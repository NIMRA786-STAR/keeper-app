import React, { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import axios from 'axios';



// Input sanitization function
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 2000); // Limit length
};

function App() {
  const [notes, setNotes] = useState([]);
  const [showAIFeatures, setShowAIFeatures] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = useCallback(() => {
    setLoading(true);
    setError(null);
    
    axios.get('http://localhost:5000/notes')
      .then(response => {
        setNotes(response.data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching notes:', error);
        setError('Failed to load notes. Please check if the server is running.');
        setLoading(false);
        setNotes([]);
      });
  }, []);

  const addNote = useCallback((newNote) => {
    // Input validation and sanitization
    if (!newNote.title?.trim() && !newNote.content?.trim()) {
      alert("Note cannot be empty!");
      return;
    }

    // Content length validation
    if (newNote.content.length > 2000) {
      alert("Note content is too long! Maximum 2000 characters allowed.");
      return;
    }

    const noteToSend = {
      title: sanitizeInput(newNote.title?.trim() || ''),
      content: sanitizeInput(newNote.content?.trim() || ''),
      isPinned: newNote.isPinned || false
    };
    
    console.log('📝 Sending sanitized note to backend:', noteToSend);
    
    // Create temporary note for immediate UI update
    const tempNote = {
      _id: `temp-${Date.now()}`,
      ...noteToSend,
      aiSummary: "",
      tags: []
    };
    
    // Add to state immediately
    setNotes(prevNotes => [...prevNotes, tempNote]);
    
    // Send to backend
    axios.post('http://localhost:5000/notes', noteToSend)
      .then(response => {
        const savedNote = response.data;
        console.log('✅ Note saved to database:', savedNote);
        
        // Replace temporary note with real note
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note._id === tempNote._id ? savedNote : note
          )
        );
        
        // Generate AI features
        if (showAIFeatures) {
          generateAIFeatures(savedNote);
        }
      })
      .catch(error => {
        console.error('❌ Error adding note:', error.response?.data || error.message);
        alert('Failed to create note. Check console for details.');
        
        // Remove temporary note on error
        setNotes(prevNotes => prevNotes.filter(note => note._id !== tempNote._id));
      });
  }, [showAIFeatures]);

// the generateAIFeatures function 

const generateAIFeatures = useCallback(async (savedNote) => {
  if (!showAIFeatures) return;

  // ✅ Enhanced duplicate prevention
  if (savedNote.lastEnhanced && Date.now() - new Date(savedNote.lastEnhanced).getTime() < 30000) {
    console.log('⏩ Skipping AI features - recently enhanced');
    return;
  }

  console.log('🤖 Generating AI features for note:', savedNote._id);

  try {
    // Process all AI features
    const [summaryRes, tagsRes] = await Promise.all([
      axios.post('http://localhost:5000/ai/summarize', { 
        content: savedNote.content 
      }),
      axios.post('http://localhost:5000/ai/tags', { 
        content: savedNote.content 
      })
    ]);

    const updatedNote = {
      ...savedNote,
      aiSummary: summaryRes.data.summary || '',
      tags: tagsRes.data.tags || [],
      lastEnhanced: new Date().toISOString()
    };

    await axios.put(`http://localhost:5000/notes/${savedNote._id}`, updatedNote);

    setNotes(prevNotes => 
      prevNotes.map(note => note._id === savedNote._id ? updatedNote : note)
    );

    console.log('✅ AI features applied successfully');

  } catch (error) {
    console.error('❌ AI feature error:', error);
    // Don't block the user if AI features fail
  }
}, [showAIFeatures, setNotes]);

  const updateNote = useCallback((id, updatedNote) => {
    // Sanitize updated note
    const sanitizedNote = {
      ...updatedNote,
      title: sanitizeInput(updatedNote.title || ''),
      content: sanitizeInput(updatedNote.content || '')
    };

    axios.put(`http://localhost:5000/notes/${id}`, sanitizedNote)
      .then(response => {
        setNotes(notes.map((note) => (note._id === id ? response.data : note)));
      })
      .catch(error => {
        console.error('Error updating note:', error);
        alert('Failed to update note. Please try again.');
      });
  }, [notes]);

  const togglePin = useCallback((id) => {
    const noteToToggle = notes.find((note) => note._id === id);
    
    if (!noteToToggle) {
      console.error(`Note with id ${id} not found`);
      return;
    }
    
    const updatedNote = { 
      ...noteToToggle, 
      isPinned: !noteToToggle.isPinned 
    };

    axios
      .put(`http://localhost:5000/notes/${id}`, updatedNote)
      .then((response) => {
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note._id === id ? response.data : note))
        );
      })
      .catch((error) => {
        console.error("Error toggling pin:", error);
        alert('Failed to pin note. Please try again.');
      });
  }, [notes]);
  
  const deleteNote = useCallback((id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      // Optimistic update - remove from state immediately
      setNotes(prevNotes => prevNotes.filter((note) => note._id !== id));
      
      // Then delete from backend
      axios
        .delete(`http://localhost:5000/notes/${id}`)
        .catch((error) => {
          console.error("Error deleting note:", error);
          alert('Failed to delete note. Please try again.');
          // Re-fetch notes to restore state
          fetchNotes();
        });
    }
  }, [fetchNotes]);

  // AI Feature: Get content suggestions
const handleGetSuggestions = async (content) => {
  try {
    const response = await fetch("http://localhost:5000/ai/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (data.success && data.suggestions) {
      // 🧠 Return full structured suggestion object (not strings)
      return {
        title: data.suggestions.title || "",
        tags: data.suggestions.tags || [],
        nextLine: data.suggestions.nextLine || "",
      };
    }
  } catch (err) {
    console.error("❌ Suggestion fetch failed:", err);
  }

  return null;
};


  // Ensure we have notes before sorting
  const sortedNotes = [...(notes || [])].sort((a, b) => {
    if (!a || !b) return 0;
    return (b.isPinned || false) - (a.isPinned || false);
  });

 
  return (
    <div>
      <Header />
      <CreateArea 
        onAdd={addNote} 
        onGetSuggestions={handleGetSuggestions}
        showAIFeatures={showAIFeatures}
      />
      
      {/* AI Features Toggle */}
      <div className="ai-toggle">
        <label>
          <input 
            type="checkbox" 
            checked={showAIFeatures}
            onChange={(e) => setShowAIFeatures(e.target.checked)}
          />
          🤖 Enable AI Features
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '15px',
          margin: '20px auto',
          borderRadius: '8px',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={fetchNotes}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              background: '#c62828',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading notes...
        </div>
      )}

      <div className="notes-container">
        {!loading && sortedNotes && sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            note ? (
              <Note
                key={note._id}
                id={note._id}
                title={note.title || ""}
                content={note.content || ""}
                isPinned={note.isPinned || false}
                aiSummary={note.aiSummary || ""}
                tags={note.tags || []}
                onDelete={deleteNote}
                onTogglePin={togglePin}
                onEdit={updateNote}
                showAIFeatures={showAIFeatures}
              />
            ) : null
          ))
        ) : (
          !loading && !error && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666', width: '100%' }}>
              <h3>No notes yet</h3>
              <p>Create your first note above!</p>
            </div>
          )
        )}
      </div>
       
      <Footer />
    </div>
  );
}

export default App;
