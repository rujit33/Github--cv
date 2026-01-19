# GitHub to CV

Transform your GitHub profile into a professional, editable CV with AI-powered enhancements and secure API handling.

> **🎯 NEW**: Full-stack architecture with Express backend for secure API key management and enhanced features!

## 🚀 Quick Start

```bash
# Install all dependencies
npm install
cd server && npm install && cd ..

# Start both frontend and backend
npm run dev:all
```

**📚 Documentation:**

- [Quick Start Guide](QUICKSTART.md) - Get running in 5 minutes
- [Setup Guide](SETUP.md) - Detailed instructions and troubleshooting
- [Implementation Details](IMPLEMENTATION_SUMMARY.md) - Technical architecture

---

Transform your GitHub profile into a professional, editable CV with LaTeX rendering. Now featuring a secure backend server that protects your API keys and enhances the application with AI-powered features.

## ✨ Features

- **AI-Powered Enhancement**: Uses OpenRouter LLM for professional content generation
- **GitHub Profile Analysis**: Automatically fetch and analyze public repositories, languages, and contributions
- **Intelligent Project Ranking**: Smart filtering and ranking with visual activity scores
- **Multiple CV Templates**: Modern, ATS-friendly designs optimized for 2026
- **Full Editing Capability**: Edit all CV sections including summary, skills, and projects
- **LaTeX Generation**: Export professional LaTeX source code
- **PDF Export**: Print-ready PDF generation via browser
- **Enhanced UI**: Beautiful repository selector with advanced filtering
  (Legacy Instructions - See QUICKSTART.md for new setup)

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Configure backend API keys in server/.env
# See SETUP.md for detailed instructions

# Start both services
npm run dev:allelopment server
npm run dev
```

## 📖 Usage

1. Enter any public GitHub username
2. Wait for the analysis to complete
3. Choose a CV template
4. Edit sections as needed
5. Download as PDF or LaTeX

## 🏗️ Architecture

```
src/
├── components/          # React UI components
│   ├── App.jsx         # Main application component
│   ├── GitHubInput.jsx # Username input form
│   ├── CVEditor.jsx    # Editable CV sections
│   ├── CVPreview.jsx   # Live CV preview
│   ├── TemplateSelector.jsx
│   ├── LoadingState.jsx
│   └── ErrorDisplay.jsx
├── services/           # Core business logic
│   ├── githubApi.js    # GitHub REST API client
│   ├── repoAnalyzer.js # Profile analysis orchestrator
│   ├── latexRenderer.js # LaTeX/HTML rendering
│   └── llmService.js   # Optional AI integration
├── templates/          # LaTeX CV templates
│   ├── modern.js
│   ├── minimal.js
│   ├── academic.js
│   └── techFocused.js
└── utils/              # Helper utilities
    ├── projectRanker.js    # Project scoring algorithm
    ├── techStackDetector.js # Framework detection
    └── languageWeights.js  # Language analysis
