"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanPayload = void 0;
const cleanPayload = (data) => {
    const { title, tags, contentId } = data;
    // Extract only tag titles
    const tagTitles = tags.map(tag => tag.title);
    return {
        title,
        contentId,
        tagTitles,
    };
};
exports.cleanPayload = cleanPayload;
