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
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./user"));
const contentType = ["image", "video", "article", "audio"];
const contentSchema = new mongoose_1.default.Schema({
    link: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: contentType,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    tags: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: "Tag"
        }],
    userId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User",
        required: true,
    }, shareLink: {
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true });
// pre()=>used to hash the passwords and perfrom something that needs to be perfromed before the creation of the model
contentSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield user_1.default.findById(this.userId);
        if (!user) {
            throw new Error("User does not exist ");
        }
        next();
    });
});
const Content = mongoose_1.default.model("content", contentSchema);
exports.default = Content;
