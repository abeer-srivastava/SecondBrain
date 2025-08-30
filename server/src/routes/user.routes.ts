import express from "express";
import User from "../models/user";
import { checkForAuthenticationCookie } from "../middlewares/auth";
import Content from "../models/content";
import { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";

import Link from "../models/links";
const router=express.Router();

router.get("/user",checkForAuthenticationCookie,async (req,res)=>{
  if(!req.user){
    return res.status(411).json("Unauthorized");
  }
  const user=(req.user as JwtPayload);
  return res.json(user); 
})
router.post("/signup",async (req,res)=>{
    try{
    const {username,password}=req.body;
    if(!username||!password){
      return  res.status(411).json("All fields are Required");
    }

    await User.create({
        username,
        password
    })
    return res.status(200).json("User Created");
    }
    catch(e){
        console.log("Error Occured",e);
    }
});

router.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(411).json("All fields are required");
    }
    const token = await (User as any).matchPasswordAndGenerateToken(username, password);
    if (!token) {
      return res.status(401).json("Invalid credentials");
    }
    // Set cookie and send response
    return res
      .cookie("token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({
  message: "Signed in",
  token: token  
});
  } catch (e) {
    return res.status(411).json("Invalid User");
  }
});

router.post("/content", checkForAuthenticationCookie, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = (req.user as JwtPayload)._id;
  console.log(userId);
  const { link, type, title } = req.body;
  if (!link || !title) {
    return res.status(400).json({ error: "Link and title are required" });
  }
  try {
    const content = await Content.create({
      link,
      type,
      title,
      userId
    });
    res.status(201).json(content);
  } catch (err) {
    res.status(500).json({ error: "Failed to create content" });
  }
});

router.get("/content", checkForAuthenticationCookie, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = (req.user as JwtPayload)._id;
        const contents = await Content.find({ userId }).populate("_id", "username")
        res.json(contents);
    } catch (error) {
        console.error("Fetch contents error:", error);
        res.status(500).json({ error: "failed to fetch contents" });
    }
});

router.delete("/content",async (req,res)=>{
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = (req.user as JwtPayload)._id;
        const contentId=req.body.contentId;
        await Content.deleteOne({
            _id:contentId,
            userId:userId
        })
        res.json({message:"deleted"});
    }catch (error) {
        console.error("Delete contents error:", error);
        res.status(500).json({ error: "failed to delete contents" });
    }
});
router.post("/brain/share", checkForAuthenticationCookie, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = (req.user as JwtPayload)._id;
    const { contentId } = req.body;

    const sharableContent = await Content.findOne({ _id: contentId, userId });
    if (!sharableContent) {
      return res.status(404).json({ error: "Content Not Found" });
    }

    const shareLink = crypto.randomBytes(16).toString("hex");

    sharableContent.shareLink = shareLink;
    await sharableContent.save();

    await Link.create({
      hash: shareLink,
      userId
    });
    res.json({ shareUrl: `http://localhost:5173/share/${shareLink}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to create a sharable Link" });
  }
});
router.get("/brain/shareLink/:shareLink", async (req, res) => {
  try {
    const { shareLink } = req.params;
    if (!shareLink) return res.status(400).json({ error: "Missing shareLink parameter" });

    const link = await Link.findOne({ hash: shareLink });
    if (!link) return res.status(404).json({ error: "Content not found" });

    const contents = await Content.find({ userId: link.userId, shareLink }); // fetch all shared items
    const user = await User.findById(String(link.userId));

    if (!user) return res.status(404).json({ error: "User not found" });

    // Format response like frontend expects
    const sharedBrainData = {
      id: link._id.toString(),
      ownerName: user.username,
      title: `${user.username}'s Second Brain`,
      description: "Shared Brain Content",
      content: contents.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        content: c.link || "", // or c.content if you store the text
        type: c.type,
        url: c.link, // if applicable
        tags: c.tags || [],
        createdAt: c.createdAt,
      }))
    };

    return res.json(sharedBrainData);

  } catch (error) {
    console.error("Fetch shared content error:", error);
    res.status(500).json({ error: "Failed to fetch shared content" });
  }
});

export default router;