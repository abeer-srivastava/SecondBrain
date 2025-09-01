import { z } from "zod";
import { contentType } from "../models/content";

// Tag schema for when tags are objects (legacy support)
const tagSchema = z.object({
    tagId: z.string(),
    title: z
        .string()
        .toLowerCase()
        .trim()
        .max(12, { message: "Max length of tag is 12" })
        .transform((v) => v.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '-'))
});

// Union type for tags - can be either strings or objects
const tagUnionSchema = z.union([z.string(), tagSchema]);

export const AuthSchema = z.object({
    username: z.string().min(3, {message: "Username has to be minimum of 3 letters"})
        .max(10, {message: "Username has to be maximum of 10 letters"}),
    password: z.string().min(8, {message: "Password has to be minimum of 8 letters"})
        .max(20, {message: "Password has   to be maximum of 20 letters"})
})


export const ContentSchema = z.object({
    link: z.string().min(1, {message: "Enter a valid link"}),
    type: z.enum(contentType, {message: "Enter a valid type"}),
    title: z.string().min(1, {message: "Enter title"}),
    tags: z.array(tagUnionSchema), // Support both string and object tags
    contentId: z.string(),

})

export type ContentType = z.infer<typeof ContentSchema>
export type TagType = z.infer<typeof tagSchema>
