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
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const content_1 = __importDefault(require("../models/content"));
const embeddingService_1 = require("../service/embeddingService");
const vectorService_1 = require("../service/vectorService");
const youtubeExtractor_1 = require("../service/extractors/youtubeExtractor");
const twitterExtractor_1 = require("../service/extractors/twitterExtractor");
const articleExtractor_1 = require("../service/extractors/articleExtractor");
const textExtractor_1 = require("../service/extractors/textExtractor");
const router = express_1.default.Router();
// POST /api/embed-content
router.post('/embed-content', auth_1.checkForAuthenticationCookie, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentId } = req.body;
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!contentId)
            return res.status(400).json({ error: 'contentId required' });
        const content = yield content_1.default.findOne({ _id: contentId, userId: req.user._id });
        if (!content)
            return res.status(404).json({ error: 'Content not found' });
        // Extract text based on type
        let text = '';
        if (content.type === 'video')
            text = yield (0, youtubeExtractor_1.getYoutubeTranscript)(content.link);
        else if (content.type === 'tweet')
            text = yield (0, twitterExtractor_1.getTweetText)(content.link);
        else if (content.type === 'article')
            text = yield (0, articleExtractor_1.extractArticleText)(content.link);
        else
            text = yield (0, textExtractor_1.extractText)(content.link);
        // Generate embedding
        const embedding = yield (0, embeddingService_1.embedAndStoreContent)(text);
        // Upsert to vector DB
        yield (0, vectorService_1.upsertEmbedding)(embedding, {
            contentId: content._id.toString(),
            userId: content.userId.toString(),
            source: content.type,
            title: content.title,
            text,
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Embed-content error:', error);
        res.status(500).json({ error: 'Failed to embed content' });
    }
}));
// GET /api/search?query=...&topK=...
router.get('/search', auth_1.checkForAuthenticationCookie, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { query, topK = 5 } = req.query;
        if (!query)
            return res.status(400).json({ error: 'Query required' });
        // Embed query
        const embedding = yield (0, embeddingService_1.embedAndStoreContent)(query);
        // Query vector DB
        const matches = yield (0, vectorService_1.queryEmbedding)(embedding, req.user._id, Number(topK));
        // Gather context
        const context = matches.map((m) => m.metadata.text).join('\n---\n');
        // Call Gemini LLM (placeholder)
        // In production, replace with real Gemini LLM API call
        const llmAnswer = `LLM answer using context: ${context}`;
        res.json({ answer: llmAnswer, sources: matches.map((m) => ({ title: m.metadata.title, link: m.metadata.link })) });
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search' });
    }
}));
exports.default = router;
