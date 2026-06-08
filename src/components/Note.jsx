// File: src/Note.jsx
import React, { useState, useCallback, memo } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import PushPinIcon from "@mui/icons-material/PushPin";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SummaryIcon from '@mui/icons-material/Summarize';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import axios from 'axios';

const Note = memo(({ 
  id, 
  title = "", 
  content = "", 
  isPinned = false, 
  aiSummary = "", 
  tags = [], 
  onDelete, 
  onTogglePin, 
  onEdit, 
  showAIFeatures = true 
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  // handleChange function with useCallback
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    if (onEdit && id) {
      onEdit(id, { 
        title: name === "title" ? value : title,
        content: name === "content" ? value : content,
        isPinned: isPinned,
        aiSummary: aiSummary, 
        tags: tags
      });
    }
  }, [id, title, content, isPinned, aiSummary, tags, onEdit]);

  // AI Feature: Enhance writing with useCallback
  const enhanceWriting = useCallback(() => {
    if (!content || !content.trim() || !onEdit || !id) {
      console.log('❌ Cannot enhance: missing content, onEdit, or id');
      alert('Cannot enhance empty note.');
      return;
    }
    
    if (content.trim().length < 5) {
      alert('Text is too short to enhance. Please write at least 5 characters.');
      return;
    }
    
    setIsEnhancing(true);
    console.log('🎯 Starting enhancement for note:', id);
    
    axios.post('http://localhost:5000/ai/enhance', { text: content })
      .then(response => {
        console.log('✅ Enhancement successful:', response.data);
        
        if (response.data.enhancedText && onEdit && id) {
          const improvement = response.data.enhancedText !== content ? 
            'Text has been improved!' : 'Text was already well-written.';
          
          onEdit(id, { 
            title: title, 
            content: response.data.enhancedText, 
            isPinned: isPinned,
            lastEnhanced: new Date().toISOString(),
            aiSummary: aiSummary,
            tags: tags
          });
          
          console.log('📝 Enhancement applied:', improvement);
        } else {
          console.warn('⚠️ No enhanced text received or no changes made');
          alert('No improvements were needed for this text.');
        }
        setIsEnhancing(false);
      })
      .catch(error => {
        console.error('❌ Error enhancing text:', {
          message: error.message,
          response: error.response?.data
        });
        
        // Fallback local improvements
        const localEnhanced = content
          .replace(/\bim\b/gi, "I'm")
          .replace(/\bi\b/g, "I")
          .replace(/\bdont\b/gi, "don't")
          .replace(/\bcant\b/gi, "can't");
        
        let finalText = localEnhanced.charAt(0).toUpperCase() + localEnhanced.slice(1);
        if (!/[.!?]$/.test(finalText)) {
          finalText += '.';
        }
        
        if (onEdit && id && finalText !== content) {
          onEdit(id, { 
            title: title, 
            content: finalText, 
            isPinned: isPinned,
            lastEnhanced: new Date().toISOString(),
            aiSummary: aiSummary,
            tags: tags
          });
        }
        
        setIsEnhancing(false);
      });
  }, [id, title, content, isPinned, aiSummary, tags, onEdit]);

  // AI Feature: Regenerate summary with useCallback
  const regenerateSummary = useCallback(() => {
    if (!content || !onEdit || !id) return;
    
    axios.post('http://localhost:5000/ai/summarize', { content })
      .then(response => {
        const newSummary = response?.data?.summary ?? '';
        if (onEdit && id) {
          // Update only aiSummary (backend will re-run AI if needed, but UI should reflect summary)
          onEdit(id, { 
            title: title, 
            content: content, 
            isPinned: isPinned,
            aiSummary: newSummary,
            tags: tags
          });
        }
      })
      .catch(error => {
        console.error('Error regenerating summary:', error);
        alert('Failed to regenerate summary. See console for details.');
      });
  }, [id, title, content, isPinned, tags, onEdit]);

  // Handle toggle pin with useCallback
  const handleTogglePin = useCallback(() => {
    if (onTogglePin && id) {
      onTogglePin(id);
    }
  }, [id, onTogglePin]);

  // Handle delete with useCallback
  const handleDelete = useCallback(() => {
    if (onDelete && id) {
      onDelete(id);
    }
  }, [id, onDelete]);

  return (
    <div className={`note ${isPinned ? "pinned" : ""}`}>
      {/* Pin Button */}
      <Zoom in={true}>
        <Fab className="pin-btn" size="small" onClick={handleTogglePin}>
          <PushPinIcon /> 
        </Fab>
      </Zoom>

      {/* Note Content */}
      <input 
        name="title" 
        value={title || ""} 
        onChange={handleChange} 
        placeholder="Title" 
      />
      <textarea 
        name="content" 
        value={content || ""} 
        onChange={handleChange} 
        placeholder="Take a note..." 
      />

      {/* AI Features Section */}
      {showAIFeatures && (
        <div className="ai-features">
          {/* AI Summary */}
          {aiSummary && (
            <div className="ai-summary">
              <SummaryIcon fontSize="small" />
              <span>{aiSummary}</span>
              <button className="regenerate-btn" onClick={regenerateSummary}>🔄</button>
            </div>
          )}

          {/* AI Tags */}
          {tags && tags.length > 0 && (
            <div className="ai-tags">
              <LocalOfferIcon fontSize="small" />
              {tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          )}

          {/* Enhance Writing Button */}
          <div className="enhance-section">
            <button 
              className="enhance-btn" 
              onClick={enhanceWriting}
              disabled={isEnhancing || !content || !content.trim()}
            >
              <AutoAwesomeIcon fontSize="small" />
              {isEnhancing ? "Enhancing..." : "Enhance Writing"}
            </button>
          </div>
        </div>
      )}

      {/* Delete Button */}
      <Zoom in={true}>
        <Fab className="delete-btn" size="small" onClick={handleDelete}>
          <DeleteIcon />
        </Fab>
      </Zoom>
    </div>
  );
});

Note.displayName = 'Note';

export default Note;

