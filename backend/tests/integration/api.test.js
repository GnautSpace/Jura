const request = require('supertest');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

// Mock the Google Generative AI before requiring the app
jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn().mockResolvedValue({
    response: {
      text: () => 'This is a mocked AI response from Gemini API. The document has been successfully analyzed and summarized.'
    }
  });
  
  const mockSendMessage = jest.fn().mockResolvedValue({
    response: {
      text: () => 'This is a mocked AI response from Gemini API. The document has been successfully analyzed and summarized.'
    }
  });
  
  const mockStartChat = jest.fn().mockReturnValue({
    sendMessage: mockSendMessage
  });
  
  const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent,
    startChat: mockStartChat
  });
  
  class MockGoogleGenerativeAI {
    constructor(apiKey) {
      this.apiKey = apiKey;
    }
    
    getGenerativeModel() {
      return {
        generateContent: mockGenerateContent,
        startChat: mockStartChat
      };
    }
  }
  
  return {
    GoogleGenerativeAI: MockGoogleGenerativeAI
  };
});

// Now require the app after mocking
const app = require('../../server.cjs');

describe('API Endpoints - Integration Tests', () => {
  
  describe('GET /health', () => {
    test('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('geminiAI');
    });
    
    test('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
    
    test('should return memory usage information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('heapUsed');
    });
  });
  
  describe('POST /chat', () => {
    test('should accept valid message and return AI response', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: 'Hello, how are you?' })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('response');
      expect(typeof response.body.response).toBe('string');
      expect(response.body.response.length).toBeGreaterThan(0);
    });
    
    test('should sanitize markdown from response', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: 'Tell me about legal documents' })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      // Check that response doesn't contain markdown markers
      expect(response.body.response).not.toMatch(/\*\*/);
      expect(response.body.response).not.toMatch(/\*/);
    });
    
    test('should return 400 for missing message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({})
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('ValidationError');
      expect(response.body.message).toMatch(/message/i);
    });
    
    test('should return 400 for empty message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: '   ' })
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
    
    test('should return 400 for non-string message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: 12345 })
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('ValidationError');
      expect(response.body.message).toMatch(/string/i);
    });
    
    test('should return 400 for message exceeding length limit', async () => {
      const longMessage = 'a'.repeat(10001);
      const response = await request(app)
        .post('/chat')
        .send({ message: longMessage })
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('ValidationError');
      expect(response.body.message).toMatch(/too long/i);
    });
    
    test('should handle missing request body', async () => {
      const response = await request(app)
        .post('/chat')
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
    });
    
    test('should trim whitespace from message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: '  Hello  ' })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
    
    test('should handle special characters in message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: 'Test with special chars: @#$%^&*()' })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
    
    test('should handle JSON content type', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: 'Test message' })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
  
  describe('Rate Limiting', () => {
    test('should accept requests under rate limit', async () => {
      // Make a few requests that should all succeed
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/chat')
          .send({ message: `Test message ${i}` })
          .set('Content-Type', 'application/json');
        
        expect(response.status).toBe(200);
      }
    });
    
    // Note: Testing rate limiting fully would require many requests
    // This is a basic test to ensure the endpoint responds correctly
  });
  
  describe('Error Handling', () => {
    test('should return proper error structure', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: '' })
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body.success).toBe(false);
    });
    
    test('should return 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);
      
      // Express default 404 response
      expect(response.status).toBe(404);
    });
  });
  
    describe('CORS Configuration', () => {
    test('should have CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should handle OPTIONS preflight request', async () => {
      const response = await request(app)
        .options('/chat')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);
    });

    test('should allow requests from configured origin', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');
      
      expect(response.headers['access-control-allow-origin']).toBeTruthy();
    });
  });

  describe('Health Check Details', () => {
    test('should return uptime information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    test('should return environment information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('environment');
      expect(response.body.environment).toBe('test');
    });

    test('should return gemini AI status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('geminiAI');
      expect(response.body.geminiAI).toBe('mocked');
    });
  });

  describe('Chat Endpoint Edge Cases', () => {
    test('should handle very long valid messages', async () => {
      const longMessage = 'a'.repeat(9999); // Just under 10000 limit
      const response = await request(app)
        .post('/chat')
        .send({ message: longMessage })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('should handle messages with newlines', async () => {
      const message = 'Line 1\nLine 2\nLine 3';
      const response = await request(app)
        .post('/chat')
        .send({ message })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('should handle messages with tabs', async () => {
      const message = 'Text\twith\ttabs';
      const response = await request(app)
        .post('/chat')
        .send({ message })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('should handle unicode characters', async () => {
      const message = 'Hello 你好 مرحبا שלום';
      const response = await request(app)
        .post('/chat')
        .send({ message })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('should handle emojis in message', async () => {
      const message = 'Hello 👋 How are you? 😊';
      const response = await request(app)
        .post('/chat')
        .send({ message })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    test('should return processing time in response', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: 'Test message' })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.body).toHaveProperty('processingTime');
      expect(typeof response.body.processingTime).toBe('number');
      expect(response.body.processingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Input Validation Edge Cases', () => {
    test('should reject message with only whitespace', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: '   \n\t   ' })
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
    });

    test('should reject null message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: null })
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('should reject array as message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: ['test'] })
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('should reject object as message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: { text: 'test' } })
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('should reject boolean as message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: true })
        .set('Content-Type', 'application/json')
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('Response Headers', () => {
    test('should return JSON content type for /chat', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: 'Test' })
        .set('Content-Type', 'application/json')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/json/);
    });

    test('should return JSON content type for /health', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/json/);
    });

    test('should return JSON for error responses', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ message: '' })
        .expect(400);
      
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
