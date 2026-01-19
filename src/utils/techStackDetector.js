/**
 * Tech Stack Detector
 * Analyzes repository files to infer technologies and frameworks used
 */

/**
 * Map of config files to their associated technologies
 */
const CONFIG_FILE_PATTERNS = {
  // JavaScript/Node ecosystem
  "package.json": { type: "npm", category: "JavaScript/Node.js" },
  "yarn.lock": { type: "yarn", category: "JavaScript/Node.js" },
  "pnpm-lock.yaml": { type: "pnpm", category: "JavaScript/Node.js" },
  "tsconfig.json": { type: "typescript", category: "TypeScript" },
  "webpack.config.js": { type: "webpack", category: "Build Tools" },
  "vite.config.js": { type: "vite", category: "Build Tools" },
  "vite.config.ts": { type: "vite", category: "Build Tools" },
  "rollup.config.js": { type: "rollup", category: "Build Tools" },
  "next.config.js": { type: "nextjs", category: "Frameworks" },
  "next.config.mjs": { type: "nextjs", category: "Frameworks" },
  "nuxt.config.js": { type: "nuxt", category: "Frameworks" },
  "angular.json": { type: "angular", category: "Frameworks" },
  "svelte.config.js": { type: "svelte", category: "Frameworks" },
  ".babelrc": { type: "babel", category: "Build Tools" },
  "babel.config.js": { type: "babel", category: "Build Tools" },
  "jest.config.js": { type: "jest", category: "Testing" },
  "vitest.config.js": { type: "vitest", category: "Testing" },
  ".eslintrc": { type: "eslint", category: "Code Quality" },
  ".eslintrc.js": { type: "eslint", category: "Code Quality" },
  ".prettierrc": { type: "prettier", category: "Code Quality" },
  "tailwind.config.js": { type: "tailwindcss", category: "CSS Frameworks" },

  // Python ecosystem
  "requirements.txt": { type: "pip", category: "Python" },
  "setup.py": { type: "setuptools", category: "Python" },
  "pyproject.toml": { type: "python-project", category: "Python" },
  Pipfile: { type: "pipenv", category: "Python" },
  "poetry.lock": { type: "poetry", category: "Python" },
  "conda.yaml": { type: "conda", category: "Python" },
  "environment.yml": { type: "conda", category: "Python" },
  "tox.ini": { type: "tox", category: "Testing" },
  "pytest.ini": { type: "pytest", category: "Testing" },
  ".flake8": { type: "flake8", category: "Code Quality" },
  "mypy.ini": { type: "mypy", category: "Code Quality" },

  // Ruby ecosystem
  Gemfile: { type: "bundler", category: "Ruby" },
  Rakefile: { type: "rake", category: "Ruby" },
  ".rubocop.yml": { type: "rubocop", category: "Code Quality" },

  // Java/JVM ecosystem
  "pom.xml": { type: "maven", category: "Java" },
  "build.gradle": { type: "gradle", category: "Java" },
  "build.gradle.kts": { type: "gradle-kotlin", category: "Kotlin" },

  // Go ecosystem
  "go.mod": { type: "go-modules", category: "Go" },
  "go.sum": { type: "go-modules", category: "Go" },

  // Rust ecosystem
  "Cargo.toml": { type: "cargo", category: "Rust" },

  // Docker/DevOps
  Dockerfile: { type: "docker", category: "DevOps" },
  "docker-compose.yml": { type: "docker-compose", category: "DevOps" },
  "docker-compose.yaml": { type: "docker-compose", category: "DevOps" },
  ".dockerignore": { type: "docker", category: "DevOps" },
  Jenkinsfile: { type: "jenkins", category: "CI/CD" },
  ".travis.yml": { type: "travis", category: "CI/CD" },
  ".github/workflows": { type: "github-actions", category: "CI/CD" },
  ".circleci": { type: "circleci", category: "CI/CD" },
  terraform: { type: "terraform", category: "Infrastructure" },
  kubernetes: { type: "kubernetes", category: "Infrastructure" },
  k8s: { type: "kubernetes", category: "Infrastructure" },

  // C/C++
  "CMakeLists.txt": { type: "cmake", category: "C/C++" },
  Makefile: { type: "make", category: "Build Tools" },

  // .NET
  ".csproj": { type: "dotnet", category: ".NET" },
  ".fsproj": { type: "fsharp", category: ".NET" },
  "nuget.config": { type: "nuget", category: ".NET" },
};

