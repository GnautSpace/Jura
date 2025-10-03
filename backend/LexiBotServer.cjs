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
    try {
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        
        if (!rateLimitMap.has(clientIP)) {
            rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
            return next();
        }
        
        const clientData = rateLimitMap.get(clientIP);
        
        if (now > clientData.resetTime) {
            // Reset the rate limit window
            rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
            return next();
        }
        
        if (clientData.count >= RATE_LIMIT_REQUESTS) {
            const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
            console.warn(`RATE LIMIT: IP ${clientIP} exceeded limit (${clientData.count}/${RATE_LIMIT_REQUESTS}). Retry in ${retryAfter}s`);
            return res.status(429).json({
                success: false,
                error: "Rate Limit Exceeded",
                message: "Too many requests from this IP",
                fixableReason: `Please wait ${retryAfter} seconds before making another request`,
                retryAfter: retryAfter
            });
        }
        
        clientData.count++;
        next();
    } catch (error) {
        console.error("Rate limiting error:", error);
        next(); // Continue without rate limiting if there's an error
    }
};

app.use('/chat', rateLimit);

// Enhanced Environment Variable Validation
const validateEnvironment = () => {
    const errors = [];
    
    if (!process.env.GEMINI_API_KEY) {
        errors.push("GEMINI_API_KEY is missing");
    } else if (!process.env.GEMINI_API_KEY.startsWith('AIza')) {
        errors.push("GEMINI_API_KEY appears to be invalid (should start with 'AIza')");
    }
    
    if (errors.length > 0) {
        console.error("Environment Configuration Errors:");
        errors.forEach(error => console.error(`  - ${error}`));
        console.error("\nHow to fix:");
        console.error("  1. Create a .env file in the backend directory");
        console.error("  2. Get a valid API key from https://aistudio.google.com/");
        console.error("  3. Add: GEMINI_API_KEY=your_api_key_here");
        process.exit(1);
    }
};

validateEnvironment();

const apiKey = process.env.GEMINI_API_KEY;

// Initialize Gemini AI with error handling
let genAI;
try {
    genAI = new GoogleGenerativeAI(apiKey);
} catch (error) {
    throw new ConfigurationError(
        "Failed to initialize Google Generative AI",
        "Check if your GEMINI_API_KEY is valid and properly formatted"
    );
}

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  systemInstruction: `You are a helpful legal assistant named "Lexi." Your role is to offer basic legal information and guidance in an approachable and easy-to-understand way. You specialize in answering questions about rights, legal terms, and processes. Always remind users to seek advice from a licensed legal professional for specific issues.`,
});

const generationConfig = {
  temperature: 0.5,
  topK: 64,
  topP: 0.95,
  maxOutputTokens: 5000,
  responseMimeType: "text/plain",
};

app.use(express.json());

// Enhanced response sanitization with error handling
const sanitizeResponse = (text) => {
    try {
        if (!text || typeof text !== 'string') {
            console.warn("Invalid response text received:", typeof text);
            return "I'm sorry, I couldn't process your request. Please try again.";
        }
        
        const cleanedText = text
            .replace(/(\*\*|\*|__|_)/g, "")
            .replace(/^>\s+/gm, "")
            .replace(/^[-*]\s+/gm, "")
            .trim();
            
        return cleanedText || "I'm sorry, I couldn't process your request. Please try again.";
    } catch (error) {
        console.error("Error sanitizing response:", error.message);
        return "I'm sorry, there was an error processing the response. Please try again.";
    }
};

// Input validation helper
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

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development',
            geminiAI: 'connected'
        };
        
        // Quick AI test
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
            const testResult = await model.generateContent("Hello");
            healthData.geminiAI = 'operational';
        } catch (error) {
            healthData.geminiAI = 'error';
            healthData.geminiError = error.message;
            healthData.status = 'degraded';
        }
        
        const statusCode = healthData.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(healthData);
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

