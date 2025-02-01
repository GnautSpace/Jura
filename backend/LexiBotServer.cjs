const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: "http://localhost:5173", 
  methods: 'POST,GET,PUT,PATCH,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));


const apiKey = process.env.GEMINI_API_KEY;
//console.log("Loaded API Key:", process.env.GEMINI_API_KEY || "Not Found");

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
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

const sanitizeResponse=(text)=>{
  return text.replace(/(\*\*|\*|__|_)/g, "").replace(/^>\s+/gm, "").replace(/^[-*]\s+/gm, "").trim();
}

app.post("/chat", async (req, res) => {
  try {
    const userMsg = req.body.message;
    const chatSession = model.startChat({
      generationConfig,
      history: [{ role: "user", parts: [{ text: userMsg }] }],
    });

    const result = await chatSession.sendMessage(userMsg);
    const rawResponse = result.response.text();
    console.log("Raw Response:", rawResponse);

    const sanitizedResponse = sanitizeResponse(rawResponse);
    console.log("Sanitized Response:", sanitizedResponse);

    res.send(sanitizedResponse);
  } catch (error) {
    console.error("Error in /chat route:", error.message);
    res.status(500).send("Failed to process the request.");
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