/**
 * Dependency patterns to detect frameworks from package.json
 */
const NPM_DEPENDENCY_PATTERNS = {
  // Frontend Frameworks
  react: { name: "React", category: "Frontend Frameworks" },
  "react-dom": { name: "React", category: "Frontend Frameworks" },
  vue: { name: "Vue.js", category: "Frontend Frameworks" },
  "@angular/core": { name: "Angular", category: "Frontend Frameworks" },
  svelte: { name: "Svelte", category: "Frontend Frameworks" },
  "solid-js": { name: "Solid.js", category: "Frontend Frameworks" },
  preact: { name: "Preact", category: "Frontend Frameworks" },

  // Meta Frameworks
  next: { name: "Next.js", category: "Meta Frameworks" },
  nuxt: { name: "Nuxt.js", category: "Meta Frameworks" },
  gatsby: { name: "Gatsby", category: "Meta Frameworks" },
  remix: { name: "Remix", category: "Meta Frameworks" },
  astro: { name: "Astro", category: "Meta Frameworks" },

  // Backend Frameworks
  express: { name: "Express.js", category: "Backend Frameworks" },
  fastify: { name: "Fastify", category: "Backend Frameworks" },
  koa: { name: "Koa", category: "Backend Frameworks" },
  hapi: { name: "Hapi", category: "Backend Frameworks" },
  nestjs: { name: "NestJS", category: "Backend Frameworks" },
  "@nestjs/core": { name: "NestJS", category: "Backend Frameworks" },

  // State Management
  redux: { name: "Redux", category: "State Management" },
  "@reduxjs/toolkit": { name: "Redux Toolkit", category: "State Management" },
  mobx: { name: "MobX", category: "State Management" },
  zustand: { name: "Zustand", category: "State Management" },
  recoil: { name: "Recoil", category: "State Management" },
  jotai: { name: "Jotai", category: "State Management" },
  pinia: { name: "Pinia", category: "State Management" },
  vuex: { name: "Vuex", category: "State Management" },

  // Styling
  tailwindcss: { name: "Tailwind CSS", category: "CSS Frameworks" },
  "styled-components": { name: "Styled Components", category: "CSS-in-JS" },
  "@emotion/react": { name: "Emotion", category: "CSS-in-JS" },
  sass: { name: "Sass", category: "CSS Preprocessors" },
  less: { name: "Less", category: "CSS Preprocessors" },
  bootstrap: { name: "Bootstrap", category: "CSS Frameworks" },
  "@mui/material": { name: "Material UI", category: "UI Libraries" },
  antd: { name: "Ant Design", category: "UI Libraries" },
  "chakra-ui": { name: "Chakra UI", category: "UI Libraries" },
  "@chakra-ui/react": { name: "Chakra UI", category: "UI Libraries" },

  // Testing
  jest: { name: "Jest", category: "Testing" },
  mocha: { name: "Mocha", category: "Testing" },
  vitest: { name: "Vitest", category: "Testing" },
  cypress: { name: "Cypress", category: "E2E Testing" },
  playwright: { name: "Playwright", category: "E2E Testing" },
  "@testing-library/react": {
    name: "React Testing Library",
    category: "Testing",
  },

  // Database
  mongoose: { name: "MongoDB/Mongoose", category: "Databases" },
  prisma: { name: "Prisma", category: "ORMs" },
  "@prisma/client": { name: "Prisma", category: "ORMs" },
  typeorm: { name: "TypeORM", category: "ORMs" },
  sequelize: { name: "Sequelize", category: "ORMs" },
  "drizzle-orm": { name: "Drizzle", category: "ORMs" },
  pg: { name: "PostgreSQL", category: "Databases" },
  mysql2: { name: "MySQL", category: "Databases" },
  redis: { name: "Redis", category: "Databases" },
  ioredis: { name: "Redis", category: "Databases" },

  // GraphQL
  graphql: { name: "GraphQL", category: "API" },
  "apollo-server": { name: "Apollo Server", category: "API" },
  "@apollo/client": { name: "Apollo Client", category: "API" },
  urql: { name: "URQL", category: "API" },

  // Auth
  passport: { name: "Passport.js", category: "Authentication" },
  jsonwebtoken: { name: "JWT", category: "Authentication" },
  "next-auth": { name: "NextAuth.js", category: "Authentication" },
  "@auth/core": { name: "Auth.js", category: "Authentication" },

  // Utilities
  axios: { name: "Axios", category: "HTTP Clients" },
  lodash: { name: "Lodash", category: "Utilities" },
  "date-fns": { name: "date-fns", category: "Utilities" },
  dayjs: { name: "Day.js", category: "Utilities" },
  moment: { name: "Moment.js", category: "Utilities" },
  zod: { name: "Zod", category: "Validation" },
  yup: { name: "Yup", category: "Validation" },

  // Build Tools
  webpack: { name: "Webpack", category: "Build Tools" },
  vite: { name: "Vite", category: "Build Tools" },
  esbuild: { name: "esbuild", category: "Build Tools" },
  rollup: { name: "Rollup", category: "Build Tools" },
  parcel: { name: "Parcel", category: "Build Tools" },
  turbo: { name: "Turborepo", category: "Build Tools" },

  // Mobile
  "react-native": { name: "React Native", category: "Mobile Development" },
  expo: { name: "Expo", category: "Mobile Development" },
  "@capacitor/core": { name: "Capacitor", category: "Mobile Development" },
  cordova: { name: "Cordova", category: "Mobile Development" },

  // AI/ML
  openai: { name: "OpenAI", category: "AI/ML" },
  langchain: { name: "LangChain", category: "AI/ML" },
  "@tensorflow/tfjs": { name: "TensorFlow.js", category: "AI/ML" },
};

