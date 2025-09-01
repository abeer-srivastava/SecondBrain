"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
exports.client = new js_client_rest_1.QdrantClient({
    url: 'https://b3c9b532-bf48-4bc7-95f8-2c965b5f13b3.eu-west-2-0.aws.cloud.qdrant.io:6333',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.63_96aAH0lsIx7BJsth6gdjyMpIVYYwjZqAiNs8OM4I',
});
