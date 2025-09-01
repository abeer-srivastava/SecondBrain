"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentSchema = exports.AuthSchema = void 0;
const zod_1 = require("zod");
const content_1 = require("../models/content");
const tagSchema = zod_1.z.object({
    tagId: zod_1.z.string(),
    title: zod_1.z
        .string()
        .toLowerCase()
        .trim()
        .max(12, { message: "Max length of tag is 12" })
        .transform((v) => v.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '-'))
});
exports.AuthSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, { message: "Username has to be minimum of 3 letters" })
        .max(10, { message: "Username has to be maximum of 10 letters" }),
    password: zod_1.z.string().min(8, { message: "Password has to be minimum of 8 letters" })
        .max(20, { message: "Password has   to be maximum of 20 letters" })
});
exports.ContentSchema = zod_1.z.object({
    link: zod_1.z.string().min(1, { message: "Enter a valid link" }),
    type: zod_1.z.enum(content_1.contentType, { message: "Enter a valid type" }),
    title: zod_1.z.string().min(1, { message: "Enter title" }),
    tags: zod_1.z.array(tagSchema),
    contentId: zod_1.z.string(),
});
