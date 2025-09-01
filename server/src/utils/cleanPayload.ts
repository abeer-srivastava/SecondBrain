import { ContentType } from "../types/Schemas";

export type CleanedPayload = {
    title: string;
    contentId: string;
    tagTitles: string[];
};
export const cleanPayload = (data: ContentType): CleanedPayload => {
    const { title, tags, contentId } = data;

    // Handle tags as strings or objects
    const tagTitles = tags.map(tag => {
        if (typeof tag === 'string') {
            return tag;
        } else if (tag && typeof tag === 'object' && 'title' in tag) {
            return tag.title;
        }
        return '';
    }).filter(Boolean);

    return {
        title,
        contentId,
        tagTitles,
    };
};