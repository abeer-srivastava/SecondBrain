"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentSchema = exports.contentType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./user"));
exports.contentType = ["tweet", "video", "article", "document", "link"];
exports.contentSchema = new mongoose_1.default.Schema({
    link: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: exports.contentType,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    tags: [{
            type: String,
            required: false
        }],
    userId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User",
        required: true,
    },
    shareLink: {
        type: String,
        unique: true,
        sparse: true
    },
    // LLM Analysis Fields
    summary: {
        type: String,
        required: false
    },
    references: [{
            type: String,
            required: false
        }],
    keywords: [{
            type: String,
            required: false
        }],
    relatedTopics: [{
            type: String,
            required: false
        }],
    insights: {
        type: String,
        required: false
    },
    llmAnalyzed: {
        type: Boolean,
        default: false
    },
    analyzedAt: {
        type: Date,
        required: false
    }
}, { timestamps: true });
// pre()=>used to hash the passwords and perfrom something that needs to be perfromed before the creation of the model
exports.contentSchema.pre("save", async function (next) {
    const user = await user_1.default.findById(this.userId);
    if (!user) {
        throw new Error("User does not exist ");
    }
    next();
});
const Content = mongoose_1.default.model("content", exports.contentSchema);
exports.default = Content;
