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
exports.ProcessTags = void 0;
const tags_1 = require("../models/tags");
const ProcessTags = (tags) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Array.isArray(tags))
        return;
    try {
        const formattedTags = tags.map(tag => ({ name: tag }));
        yield tags_1.Tag.insertMany(formattedTags, { ordered: false }).catch(() => { });
    }
    catch (e) {
        // @ts-ignore
        if (e.code === 11000) {
            console.warn("Duplicate tags were skipped.");
        }
        else {
            console.error("Unexpected error during tag insertion:", e);
        }
    }
});
exports.ProcessTags = ProcessTags;
