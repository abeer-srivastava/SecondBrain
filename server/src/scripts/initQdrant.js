"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_client_rest_1 = require("@qdrant/js-client-rest");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
// Load environment variables
(0, dotenv_1.config)({ path: path_1.default.resolve(__dirname, '../.env') });
// Initialize Qdrant client
const qdrantClient = new js_client_rest_1.QdrantClient({
    url: process.env.QDRANT_HOST || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API,
    https: process.env.QDRANT_HTTPS === 'true'
});
const COLLECTION_NAME = 'secondBrain';
const VECTOR_SIZE = 1024; // Updated to match the embedding model's output
function initializeQdrant() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Initializing Qdrant collection...');
            // Delete existing collection if it exists
            const collections = yield qdrantClient.getCollections();
            const collectionExists = collections.collections.some(c => c.name === COLLECTION_NAME);
            if (collectionExists) {
                console.log(`Deleting existing collection '${COLLECTION_NAME}'...`);
                yield qdrantClient.deleteCollection(COLLECTION_NAME);
            }
            // Create new collection with correct vector size
            console.log(`Creating collection '${COLLECTION_NAME}' with vector size ${VECTOR_SIZE}...`);
            yield qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_SIZE,
                    distance: 'Cosine',
                    on_disk: true,
                },
            });
            console.log(`Collection '${COLLECTION_NAME}' created successfully.`);
            // Create payload index for filtering
            console.log('Creating payload index for filtering...');
            yield qdrantClient.createPayloadIndex(COLLECTION_NAME, {
                field_name: 'contentId',
                field_schema: 'keyword',
            });
            console.log('Payload index created successfully.');
        }
        catch (error) {
            console.error('Error initializing Qdrant:', error);
            process.exit(1);
        }
    });
}
initializeQdrant().then(() => {
    console.log('Qdrant initialization completed.');
    process.exit(0);
});
