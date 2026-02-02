# Notes API - Backend Development Task

A minimal backend API for managing notes with intelligent validation and rate limiting.

## Features

✨ **Intelligent Validation**
- Automatically trims extra spaces from inputs
- Rejects empty strings and whitespace-only content
- Validates both title and content fields
- Provides detailed error messages

🚀 **Smart Behavior**
- Detects when updates don't change anything
- Returns meaningful responses for no-op updates
- Case-insensitive search
- Automatic sorting by most recently updated

⏱️ **Rate Limiting**
- Maximum 5 notes per minute per client
- Prevents API abuse
- Clear error messages when limit exceeded

## Installation

```bash
npm install
```

## Running the Server

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### 1. Create a Note

**POST** `/notes`

Creates a new note with intelligent validation.

**Request Body:**
```json
{
  "title": "Meeting Notes",
  "content": "Discussed hiring plan and deadlines"
}
```

**Validation Rules:**
- `title` is required and cannot be empty or whitespace
- `content` is required and cannot be empty or whitespace
- Extra spaces are automatically trimmed

**Success Response (201):**
```json
{
  "message": "Note created successfully",
  "note": {
    "id": 1,
    "title": "Meeting Notes",
    "content": "Discussed hiring plan and deadlines",
    "created_at": "2025-02-02T21:42:00.000Z",
    "updated_at": "2025-02-02T21:42:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "details": [
    "Title is required and cannot be empty or just spaces",
    "Content is required and cannot be empty or just spaces"
  ]
}
```

**Rate Limit Response (429):**
```json
{
  "error": "Rate limit exceeded",
  "message": "Maximum 5 notes per minute allowed"
}
```

---

### 2. Get All Notes

**GET** `/notes`

Retrieves all notes sorted by most recently updated first.

**Success Response (200):**
```json
{
  "count": 3,
  "notes": [
    {
      "id": 2,
      "title": "Updated Note",
      "content": "This was just updated",
      "created_at": "2025-02-02T21:42:00.000Z",
      "updated_at": "2025-02-02T21:45:00.000Z"
    },
    {
      "id": 1,
      "title": "Meeting Notes",
      "content": "Discussed hiring plan and deadlines",
      "created_at": "2025-02-02T21:42:00.000Z",
      "updated_at": "2025-02-02T21:42:00.000Z"
    }
  ]
}
```

---

### 3. Update a Note

**PUT** `/notes/:id`

Updates an existing note. Supports partial updates.

**Request Body:**
```json
{
  "title": "Updated Meeting Notes",
  "content": "Discussed hiring plan, deadlines, and budget"
}
```

**Partial Update Example:**
```json
{
  "content": "Only updating the content"
}
```

**Validation Rules:**
- Partial updates are allowed (can update only title or only content)
- Fields provided cannot be empty or whitespace
- If update doesn't change anything, returns meaningful response
- Automatically updates `updated_at` timestamp

**Success Response (200):**
```json
{
  "message": "Note updated successfully",
  "note": {
    "id": 1,
    "title": "Updated Meeting Notes",
    "content": "Discussed hiring plan, deadlines, and budget",
    "created_at": "2025-02-02T21:42:00.000Z",
    "updated_at": "2025-02-02T21:45:00.000Z"
  },
  "updated_fields": ["title", "content"]
}
```

**No Changes Response (200):**
```json
{
  "message": "No changes detected - note remains unchanged",
  "note": {
    "id": 1,
    "title": "Meeting Notes",
    "content": "Discussed hiring plan and deadlines",
    "created_at": "2025-02-02T21:42:00.000Z",
    "updated_at": "2025-02-02T21:42:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Note not found",
  "message": "No note exists with id 999"
}
```

---

### 4. Search Notes

**GET** `/notes/search?q=meeting`

Searches for notes in both title and content fields.

**Query Parameters:**
- `q` (required): Search query string

**Search Features:**
- Case-insensitive matching
- Searches in both title and content
- Ignores extra spaces in query
- Returns results sorted by most recently updated
- "Meet" will match "meeting"

**Success Response (200):**
```json
{
  "query": "meeting",
  "count": 2,
  "notes": [
    {
      "id": 1,
      "title": "Meeting Notes",
      "content": "Discussed hiring plan and deadlines",
      "created_at": "2025-02-02T21:42:00.000Z",
      "updated_at": "2025-02-02T21:42:00.000Z"
    },
    {
      "id": 3,
      "title": "Project Ideas",
      "content": "Schedule a meeting for next week",
      "created_at": "2025-02-02T21:42:00.000Z",
      "updated_at": "2025-02-02T21:42:00.000Z"
    }
  ]
}
```

**Error Response (400):**
```json
{
  "error": "Invalid search query",
  "message": "Search query cannot be empty or just spaces"
}
```

---

## Testing

Run the comprehensive test suite:

```bash
npm test
```

This will test:
- ✅ Valid note creation
- ✅ Validation error handling
- ✅ Getting all notes
- ✅ Updating notes
- ✅ Partial updates
- ✅ No-change detection
- ✅ Search functionality
- ✅ Case-insensitive search
- ✅ Rate limiting

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit:** 5 notes per minute per client
- **Window:** 60 seconds
- **Response:** HTTP 429 when exceeded

Rate limiting is applied only to the **POST /notes** endpoint.

## Technical Implementation

### Technology Stack
- **Node.js** with **Express.js**
- In-memory storage (can be replaced with database)
- No external validation libraries (custom validation)

### Key Features
1. **Intelligent String Cleaning**: Automatically trims whitespace from all inputs
2. **Empty String Detection**: Rejects strings that are only whitespace
3. **Partial Update Support**: Can update only title or content
4. **Change Detection**: Knows when an update doesn't actually change data
5. **Flexible Search**: Case-insensitive, searches both fields
6. **Auto-sorting**: Always returns notes sorted by most recent update

## Project Structure

```
notes-api/
├── server.js          # Main server file with all endpoints
├── package.json       # Dependencies and scripts
├── test.js           # Comprehensive test suite
└── README.md         # Documentation
```

## Example Usage

### Using cURL

**Create a note:**
```bash
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"Note content here"}'
```

**Get all notes:**
```bash
curl http://localhost:3000/notes
```

**Update a note:**
```bash
curl -X PUT http://localhost:3000/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

**Search notes:**
```bash
curl "http://localhost:3000/notes/search?q=meeting"
```

## Development Notes

- The API uses in-memory storage, so data is lost when the server restarts
- For production, replace the `notes` array with a database (MongoDB, PostgreSQL, etc.)
- Rate limiting uses IP address for client identification
- All timestamps are in ISO 8601 format

