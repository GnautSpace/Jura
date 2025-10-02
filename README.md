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

Getting Started
1. Clone the repo
    ```bash
    git clone https://github.com/GnautSpace/Jura.git
    
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


      OR

   - Copy `.env.example` to `.env`
     - **Linux / macOS**
        ```bash
        cd backend
        cp .env.example .env
        ```
     - **Windows (PowerShell)**
        ```powershell
        cd backend
        copy .env.example .env
        ```
     - **Windows (Git Bash / WSL)**
        ```bash
        cd backend
        cp .env.example .env
        ```

## Contribution
please check (CONTRIBUTING.md)[https://github.com/GnautSpace/Jura/blob/main/CONTRIBUTING.md]
      
## License
This project is licensed under the MIT License — see the LICENSE file for details.