/**
 * Python package patterns
 */
const PYTHON_PACKAGE_PATTERNS = {
  django: { name: "Django", category: "Web Frameworks" },
  flask: { name: "Flask", category: "Web Frameworks" },
  fastapi: { name: "FastAPI", category: "Web Frameworks" },
  tornado: { name: "Tornado", category: "Web Frameworks" },
  pyramid: { name: "Pyramid", category: "Web Frameworks" },
  aiohttp: { name: "aiohttp", category: "Web Frameworks" },

  numpy: { name: "NumPy", category: "Data Science" },
  pandas: { name: "Pandas", category: "Data Science" },
  scipy: { name: "SciPy", category: "Data Science" },
  matplotlib: { name: "Matplotlib", category: "Data Visualization" },
  seaborn: { name: "Seaborn", category: "Data Visualization" },
  plotly: { name: "Plotly", category: "Data Visualization" },

  tensorflow: { name: "TensorFlow", category: "Machine Learning" },
  keras: { name: "Keras", category: "Machine Learning" },
  pytorch: { name: "PyTorch", category: "Machine Learning" },
  torch: { name: "PyTorch", category: "Machine Learning" },
  "scikit-learn": { name: "Scikit-learn", category: "Machine Learning" },
  sklearn: { name: "Scikit-learn", category: "Machine Learning" },
  xgboost: { name: "XGBoost", category: "Machine Learning" },
  lightgbm: { name: "LightGBM", category: "Machine Learning" },
  transformers: { name: "Hugging Face Transformers", category: "NLP/AI" },
  langchain: { name: "LangChain", category: "AI/ML" },
  openai: { name: "OpenAI", category: "AI/ML" },

  sqlalchemy: { name: "SQLAlchemy", category: "ORMs" },
  peewee: { name: "Peewee", category: "ORMs" },
  "tortoise-orm": { name: "Tortoise ORM", category: "ORMs" },

  celery: { name: "Celery", category: "Task Queues" },
  redis: { name: "Redis", category: "Databases" },
  psycopg2: { name: "PostgreSQL", category: "Databases" },
  pymongo: { name: "MongoDB", category: "Databases" },

  pytest: { name: "Pytest", category: "Testing" },
  unittest: { name: "unittest", category: "Testing" },

  requests: { name: "Requests", category: "HTTP Clients" },
  httpx: { name: "HTTPX", category: "HTTP Clients" },
  beautifulsoup4: { name: "BeautifulSoup", category: "Web Scraping" },
  scrapy: { name: "Scrapy", category: "Web Scraping" },
  selenium: { name: "Selenium", category: "Automation" },

  pydantic: { name: "Pydantic", category: "Validation" },
  marshmallow: { name: "Marshmallow", category: "Serialization" },
};

