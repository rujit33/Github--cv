# GitHub to CV - Setup and Installation Guide

## 🎯 Overview

GitHub to CV is a full-stack application that transforms your GitHub profile into a professional, ATS-friendly CV with AI-powered enhancements.

**Key Features:**

- ✅ **Secure Backend**: API keys are protected on the server
- 🤖 **AI-Powered**: Uses LLM to generate professional content
- 📊 **Smart Selection**: Automatically ranks and suggests best projects
- 🎨 **Modern Templates**: ATS-friendly, professionally designed CV templates
- 📄 **PDF Export**: Generate high-quality LaTeX PDFs

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Frontend  │────────▶│   Backend   │────────▶│  GitHub API  │
│   (React)   │         │  (Express)  │         │              │
│             │◀────────│             │────────▶│ OpenRouter   │
└─────────────┘         └─────────────┘         │     API      │
                                                 └──────────────┘
```

## 📦 Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **GitHub Token** (optional, for higher rate limits)
- **OpenRouter API Key** (for AI features)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Variables

#### Frontend (.env)

```env
# Backend API URL
VITE_API_URL=http://localhost:3001
```

#### Backend (server/.env)

```env
# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173

# OpenRouter API Key (Required for AI features)
# Get your free key from: https://openrouter.ai/
OPENROUTER_API_KEY=your-openrouter-api-key-here

# LLM Model (free tier available)
LLM_MODEL=google/gemma-3-27b-it:free

# GitHub Personal Access Token (Optional but recommended)
# Create at: https://github.com/settings/tokens
# Increases rate limit from 60 to 5000 requests/hour
GITHUB_TOKEN=your-github-token-here
```

### 3. Run the Application

**Option A: Run Both Services Simultaneously**

```bash
npm run dev:all
```

**Option B: Run Services Separately**

Terminal 1 (Backend):

```bash
npm run dev:server
```

Terminal 2 (Frontend):

```bash
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔑 Getting API Keys

### OpenRouter API Key (Required for AI)

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up for a free account
3. Navigate to [Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Add it to `server/.env` as `OPENROUTER_API_KEY`

**Free Tier Models:**

- `google/gemma-3-27b-it:free` (default)
- `meta-llama/llama-3.2-3b-instruct:free`
- `qwen/qwen-2-7b-instruct:free`

### GitHub Token (Optional but Recommended)

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. **No scopes needed** for public repositories
4. Copy the token
5. Add it to `server/.env` as `GITHUB_TOKEN`

**Benefits:**

- Rate limit: 60 → 5000 requests/hour
- Faster profile analysis
- Access to private repositories (if scopes granted)

## 🎨 Features

### 1. Intelligent Repository Selection

- **Activity Scoring**: Ranks repositories by recent commits, stars, and engagement
- **Smart Pre-selection**: Automatically selects your top 4 most active projects
- **Visual Filtering**: Search, filter by language, and sort by multiple criteria

### 2. AI-Powered CV Generation

- **Professional Summaries**: Generated based on your GitHub activity
- **Project Descriptions**: Enhanced, compelling descriptions for each project
- **Skill Categorization**: Automatically groups technologies by type

### 3. Modern CV Templates

- **ATS-Friendly**: Optimized for Applicant Tracking Systems
- **Professional Design**: Clean, modern layouts
- **LaTeX Quality**: Publication-ready PDF output

## 📚 API Endpoints

### GitHub Endpoints

- `GET /api/github/user/:username` - Get user profile
- `GET /api/github/user/:username/repos` - Get user repositories
- `GET /api/github/repo/:owner/:repo` - Get repository details
- `GET /api/github/repo/:owner/:repo/languages` - Get repository languages
- `GET /api/github/repo/:owner/:repo/readme` - Get README content
- `GET /api/github/repo/:owner/:repo/commits` - Get recent commits

### LLM Endpoints

- `GET /api/llm/status` - Check LLM service status
- `POST /api/llm/generate` - Generate text with LLM
- `POST /api/llm/generate-summary` - Generate professional summary
- `POST /api/llm/enhance-projects` - Enhance project descriptions

### System Endpoints

- `GET /api/health` - Health check

## 🔒 Security Features

- ✅ API keys stored securely on backend
- ✅ CORS protection
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet.js security headers
- ✅ Input validation and sanitization

## 🛠️ Development Scripts

```bash
# Frontend only
npm run dev

# Backend only
npm run dev:server

# Both services (concurrent)
npm run dev:all

# Build frontend for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Install backend dependencies
npm run server:install
```

## 📁 Project Structure

```
github-to-cv/
├── src/                      # Frontend source
│   ├── components/           # React components
│   ├── services/             # API services (calls backend)
│   ├── templates/            # CV LaTeX templates
│   └── utils/                # Utility functions
├── server/                   # Backend source
│   ├── routes/               # API routes
│   │   ├── github.js         # GitHub API proxy
│   │   └── llm.js            # LLM API proxy
│   ├── server.js             # Express server
│   ├── package.json          # Backend dependencies
│   └── .env                  # Backend configuration
├── public/                   # Static assets
├── package.json              # Frontend dependencies
└── .env                      # Frontend configuration
```

## 🐛 Troubleshooting

### Backend won't start

- Ensure Node.js 18+ is installed
- Check if port 3001 is available
- Verify `.env` file exists in `server/` directory

### API keys not working

- Double-check keys are in `server/.env` (not root `.env`)
- Ensure no extra spaces or quotes around keys
- Restart the backend server after adding keys

### GitHub rate limit errors

- Add a GitHub token to increase rate limit
- Wait for rate limit reset (check error message for time)

### LLM not generating content

- Verify `OPENROUTER_API_KEY` is correct
- Check [OpenRouter status](https://openrouter.ai/docs/limits)
- Try a different free model

### CORS errors

- Ensure `CORS_ORIGIN` matches your frontend URL
- Check frontend is running on port 5173

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variable: `VITE_API_URL=https://your-backend-url`

### Backend (Railway/Render/Fly.io)

1. Deploy `server/` directory
2. Set environment variables from `server/.env`
3. Ensure `PORT` is set by platform or use default 3001

## 📝 License

MIT License - Feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR.

## 📧 Support

For issues or questions:

1. Check the troubleshooting section
2. Review [OpenRouter docs](https://openrouter.ai/docs)
3. Open a GitHub issue

---

**Built with ❤️ using React, Express, and AI**
