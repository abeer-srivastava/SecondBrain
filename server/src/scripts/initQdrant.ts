import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_HOST || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API,
    https: process.env.QDRANT_HTTPS === 'true'
});

const COLLECTION_NAME = 'secondBrain';
const VECTOR_SIZE = 1024; // Updated to match the embedding model's output

async function initializeQdrant() {
    try {
        console.log('Initializing Qdrant collection...');
        
        // Delete existing collection if it exists
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(c => c.name === COLLECTION_NAME);

        if (collectionExists) {
            console.log(`Deleting existing collection '${COLLECTION_NAME}'...`);
            await qdrantClient.deleteCollection(COLLECTION_NAME);
        }

        // Create new collection with correct vector size
        console.log(`Creating collection '${COLLECTION_NAME}' with vector size ${VECTOR_SIZE}...`);
        await qdrantClient.createCollection(COLLECTION_NAME, {
            vectors: {
                size: VECTOR_SIZE,
                distance: 'Cosine',
                on_disk: true,
            },
        });

        console.log(`Collection '${COLLECTION_NAME}' created successfully.`);
        
        // Create payload index for filtering
        console.log('Creating payload index for filtering...');
        await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
            field_name: 'contentId',
            field_schema: 'keyword',
        });

        console.log('Payload index created successfully.');
        
    } catch (error) {
        console.error('Error initializing Qdrant:', error);
        process.exit(1);
    }
}

initializeQdrant().then(() => {
    console.log('Qdrant initialization completed.');
    process.exit(0);
});
