const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  // AI Features
  aiSummary: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  lastEnhanced: {
    type: Date,
    default: null,
  }
});

module.exports = mongoose.model('Note', NoteSchema);