```

### Separation of Concerns

| Layer          | Responsibility                                   |
| -------------- | ------------------------------------------------ |
| **Components** | UI rendering, user interaction, state management |
| **Services**   | API calls, data processing, business logic       |
| **Templates**  | LaTeX generation, document structure             |
| **Utils**      | Reusable algorithms, data transformations        |

## 🧠 Project Ranking Algorithm

Projects are ranked using a weighted scoring system to identify meaningful work:

### Scoring Weights

| Factor          | Weight | Description                    |
| --------------- | ------ | ------------------------------ |
| Stars           | 20%    | Community interest (log scale) |
| Recent Activity | 20%    | Days since last update         |
| Original Work   | 10%    | Bonus for non-forked repos     |
| README Quality  | 10%    | Documentation completeness     |
| Has README      | 10%    | Basic documentation present    |
| Code Size       | 10%    | Substantial codebase indicator |
| Forks           | 10%    | Usage/collaboration signal     |
| Has Language    | 5%     | Primary language defined       |
| Topic Count     | 5%     | Tags/topics added              |

### Filtering Rules

Repositories are **excluded** if they:

- Are forks with < 5 stars
- Are archived with < 10 stars
- Have < 5 KB of code
- Have no primary language
- Match config/dotfile patterns (`dotfiles`, `.github`, etc.)
- Match learning patterns (`tutorial-*`, `hello-world`) with 0 stars

### README Quality Scoring

READMEs are scored on:

- Has title heading (+10)
- Has description (20+ words) (+15)
- Has installation instructions (+15)
- Has usage examples (+15)
- Has code blocks (+15)
- Has badges (+5)
- Has screenshots/images (+10)
- Has license section (+5)
- Has contributing section (+5)

## 🔧 Tech Stack Detection

The analyzer detects technologies from config files:

### Supported Config Files

| File                           | Detection                                |
| ------------------------------ | ---------------------------------------- |
| `package.json`                 | npm dependencies → frameworks, libraries |
| `requirements.txt`             | Python packages                          |
| `pyproject.toml`               | Python project config                    |
| `Cargo.toml`                   | Rust crates                              |
| `go.mod`                       | Go modules                               |
| `Gemfile`                      | Ruby gems                                |
| `pom.xml`                      | Maven/Java                               |
| `Dockerfile`                   | Container usage                          |
| `*.yml` in `.github/workflows` | CI/CD                                    |

### Detected Frameworks

- **Frontend**: React, Vue, Angular, Svelte, Next.js, etc.
- **Backend**: Express, FastAPI, Django, Spring, etc.
- **Database**: PostgreSQL, MongoDB, Redis, etc.
- **Testing**: Jest, Pytest, Mocha, Cypress, etc.
- **DevOps**: Docker, Kubernetes, Terraform, etc.

## 📄 CV Templates

### Modern

Clean design with accent colors and modern typography. Best for tech industry applications.

### Minimal

Simple, elegant design focusing purely on content. Universal appeal.

### Academic

Traditional CV format with structured sections. Suitable for research or academic positions.

### Tech-Focused

Developer-centric design with skill bars, metrics, and code-style formatting.

## 🤖 Optional LLM Integration

AI features are **disabled by default** and require explicit configuration.

### Setup

1. Copy `.env.example` to `.env`
2. Add your API key:

```env
VITE_OPENAI_API_KEY=your_api_key_here
VITE_LLM_MODEL=gpt-3.5-turbo
VITE_ENABLE_LLM=true
```

### LLM Usage Philosophy

The LLM is used **only** for:

- Improving phrasing and professional language
- Generating concise summaries from existing data

The LLM is **never** used for:

- Data extraction (GitHub API only)
- Inventing achievements or details
- Core ranking or analysis logic

### Supported Providers

Currently supports OpenAI API. Model is configurable via environment variables.

## ⚠️ Limitations

### GitHub API Rate Limits

- **Unauthenticated**: 60 requests/hour
- Each profile analysis uses ~20-40 requests
- Rate limit errors include reset time

### Data Availability

- Only public repositories are analyzed
- Private contributions are not visible
- Some profile fields may be empty

### LaTeX Rendering

- CV is previewed as HTML for reliable browser compatibility
- LaTeX source code can be downloaded for professional typesetting
- Use Overleaf or local LaTeX to compile the .tex files
- PDF export uses browser print dialog

### Tech Stack Detection

- Limited to common config file patterns
- May miss custom or unusual setups
- Dependency versions not always available

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Templates

1. Create a new file in `src/templates/`
2. Export a template object with:
   - `id`: Unique identifier
   - `name`: Display name
   - `description`: Short description
   - `preview`: Emoji or icon
   - `generate(cvData)`: Function returning LaTeX string
3. Register in `src/templates/index.js`

### Adding Tech Stack Detection

1. Add patterns to `src/utils/techStackDetector.js`
2. Add to appropriate category in `CONFIG_FILE_PATTERNS` or `NPM_DEPENDENCY_PATTERNS`

## 📝 License

MIT License - feel free to use and modify.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🙏 Acknowledgments

- [GitHub REST API](https://docs.github.com/en/rest)
- [latex.js](https://latex.js.org/) for browser-based LaTeX
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide Icons](https://lucide.dev/) for icons