app.post("/chat", async (req, res) => {
  const startTime = Date.now();
  let userMsg;
  
  try {
    // Input validation
    userMsg = validateChatInput(req.body);
    console.log(`\nNEW CHAT REQUEST`);
    console.log(`Message: "${userMsg.substring(0, 100)}${userMsg.length > 100 ? '...' : ''}"`);
    console.log(`Message Length: ${userMsg.length} characters`);
    console.log(`Started at: ${new Date().toLocaleTimeString()}`);
    
    // Initialize AI model with error handling
    let model;
    try {
      model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        systemInstruction: `You are a helpful legal assistant named "Lexi." Your role is to offer basic legal information and guidance in an approachable and easy-to-understand way. You specialize in answering questions about rights, legal terms, and processes. Always remind users to seek advice from a licensed legal professional for specific issues.`,
      });
    } catch (error) {
      throw new APIError(
        "Failed to initialize AI model",
        500,
        "Check your GEMINI_API_KEY or try restarting the server"
      );
    }

    // Start chat session with error handling
    let chatSession;
    try {
      chatSession = model.startChat({
        generationConfig,
        history: [{ role: "user", parts: [{ text: userMsg }] }],
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
        "The AI response was malformed. Please try rephrasing your question"
      );
    }

    const sanitizedResponse = sanitizeResponse(rawResponse);
    const processingTime = Date.now() - startTime;
    
    console.log(`\n✅ ======================== SUCCESS ========================`);
    console.log(`Processing Time: ${processingTime}ms`);
    console.log(`Input Length: ${userMsg.length} chars`);
    console.log(`Response Length: ${sanitizedResponse.length} chars`);
    console.log(`Completed at: ${new Date().toLocaleTimeString()}`);
    console.log(`Performance: ${processingTime < 2000 ? '🟢 Fast' : processingTime < 5000 ? '🟡 Normal' : '🔴 Slow'}`);
    console.log(`=======================================================\n`);
    
    res.json({
      success: true,
      response: sanitizedResponse,
      processingTime: processingTime
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    // Enhanced terminal logging with detailed error information
    console.error('\n🚨 ================================ ERROR ================================');
    console.error(`Processing Time: ${processingTime}ms`);
    console.error(`User Message: "${userMsg ? userMsg.substring(0, 100) : 'N/A'}${userMsg && userMsg.length > 100 ? '...' : ''}"`);
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
      fixableReason: "This appears to be a server issue. Please try again, and if the problem persists, contact support"
    });
  }
});

// Global error handling middleware
app.use((error, req, res, next) => {
    console.error('\n🚨 ======================= GLOBAL ERROR =======================');
    console.error(`Error Type: ${error.name || 'Unknown'}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Request URL: ${req.method} ${req.originalUrl}`);
    console.error(`Request IP: ${req.ip || req.connection.remoteAddress || 'unknown'}`);
    
    if (error.stack) {
        console.error(`📚 Stack Trace:\n${error.stack}`);
    }
    
    console.error('==========================================================\n');
    
    if (error instanceof ValidationError || error instanceof APIError || error instanceof ConfigurationError) {
        console.error(`⚙️ HANDLED ERROR: ${error.name} - Status: ${error.statusCode}`);
        return res.status(error.statusCode).json({
            success: false,
            error: error.name,
            message: error.message,
            fixableReason: error.fixableReason
        });
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        console.error(`JSON PARSE ERROR: Client sent malformed JSON`);
        return res.status(400).json({
            success: false,
            error: "JSON Parse Error",
            message: "Invalid JSON in request body",
            fixableReason: "Please check your request format and ensure it's valid JSON"
        });
    }
    
    console.error(`💥 UNHANDLED ERROR: This error type is not specifically handled`);
    res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        fixableReason: "This is likely a server issue. Please try again later or contact support"
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: "Not Found",
        message: `Route ${req.method} ${req.originalUrl} not found`,
        fixableReason: "Please check the URL and HTTP method. Available routes: POST /chat"
    });
});

// Enhanced server startup with better error handling
const port = process.env.PORT || 5000;

const startServer = () => {
    const server = app.listen(port, () => {
        console.log('\n ================== LEXIBOT SERVER STARTED ==================');
        console.log(`Server URL: http://localhost:${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Gemini AI: Ready (API Key: ${apiKey.substring(0, 8)}...)`);
        console.log(`CORS: Enabled for http://localhost:5173`);
        console.log(`Rate Limiting: ${RATE_LIMIT_REQUESTS} requests per minute`);
        console.log(`Available Endpoints:`);
        console.log(`  • POST /chat - AI Chat Interface`);
        console.log(`  • GET /health - Health Check`);
        console.log(`Started at: ${new Date().toLocaleString()}`);
        console.log('===========================================================\n');
        console.log(' Server logs will appear below when requests are made...\n');
    });
    
    // Handle server errors
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(` Port ${port} is already in use`);
            console.error(" How to fix:");
            console.error(`  1. Kill the process using port ${port}:`);
            console.error(`     netstat -ano | findstr :${port}`);
            console.error(`     taskkill /PID <PID> /F`);
            console.error(`  2. Or use a different port by setting PORT environment variable`);
            process.exit(1);
        } else if (error.code === 'EACCES') {
            console.error(`Permission denied for port ${port}`);
            console.error("How to fix: Try using a port number above 1024 or run as administrator");
            process.exit(1);
        } else {
            console.error("Server startup error:", error.message);
            process.exit(1);
        }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully...');
        server.close(() => {
            console.log('Server shut down successfully');
            process.exit(0);
        });
    });
    
    process.on('SIGINT', () => {
        console.log('\nSIGINT received, shutting down gracefully...');
        server.close(() => {
            console.log('Server shut down successfully');
            process.exit(0);
        });
    });
};

startServer();
