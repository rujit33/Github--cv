/**
 * Project Ranker
 * Ranks repositories based on multiple factors to identify meaningful projects
 */

import { differenceInDays, parseISO } from "date-fns";

/**
 * Scoring weights for repository ranking
 */
const SCORING_WEIGHTS = {
  // Activity indicators
  stars: 0.2, // Community interest
  forks: 0.1, // Collaboration/usage
  recentActivity: 0.2, // How recently updated

  // Code quality indicators
  codeSize: 0.1, // Substantial codebase
  hasReadme: 0.1, // Documentation
  readmeQuality: 0.1, // README completeness

  // Technical indicators
  hasLanguage: 0.05, // Primary language defined
  topicCount: 0.05, // Topics/tags defined

  // Ownership indicators
  isOriginal: 0.1, // Not a fork
};

/**
 * Calculates a score for repository stars
 * Uses logarithmic scaling to prevent high-star repos from dominating
 * @param {number} stars - Star count
 * @returns {number} - Score 0-100
 */
function scoreStars(stars) {
  if (stars === 0) return 0;
  // Log scale: 1 star = 14, 10 stars = 33, 100 stars = 66, 1000 stars = 100
  return Math.min(100, Math.log10(stars + 1) * 33);
}

/**
 * Calculates a score for repository forks
 * @param {number} forks - Fork count
 * @returns {number} - Score 0-100
 */
function scoreForks(forks) {
  if (forks === 0) return 0;
  return Math.min(100, Math.log10(forks + 1) * 40);
}

/**
 * Calculates recency score based on last update
 * @param {string} updatedAt - ISO date string
 * @returns {number} - Score 0-100
 */
function scoreRecency(updatedAt) {
  const daysSinceUpdate = differenceInDays(new Date(), parseISO(updatedAt));

  if (daysSinceUpdate <= 7) return 100; // Updated this week
  if (daysSinceUpdate <= 30) return 90; // Updated this month
  if (daysSinceUpdate <= 90) return 70; // Updated this quarter
  if (daysSinceUpdate <= 180) return 50; // Updated in 6 months
  if (daysSinceUpdate <= 365) return 30; // Updated this year
  if (daysSinceUpdate <= 730) return 15; // Updated in 2 years
  return 5; // Older than 2 years
}

/**
 * Calculates code size score
 * @param {number} sizeKB - Repository size in KB
 * @returns {number} - Score 0-100
 */
function scoreCodeSize(sizeKB) {
  if (sizeKB < 10) return 5; // Tiny (< 10KB)
  if (sizeKB < 50) return 20; // Very small
  if (sizeKB < 200) return 40; // Small
  if (sizeKB < 1000) return 60; // Medium
  if (sizeKB < 5000) return 80; // Large
  if (sizeKB < 50000) return 100; // Very large
  return 90; // Huge (might be data/assets)
}

/**
 * Analyzes README content quality
 * @param {string|null} readmeContent - README content
 * @returns {Object} - Quality metrics
 */
export function analyzeReadmeQuality(readmeContent) {
  if (!readmeContent) {
    return { score: 0, hasReadme: false, metrics: {} };
  }

  const content = readmeContent.toLowerCase();
  const lines = readmeContent.split("\n").length;
  const words = readmeContent.split(/\s+/).length;

  const metrics = {
    hasTitle: /^#\s+.+/m.test(readmeContent),
    hasDescription: words > 20,
    hasInstallation: /install|setup|getting started/i.test(content),
    hasUsage: /usage|how to|example/i.test(content),
    hasCodeBlocks: /```/.test(readmeContent),
    hasBadges: /\[!\[.+\]\(.+\)\]/.test(readmeContent),
    hasScreenshots: /!\[.+\]\(.+\.(png|jpg|gif|svg)/i.test(readmeContent),
    hasLicense: /license/i.test(content),
    hasContributing: /contribut/i.test(content),
    lineCount: lines,
    wordCount: words,
  };

  // Calculate score based on metrics
  let score = 0;
  if (metrics.hasTitle) score += 10;
  if (metrics.hasDescription) score += 15;
  if (metrics.hasInstallation) score += 15;
  if (metrics.hasUsage) score += 15;
  if (metrics.hasCodeBlocks) score += 15;
  if (metrics.hasBadges) score += 5;
  if (metrics.hasScreenshots) score += 10;
  if (metrics.hasLicense) score += 5;
  if (metrics.hasContributing) score += 5;

  // Bonus for comprehensive READMEs
  if (words > 200) score += 5;
  if (words > 500) score += 5;

  return {
    score: Math.min(100, score),
    hasReadme: true,
    metrics,
  };
}

/**
 * Extracts project description from README
 * @param {string} readmeContent - README content
 * @returns {string|null} - Extracted description
 */
export function extractDescriptionFromReadme(readmeContent) {
  if (!readmeContent) return null;

  const lines = readmeContent.split("\n");
  let description = "";
  let foundTitle = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip badges and empty lines at the start
    if (!foundTitle) {
      if (/^#\s+/.test(trimmed)) {
        foundTitle = true;
        continue;
      }
      if (!trimmed || /^\[!\[/.test(trimmed) || /^!\[/.test(trimmed)) {
        continue;
      }
    }

    // After title, collect first paragraph
    if (foundTitle) {
      if (!trimmed) {
        if (description) break;
        continue;
      }
      if (/^#/.test(trimmed)) break; // Next heading
      if (/^[-*]/.test(trimmed)) break; // List
      if (/^```/.test(trimmed)) break; // Code block

      description += (description ? " " : "") + trimmed;
    }
  }

  return description.slice(0, 500) || null;
}

