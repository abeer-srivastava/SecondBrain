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
exports.getEmbeddings = void 0;
const cohere_ai_1 = require("cohere-ai");
const cohere = new cohere_ai_1.CohereClient({
    token: process.env.COHERE_API_KEY
});
const getEmbeddings = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let stagedData;
    if (typeof data === "string") {
        stagedData = data.trim();
    }
    else {
        stagedData = (data.title + " " + data.tagTitles.join(" ")).trim();
    }
    if (!stagedData) {
        throw new Error("Staged data is empty, cannot generate embeddings.");
    }
    try {
        const embed = yield cohere.v2.embed({
            model: 'embed-english-v3.0',
            inputType: 'search_document',
            embeddingTypes: ['float'],
            texts: [stagedData],
        });
        const vector = embed.embeddings.float[0];
        return vector;
    }
    catch (error) {
        console.error("Error generating embeddings:", error);
        throw new Error(`Error in getEmbeddings: ${error}`);
    }
});
exports.getEmbeddings = getEmbeddings;
