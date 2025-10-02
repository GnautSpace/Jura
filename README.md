# Jura - Justice For All

"Legal docs shouldn’t feel like decoding ancient scrolls."  
Jura simplifies legal document analysis using AI - helping people extract key details, summarize insights, and even listen to legal content through text-to-speech.

---

## Inspiration

The legal domain is complex, and accessing case details efficiently can be challenging. I came across people who were either deceived by fake documents or simply unable to read the content of legal paperwork.  
Jura was born to fix that - a tool to make legal analysis more accessible, accurate, and AI-assisted.

---

## What It Does

- Upload Legal PDFs: Quickly upload scanned or digital legal documents.  
- Extract Key Details: Pull out important case info using AI-powered text extraction.  
- Summarize Insights: Get concise summaries of lengthy, jargon-heavy legal docs.  
- Text-to-Speech: Listen to summaries or entire documents for improved accessibility.

---

## How I Built It

- Frontend: React  
- Backend: Node.js + Express  
- AI Processing: Gemini APIs for translation, summarization, and text extraction  
- Styling: HTML & CSS  

---

## What's Next for Jura

- Case lookup & status tracking features for real-time legal insights  
- User–prosecutor/lawyer connection functionality  
- More languages and better OCR for global accessibility

---

## Tech Stack

Built With: HTML, CSS, React, Node.js, Express, Gemini APIs

---

## Hacktoberfest

Jura is part of Hacktoberfest 2025.  
We welcome all contributors - whether you want to fix bugs, improve summarization, add features, or write documentation.

---

## Contributing

We welcome contributions! Jura is still under development, so there’s plenty of room to make an impact.

You can contribute by:  
- Adding new features – e.g., better PDF handling, enhanced TTS voices, multi-language support, case lookup, or status tracking  
- Fixing bugs – issues with PDF parsing, summarization, or frontend glitches  
- Improving documentation – writing guides, tutorials, or better README explanations  
- Enhancing UI/UX – make the app more intuitive and visually appealing  
- Optimizing performance – speed up AI processing, reduce memory usage, or handle larger files  
- Testing – write unit tests for backend, frontend, or AI modules  

### How to contribute:
1. Fork the repo and clone it locally.  
2. Create a feature branch for your work:  
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes, commit with a clear message, and push to your fork.
4. Open a pull request (PR) to the main Jura repo describing your changes.

Note: Jura is not live yet, so contributions will be tested locally. Pull requests that improve functionality, add new features, or make the app more user-friendly are highly encouraged

Getting Started
1. Clone the repo
    ```bash
    git clone https://github.com/YOUR-USERNAME/jura.git
    
    ```

2.  frontend
   ```bash
     cd frontend
     npm install
    
   ```
   To run the frontend 
   ```bash
   npm run dev
   ```     
4. backend
   ```bash
    cd backend
    npm install
   ```
  To run the server/backend
  ```bash
  npm run start
  ```
5. Gemini AI API keys
   - Go to (google ai studio)[https://aistudio.google.com]
   - select `Get API key` from the left sidebar and create a project if not already done
   - select the project from the drop-down and create an api key
   - example of `.env` file
      ```bash
         GEMINI_API_KEY=<your-key-here>
         GEMINI_API_KEY_1=<your-key-here>
      ```
      
License
This project is licensed under the MIT License — see the LICENSE file for details.
