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
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const auth_1 = require("../middlewares/auth");
const content_1 = __importDefault(require("../models/content"));
const crypto_1 = __importDefault(require("crypto"));
const links_1 = __importDefault(require("../models/links"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.json("");
});
router.get("/user", auth_1.checkForAuthenticationCookie, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(411).json("Unauthorized");
    }
    const user = req.user;
    return res.json(user);
}));
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(411).json("All fields are Required");
        }
        yield user_1.default.create({
            username,
            password
        });
        return res.status(200).json("User Created");
    }
    catch (e) {
        console.log("Error Occured", e);
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(411).json("All fields are required");
        }
        const token = yield user_1.default.matchPasswordAndGenerateToken(username, password);
        if (!token) {
            return res.status(401).json("Invalid credentials");
        }
        // Set cookie and send response
        return res
            .cookie("token", token, {
            httpOnly: true,
            // secure: true, // Uncomment in production with HTTPS
            // sameSite: "strict", // Optional, for CSRF protection
        })
            .status(200)
            .json({
            message: "Signed in",
            token: token
        });
    }
    catch (e) {
        return res.status(411).json("Invalid User");
    }
}));
router.post("/content", auth_1.checkForAuthenticationCookie, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user._id;
    console.log(userId);
    const { link, type, title } = req.body;
    // console.log("link",link);
    // console.log("type",type);
    // console.log("title",title);
    //   console.log("tags",tags);
    if (!link || !title) {
        return res.status(400).json({ error: "Link and title are required" });
    }
    try {
        const content = yield content_1.default.create({
            link,
            type,
            title,
            userId
        });
        res.status(201).json(content);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create content" });
    }
}));
router.get("/content", auth_1.checkForAuthenticationCookie, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user._id;
        const contents = yield content_1.default.find({ userId }).populate("_id", "username");
        res.json(contents);
    }
    catch (error) {
        console.error("Fetch contents error:", error);
        res.status(500).json({ error: "failed to fetch contents" });
    }
}));
router.delete("/content", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user._id;
        const contentId = req.body.contentId;
        yield content_1.default.deleteOne({
            _id: contentId,
            userId: userId
        });
        res.json({ message: "deleted" });
    }
    catch (error) {
        console.error("Delete contents error:", error);
        res.status(500).json({ error: "failed to delete contents" });
    }
}));
router.post("/brain/share", auth_1.checkForAuthenticationCookie, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user._id;
        const { contentId } = req.body;
        // console.log(contentId);
        const sharableContent = yield content_1.default.findOne({
            _id: contentId,
            userId,
        });
        if (!sharableContent) {
            return res.status(404).json({ error: "Content Not Found" });
        }
        const shareLink = crypto_1.default.randomBytes(16).toString("hex");
        sharableContent.shareLink = shareLink; // <-- Assign it here!
        yield links_1.default.create({
            "hash": shareLink,
            userId
        });
        res.json({ shareUrl: `http://localhost:3000/api/brain/shareLink/${shareLink}` });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create a sharable Link" });
    }
}));
router.get("/brain/shareLink/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shareLink } = req.params;
        if (!shareLink) {
            return res.status(400).json({ error: "Missing shareLink parameter" });
        }
        const hash = shareLink;
        const link = yield links_1.default.findOne({ hash });
        if (!link) {
            return res.status(404).json({ error: "Content not found" });
        }
        const content = yield content_1.default.findOne({
            userId: link.userId
        });
        // console.log(link.userId);
        // console.log(String(link.userId))
        // console.log(typeof String(link.userId))
        const user = yield user_1.default.findById(String(link.userId));
        // console.log("user is:", user);
        // console.log("user === null:", user === null);
        // console.log("user == null:", user == null);
        // console.log("user typeof:", typeof user);
        if (user) {
            return res.json({
                user: user.username,
                content,
            });
        }
    }
    catch (error) {
        console.error("Fetch shared content error:", error);
        res.status(500).json({ error: "Failed to fetch shared content" });
    }
}));
exports.default = router;
