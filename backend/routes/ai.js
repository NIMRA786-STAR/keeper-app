// File: backend/routes/ai.js
const express = require('express');
const router = express.Router();
const aiService = require('../aiService'); // Import unified AI service

console.log('🚀 AI Routes Initialized');

// POST /ai/summarize
router.post('/summarize', async (req, res) => {
  try {
    const { content } = req.body;
    console.log('🧠 Summarizing note...');
    const summary = await aiService.generateSummary(content);
    res.json({ summary, success: true });
  } catch (error) {
    console.error('💥 AI Summarization Error:', error);
    res.status(500).json({ error: 'AI summarization failed' });
  }
});

// POST /ai/enhance
router.post('/enhance', async (req, res) => {
  try {
    const { text } = req.body;
    console.log('✨ Enhancing writing...');
    const enhancedText = await aiService.enhanceWriting(text);
    res.json({ enhancedText, success: true });
  } catch (error) {
    console.error('💥 AI Enhancement Error:', error);
    res.status(500).json({ error: 'AI enhancement failed' });
  }
});

// POST /ai/tags
router.post('/tags', async (req, res) => {
  try {
    const { content } = req.body;
    console.log('🏷️ Generating tags...');
    const tags = await aiService.generateTags(content);
    res.json({ tags, success: true });
  } catch (error) {
    console.error('💥 AI Tag Generation Error:', error);
    res.status(500).json({ error: 'AI tag generation failed' });
  }
});

// 💡 NEW Suggestion route
router.post("/suggest", async (req, res) => {
  console.log("💡 AI Suggestion request received");
  try {
    const { content } = req.body;
    const suggestions = await aiService.getSuggestions(content);
    res.json({ suggestions, success: true });
  } catch (error) {
    console.error("⚠️ Suggestion generation failed:", error.message);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});




module.exports = router;
