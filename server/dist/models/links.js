"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const linkSchema = new mongoose_1.default.Schema({
    hash: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User",
        required: true
    }
});
const Link = mongoose_1.default.model("links", linkSchema);
exports.default = Link;
