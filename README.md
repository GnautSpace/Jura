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

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your system
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- Google Gemini API keys (get them from [Google AI Studio](https://aistudio.google.com))

### 🐳 Quick Start with Docker (Recommended)

This is the easiest way to run the entire application with both frontend and backend.

1. **Clone the repository**
   ```bash
   git clone https://github.com/GnautSpace/Jura.git
   cd Jura
   ```

2. **Set up environment variables**
   
   Copy the example environment file and add your API keys:
   
   **Linux / macOS / Git Bash**
   ```bash
   cp .env.example .env
   ```
   
   **Windows (PowerShell)**
   ```powershell
   copy .env.example .env
   ```
   
   Edit the `.env` file and add your Gemini API keys:
   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_API_KEY_1=your_actual_api_key_1_here
   ```

3. **Run the application**
   
   **Development mode (with hot-reload):**
   ```bash
   docker-compose up
   ```
   
   **Production mode:**
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```
   
   **Run in detached mode (background):**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API (Main): http://localhost:3000
   - Backend API (LexiBot): http://localhost:5000

5. **Stop the application**
   ```bash
   docker-compose down
   ```
   
   **Stop and remove volumes:**
   ```bash
   docker-compose down -v
   ```

### Environment Variables

The application uses the following environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for LexiBot | Yes | - |
| `GEMINI_API_KEY_1` | Google Gemini API key for document processing | Yes | - |
| `NODE_ENV` | Environment mode (`development` or `production`) | No | `development` |
| `VITE_API_URL` | Backend API URL for frontend | No | `http://localhost:3000` |
| `VITE_LEXI_API_URL` | LexiBot API URL for frontend | No | `http://localhost:5000` |

**How to get Gemini API keys:**
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click `Get API key` from the left sidebar
3. Create a project if you haven't already
4. Generate an API key for your project
5. Copy the key (it should start with `AIza`)

### 💻 Local Development (without Docker)

If you prefer to run the services locally without Docker:

1. **Clone the repo**
   ```bash
   git clone https://github.com/GnautSpace/Jura.git
   cd Jura
   ```

2. **Setup Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your API keys
   npm install
   npm run dev:both  # Runs both servers with hot-reload
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000 & http://localhost:5000

### 🔧 Docker Commands Reference

**Build images:**
```bash
docker-compose build
```

**Rebuild without cache:**
```bash
docker-compose build --no-cache
```

**View logs:**
```bash
docker-compose logs -f
```

**View logs for specific service:**
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

**Execute commands in container:**
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
```

**Restart services:**
```bash
docker-compose restart
```

### 🧪 Testing

The backend includes comprehensive unit and integration tests with Jest and Supertest.

**Running Tests:**

```bash
# Run all tests
npm test --prefix backend

# Run tests in watch mode (re-runs on file changes)
npm run test:watch --prefix backend

# Run tests with coverage report
npm run test:coverage --prefix backend

# Run only unit tests
npm run test:unit --prefix backend

# Run only integration tests
npm run test:integration --prefix backend
```

**Test Coverage:**

Current test coverage for backend:
- **68 test cases** covering critical functionality
- **52% statement coverage** on server.cjs
- **43% branch coverage** 
- Unit tests for utility functions (sanitization, validation, error handling)
- Integration tests for API endpoints (/chat, /health)
- Mocked external dependencies (Gemini API)

**Test Structure:**

```
backend/tests/
├── unit/
│   ├── utils.test.js      # Utility function tests
│   └── errors.test.js     # Error handling tests
├── integration/
│   └── api.test.js        # API endpoint tests
├── mocks/
│   └── gemini.mock.js     # Gemini API mock
├── setup.js               # Test environment setup
└── README.md              # Detailed testing guide
```

For detailed testing documentation, see **[Testing Guide](backend/tests/README.md)**

---

### 🐛 Troubleshooting

**Port already in use:**
```bash
# Find and kill the process using the port (example for port 3000)
# Linux/macOS:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Container won't start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**Hot-reload not working:**
- Make sure you're using `docker-compose.yml` (not `docker-compose.prod.yml`)
- On Windows, ensure file sharing is enabled in Docker Desktop settings
- Try stopping and restarting the containers

**API key errors:**
- Make sure your `.env` file exists in the root directory
- Check that API keys start with `AIza`
- Ensure no quotes around the API keys in `.env` file
- Try restarting the containers after updating `.env`

**Cannot connect to backend:**
- Verify both services are running: `docker-compose ps`
- Check if ports 3000, 5000, and 5173 are available
- Make sure the backend container is healthy: `docker-compose logs backend`

---

## 📚 Additional Documentation

For more detailed information:

**Docker & Deployment:**
- **[Docker Setup Guide](docs/DOCKER.md)** - Comprehensive Docker documentation
- **[Dockerization Summary](docs/DOCKERIZATION_SUMMARY.md)** - Implementation details
- **[Docker Quick Reference](docs/DOCKER_QUICK_REFERENCE.txt)** - Quick command reference
- **[Dockerization Checklist](docs/DOCKERIZATION_CHECKLIST.md)** - Verification checklist
- **[GitHub Actions Example](docs/.github-workflows-docker-build.yml.example)** - CI/CD template

**Testing:**
- **[Testing Guide](backend/tests/README.md)** - Comprehensive testing documentation
- **[Error Handling Guide](backend/Docs/ERROR_HANDLING.md)** - Backend error handling

---

## Contribution
please check (CONTRIBUTING.md)[https://github.com/GnautSpace/Jura/blob/main/CONTRIBUTING.md]
      
## License
This project is licensed under the MIT License — see the LICENSE file for details.
