
import express from "express";
import User from "../models/user";
import { checkForAuthenticationCookie } from "../middlewares/auth";
import Content from "../models/content";
import { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import Link from "../models/links";
import { QdrantUpsertPoints } from "../utils/QdrantProcessing";
import { Tag } from "../models/tags";
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
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
  console.log("the userId is ",userId);
  const { link, type, title, tags } = req.body;
  if (!link || !title || !type) {
    console.log("link, title, and type are required")
    return res.status(400).json({ error: "Link, title, and type are required" });
  }
  
  // Validate content type
  if (!["tweet", "video", "article", "document", "link"].includes(type)) {
    return res.status(400).json({ error: "Invalid content type" });
  }
  
  try {
    // Process tags - ensure they're strings and filter out empty ones
    const processedTags = Array.isArray(tags) 
      ? tags.filter(tag => tag && tag.trim()) 
      : [];
    
    const content = await Content.create({
      link,
      type,
      title,
      userId,
      tags: processedTags
    });
    console.log("the content is added ",content);
    const data={contentId:String(content._id),link,type,title,tags:processedTags}
    console.log(data);
    // await QdrantUpsertPoints(data)
    res.status(201).json(content);
  } catch (err) {
    console.error("Error creating content:", err);
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

// Tag management routes
router.post("/tags", checkForAuthenticationCookie, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Tag name is required" });
    }
    
    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: name.trim() });
    if (existingTag) {
      return res.status(409).json({ error: "Tag already exists" });
    }
    
    const tag = await Tag.create({ name: name.trim() });
    res.status(201).json(tag);
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
});

router.get("/tags", checkForAuthenticationCookie, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (error) {
    console.error("Fetch tags error:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

router.delete("/tags/:id", checkForAuthenticationCookie, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { id } = req.params;
    const tag = await Tag.findByIdAndDelete(id);
    
    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }
    
    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
});

// LLM-powered content analysis and search routes
router.post("/content/analyze", checkForAuthenticationCookie, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { contentId } = req.body;
    if (!contentId) {
      return res.status(400).json({ error: "Content ID is required" });
    }
    
    // Get content from database
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }
    
    // Check if user owns this content
    if (String(content.userId) !== String((req.user as JwtPayload)._id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Analyze content with LLM
    const { analyzeContentWithLLM } = await import("../utils/TextEmbeddings.js");
    const analysis = await analyzeContentWithLLM({
      title: content.title,
      link: content.link,
      type: content.type,
      tags: content.tags,
    });
    
    // Update content with analysis results
    content.summary = analysis.summary;
    content.references = analysis.references;
    content.keywords = analysis.keywords;
    content.relatedTopics = analysis.relatedTopics;
    content.insights = analysis.insights;
    content.llmAnalyzed = true;
    content.analyzedAt = new Date();
    
    await content.save();
    
    // Update Qdrant with enhanced data
    const { QdrantUpsertPoints } = await import("../utils/QdrantProcessing.js");
    await QdrantUpsertPoints({
      contentId: String(content._id),
      title: content.title,
      link: content.link,
      type: content.type,
      tags: content.tags,
    });
    
    res.json({
      success: true,
      analysis,
      content: {
        id: content._id,
        title: content.title,
        summary: content.summary,
        references: content.references,
        keywords: content.keywords,
        relatedTopics: content.relatedTopics,
        insights: content.insights,
      }
    });
    
  } catch (error) {
    console.error("Content analysis error:", error);
    res.status(500).json({ error: "Failed to analyze content" });
  }
});

// Intelligent search with LLM context
router.post("/content/search", checkForAuthenticationCookie, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { query, limit = 5 } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }
    
    const { QdrantSearchWithContext } = await import("../utils/QdrantProcessing.js");
    const searchResults = await QdrantSearchWithContext(query, limit);
    
    res.json({
      success: true,
      query,
      results: searchResults,
      total: searchResults.length
    });
    
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to perform search" });
  }
});

// Get intelligent references for a query
router.post("/content/references", checkForAuthenticationCookie, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { query, limit = 5 } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    
    const { getIntelligentReferences } = await import("../utils/QdrantProcessing.js");
    const references = await getIntelligentReferences(query, limit);
    
    res.json({
      success: true,
      query,
      references,
      total: references.length
    });
    
  } catch (error) {
    console.error("References error:", error);
    res.status(500).json({ error: "Failed to get references" });
  }
});

// Get content recommendations
router.get("/content/:contentId/recommendations", checkForAuthenticationCookie, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { contentId } = req.params;
    const { limit = 5 } = req.query;
    
    // Check if user owns this content
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }
    
    if (String(content.userId) !== String((req.user as JwtPayload)._id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { getContentRecommendations } = await import("../utils/QdrantProcessing.js");
    const recommendations = await getContentRecommendations(contentId, Number(limit));
    
    res.json({
      success: true,
      contentId,
      recommendations,
      total: recommendations.length
    });
    
  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

// Batch analyze all user's content
router.post("/content/batch-analyze", checkForAuthenticationCookie, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = (req.user as JwtPayload)._id;
    
    // Get all user's content
    const userContent = await Content.find({ userId });
    
    if (userContent.length === 0) {
      return res.json({
        success: true,
        message: "No content to analyze",
        results: []
      });
    }
    
    // Start batch analysis in background
    const { batchAnalyzeContent } = await import("../utils/QdrantProcessing.js");
    
    // Run analysis asynchronously
    batchAnalyzeContent().then((results: any[]) => {
      console.log("Background batch analysis completed:", results);
    }).catch((error: any) => {
      console.error("Background batch analysis failed:", error);
    });
    
    res.json({
      success: true,
      message: "Batch analysis started in background",
      contentCount: userContent.length,
      estimatedTime: `${Math.ceil(userContent.length * 1.5)} seconds`
    });
    
  } catch (error) {
    console.error("Batch analysis error:", error);
    res.status(500).json({ error: "Failed to start batch analysis" });
  }
});

// Get content insights and analytics
router.get("/content/insights", checkForAuthenticationCookie, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const userId = (req.user as JwtPayload)._id;
    
    // Get content statistics
    const totalContent = await Content.countDocuments({ userId });
    const analyzedContent = await Content.countDocuments({ 
      userId, 
      llmAnalyzed: true 
    });
    
    // Get content by type
    const contentByType = await Content.aggregate([
      { $match: { userId } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    
    // Get most common tags
    const tagStats = await Content.aggregate([
      { $match: { userId } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags.title", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get recent analysis insights
    const recentInsights = await Content.find({ 
      userId, 
      llmAnalyzed: true,
      insights: { $exists: true, $ne: "" }
    })
    .sort({ analyzedAt: -1 })
    .limit(5)
    .select('title insights analyzedAt');
    
    res.json({
      success: true,
      insights: {
        totalContent,
        analyzedContent,
        analysisPercentage: totalContent > 0 ? Math.round((analyzedContent / totalContent) * 100) : 0,
        contentByType,
        topTags: tagStats,
        recentInsights
      }
    });
    
  } catch (error) {
    console.error("Insights error:", error);
    res.status(500).json({ error: "Failed to get insights" });
  }
});

export default router;
