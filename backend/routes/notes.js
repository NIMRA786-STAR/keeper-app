// File: backend/routes/notes.js
const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const aiService = require("../aiService");

console.log("🗒️ Notes API Routes Initialized");

// 🧩 CREATE a new note
router.post("/", async (req, res) => {
  try {
    const { title, content, aiSummary, aiTags } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Note content is required" });
    }

    // ✅ Auto-fill title if missing
    const safeTitle = title && title.trim().length > 0 ? title : "Untitled Note";

    // 🧠 Summary & tags handling
    let summary = aiSummary;
    let tags = aiTags;

    // Generate summary if missing
    if (!summary) {
      console.log("🧠 Generating AI summary for new note...");
      try {
        summary = await aiService.generateSummary(content);
      } catch (err) {
        console.warn("⚠️ AI summary generation failed:", err.message);
        summary = "• Auto-summary unavailable.";
      }
    }

    // Generate tags if missing
    if (!tags || tags.length === 0) {
      console.log("🏷️ Generating AI tags for new note...");
      try {
        tags = await aiService.generateTags(content);
      } catch (err) {
        console.warn("⚠️ AI tag generation failed:", err.message);
        tags = ["general"];
      }
    }

    const newNote = new Note({
      title: safeTitle,
      content,
      isPinned: false,
      aiSummary: summary,
      tags,
      lastEnhanced: null,
      createdAt: new Date(),
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error("💥 Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// 🧩 GET all notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("💥 Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// 🧩 UPDATE a note
router.put("/:id", async (req, res) => {
  try {
    const { title, content, aiSummary, tags, isPinned } = req.body;
    const id = req.params.id;

    const existingNote = await Note.findById(id);
    if (!existingNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    const contentChanged = content && content !== existingNote.content;

    let finalSummary = existingNote.aiSummary;
    let finalTags = existingNote.tags;

    if (contentChanged) {
      console.log("🧠 Content changed — regenerating AI data");
      finalSummary = await aiService.generateSummary(content);
      finalTags = await aiService.generateTags(content);
    }

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        title: title?.trim() || existingNote.title,
        content: content || existingNote.content,
        isPinned: isPinned ?? existingNote.isPinned,
        aiSummary: finalSummary,
        tags: finalTags,
      },
      { new: true }
    );

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("💥 Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});


// 🧩 DELETE a note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("💥 Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

module.exports = router;
