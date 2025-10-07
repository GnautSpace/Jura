const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Custom Error Classes
class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.statusCode = 400;
    }
}

class APIError extends Error {
    constructor(message, statusCode = 500, fixableReason = null) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.fixableReason = fixableReason;
    }
}

class ConfigurationError extends Error {
    constructor(message, fixableReason = null) {
        super(message);
        this.name = 'ConfigurationError';
        this.statusCode = 500;
        this.fixableReason = fixableReason;
    }
}

const app = express();

// Conversation storage for maintaining context across requests
const conversationStore = new Map();
const CONVERSATION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Clean up old conversations periodically
setInterval(() => {
    const now = Date.now();
    for (const [conversationId, conversation] of conversationStore.entries()) {
        if (now - conversation.lastActivity > CONVERSATION_TIMEOUT) {
            conversationStore.delete(conversationId);
            console.log(`🧹 Cleaned up conversation: ${conversationId}`);
        }
    }
}, 5 * 60 * 1000); // Clean every 5 minutes

// Health check caching system
const HEALTH_CACHE_TTL = 60 * 1000; // 1 minute cache TTL
const ENABLE_GEMINI_HEALTH = process.env.ENABLE_GEMINI_HEALTH === 'true';
let geminiHealthCache = {
    result: null,
    timestamp: 0,
    lastError: null
};

const corsOptions = {
  origin: "http://localhost:5173", 
  methods: 'POST,GET,PUT,PATCH,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Simple rate limiting middleware
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_REQUESTS = 30; // 30 requests per minute

const rateLimit = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!rateLimitMap.has(clientIP)) {
        rateLimitMap.set(clientIP, { requests: 1, windowStart: now });
        return next();
    }
    
    const clientData = rateLimitMap.get(clientIP);
    
    if (now - clientData.windowStart > RATE_LIMIT_WINDOW) {
        clientData.requests = 1;
        clientData.windowStart = now;
        return next();
    }
    
    if (clientData.requests >= RATE_LIMIT_REQUESTS) {
        return res.status(429).json({
            success: false,
            error: "Rate Limit Exceeded",
            message: "Too many requests. Please wait before trying again.",
            fixableReason: "Wait for 1 minute before making another request"
        });
    }
    
    clientData.requests++;
    next();
};

app.use(rateLimit);

// Configure Gemini AI
if (!process.env.GEMINI_API_KEY) {
    console.error("🚨 CRITICAL ERROR: GEMINI_API_KEY environment variable is missing!");
    console.error("💡 Solution: Add GEMINI_API_KEY=your_api_key_here to your .env file");
    console.error("🔗 Get your API key from: https://aistudio.google.com/");
    process.exit(1);
}

let genAI;
try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("✅ Gemini AI initialized successfully");
} catch (error) {
    console.error("🚨 Failed to initialize Gemini AI:", error.message);
    throw new ConfigurationError(
        "Failed to initialize Gemini AI",
        "Check your GEMINI_API_KEY in the .env file"
    );
}

// Generation configuration
const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 2048,
};

// Enhanced input validation helper
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

    // Validate conversationId if provided
    if (body.conversationId && typeof body.conversationId !== 'string') {
        throw new ValidationError("Conversation ID must be a string", "conversationId");
    }

    // Validate context if provided
    if (body.context && typeof body.context !== 'string') {
        throw new ValidationError("Context must be a string", "context");
    }
    
    return {
        message: body.message.trim(),
        conversationId: body.conversationId || null,
        context: body.context || null
    };
};

// Efficient Gemini health check function
const checkGeminiHealth = async () => {
    const now = Date.now();
    
    // Check if we have a fresh cached result
    if (geminiHealthCache.result && (now - geminiHealthCache.timestamp) < HEALTH_CACHE_TTL) {
        console.log('📋 Using cached Gemini health status');
        return geminiHealthCache.result;
    }
    
    let healthResult = {
        status: 'unknown',
        error: null,
        checkType: 'lightweight'
    };
    
    try {
        if (ENABLE_GEMINI_HEALTH) {
            // Full generative test (quota-consuming)
            console.log('🧪 Performing full Gemini generation test...');
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
            await model.generateContent("ping");
            healthResult.status = 'operational';
            healthResult.checkType = 'full-generation';
        } else {
            // Lightweight check - just verify model initialization
            console.log('⚡ Performing lightweight Gemini check...');
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
            // Just verify the model can be instantiated without generating content
            if (model && model.model) {
                healthResult.status = 'operational';
                healthResult.checkType = 'model-init';
            } else {
                throw new Error('Model instantiation failed');
            }
        }
    } catch (error) {
        console.log(`❌ Gemini health check failed: ${error.message}`);
        healthResult.status = 'error';
        healthResult.error = error.message;
        geminiHealthCache.lastError = error.message;
    }
    
    // Cache the result
    geminiHealthCache.result = healthResult;
    geminiHealthCache.timestamp = now;
    
    return healthResult;
};

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            server: 'operational',
            geminiAI: 'checking...',
            healthConfig: {
                geminiFullCheck: ENABLE_GEMINI_HEALTH,
                cacheTTL: HEALTH_CACHE_TTL / 1000 + 's'
            }
        };
        
        // Perform efficient Gemini health check
        const geminiResult = await checkGeminiHealth();
        
        healthData.geminiAI = geminiResult.status;
        healthData.geminiCheckType = geminiResult.checkType;
        
        if (geminiResult.error) {
            healthData.geminiError = geminiResult.error;
        }
        
        // Determine overall status
        if (geminiResult.status === 'error') {
            healthData.status = 'degraded';
        } else if (geminiResult.status === 'unknown') {
            // Don't mark as degraded for unknown status in lightweight mode
            healthData.status = 'healthy';
        }
        
        const statusCode = healthData.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(healthData);
    } catch (error) {
        console.error('🚨 Health endpoint error:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            healthConfig: {
                geminiFullCheck: ENABLE_GEMINI_HEALTH,
                cacheTTL: HEALTH_CACHE_TTL / 1000 + 's'
            }
        });
    }
});

