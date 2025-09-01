import { Tag } from "../models/tags"
import { TagType } from "../types/Schemas";

export const ProcessTags = async (tags: string[]) => {
      if (!Array.isArray(tags)) return;
    try {
        const formattedTags = tags.map(tag => ({ name: tag }));
        await Tag.insertMany(formattedTags, { ordered: false }).catch(() => {});
    } catch (e) {
        // @ts-ignore
        if (e.code === 11000) {
            console.warn("Duplicate tags were skipped.");
        } else {
            console.error("Unexpected error during tag insertion:", e);
        }
    }
};