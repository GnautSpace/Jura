# Error Handling Documentation

## Overview
This backend implements comprehensive error handling with detailed, fixable error messages to help developers and users understand and resolve issues quickly.

## Error Types

### 1. ValidationError (400)
**Description**: Invalid input from client
**Fields**: 
- `field`: The specific field that failed validation
- `fixableReason`: How to fix the issue

**Examples**:
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Message is required",
  "field": "message",
  "fixableReason": "Please provide a valid message"
}
```

### 2. APIError (Various Status Codes)
**Description**: Issues with external API calls (Gemini AI)
**Common Status Codes**:
- `401`: Invalid API key
- `403`: Permission denied
- `429`: Rate limit exceeded
- `502`: AI service error
- `504`: Request timeout

**Examples**:
```json
{
  "success": false,
  "error": "API Error",
  "message": "Invalid API key",
  "fixableReason": "Please check your GEMINI_API_KEY in the .env file. Get a valid key from https://aistudio.google.com/"
}
```

### 3. ConfigurationError (500)
**Description**: Server configuration issues
**Example**:
```json
{
  "success": false,
  "error": "Configuration Error",
  "message": "Failed to initialize Google Generative AI",
  "fixableReason": "Check if your GEMINI_API_KEY is valid and properly formatted"
}
```

## Features

### Input Validation
- **Empty messages**: Prevents empty or whitespace-only messages
- **Message length**: Limits messages to 10,000 characters
- **Type checking**: Ensures message is a string
- **JSON validation**: Handles malformed JSON requests

### API Error Handling
- **Invalid API keys**: Detects and provides fix instructions
- **Quota exceeded**: Explains billing/quota issues
- **Rate limiting**: Both client-side and server-side protection
- **Timeout handling**: Graceful handling of slow AI responses
- **Permission errors**: Clear explanation of access issues

### Server Error Handling
- **Port conflicts**: Detailed instructions for resolving EADDRINUSE
- **Permission issues**: Guidance for port access problems
- **Graceful shutdown**: Proper cleanup on SIGTERM/SIGINT
- **Health monitoring**: `/health` endpoint for system status

### Rate Limiting
- **Limit**: 30 requests per minute per IP
- **Window**: 60 seconds
- **Response**: Includes retry-after time
- **Memory-based**: Simple in-memory storage (production should use Redis)

### Logging & Monitoring
- **Request logging**: Every chat request is logged with processing time
- **Error logging**: Comprehensive error details with timestamps
- **Performance tracking**: Response time monitoring
- **Health checks**: System status and AI service connectivity

## API Endpoints

### POST /chat
**Purpose**: Main chat endpoint for AI interactions

**Request**:
```json
{
  "message": "Your legal question here"
}
```

**Success Response**:
```json
{
  "success": true,
  "response": "AI response text",
  "processingTime": 1234
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Error description",
  "fixableReason": "How to fix this error"
}
```

### GET /health
**Purpose**: System health and status monitoring

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-03T...",
  "uptime": 3600,
  "memory": {...},
  "environment": "development",
  "geminiAI": "operational"
}
```

## Environment Setup

### Required Environment Variables
```env
GEMINI_API_KEY_1=AIzaSy...  # Primary API key (server.cjs)
GEMINI_API_KEY=AIzaSy...    # API key (LexiBotServer.cjs)
```

### API Key Validation
- Must start with "AIza"
- Should be 39 characters long
- Validated at startup
- Tested during health checks

## Testing Error Handling

Run the test suite:
```bash
node test-error-handling.js
```

This will test:
1. Health check endpoint
2. 404 error handling
3. Empty message validation
4. Missing message validation
5. Invalid JSON handling
6. Message length validation
7. Basic rate limiting

## Production Considerations

### 1. Rate Limiting
- Current implementation uses in-memory storage
- For production, use Redis or similar for distributed rate limiting
- Consider implementing user-based limits instead of IP-based

### 2. Logging
- Integrate with proper logging service (Winston, etc.)
- Add request IDs for tracing
- Implement log rotation
- Send critical errors to monitoring service

### 3. Security
- Add request validation middleware
- Implement proper CORS policies
- Add helmet.js for security headers
- Consider API key rotation strategy

### 4. Monitoring
- Set up health check monitoring
- Add metrics collection (Prometheus, etc.)
- Implement alerting for error rates
- Monitor API quota usage

### 5. Error Recovery
- Implement retry logic for transient failures
- Add circuit breaker pattern for API calls
- Consider fallback responses for AI failures
- Implement graceful degradation

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process using the port
netstat -ano | findstr :3000
# Kill the process
taskkill /PID <PID> /F
```

### Invalid API Key
1. Go to https://aistudio.google.com/
2. Create or select a project
3. Generate a new API key
4. Update your `.env` file

### API Quota Exceeded
1. Check your Google Cloud billing
2. Monitor usage in AI Studio
3. Consider upgrading your plan
4. Implement better rate limiting

### Network Issues
1. Check internet connectivity
2. Verify firewall settings
3. Check if Google AI services are accessible
4. Consider implementing retry logic

## Error Response Schema

All errors follow this consistent schema:
```typescript
interface ErrorResponse {
  success: false;
  error: string;                                        // Error type/category
  message: string;                                      // Human-readable error description
  fixableReason?: string;                               // How to fix the issue
  field?: string;                                       // For validation errors
  retryAfter?: number;                                  // For rate limiting (seconds)
}
```

This ensures consistent error handling across the entire API and makes it easy for frontend applications to display helpful error messages to users.