/**
 * Analyzes package.json content to detect tech stack
 * @param {string} content - package.json content
 * @returns {Array} - Detected technologies
 */
export function analyzePackageJson(content) {
  const technologies = [];

  try {
    const pkg = JSON.parse(content);
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };

    const seenTech = new Set();

    for (const [dep, version] of Object.entries(allDeps || {})) {
      const match = NPM_DEPENDENCY_PATTERNS[dep];
      if (match && !seenTech.has(match.name)) {
        seenTech.add(match.name);
        technologies.push({
          name: match.name,
          category: match.category,
          version: version.replace(/[\^~]/, ""),
          source: "package.json",
        });
      }
    }

    // Detect TypeScript
    if (allDeps.typescript) {
      technologies.push({
        name: "TypeScript",
        category: "Languages",
        version: allDeps.typescript.replace(/[\^~]/, ""),
        source: "package.json",
      });
    }
  } catch (error) {
    console.warn("Failed to parse package.json:", error);
  }

  return technologies;
}

/**
 * Analyzes requirements.txt content to detect Python tech stack
 * @param {string} content - requirements.txt content
 * @returns {Array} - Detected technologies
 */
export function analyzeRequirementsTxt(content) {
  const technologies = [];
  const seenTech = new Set();

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Parse package name (handles ==, >=, <=, ~=, etc.)
    const match = trimmed.match(/^([a-zA-Z0-9_-]+)/);
    if (!match) continue;

    const packageName = match[1].toLowerCase();
    const techMatch = PYTHON_PACKAGE_PATTERNS[packageName];

    if (techMatch && !seenTech.has(techMatch.name)) {
      seenTech.add(techMatch.name);

      // Extract version if present
      const versionMatch = trimmed.match(/[=<>~]=?(.+)$/);

      technologies.push({
        name: techMatch.name,
        category: techMatch.category,
        version: versionMatch ? versionMatch[1] : null,
        source: "requirements.txt",
      });
    }
  }

  return technologies;
}

/**
 * Analyzes pyproject.toml for Python projects
 * @param {string} content - pyproject.toml content
 * @returns {Array} - Detected technologies
 */
export function analyzePyprojectToml(content) {
  const technologies = [];
  const seenTech = new Set();

  // Simple parsing - look for dependencies
  const depMatch = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (depMatch) {
    const deps = depMatch[1];

    for (const [pkg, tech] of Object.entries(PYTHON_PACKAGE_PATTERNS)) {
      if (deps.toLowerCase().includes(pkg) && !seenTech.has(tech.name)) {
        seenTech.add(tech.name);
        technologies.push({
          name: tech.name,
          category: tech.category,
          source: "pyproject.toml",
        });
      }
    }
  }

  return technologies;
}

/**
 * Infers tech stack from file list in repository
 * @param {Array<string>} files - List of file paths
 * @returns {Array} - Detected technologies
 */
export function inferFromFileList(files) {
  const technologies = [];
  const seenTypes = new Set();

  for (const file of files) {
    const fileName = file.split("/").pop();

    for (const [pattern, tech] of Object.entries(CONFIG_FILE_PATTERNS)) {
      if (fileName === pattern || file.includes(pattern)) {
        if (!seenTypes.has(tech.type)) {
          seenTypes.add(tech.type);
          technologies.push({
            name: tech.type,
            category: tech.category,
            source: "file-structure",
          });
        }
      }
    }
  }

  return technologies;
}

/**
 * Categorizes and merges technology lists
 * @param {Array} technologies - Raw technology list
 * @returns {Object} - Categorized technologies
 */
export function categorizeTechnologies(technologies) {
  const categories = {};

  for (const tech of technologies) {
    if (!categories[tech.category]) {
      categories[tech.category] = [];
    }

    // Avoid duplicates
    if (!categories[tech.category].some((t) => t.name === tech.name)) {
      categories[tech.category].push(tech);
    }
  }

  return categories;
}

export { NPM_DEPENDENCY_PATTERNS, PYTHON_PACKAGE_PATTERNS };
