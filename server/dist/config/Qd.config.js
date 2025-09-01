"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
// Qdrant Cloud configuration
const QDRANT_CLOUD_URL = 'https://b3c9b532-bf48-4bc7-95f8-2c965b5f13b3.eu-west-2-0.aws.cloud.qdrant.io:6333';
const QDRANT_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.63_96aAH0lsIx7BJsth6gdjyMpIVYYwjZqAiNs8OM4I';
// Create Qdrant client with Qdrant Cloud configuration
exports.client = new js_client_rest_1.QdrantClient({
    url: QDRANT_CLOUD_URL,
    apiKey: QDRANT_API_KEY,
    https: true
});
console.log('Qdrant client initialized with Qdrant Cloud');
