import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

const model = 'multilingual-e5-large';

export async function Vector(): Promise<void> {
    const index = pc.index('semantic-cache');

    // Uncomment and use this block to upsert data into Pinecone
    /*
    const data = [
        { id: 'vec1', text: 'Apple is a popular fruit known for its sweetness and crisp texture.' },
        { id: 'vec2', text: 'The tech company Apple is known for its innovative products like the iPhone.' },
        { id: 'vec3', text: 'Many people enjoy eating apples as a healthy snack.' },
        { id: 'vec4', text: 'Apple Inc. has revolutionized the tech industry with its sleek designs and user-friendly interfaces.' },
        { id: 'vec5', text: 'An apple a day keeps the doctor away, as the saying goes.' },
        { id: 'vec6', text: 'Apple Computer Company was founded on April 1, 1976, by Steve Jobs, Steve Wozniak, and Ronald Wayne as a partnership.' }
    ];

    const embeddings = await pc.inference.embed(
        model,
        data.map(d => d.text),
        { inputType: 'passage', truncate: 'END' }
    );

    const vectors = data.map((d, i) => {
        const values = embeddings[i]?.values;
        if (!values) {
            throw new Error(`Missing embedding values for id: ${d.id}`);
        }

        return {
            id: d.id,
            values,
            metadata: { text: d.text }
        };
    });

    await index.namespace('semantic-cache').upsert(vectors);
    */

    const question = ["What is apple company?"];

    const questionEmbeddings = await pc.inference.embed(
        model,
        question,
        { inputType: 'passage', truncate: 'END' }
    );

    const queryVector = questionEmbeddings[0]?.values;
    if (!queryVector) {
        throw new Error('Failed to generate embeddings for the question.');
    }

    const queryResponse = await index.namespace('semantic-cache').query({
        vector: queryVector,
        topK: 3,
        includeValues: true,
        includeMetadata: true,
    });

    // Filtering results with a minimum score threshold of 0.75
    const filteredResults = queryResponse.matches?.filter(match => (match.score ?? 0) >= 0.75) || [];

    if (filteredResults.length === 0) {
        console.log('No relevant results found.');
        return;
    }

    console.log('Filtered Query Results:');
    filteredResults.forEach((match, index) => {
        console.log(`\nMatch ${index + 1}:`);
        console.log(`- ID: ${match.id}`);
        console.log(`- Score: ${match.score}`);
        console.log(`- Metadata:`, match.metadata);
        console.log(`- Vector Values (First 5):`, match.values?.slice(0, 5)); // Preview first 5 values
    });
}