/**
 * Checks if a repository should be filtered out
 * @param {Object} repo - Repository data
 * @returns {boolean} - True if should be filtered
 */
export function shouldFilterRepository(repo) {
  // Filter forks (unless they have significant contributions)
  if (repo.isFork && repo.stars < 5) {
    return true;
  }

  // Filter archived repos (unless significant)
  if (repo.isArchived && repo.stars < 10) {
    return true;
  }

  // Filter very small repos
  if (repo.size < 5) {
    return true;
  }

  // Filter repos with no language
  if (!repo.language) {
    return true;
  }

  // Filter common config/dotfile repos
  const configPatterns = [
    /^\.?dotfiles?$/i,
    /^\.?config$/i,
    /^\.github$/i,
    /^homebrew-/i,
    /\.github\.io$/i, // Keep personal sites but lower priority
  ];

  if (configPatterns.some((p) => p.test(repo.name))) {
    return true;
  }

  // Filter practice/learning repos with no engagement
  const learningPatterns = [
    /^test$/i,
    /^hello[-_]?world$/i,
    /^practice$/i,
    /^learning[-_]/i,
    /^tutorial[-_]/i,
    /^course[-_]/i,
  ];

  if (learningPatterns.some((p) => p.test(repo.name)) && repo.stars === 0) {
    return true;
  }

  return false;
}

/**
 * Calculates overall score for a repository
 * @param {Object} repo - Repository data
 * @param {Object} options - Additional data (readme, languages, etc.)
 * @returns {Object} - Score breakdown and total
 */
export function calculateRepositoryScore(repo, options = {}) {
  const { readmeContent, commitActivity } = options;

  const readmeAnalysis = analyzeReadmeQuality(readmeContent);

  const scores = {
    stars: scoreStars(repo.stars),
    forks: scoreForks(repo.forks),
    recentActivity: scoreRecency(repo.updatedAt),
    codeSize: scoreCodeSize(repo.size),
    hasReadme: readmeContent ? 100 : 0,
    readmeQuality: readmeAnalysis.score,
    hasLanguage: repo.language ? 100 : 0,
    topicCount: Math.min(100, (repo.topics?.length || 0) * 20),
    isOriginal: repo.isFork ? 0 : 100,
  };

  // Calculate weighted total
  let totalScore = 0;
  for (const [key, weight] of Object.entries(SCORING_WEIGHTS)) {
    totalScore += (scores[key] || 0) * weight;
  }

  return {
    totalScore: Math.round(totalScore),
    breakdown: scores,
    readmeAnalysis,
  };
}

/**
 * Ranks and filters repositories
 * @param {Array} repos - Array of repositories
 * @param {Map} readmeMap - Map of repo name to README content
 * @param {Object} options - Ranking options
 * @returns {Array} - Ranked repositories
 */
export function rankRepositories(repos, readmeMap = new Map(), options = {}) {
  const { maxResults = 10, includeFiltered = false, minScore = 20 } = options;

  // Filter and score repositories
  const scoredRepos = repos
    .filter((repo) => includeFiltered || !shouldFilterRepository(repo))
    .map((repo) => {
      const readmeContent = readmeMap.get(repo.name);
      const scoring = calculateRepositoryScore(repo, { readmeContent });

      return {
        ...repo,
        scoring,
        extractedDescription:
          extractDescriptionFromReadme(readmeContent) || repo.description,
      };
    })
    .filter((repo) => repo.scoring.totalScore >= minScore);

  // Sort by score descending
  scoredRepos.sort((a, b) => b.scoring.totalScore - a.scoring.totalScore);

  return scoredRepos.slice(0, maxResults);
}

/**
 * Categorizes projects by type/purpose
 * @param {Array} repos - Scored repositories
 * @returns {Object} - Categorized projects
 */
export function categorizeProjects(repos) {
  const categories = {
    "Web Applications": [],
    "Libraries & Packages": [],
    "CLI Tools": [],
    "APIs & Services": [],
    "Data & ML": [],
    "Mobile Apps": [],
    Other: [],
  };

  const categoryPatterns = {
    "Web Applications": [
      "next.js",
      "react",
      "vue",
      "angular",
      "svelte",
      "web",
      "frontend",
      "dashboard",
      "website",
      "app",
    ],
    "Libraries & Packages": [
      "lib",
      "library",
      "package",
      "module",
      "sdk",
      "framework",
      "plugin",
    ],
    "CLI Tools": ["cli", "command", "terminal", "console", "tool"],
    "APIs & Services": [
      "api",
      "server",
      "backend",
      "service",
      "rest",
      "graphql",
      "microservice",
    ],
    "Data & ML": [
      "data",
      "ml",
      "machine-learning",
      "ai",
      "analytics",
      "neural",
      "model",
      "tensorflow",
      "pytorch",
    ],
    "Mobile Apps": [
      "mobile",
      "ios",
      "android",
      "react-native",
      "flutter",
      "app",
    ],
  };

  for (const repo of repos) {
    const text = [repo.name, repo.description, ...(repo.topics || [])]
      .join(" ")
      .toLowerCase();

    let categorized = false;

    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some((p) => text.includes(p))) {
        categories[category].push(repo);
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      categories["Other"].push(repo);
    }
  }

  // Remove empty categories
  for (const key of Object.keys(categories)) {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  }

  return categories;
}

export { SCORING_WEIGHTS };
