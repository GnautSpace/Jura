const express = require('express');
const cors = require('cors');
/*const multer = require('multer');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');*/

const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();


const app = express();

//const upload = multer({ dest: "uploads/" });

const corsOptions = {
    origin: ["http://localhost:5173","https://jura-flame.vercel.app/"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const apiKey1 = process.env.GEMINI_API_KEY_1;
//const apiKey2 = process.env.GEMINI_API_KEY_2;

if (!apiKey1) {
    console.error("API keys are missing in the environment variables.");
    process.exit(1);
}

const genai_1 = new GoogleGenerativeAI(apiKey1);
//const genai_2 = new GoogleGenerativeAI(apiKey2);

const generationConfig = {
    temperature: 0.5,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 5000,
    responseMimeType: "text/plain",
};

const sanitizeResponse = (text) => {
    const cleanedText = text.replace(/(\*\*|\*|__|_)/g, "").replace(/^>\s+/gm, "").replace(/^[-*]\s+/gm, "").trim();
    return cleanedText || "I'm sorry, I couldn't process your request. Please try again.";
};

app.post("/chat", async (req, res) => {
    try {
        const userMsg = req.body.message;
        const model = genai_1.getGenerativeModel({
            model: "gemini-1.5-pro",
            systemInstruction: `You are a helpful legal assistant named "Lexi." Your role is to offer basic legal information and guidance in an approachable and easy-to-understand way.`,
        });

        const chatSession = model.startChat({
            generationConfig,
            history: [{ role: "user", parts: [{ text: userMsg }] }],
        });

        const result = await chatSession.sendMessage(userMsg);
        const rawResponse = result.response.text();
        const sanitizedResponse = sanitizeResponse(rawResponse);

        res.send(sanitizedResponse);
    } catch (error) {
        console.error("Error in /chat route:", error.message);
        res.status(500).send("Failed to process the request.");
    }
});
/*
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        console.error("no file uploaded");
        return res.status(400).json({ error: "no file uploaded" });
    }

    try {
        console.log("File received:", req.file); 
        const filePath = req.file.path;
        const fileType = req.file.mimetype;
        let extractedText = "";

        if (fileType === "application/pdf") {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
        } else {
            throw new Error("Unsupported file format. only PdFs are allowed.");
        }

        console.log("Extracted text from PDF:", extractedText);

        await fs.unlink(filePath); 

        const model_2 = genai_2.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
        Analyze the following legal document and extract key information:
        1. Case Name (if applicable)
        2. Plaintiff and Defendant
        3. Key Legal Issues
        4. Laws & Statutes Referenced
        5. Important Dates

        Return the response in JSON format.

        Document:
        ${extractedText}
        `;

        const result = await model_2.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const rawResponse = await result.response.text();
        console.log("Raw Response from AI:", rawResponse);

        const cleanedResponse = rawResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanedResponse);
        } catch (error) {
            console.error("JSON Parsing Error:", error.message);
            return res.status(500).json({ error: "Invalid JSON from AI" });
        }

        res.json({ extractedText, analysis: parsedResponse });

    } catch (error) {
        console.error("Error in /upload route:", error.message);
        res.status(500).json({ error: "Failed to process the file." });
    }
});*/


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));