const express = require('express');
const AIService = require('../aiService');
const axios = require('axios');

const router = express.Router();

// Test OpenAI API directly - NEW ROUTE
router.post('/test-openai', async (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    console.log('🧪 Testing OpenAI API directly...');
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OPENAI_API_KEY not found in environment variables'
      });
    }

    console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Say "Test successful" if you can read this. Original content: ${content}`
          }
        ],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    res.json({
      success: true,
      message: 'OpenAI API is working!',
      response: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI test error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message,
      status: error.response?.status,
      details: 'Check your API key and billing status'
    });
  }
});

// Your existing routes...
router.get('/env', (req, res) => {
  res.json({
    openaiKey: process.env.OPENAI_API_KEY ? `Set (${process.env.OPENAI_API_KEY.substring(0, 10)}...)` : 'Missing',
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    mongodbUri: process.env.MONGODB_URI || 'NOT SET'
  });
});

// Test AI summary
router.post('/summary', async (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    console.log('🧪 Test summary request received');
    const summary = await AIService.generateSummary(content);
    res.json({
      success: true,
      summary,
      contentLength: content.length
    });
  } catch (error) {
    console.error('Test summary error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test all AI features
router.post('/all', async (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    console.log('🧪 Test all AI features request received');
    const [summary, tags, enhanced] = await Promise.all([
      AIService.generateSummary(content),
      AIService.generateTags(content),
      AIService.enhanceWriting("i need to buy milk and eggs from store")
    ]);

    res.json({
      success: true,
      results: {
        summary,
        tags,
        enhanced,
        testContent: content
      }
    });
  } catch (error) {
    console.error('Test all features error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple test route
router.get('/simple', (req, res) => {
  res.json({
    message: 'Test routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;