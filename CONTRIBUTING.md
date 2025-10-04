# Contributing to Jura

Thank you for your interest in contributing to Jura! We're excited to have you join our community. This guide will help you understand our contribution process, coding standards, and best practices.

## Note : The site is currently broken. It will take some time as i cannot check it until oct-6. If anyone is interested in maintaining the site meanwhile you are welcome. 

## 📋 Table of Contents

- [Hacktoberfest](#hacktoberfest)
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Conventions](#commit-message-conventions)
- [Issue and Pull Request Process](#issue-and-pull-request-process)
- [Backend Development Guidelines](#backend-development-guidelines)
- [Frontend Development Guidelines](#frontend-development-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Security Reporting](#security-reporting)
- [Additional Resources](#additional-resources)

---

## 🎃 Hacktoberfest

Jura is part of **Hacktoberfest 2025**! We welcome all contributors - whether you want to fix bugs, improve summarization, add features, or write documentation. Your contributions make this project stronger and more useful to everyone.

---

## 📜 Code of Conduct

By participating in this project, you agree to maintain a welcoming and inclusive environment. We expect all contributors to:

- Be respectful and considerate in communications
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

Any unacceptable behavior should be reported to the project maintainers.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for containerized development)
- **Git**

### Local Setup

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Jura.git
   cd Jura
   ```

2. **Set Up Environment Variables**
   ```bash
   # Copy the example environment files
   cp .env.example backend/.env
   cp .env.example frontend/.env
   
   # Edit the .env files with your API keys
   # Backend needs: GEMINI_API_KEY_1
   # Frontend needs: VITE_API_URL
   ```

3. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Run with Docker (Recommended)**
   ```bash
   # From the root directory
   docker-compose up --build
   ```

5. **Or Run Locally**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

---

## 🤝 How to Contribute

You can contribute in several ways:

### 1. **Add Features**
- Better PDF handling and parsing
- Enhanced text-to-speech voices
- Multi-language support
- Case lookup functionality
- Status tracking for legal documents
- UI/UX enhancements

### 2. **Fix Bugs**
- Issues with PDF parsing
- Summarization accuracy
- Frontend functionality
- Backend processing errors
- API integration issues

### 3. **Improve Documentation**
- Write guides and tutorials
- Improve README clarity
- Add code comments
- Create API documentation
- Update existing docs

### 4. **Testing**
- Write unit tests for backend
- Add integration tests
- Create E2E tests for frontend
- Improve test coverage
- Add edge case testing

### 5. **Performance Optimization**
- Improve AI processing speed
- Reduce memory usage
- Optimize large file handling
- Enhance database queries
- Frontend bundle optimization

---

## 💅 Code Style Guidelines

### General Principles

- **Consistency**: Follow the existing code style in the project
- **Readability**: Write clear, self-documenting code
- **Simplicity**: Keep it simple and maintainable
- **Comments**: Add comments for complex logic, not obvious code

### JavaScript/TypeScript Style

We follow these conventions for JavaScript code:

#### Naming Conventions

```javascript
// Constants - UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10485760;
const API_TIMEOUT = 30000;

// Variables and functions - camelCase
const userInput = 'Hello';
function processDocument(file) { }

// Classes and Components - PascalCase
class DocumentProcessor { }
function UserProfile() { }

// Private methods/properties - prefix with underscore
function _privateHelper() { }
```

#### Formatting

```javascript
// Use 2 spaces for indentation
function example() {
  if (condition) {
    doSomething();
  }
}

// Always use semicolons
const value = 10;

// Use single quotes for strings (except JSX)
const message = 'Hello, World!';

// Use template literals for string interpolation
const greeting = `Hello, ${name}!`;

// Destructure when possible
const { firstName, lastName } = user;

// Use arrow functions for callbacks
array.map(item => item.value);

// Use async/await instead of promises
async function fetchData() {
  const response = await fetch(url);
  return response.json();
}
```

### React Style

```jsx
// Function components (preferred)
function MyComponent({ title, onSubmit }) {
  return (
    <div className="my-component">
      <h1>{title}</h1>
    </div>
  );
}

// Props destructuring in parameters
function Button({ label, onClick, disabled = false }) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// Use meaningful component names
function UserProfileCard() { } // Good
function Component1() { }       // Bad
```

### ESLint Rules

The project uses ESLint for code quality. Run the linter before committing:

```bash
# Frontend
cd frontend
npm run lint

# Backend
cd backend
npm run lint  # if configured
```

---

## 📝 Commit Message Conventions

We follow the **Conventional Commits** specification for clear and structured commit history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code changes that neither fix bugs nor add features
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration
- **chore**: Other changes that don't modify src or test files

### Examples

```bash
# Feature
git commit -m "feat(chat): add file attachment support for chat interface"

# Bug fix
git commit -m "fix(pdf): resolve parsing error for scanned documents"

# Documentation
git commit -m "docs(readme): update installation instructions for Windows"

# Multiple paragraphs
git commit -m "feat(backend): implement rate limiting for API endpoints

- Add express-rate-limit middleware
- Configure limits for different routes
- Add tests for rate limiting behavior

Closes #42"

# Breaking change
git commit -m "feat(api)!: change response format for /chat endpoint

BREAKING CHANGE: Response now returns data in 'result' field instead of 'response'"
```

### Scope Guidelines

- **backend**: Backend/server changes
- **frontend**: Frontend/UI changes
- **api**: API-related changes
- **chat**: Chat functionality
- **pdf**: PDF processing
- **tts**: Text-to-speech features
- **docker**: Docker configuration
- **tests**: Test-related changes
- **deps**: Dependency updates

---

## 🔄 Issue and Pull Request Process

### Creating Issues

Before creating an issue:

1. **Search existing issues** to avoid duplicates
2. **Use issue templates** if available
3. **Provide detailed information**:
   - Clear, descriptive title
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (OS, browser, Node version)
   - Screenshots or error logs if applicable

#### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `hacktoberfest`: Hacktoberfest eligible

### Branch Naming

Create descriptive branch names following this pattern:

```bash
<type>/<description>-<issue-number>

# Examples
git checkout -b feat/add-file-upload-support-42
git checkout -b fix/resolve-pdf-parsing-error-15
git checkout -b docs/update-contributing-guide-23
git checkout -b refactor/improve-chat-component-31
```

### Submitting Pull Requests

1. **Create a Feature Branch**
   ```bash
   git checkout -b feat/your-feature-name-123
   ```

2. **Make Your Changes**
   - Write clean, well-documented code
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   # Run backend tests
   cd backend
   npm test
   
   # Run frontend tests (if available)
   cd frontend
   npm test
   
   # Test with Docker
   docker-compose up --build
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat(scope): add your feature description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feat/your-feature-name-123
   ```

6. **Open a Pull Request**
   - Go to the original Jura repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template with:
     - **Title**: Clear description (follows commit convention)
     - **Description**: What changes were made and why
     - **Related Issues**: Link to issues (e.g., "Closes #42")
     - **Testing**: How to test the changes
     - **Screenshots**: If UI changes are involved

### PR Review Process

- Maintainers will review your PR within 3-5 days
- Address any requested changes
- Keep discussions professional and constructive
- Once approved, a maintainer will merge your PR

### PR Checklist

Before submitting, ensure:

- [ ] Code follows project style guidelines
- [ ] Commit messages follow conventional commits
- [ ] Tests are added/updated and passing
- [ ] Documentation is updated if needed
- [ ] No merge conflicts with main branch
- [ ] PR description is clear and complete
- [ ] All CI checks pass

---

## 🖥️ Backend Development Guidelines

### Technology Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **AI Integration**: Google Generative AI (Gemini)
- **Testing**: Jest, Supertest
- **Module System**: CommonJS (`.cjs` files)

### Project Structure

```
backend/
├── server.cjs           # Main server file with Express routes
├── LexiBotServer.cjs    # (If applicable) Additional bot logic
├── package.json         # Dependencies and scripts
├── jest.config.js       # Jest configuration
├── Dockerfile           # Docker configuration
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── mocks/          # Mock implementations
│   └── setup.js        # Test environment setup
└── Docs/               # Backend documentation
```

### Best Practices

1. **Error Handling**
   ```javascript
   // Use custom error classes
   class ValidationError extends Error {
     constructor(message, field = null) {
       super(message);
       this.name = 'ValidationError';
       this.statusCode = 400;
       this.field = field;
     }
   }
   
   // Always handle errors gracefully
   app.post('/api/endpoint', async (req, res) => {
     try {
       // Your logic here
     } catch (error) {
       console.error('Error:', error);
       res.status(500).json({ 
         success: false, 
         error: error.message 
       });
     }
   });
   ```

2. **Input Validation**
   ```javascript
   // Validate all user inputs
   function validateChatInput(body) {
     if (!body || !body.message) {
       throw new ValidationError("Message is required", "message");
     }
     
     if (typeof body.message !== 'string') {
       throw new ValidationError("Message must be a string", "message");
     }
     
     if (body.message.length > 10000) {
       throw new ValidationError("Message is too long", "message");
     }
     
     return body.message.trim();
   }
   ```

3. **Environment Variables**
   ```javascript
   // Always use environment variables for sensitive data
   require('dotenv').config();
   
   const apiKey = process.env.GEMINI_API_KEY_1;
   if (!apiKey) {
     throw new Error('GEMINI_API_KEY_1 is required');
   }
   ```

4. **Async/Await**
   ```javascript
   // Prefer async/await over callbacks
   async function processRequest(data) {
     const result = await apiCall(data);
     return result;
   }
   ```

5. **Logging**
   ```javascript
   // Use console.log for development, consider winston/morgan for production
   console.log('Request received:', { method: req.method, path: req.path });
   console.error('Error occurred:', error.message);
   ```

### API Design Guidelines

- Use RESTful conventions
- Return consistent JSON responses
- Include proper HTTP status codes
- Add CORS headers appropriately
- Implement rate limiting for public endpoints
- Version your API (e.g., `/api/v1/`)

### Response Format

```javascript
// Success response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}

// Error response
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "field": "fieldName" // optional, for validation errors
}
```

---

## 🎨 Frontend Development Guidelines

### Technology Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: CSS (plain CSS or CSS Modules)
- **Routing**: React Router (if applicable)

### Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── styles/        # CSS files
│   ├── assets/        # Images, fonts, etc.
│   ├── App.jsx        # Main app component
│   └── main.jsx       # Entry point
├── public/            # Static assets
├── package.json
├── vite.config.js
└── Dockerfile
```

### Best Practices

1. **Component Organization**
   ```jsx
   // One component per file
   // MyComponent.jsx
   import './MyComponent.css';
   
   function MyComponent({ title, data, onAction }) {
     // Hooks at the top
     const [state, setState] = useState(null);
     const [loading, setLoading] = useState(false);
     
     // Event handlers
     const handleClick = () => {
       onAction(data);
     };
     
     // Render logic
     if (loading) return <Spinner />;
     
     return (
       <div className="my-component">
         <h2>{title}</h2>
         <button onClick={handleClick}>Click Me</button>
       </div>
     );
   }
   
   export default MyComponent;
   ```

2. **State Management**
   ```jsx
   // Use useState for local state
   const [count, setCount] = useState(0);
   
   // Use useEffect for side effects
   useEffect(() => {
     fetchData();
   }, [dependency]);
   
   // Use useContext for global state
   const theme = useContext(ThemeContext);
   ```

3. **API Calls**
   ```jsx
   // Create a separate API service file
   // src/services/api.js
   export async function sendChatMessage(message) {
     const response = await fetch(`${API_URL}/chat`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ message })
     });
     
     if (!response.ok) {
       throw new Error('Failed to send message');
     }
     
     return response.json();
   }
   
   // Use in component
   const handleSubmit = async () => {
     try {
       setLoading(true);
       const result = await sendChatMessage(message);
       setResponse(result);
     } catch (error) {
       setError(error.message);
     } finally {
       setLoading(false);
     }
   };
   ```

4. **Prop Validation**
   ```jsx
   // Consider using PropTypes or TypeScript
   import PropTypes from 'prop-types';
   
   MyComponent.propTypes = {
     title: PropTypes.string.isRequired,
     count: PropTypes.number,
     onSubmit: PropTypes.func.isRequired
   };
   ```

5. **Accessibility**
   ```jsx
   // Use semantic HTML
   <button>Click Me</button>  // Good
   <div onClick={...}>Click Me</div>  // Bad
   
   // Add ARIA labels when needed
   <input 
     type="text" 
     aria-label="Search documents"
     placeholder="Search..."
   />
   ```

### CSS Guidelines

```css
/* Use meaningful class names */
.chat-container { }      /* Good */
.cc { }                  /* Bad */

/* Use BEM naming for complex components */
.chat-message { }
.chat-message__author { }
.chat-message--highlighted { }

/* Prefer classes over IDs for styling */
.header { }              /* Good */
#header { }              /* Avoid */

/* Group related properties */
.button {
  /* Positioning */
  position: relative;
  
  /* Display & Box Model */
  display: inline-block;
  padding: 10px 20px;
  
  /* Color */
  background-color: #007bff;
  color: white;
  
  /* Text */
  font-size: 16px;
  
  /* Other */
  cursor: pointer;
  transition: all 0.3s ease;
}
```

---

## 🧪 Testing Guidelines

### Running Tests

```bash
# Backend tests
cd backend
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
```

### Writing Tests

#### Unit Tests

```javascript
// tests/unit/utils.test.js
const { describe, test, expect } = require('@jest/globals');

describe('sanitizeResponse', () => {
  test('should remove markdown formatting', () => {
    const input = '**Bold** and *italic* text';
    const expected = 'Bold and italic text';
    expect(sanitizeResponse(input)).toBe(expected);
  });
  
  test('should handle null input', () => {
    expect(sanitizeResponse(null)).toBe('Error message');
  });
});
```

#### Integration Tests

```javascript
// tests/integration/api.test.js
const request = require('supertest');
const app = require('../../server.cjs');

describe('POST /chat', () => {
  test('should return AI response', async () => {
    const response = await request(app)
      .post('/chat')
      .send({ message: 'Hello' })
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('response');
  });
});
```

### Test Coverage

We aim for:
- **Statements**: 50%+
- **Branches**: 40%+
- **Functions**: 40%+
- **Lines**: 50%+

---

## 🔒 Security Reporting

### Reporting Security Vulnerabilities

If you discover a security vulnerability in Jura, please follow these steps:

1. **DO NOT** open a public issue
2. **Email the maintainers** directly at: security@jura-project.example (or create a private security advisory on GitHub)
   - Or contact via GitHub: @mohitahlawat2001
3. **Include in your report**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Security Best Practices

When contributing, please:

- Never commit API keys, passwords, or secrets
- Use environment variables for sensitive data
- Validate and sanitize all user inputs
- Use HTTPS for API calls
- Keep dependencies up to date
- Follow OWASP security guidelines

### Responsible Disclosure

We ask that you:

- Give us reasonable time to address the issue (90 days)
- Don't exploit the vulnerability
- Don't share the vulnerability publicly until it's fixed

We will:

- Acknowledge your report within 48 hours
- Provide a timeline for the fix
- Credit you in the fix announcement (if desired)

---

## 📚 Additional Resources

### Documentation

- [README](./README.md) - Project overview and setup
- [Docker Guide](./docs/DOCKER.md) - Docker setup and usage
- [Testing Guide](./backend/tests/README.md) - Comprehensive testing documentation
- [Error Handling](./backend/Docs/ERROR_HANDLING.md) - Backend error handling guide

### External Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Jest Testing Framework](https://jestjs.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Google Generative AI](https://ai.google.dev/)

### Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/GnautSpace/Jura/issues)
- **Pull Requests**: [View open PRs](https://github.com/GnautSpace/Jura/pulls)
- **Discussions**: Join our community discussions (if available)

---

## 🙏 Thank You

Thank you for contributing to Jura! Your time and effort help make this project better for everyone. We appreciate:

- 🐛 Bug reports and fixes
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🧪 Tests and quality improvements
- 💡 Ideas and suggestions

Every contribution, no matter how small, makes a difference!

---

## 📄 License

By contributing to Jura, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

**Questions?** Feel free to open an issue or reach out to the maintainers. We're here to help! 🚀
