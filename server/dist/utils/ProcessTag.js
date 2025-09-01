"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessTags = void 0;
const tags_1 = require("../models/tags");
const ProcessTags = async (tags) => {
    if (!Array.isArray(tags))
        return;
    try {
        const formattedTags = tags.map(tag => ({ name: tag }));
        await tags_1.Tag.insertMany(formattedTags, { ordered: false }).catch(() => { });
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
};
exports.ProcessTags = ProcessTags;
