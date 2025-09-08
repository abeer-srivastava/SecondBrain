"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanPayload = void 0;
const cleanPayload = (data) => {
    const { title, tags, contentId } = data;
    // Handle tags as strings or objects
    const tagTitles = tags.map(tag => {
        if (typeof tag === 'string') {
            return tag;
        }
        else if (tag && typeof tag === 'object' && 'title' in tag) {
            return tag.title;
        }
        return '';
    }).filter(Boolean);
    return {
        title,
        contentId,
    };
};
exports.cleanPayload = cleanPayload;
// remove the tagtitles from the return and the props 
