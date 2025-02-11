# **@hitmiss/pinecone - Semantic Caching with Pinecone**

## **Overview**  
**@hitmiss/pinecone** is a **TypeScript-based** caching system that leverages **Pinecone** and **vector embeddings** to store and retrieve data based on **semantic similarity**. Instead of traditional key-value storage, it allows querying data using meaning-based searches.  

## **Features**  
✅ Stores values as **vector embeddings** for efficient similarity-based retrieval.  
✅ Uses **Pinecone** for scalable, high-performance vector storage.  
✅ Supports **semantic queries**, retrieving the most relevant stored data.  
✅ Adjustable **minimum similarity threshold** for refined search results.  

## **Installation**  
Ensure you have **Node.js** installed, then install the required dependencies:  

```sh
pnpm add @pinecone-database/pinecone dotenv
```

## **Setup**  
Create a `.env` file and add your **Pinecone API key**:  

```env
PINECONE_API_KEY=your_pinecone_api_key_here
```

## **Usage**  

### **1. Import and Initialize**  
```typescript
import SemanticCache from '@hitmiss/pinecone';

const cache = new SemanticCache();
```

### **2. Store Data**  
```typescript
await cache.set("greeting", "Hello, how are you?");
```

### **3. Retrieve Data**  
```typescript
const result = await cache.get("hello", 0.75);
console.log(result); // Returns the most relevant stored value
```

## **Error Handling**  
- Throws an error if **Pinecone API key is missing**.
- Returns `null` if no relevant data is found.

## **License**  
This project is licensed under the **MIT License**.
