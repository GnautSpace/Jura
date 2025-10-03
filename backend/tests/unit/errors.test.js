const { describe, test, expect } = require('@jest/globals');

// Import server to get error classes
const app = require('../../server.cjs');

// We need to extract the error classes from the server module
// Since they're not exported, we'll test them through the API responses

describe('Error Classes - Unit Tests', () => {
  
  describe('ValidationError', () => {
    test('should be thrown for invalid input', async () => {
      const request = require('supertest');
      const response = await request(app)
        .post('/chat')
        .send({ message: '' })
        .expect(400);
      
      expect(response.body.error).toBe('ValidationError');
      expect(response.body.success).toBe(false);
    });

    test('should include field information when provided', async () => {
      const request = require('supertest');
      const response = await request(app)
        .post('/chat')
        .send({ message: 12345 })
        .expect(400);
      
      expect(response.body.error).toBe('ValidationError');
      expect(response.body.field).toBe('message');
    });

    test('should have status code 400', async () => {
      const request = require('supertest');
      const response = await request(app)
        .post('/chat')
        .send({})
        .expect(400);
      
      expect(response.status).toBe(400);
    });
  });

  describe('Error Response Structure', () => {
    test('should have consistent error structure', async () => {
      const request = require('supertest');
      const response = await request(app)
        .post('/chat')
        .send({ message: '' })
        .expect(400);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });

    test('should include fixableReason in error response', async () => {
      const request = require('supertest');
      const response = await request(app)
        .post('/chat')
        .send({ message: '' })
        .expect(400);
      
      expect(response.body).toHaveProperty('fixableReason');
    });
  });

  describe('JSON Parse Errors', () => {
    test('should handle malformed JSON gracefully', async () => {
      const request = require('supertest');
      const response = await request(app)
        .post('/chat')
        .set('Content-Type', 'application/json')
        .send('{"message": invalid json}')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('404 Errors', () => {
    test('should return 404 for non-existent routes', async () => {
      const request = require('supertest');
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not Found');
    });

    test('should return 404 for POST to invalid route', async () => {
      const request = require('supertest');
      const response = await request(app)
        .post('/invalid-route')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('Method Not Allowed', () => {
    test('should handle GET request to /chat endpoint', async () => {
      const request = require('supertest');
      const response = await request(app)
        .get('/chat')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });

    test('should handle PUT request to /health endpoint', async () => {
      const request = require('supertest');
      const response = await request(app)
        .put('/health')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });
});
