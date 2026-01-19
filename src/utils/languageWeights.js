/**
 * Language Weights & Statistics
 * Analyzes language usage across repositories
 */

/**
 * Language categories for skill grouping
 */
export const LANGUAGE_CATEGORIES = {
  "Systems Programming": ["C", "C++", "Rust", "Zig", "Assembly"],
  "Backend Development": [
    "Java",
    "Go",
    "Python",
    "Ruby",
    "PHP",
    "Scala",
    "Kotlin",
    "C#",
    "Elixir",
    "Erlang",
  ],
  "Frontend Development": [
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "SCSS",
    "Sass",
    "Less",
  ],
  "Mobile Development": ["Swift", "Kotlin", "Objective-C", "Dart"],
  "Data Science & ML": ["Python", "R", "Julia", "MATLAB"],
  "DevOps & Scripting": [
    "Shell",
    "Bash",
    "PowerShell",
    "Python",
    "Perl",
    "Lua",
    "HCL",
  ],
  "Functional Programming": [
    "Haskell",
    "OCaml",
    "F#",
    "Clojure",
    "Scala",
    "Elixir",
    "Elm",
  ],
  Database: ["SQL", "PLSQL", "PLpgSQL"],
};

/**
 * Language proficiency thresholds (in bytes)
 */
const PROFICIENCY_THRESHOLDS = {
  expert: 500000, // 500KB+
  advanced: 100000, // 100KB+
  intermediate: 25000, // 25KB+
  beginner: 5000, // 5KB+
};

/**
 * Calculates proficiency level based on bytes written
 * @param {number} bytes - Total bytes in language
 * @returns {string} - Proficiency level
 */
export function calculateProficiency(bytes) {
  if (bytes >= PROFICIENCY_THRESHOLDS.expert) return "Expert";
  if (bytes >= PROFICIENCY_THRESHOLDS.advanced) return "Advanced";
  if (bytes >= PROFICIENCY_THRESHOLDS.intermediate) return "Intermediate";
  if (bytes >= PROFICIENCY_THRESHOLDS.beginner) return "Beginner";
  return "Familiar";
}

/**
 * Aggregates language statistics across all repositories
 * @param {Map} languageMap - Map of repo name to language bytes
 * @returns {Object} - Aggregated language stats
 */
export function aggregateLanguageStats(languageMap) {
  const totals = {};
  const byRepo = {};

  for (const [repoName, languages] of languageMap.entries()) {
    byRepo[repoName] = languages;

    for (const [lang, bytes] of Object.entries(languages)) {
      if (!totals[lang]) {
        totals[lang] = {
          name: lang,
          totalBytes: 0,
          repoCount: 0,
          repos: [],
        };
      }

      totals[lang].totalBytes += bytes;
      totals[lang].repoCount++;
      totals[lang].repos.push(repoName);
    }
  }

  // Calculate percentages and proficiency
  const totalBytes = Object.values(totals).reduce(
    (sum, l) => sum + l.totalBytes,
    0
  );

  const ranked = Object.values(totals)
    .map((lang) => ({
      ...lang,
      percentage: totalBytes > 0 ? (lang.totalBytes / totalBytes) * 100 : 0,
      proficiency: calculateProficiency(lang.totalBytes),
    }))
    .sort((a, b) => b.totalBytes - a.totalBytes);

  return {
    languages: ranked,
    totalBytes,
    byRepo,
    primaryLanguage: ranked[0]?.name || null,
    languageCount: ranked.length,
  };
}

/**
 * Groups languages by category
 * @param {Array} languages - Language stats array
 * @returns {Object} - Grouped by category
 */
export function groupLanguagesByCategory(languages) {
  const grouped = {};
  const uncategorized = [];

  for (const lang of languages) {
    let foundCategory = false;

    for (const [category, langs] of Object.entries(LANGUAGE_CATEGORIES)) {
      if (langs.includes(lang.name)) {
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(lang);
        foundCategory = true;
        break;
      }
    }

    if (!foundCategory) {
      uncategorized.push(lang);
    }
  }

  if (uncategorized.length > 0) {
    grouped["Other"] = uncategorized;
  }

  return grouped;
}

/**
 * Generates skill entries from languages
 * @param {Array} languages - Language stats
 * @param {number} minPercentage - Minimum percentage to include
 * @returns {Array} - Skill entries for CV
 */
export function generateSkillsFromLanguages(languages, minPercentage = 2) {
  return languages
    .filter((l) => l.percentage >= minPercentage)
    .map((lang) => ({
      name: lang.name,
      level: lang.proficiency,
      percentage: Math.round(lang.percentage),
      category: getCategoryForLanguage(lang.name),
      source: "language-analysis",
    }));
}

/**
 * Gets category for a specific language
 * @param {string} language - Language name
 * @returns {string} - Category name
 */
function getCategoryForLanguage(language) {
  for (const [category, langs] of Object.entries(LANGUAGE_CATEGORIES)) {
    if (langs.includes(language)) {
      return category;
    }
  }
  return "Programming Languages";
}

/**
 * Formats bytes to human readable string
 * @param {number} bytes - Byte count
 * @returns {string} - Formatted string
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
