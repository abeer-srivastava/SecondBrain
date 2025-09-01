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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantDelete = exports.QdrantSearch = exports.QdrantUpsertPoints = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const cleanPayload_1 = require("./cleanPayload");
const TextEmbeddings_1 = require("./TextEmbeddings");
const client = new js_client_rest_1.QdrantClient({
    host: process.env.QDRANT_HOST,
    port: 6333,
    apiKey: process.env.QDRANT_API
});
const QdrantUpsertPoints = (data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("data in Qdrant", data);
    const payload = (0, cleanPayload_1.cleanPayload)(data);
    console.log("payload in Qdrant", payload);
    const embeddings = yield (0, TextEmbeddings_1.getEmbeddings)(payload);
    try {
        yield client.upsert("secondBrain", {
            points: [{
                    id: data.contentId,
                    payload: payload,
                    vector: embeddings,
                }]
        });
        console.log("Qdrant Created id: ", data.contentId);
        return;
    }
    catch (error) {
        console.error("Error upserting points:", error);
    }
});
exports.QdrantUpsertPoints = QdrantUpsertPoints;
const QdrantSearch = (embeddings) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield client.search("secondBrain", {
            vector: embeddings,
            limit: 3,
            with_payload: true
        });
        return response.map(response => response.id);
    }
    catch (error) {
        console.error("Error searching for points:", error);
    }
});
exports.QdrantSearch = QdrantSearch;
const QdrantDelete = (contentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.delete("secondBrain", {
            points: [contentId]
        });
        console.log("Qdrant Deleting id: ", contentId);
        return;
    }
    catch (error) {
        console.error("Error deleting points:", error);
    }
});
exports.QdrantDelete = QdrantDelete;