app.post("/chat", async (req, res) => {
  const startTime = Date.now();
  let chatData;
  
  try {
    // Input validation
    chatData = validateChatInput(req.body);
    const { message: userMsg, conversationId, context } = chatData;
    
    console.log(`\nNEW CHAT REQUEST`);
    console.log(`Message: "${userMsg.substring(0, 100)}${userMsg.length > 100 ? '...' : ''}"`);
    console.log(`Message Length: ${userMsg.length} characters`);
    console.log(`Conversation ID: ${conversationId || 'none'}`);
    console.log(`Context: ${context || 'none'}`);
    console.log(`Started at: ${new Date().toLocaleTimeString()}`);

    // Get or create conversation history
    let conversation = null;
    if (conversationId) {
        conversation = conversationStore.get(conversationId);
        if (conversation) {
            conversation.lastActivity = Date.now();
            console.log(`📚 Using existing conversation with ${conversation.history.length} messages`);
        }
    }

    // Create enhanced system instruction based on context
    let systemInstruction = `You are a helpful legal assistant named "Lexi." Your role is to offer basic legal information and guidance in an approachable and easy-to-understand way. You specialize in answering questions about rights, legal terms, and processes.`;
    
    if (context === 'legal_assistant') {
        systemInstruction += ` You are specifically focused on legal assistance and should:
        - Provide clear, accurate legal information
        - Explain complex legal terms in simple language
        - Always remind users that this is general information and they should consult a qualified attorney for specific legal advice
        - Be helpful and professional in your responses
        - If asked about non-legal topics, politely redirect the conversation back to legal matters`;
    }

    systemInstruction += ` Always remind users to seek advice from a licensed legal professional for specific issues.`;
    
    // Initialize AI model with error handling
    let model;
    try {
      model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        systemInstruction: systemInstruction,
      });
    } catch (error) {
      throw new APIError(
        "Failed to initialize AI model",
        500,
        "Check your GEMINI_API_KEY or try restarting the server"
      );
    }

    // Prepare conversation history for AI model
    let chatHistory = [];
    if (conversation && conversation.history.length > 0) {
        // Use existing conversation history
        chatHistory = conversation.history;
        console.log(`📜 Loading ${chatHistory.length} previous messages`);
    }

    // Start chat session with error handling
    let chatSession;
    try {
      chatSession = model.startChat({
        generationConfig,
        history: chatHistory,
      });
    } catch (error) {
      throw new APIError(
        "Failed to start chat session",
        500,
        "This might be a temporary issue. Please try again in a moment"
      );
    }

    // Send message with comprehensive error handling
    let result;
    try {
      result = await chatSession.sendMessage(userMsg);
    } catch (error) {
      if (error.message.includes('API_KEY_INVALID')) {
        throw new APIError(
          "Invalid API key",
          401,
          "Please check your GEMINI_API_KEY in the .env file. Get a valid key from https://aistudio.google.com/"
        );
      } else if (error.message.includes('quota')) {
        throw new APIError(
          "API quota exceeded",
          429,
          "Your Gemini API quota has been exceeded. Check your billing settings or try again later"
        );
      } else if (error.message.includes('PERMISSION_DENIED')) {
        throw new APIError(
          "Permission denied",
          403,
          "Your API key doesn't have permission for this request. Check your API key settings"
        );
      } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
        throw new APIError(
          "Rate limit exceeded",
          429,
          "Too many requests. Please wait a moment before trying again"
        );
      } else if (error.message.includes('timeout') || error.code === 'ECONNRESET') {
        throw new APIError(
          "Request timeout",
          504,
          "The AI service is taking too long to respond. Please try again with a shorter message"
        );
      } else {
        throw new APIError(
          "AI service error",
          502,
          "There's an issue with the AI service. Please try again in a moment"
        );
      }
    }

    // Process response with error handling
    let rawResponse;
    try {
      rawResponse = result.response.text();
      console.log("Raw Response:", rawResponse);
    } catch (error) {
      throw new APIError(
        "Failed to extract response text",
        500,
        "The AI response couldn't be processed. Please try again"
      );
    }

    // Sanitize response to prevent potential security issues
    const sanitizedResponse = rawResponse
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();

    if (!sanitizedResponse) {
      throw new APIError(
        "Empty response from AI",
        500,
        "The AI didn't provide a response. Please try rephrasing your question"
      );
    }

    const processingTime = Date.now() - startTime;

    // Save conversation history if conversationId is provided
    if (conversationId) {
        if (!conversation) {
            // Create new conversation
            conversation = {
                id: conversationId,
                history: [],
                createdAt: Date.now(),
                lastActivity: Date.now(),
                context: context
            };
            conversationStore.set(conversationId, conversation);
            console.log(`💾 Created new conversation: ${conversationId}`);
        }

        // Add user message and bot response to history
        conversation.history.push(
            { role: "user", parts: [{ text: userMsg }] },
            { role: "model", parts: [{ text: sanitizedResponse }] }
        );
        
        // Keep only last 20 messages to prevent memory issues
        if (conversation.history.length > 40) {
            conversation.history = conversation.history.slice(-40);
        }
        
        conversation.lastActivity = Date.now();
        console.log(`💾 Saved conversation (${conversation.history.length} messages)`);
    }
    
    console.log(`=======================================================`);
    console.log(`✅ SUCCESS - Chat completed in ${processingTime}ms`);
    console.log(`Input Length: ${userMsg.length} chars`);
    console.log(`Response Length: ${sanitizedResponse.length} chars`);
    console.log(`Completed at: ${new Date().toLocaleTimeString()}`);
    console.log(`Performance: ${processingTime < 2000 ? '🟢 Fast' : processingTime < 5000 ? '🟡 Normal' : '🔴 Slow'}`);
    console.log(`=======================================================\n`);
    
    res.json({
      success: true,
      response: sanitizedResponse,
      processingTime: processingTime,
      conversationId: conversationId
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    // Enhanced terminal logging with detailed error information
    console.error('\n🚨 ================================ ERROR ================================');
    console.error(`Processing Time: ${processingTime}ms`);
    console.error(`User Message: "${chatData ? chatData.message.substring(0, 100) : 'N/A'}${chatData && chatData.message.length > 100 ? '...' : ''}"`);
    console.error(`Error Type: ${error.name || 'Unknown'}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Status Code: ${error.statusCode || 500}`);
    
    if (error.stack) {
      console.error(`Stack Trace:\n${error.stack}`);
    }
    
    if (error.fixableReason) {
      console.error(`How to Fix: ${error.fixableReason}`);
    }
    
    console.error('================================================================\n');
    
    // Handle different error types
    if (error instanceof ValidationError) {
      console.error(`⚠️ VALIDATION ERROR: Client sent invalid data - Field: ${error.field || 'unknown'}`);
      return res.status(error.statusCode).json({
        success: false,
        error: "Validation Error",
        message: error.message,
        field: error.field,
        fixableReason: `Please provide a valid ${error.field || 'input'}`
      });
    }
    
    if (error instanceof APIError) {
      console.error(`🤖 API ERROR: Issue with Gemini AI service - Status: ${error.statusCode}`);
      return res.status(error.statusCode).json({
        success: false,
        error: "API Error",
        message: error.message,
        fixableReason: error.fixableReason
      });
    }
    
    // Generic server error
    console.error(`💥 UNEXPECTED ERROR: Something went wrong internally`);
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: "An unexpected error occurred while processing your request",
      fixableReason: "Please try again in a moment or contact support if the issue persists"
    });
  }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Not Found",
        message: `Route ${req.method} ${req.path} not found`,
        fixableReason: "Check the URL and request method. Available endpoints: GET /health, POST /chat"
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("🚨 Unhandled middleware error:", error);
    
    res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "An unexpected server error occurred",
        fixableReason: "This is likely a server issue. Please try again or contact support"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 LexiBot Server is running on port ${PORT}`);
  console.log(`🔗 Frontend should connect to: http://localhost:${PORT}/chat`);
  console.log(`❤️ Health check available at: http://localhost:${PORT}/health`);
  console.log(`📊 Rate limiting: ${RATE_LIMIT_REQUESTS} requests per minute per IP`);
  console.log(`💾 Conversations will be cleaned up after ${CONVERSATION_TIMEOUT / (60 * 1000)} minutes of inactivity`);
  console.log(`🏥 Health check mode: ${ENABLE_GEMINI_HEALTH ? 'Full generation test (quota-consuming)' : 'Lightweight check (quota-free)'}`);
  console.log(`⏰ Health cache TTL: ${HEALTH_CACHE_TTL / 1000} seconds`);
  console.log(`💡 To enable full Gemini health checks, set ENABLE_GEMINI_HEALTH=true in your .env file`);
  console.log("✅ Server ready to handle requests!\n");
});