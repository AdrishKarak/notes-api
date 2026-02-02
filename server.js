const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// In-memory storage
let notes = [];
let noteIdCounter = 1;

// Rate limiting storage
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_NOTES_PER_MINUTE = 5;

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
  const now = Date.now();
  const clientId = req.ip || 'default'; // In production, use proper client identification
  
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, []);
  }
  
  const timestamps = rateLimitMap.get(clientId);
  
  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (validTimestamps.length >= MAX_NOTES_PER_MINUTE) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Maximum ${MAX_NOTES_PER_MINUTE} notes per minute allowed`
    });
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(clientId, validTimestamps);
  
  next();
};

// Utility function to trim and validate strings
const cleanString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

// Validate note input
const validateNoteInput = (title, content) => {
  const errors = [];
  
  const cleanTitle = cleanString(title);
  const cleanContent = cleanString(content);
  
  if (!cleanTitle) {
    errors.push('Title is required and cannot be empty or just spaces');
  }
  
  if (!cleanContent) {
    errors.push('Content is required and cannot be empty or just spaces');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanTitle,
    cleanContent
  };
};

// 1. Create a Note
app.post('/notes', rateLimiter, (req, res) => {
  const { title, content } = req.body;
  
  const validation = validateNoteInput(title, content);
  
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
  }
  
  const newNote = {
    id: noteIdCounter++,
    title: validation.cleanTitle,
    content: validation.cleanContent,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  notes.push(newNote);
  
  res.status(201).json({
    message: 'Note created successfully',
    note: newNote
  });
});

// 2. Get All Notes
app.get('/notes', (req, res) => {
  // Sort by most recently updated first
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.updated_at) - new Date(a.updated_at)
  );
  
  res.json({
    count: sortedNotes.length,
    notes: sortedNotes
  });
});

// 3. Update a Note
app.put('/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const { title, content } = req.body;
  
  const noteIndex = notes.findIndex(note => note.id === noteId);
  
  if (noteIndex === -1) {
    return res.status(404).json({
      error: 'Note not found',
      message: `No note exists with id ${noteId}`
    });
  }
  
  const existingNote = notes[noteIndex];
  let hasChanges = false;
  const updatedFields = {};
  
  // Handle partial updates
  if (title !== undefined) {
    const cleanTitle = cleanString(title);
    if (!cleanTitle) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['Title cannot be empty or just spaces']
      });
    }
    if (cleanTitle !== existingNote.title) {
      updatedFields.title = cleanTitle;
      hasChanges = true;
    }
  }
  
  if (content !== undefined) {
    const cleanContent = cleanString(content);
    if (!cleanContent) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['Content cannot be empty or just spaces']
      });
    }
    if (cleanContent !== existingNote.content) {
      updatedFields.content = cleanContent;
      hasChanges = true;
    }
  }
  
  if (!hasChanges) {
    return res.json({
      message: 'No changes detected - note remains unchanged',
      note: existingNote
    });
  }
  
  // Apply updates
  const updatedNote = {
    ...existingNote,
    ...updatedFields,
    updated_at: new Date().toISOString()
  };
  
  notes[noteIndex] = updatedNote;
  
  res.json({
    message: 'Note updated successfully',
    note: updatedNote,
    updated_fields: Object.keys(updatedFields)
  });
});

// 4. Search Notes
app.get('/notes/search', (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({
      error: 'Search query required',
      message: 'Please provide a search query using the "q" parameter'
    });
  }
  
  // Clean and normalize the search query
  const cleanQuery = cleanString(query).toLowerCase();
  
  if (!cleanQuery) {
    return res.status(400).json({
      error: 'Invalid search query',
      message: 'Search query cannot be empty or just spaces'
    });
  }
  
  // Case-insensitive search in both title and content
  const results = notes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(cleanQuery);
    const contentMatch = note.content.toLowerCase().includes(cleanQuery);
    return titleMatch || contentMatch;
  });
  
  // Sort results by most recently updated
  const sortedResults = results.sort((a, b) => 
    new Date(b.updated_at) - new Date(a.updated_at)
  );
  
  res.json({
    query: cleanQuery,
    count: sortedResults.length,
    notes: sortedResults
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Notes API server running on port ${PORT}`);
});

module.exports = app;