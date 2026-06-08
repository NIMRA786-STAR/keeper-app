
// File: src/CreateArea.jsx
import React, { useState, useRef, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';

const validateInput = (input, maxLength = 2000) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .substring(0, maxLength);
};

function CreateArea({ onAdd, onGetSuggestions, showAIFeatures }) {
  const [isExpanded, setExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const [note, setNote] = useState({
    title: "",
    content: ""
  });

  // Check speech recognition support on component mount
  useEffect(() => {
    const isSpeechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setRecognitionSupported(isSpeechSupported);
    
    if (!isSpeechSupported) {
      console.warn("Speech recognition not supported in this browser");
    }
  }, []);

  // Initialize speech recognition with better error handling
  const initSpeechRecognition = () => {
    if (!recognitionSupported) {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return null;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Enhanced configuration
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("🎤 Voice recognition started...");
        setIsRecording(true);
        finalTranscriptRef.current = note.content;
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += ' ' + transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Clean final transcript
        if (finalTranscript !== finalTranscriptRef.current) {
          finalTranscript = finalTranscript
            .replace(/\b(um|uh|ah|er|like|you know)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

          setNote(prevNote => ({
            ...prevNote,
            content: finalTranscript
          }));

          finalTranscriptRef.current = finalTranscript;
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        
        let errorMessage = "Speech recognition error: ";
        switch (event.error) {
          case 'no-speech':
            errorMessage += "No speech was detected.";
            break;
          case 'audio-capture':
            errorMessage += "No microphone was found.";
            break;
          case 'not-allowed':
            errorMessage += "Permission to use microphone was denied.";
            break;
          default:
            errorMessage += event.error;
        }
        
        alert(errorMessage);
        stopRecording();
      };

      recognition.onend = () => {
        console.log("Voice recognition ended.");
        setIsRecording(false);
      };

      return recognition;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      alert("Error initializing voice recognition. Please refresh and try again.");
      return null;
    }
  };

  const startRecording = () => {
    if (isRecording) return;

    try {
      const speechRecognition = initSpeechRecognition();
      if (speechRecognition) {
        recognitionRef.current = speechRecognition;
        speechRecognition.start();
      }
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      alert("Error starting voice recognition. Please try again.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Enhanced suggestion function with debouncing
  const getSuggestions = React.useCallback(
    (content) => {
      if (!content || content.length < 10 || !showAIFeatures) return;
      
      setIsLoadingSuggestions(true);
      onGetSuggestions(content)
  .then(data => {
    if (data && typeof data === "object") {
      const suggestionList = [];
      
      if (data.title) suggestionList.push(`💡 Suggested Title: ${data.title}`);
      if (data.nextLine) suggestionList.push(`📝 Next Idea: ${data.nextLine}`);

      setSuggestions(suggestionList);
    } else {
      setSuggestions([]);
    }

    setIsLoadingSuggestions(false);
  })
  .catch(error => {
    console.error('Error getting suggestions:', error);
    setSuggestions([]);
    setIsLoadingSuggestions(false);
  });

    },
    [onGetSuggestions, showAIFeatures]
  );

  // Single handleChange inside component, sanitized
  function handleChange(event) {
    const { name, value } = event.target;
    const sanitizedValue = validateInput(value, name === "content" ? 2000 : 100);

    setNote(prevNote => {
      const updatedNote = {
        ...prevNote,
        [name]: sanitizedValue
      };
      
      // Debounced suggestions
      if (name === "content" && sanitizedValue.length > 10 && showAIFeatures) {
        clearTimeout(handleChange.debounceTimer);
        handleChange.debounceTimer = setTimeout(() => getSuggestions(sanitizedValue), 500);
      }
      
      return updatedNote;
    });
  }

  function submitNote(event) {
    event.preventDefault();
    
    if (!note.title.trim() && !note.content.trim()) {
      alert("Note cannot be empty!");
      return;
    }

    onAdd(note);
    setNote({
      title: "",
      content: ""
    });
    setSuggestions([]);
    setExpanded(false);
    
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
  }


  // 🧠 Auto-fill title or append next line intelligently
function useSuggestion(suggestion) {
  if (!suggestion) return;

  if (suggestion.startsWith("💡 Suggested Title: ")) {
    const title = suggestion.replace("💡 Suggested Title: ", "").trim();
    setNote(prevNote => ({
      ...prevNote,
      title
    }));
  } 
  else if (suggestion.startsWith("📝 Next Idea: ")) {
    const nextLine = suggestion.replace("📝 Next Idea: ", "").trim();
    setNote(prevNote => ({
      ...prevNote,
      content: prevNote.content + "\n" + nextLine
    }));
  }

  setSuggestions([]);

}
  function expand() {
    setExpanded(true);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      clearTimeout(handleChange.debounceTimer);
    };
  }, [isRecording]);


  return (
    <div>
      <form className="create-note">
        {isExpanded && (
          <input
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="Title"
            maxLength={100}
          />
        )}
        <textarea
          name="content"
          onChange={handleChange}
          onClick={expand}
          value={note.content}
          placeholder={isRecording ? "🎤 Speak now..." : "Take a note... or click the mic to speak"}
          rows={isExpanded ? 3 : 1}
          disabled={isRecording}
          maxLength={2000}
        />

        {/* Character counter */}
     <div style={{ fontSize: '0.8em', color: '#666', textAlign: 'right', marginTop: '5px' }}>
          {note.content.length}/2000
        </div>

      {/* Voice Recording Indicator */}
       {isRecording && (
          <div className="recording-indicator">
            <div className="pulse-animation"></div>
            <span>🎤 Listening... Click stop when done</span>
            <button 
              type="button" 
              onClick={stopRecording}
              style={{ 
                marginLeft: '10px', 
                padding: '2px 8px', 
                fontSize: '0.8em',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Stop
            </button>
          </div>
        )}

        {/* Browser Support Warning */}
     {!recognitionSupported && (
          <div className="browser-support-warning">
            🎤 Voice features work best in Chrome, Edge, and Safari. 
            Make sure you're in a secure context (HTTPS) for best results.
          </div>
        )}

        {/* AI Suggestions */}
        {showAIFeatures && suggestions.length > 0 && (
          <div className="ai-suggestions">
                   <div className="suggestions-header">
                    <LightbulbIcon fontSize="small" />
                   <span>AI Suggestions</span>
              </div>
              {suggestions.map((suggestion, index) => (
               <div 
               key={index} 
               className="suggestion-item"
               onClick={() => useSuggestion(suggestion)}
             >
             {suggestion}
             </div>
             ))}
             </div>

        )}

        {showAIFeatures && isLoadingSuggestions && (
          <div className="loading-suggestions">
            <LightbulbIcon fontSize="small" />
            <span>Getting AI suggestions...</span>
          </div>
        )}

        <div className="action-buttons">
          {/* Voice Recording Button */}
      {recognitionSupported && (
            <Zoom in={isExpanded}>
              <Fab 
                className={`voice-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
                color={isRecording ? "secondary" : "default"}
                disabled={!recognitionSupported}
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
              </Fab>
            </Zoom>
          )}

          {/* Add Note Button */}
       <Zoom in={isExpanded}>
            <Fab onClick={submitNote} disabled={isRecording}>
              <AddIcon />
            </Fab>
          </Zoom>
        </div>
      </form>
    </div>
  );
 }

export default CreateArea;
