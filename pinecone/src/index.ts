import { Pinecone } from '@pinecone-database/pinecone';
import 'dotenv/config'; 

if (!process.env.PINECONE_API_KEY) {    
    throw Error("PLEASE MAKE SURE YOU HAVE PINECONE API KEY IN THE ENV FILE.");
}

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const model = 'multilingual-e5-large';

export class SemanticCache {
    private cache: Map<string, any>;

    constructor() {
        this.cache = new Map();
    }

    /**
     * Set a value in the cache.
     * @param key - The key to store the value.
     * @param value - The value to store.
     */
    async set(key: string, value: any): Promise<void> {
        const index = pc.index('semantic-cache');
        const embeddings = await pc.inference.embed(
            model,
            [value],
            { inputType: 'passage', truncate: 'END' }
        );
        const values = embeddings[0]?.values;
        if (!values) {
            throw new Error('WE FAILED TO GENERATE EMBEDDINGS');
        }

        const vector = {
            id: key,
            values: values,
            metadata: { text: value }
        };

        await index.namespace('semantic-cache').upsert([vector]);
    }

    /**
     * Get a value from the cache.
     * @param key - The key to query.
     * @param minProximity - Minimum similarity score to consider relevant.
     * @returns Filtered metadata based on the proximity threshold.
     */
    async get(key: string, minProximity: number = 0.75): Promise<any> {
        const index = pc.index('semantic-cache');
        
        // Generate embeddings for the query key
        const keyEmbeddings = await pc.inference.embed(
            model,
            [key],
            { inputType: 'passage', truncate: 'END' }
        );
        const queryVector = keyEmbeddings[0]?.values;
        if (!queryVector) {
            throw new Error('Failed to generate embeddings for the query.');
        }
        const queryResponse = await index.namespace('semantic-cache').query({
            vector: queryVector,
            topK: 1,
            includeValues: true,
            includeMetadata: true,
        });
        const filteredResults = queryResponse.matches?.filter(match => (match.score ?? 0) >= minProximity) || [];

        if (filteredResults.length === 0) {
            return null;
        }
        return filteredResults[0].metadata;
    }
}
