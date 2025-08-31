import {QdrantClient} from '@qdrant/js-client-rest';

export const client = new QdrantClient({
    url: 'https://b3c9b532-bf48-4bc7-95f8-2c965b5f13b3.eu-west-2-0.aws.cloud.qdrant.io:6333',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.63_96aAH0lsIx7BJsth6gdjyMpIVYYwjZqAiNs8OM4I',
});

