const { describe, test, expect } = require('@jest/globals');

// Since sanitizeResponse and validateChatInput are in server.cjs and not exported,
// we'll create standalone versions for testing purposes or extract them to a utils file

// Test implementation of sanitizeResponse
const sanitizeResponse = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      console.warn("Invalid response text received:", typeof text);
      return "I'm sorry, I couldn't process your request. Please try again.";
    }
    
    const cleanedText = text
      .replace(/^>\s*/gm, "")                // Remove quote markers (> at start of line)
      .replace(/^[-\*]\s*/gm, "")            // Remove bullet points (- or * at start of line)  
      .replace(/(\*\*|\*|__|_)/g, "")        // Remove bold, italic, underscores (must be after bullets)
      .trim();
      
    return cleanedText || "I'm sorry, I couldn't process your request. Please try again.";
  } catch (error) {
    console.error("Error sanitizing response:", error.message);
    return "I'm sorry, there was an error processing the response. Please try again.";
  }
};

// Test implementation of ValidationError
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

// Test implementation of validateChatInput
const validateChatInput = (body) => {
  if (!body) {
    throw new ValidationError("Request body is required");
  }
  
  if (!body.message) {
    throw new ValidationError("Message is required", "message");
  }
  
  if (typeof body.message !== 'string') {
    throw new ValidationError("Message must be a string", "message");
  }
  
  if (body.message.trim().length === 0) {
    throw new ValidationError("Message cannot be empty", "message");
  }
  
  if (body.message.length > 10000) {
    throw new ValidationError("Message is too long (max 10,000 characters)", "message");
  }
  
  return body.message.trim();
};

describe('Utility Functions - Unit Tests', () => {
  
  describe('sanitizeResponse', () => {
    test('should remove markdown bold markers', () => {
      const input = '**This is bold text**';
      const expected = 'This is bold text';
      expect(sanitizeResponse(input)).toBe(expected);
    });
    
    test('should remove markdown italic markers', () => {
      const input = '*This is italic*';
      const expected = 'This is italic';
      expect(sanitizeResponse(input)).toBe(expected);
    });
    
    test('should remove underscores', () => {
      const input = '__This is underlined__';
      const expected = 'This is underlined';
      expect(sanitizeResponse(input)).toBe(expected);
    });
    
    test('should remove quote markers', () => {
      const input = '> This is a quote';
      const expected = 'This is a quote';
      expect(sanitizeResponse(input)).toBe(expected);
    });
    
    test('should remove bullet point markers', () => {
      const input = '- Item 1\n* Item 2';
      const expected = 'Item 1\nItem 2';
      expect(sanitizeResponse(input)).toBe(expected);
    });
    
    test('should trim whitespace', () => {
      const input = '  Text with spaces  ';
      const expected = 'Text with spaces';
      expect(sanitizeResponse(input)).toBe(expected);
    });
    
    test('should handle null input', () => {
      const result = sanitizeResponse(null);
      expect(result).toBe("I'm sorry, I couldn't process your request. Please try again.");
    });
    
    test('should handle undefined input', () => {
      const result = sanitizeResponse(undefined);
      expect(result).toBe("I'm sorry, I couldn't process your request. Please try again.");
    });
    
    test('should handle non-string input', () => {
      const result = sanitizeResponse(12345);
      expect(result).toBe("I'm sorry, I couldn't process your request. Please try again.");
    });
    
    test('should handle empty string', () => {
      const result = sanitizeResponse('');
      expect(result).toBe("I'm sorry, I couldn't process your request. Please try again.");
    });
    
    test('should handle complex markdown text', () => {
      const input = '> **Bold** and *italic* with __underline__';
      const expected = 'Bold and italic with underline';
      expect(sanitizeResponse(input)).toBe(expected);
    });
  });
  
  describe('validateChatInput', () => {
    test('should accept valid message', () => {
      const body = { message: 'Hello, AI!' };
      const result = validateChatInput(body);
      expect(result).toBe('Hello, AI!');
    });
    
    test('should trim whitespace from message', () => {
      const body = { message: '  Hello, AI!  ' };
      const result = validateChatInput(body);
      expect(result).toBe('Hello, AI!');
    });
    
    test('should throw error for missing body', () => {
      expect(() => validateChatInput(null)).toThrow(ValidationError);
      expect(() => validateChatInput(null)).toThrow("Request body is required");
    });
    
    test('should throw error for missing message field', () => {
      const body = {};
      expect(() => validateChatInput(body)).toThrow(ValidationError);
      expect(() => validateChatInput(body)).toThrow("Message is required");
    });
    
    test('should throw error for non-string message', () => {
      const body = { message: 12345 };
      expect(() => validateChatInput(body)).toThrow(ValidationError);
      expect(() => validateChatInput(body)).toThrow("Message must be a string");
    });
    
    test('should throw error for empty message', () => {
      const body = { message: '   ' };
      expect(() => validateChatInput(body)).toThrow(ValidationError);
      expect(() => validateChatInput(body)).toThrow("Message cannot be empty");
    });
    
    test('should throw error for message exceeding max length', () => {
      const longMessage = 'a'.repeat(10001);
      const body = { message: longMessage };
      expect(() => validateChatInput(body)).toThrow(ValidationError);
      expect(() => validateChatInput(body)).toThrow("Message is too long");
    });
    
    test('should accept message at max length boundary', () => {
      const maxLengthMessage = 'a'.repeat(10000);
      const body = { message: maxLengthMessage };
      const result = validateChatInput(body);
      expect(result).toBe(maxLengthMessage);
    });
  });
  
  describe('ValidationError class', () => {
    test('should create error with message', () => {
      const error = new ValidationError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe(null);
    });
    
    test('should create error with message and field', () => {
      const error = new ValidationError('Test error', 'testField');
      expect(error.message).toBe('Test error');
      expect(error.field).toBe('testField');
      expect(error.statusCode).toBe(400);
    });
    
    test('should be instance of Error', () => {
      const error = new ValidationError('Test error');
      expect(error).toBeInstanceOf(Error);
    });
  });
});
