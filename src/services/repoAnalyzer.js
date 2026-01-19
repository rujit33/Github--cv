/**
 * Repository Analyzer Service
 * Orchestrates GitHub data fetching and analysis
 */

import {
  fetchUserProfile,
  fetchUserRepositories,
  fetchRepoReadme,
  fetchRepoFile,
  batchFetchLanguages,
  getRateLimitStatus,
} from "./githubApi.js";

import {
  analyzePackageJson,
  analyzeRequirementsTxt,
  analyzePyprojectToml,
  categorizeTechnologies,
} from "../utils/techStackDetector.js";

import {
  rankRepositories,
  categorizeProjects,
} from "../utils/projectRanker.js";

import {
  aggregateLanguageStats,
  generateSkillsFromLanguages,
  groupLanguagesByCategory,
} from "../utils/languageWeights.js";

/**
 * Analysis status for progress tracking
 */
export const AnalysisStatus = {
  IDLE: "idle",
  FETCHING_PROFILE: "fetching_profile",
  FETCHING_REPOS: "fetching_repos",
  ANALYZING_LANGUAGES: "analyzing_languages",
  FETCHING_READMES: "fetching_readmes",
  DETECTING_TECH_STACK: "detecting_tech_stack",
  RANKING_PROJECTS: "ranking_projects",
  COMPLETE: "complete",
  ERROR: "error",
};

/**
 * Analyzes a GitHub profile completely
 * @param {string} username - GitHub username
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Complete analysis
 */
export async function analyzeGitHubProfile(username, onProgress = () => {}) {
  const analysis = {
    username,
    profile: null,
    repositories: [],
    rankedProjects: [],
    languages: null,
    techStack: null,
    skills: [],
    statistics: {},
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // Step 1: Fetch user profile
    onProgress({
      status: AnalysisStatus.FETCHING_PROFILE,
      message: "Fetching profile...",
    });
    analysis.profile = await fetchUserProfile(username);

    // Step 2: Fetch repositories
    onProgress({
      status: AnalysisStatus.FETCHING_REPOS,
      message: "Fetching repositories...",
    });
    const allRepos = await fetchUserRepositories(username);
    analysis.repositories = allRepos;

    // Step 3: Fetch languages for top repositories
    onProgress({
      status: AnalysisStatus.ANALYZING_LANGUAGES,
      message: "Analyzing languages...",
    });
    const nonForkedRepos = allRepos.filter((r) => !r.isFork);
    const languageMap = await batchFetchLanguages(nonForkedRepos, 25);
    analysis.languages = aggregateLanguageStats(languageMap);

    // Step 4: Fetch READMEs for significant repositories
    onProgress({
      status: AnalysisStatus.FETCHING_READMES,
      message: "Fetching project documentation...",
    });
    const significantRepos = nonForkedRepos
      .filter((r) => r.size > 10)
      .slice(0, 15);

    const readmeMap = new Map();
    for (const repo of significantRepos) {
      const readme = await fetchRepoReadme(username, repo.name);
      if (readme) {
        readmeMap.set(repo.name, readme);
      }

      // Check rate limits
      const rateLimit = getRateLimitStatus();
      if (rateLimit.remaining < 10) {
        analysis.errors.push(`Rate limit low, some READMEs skipped`);
        break;
      }
    }

    // Step 5: Detect tech stack
    onProgress({
      status: AnalysisStatus.DETECTING_TECH_STACK,
      message: "Detecting tech stack...",
    });
    const techDetections = [];

    for (const repo of significantRepos.slice(0, 10)) {
      // Try package.json
      const packageJson = await fetchRepoFile(
        username,
        repo.name,
        "package.json"
      );
      if (packageJson) {
        const techs = analyzePackageJson(packageJson);
        techDetections.push(...techs.map((t) => ({ ...t, repo: repo.name })));
      }

      // Try requirements.txt
      const requirements = await fetchRepoFile(
        username,
        repo.name,
        "requirements.txt"
      );
      if (requirements) {
        const techs = analyzeRequirementsTxt(requirements);
        techDetections.push(...techs.map((t) => ({ ...t, repo: repo.name })));
      }

      // Try pyproject.toml
      const pyproject = await fetchRepoFile(
        username,
        repo.name,
        "pyproject.toml"
      );
      if (pyproject) {
        const techs = analyzePyprojectToml(pyproject);
        techDetections.push(...techs.map((t) => ({ ...t, repo: repo.name })));
      }
    }

    analysis.techStack = categorizeTechnologies(techDetections);

    // Step 6: Rank and select projects
    onProgress({
      status: AnalysisStatus.RANKING_PROJECTS,
      message: "Ranking projects...",
    });
    analysis.rankedProjects = rankRepositories(allRepos, readmeMap, {
      maxResults: 8,
      minScore: 15,
    });

    analysis.categorizedProjects = categorizeProjects(analysis.rankedProjects);

    // Step 7: Generate skills
    const languageSkills = generateSkillsFromLanguages(
      analysis.languages.languages
    );

    // Merge tech stack into skills
    const techSkills = [];
    for (const [category, techs] of Object.entries(analysis.techStack || {})) {
      for (const tech of techs) {
        techSkills.push({
          name: tech.name,
          category,
          source: "tech-detection",
          level: "Proficient",
        });
      }
    }

    // Deduplicate skills
    const seenSkills = new Set();
    analysis.skills = [...languageSkills, ...techSkills].filter((skill) => {
      const key = skill.name.toLowerCase();
      if (seenSkills.has(key)) return false;
      seenSkills.add(key);
      return true;
    });

    // Step 8: Calculate statistics
    analysis.statistics = calculateStatistics(analysis);

    onProgress({
      status: AnalysisStatus.COMPLETE,
      message: "Analysis complete!",
    });
  } catch (error) {
    onProgress({ status: AnalysisStatus.ERROR, message: error.message });
    analysis.errors.push(error.message);
    throw error;
  }

  return analysis;
}

/**
 * Calculates aggregate statistics
 * @param {Object} analysis - Analysis data
 * @returns {Object} - Statistics
 */
function calculateStatistics(analysis) {
  const repos = analysis.repositories;
  const profile = analysis.profile;

  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);
  const originalRepos = repos.filter((r) => !r.isFork);

  // Activity analysis
  const now = new Date();
  const activeInLastYear = repos.filter((r) => {
    const updated = new Date(r.updatedAt);
    return now - updated < 365 * 24 * 60 * 60 * 1000;
  });

  // Calculate years of activity
  const accountCreated = new Date(profile.createdAt);
  const yearsActive = Math.max(
    1,
    Math.floor((now - accountCreated) / (365 * 24 * 60 * 60 * 1000))
  );

  return {
    totalRepos: repos.length,
    originalRepos: originalRepos.length,
    forkedRepos: repos.length - originalRepos.length,
    totalStars,
    totalForks,
    followers: profile.followers,
    following: profile.following,
    activeReposLastYear: activeInLastYear.length,
    yearsActive,
    averageStarsPerRepo:
      originalRepos.length > 0
        ? (totalStars / originalRepos.length).toFixed(1)
        : 0,
    topLanguage: analysis.languages?.primaryLanguage,
    languageCount: analysis.languages?.languageCount || 0,
    techCount: Object.values(analysis.techStack || {}).flat().length,
  };
}

/**
 * Generates a summary paragraph for the CV
 * @param {Object} analysis - Complete analysis
 * @returns {string} - Generated summary
 */
export function generateSummary(analysis) {
  const { profile, statistics, languages, rankedProjects } = analysis;

  const parts = [];

  // Opening
  if (profile.bio) {
    parts.push(profile.bio);
  } else {
    parts.push(
      `Software developer with ${statistics.yearsActive}+ years of experience on GitHub.`
    );
  }

  // Languages expertise
  const topLangs = languages?.languages?.slice(0, 3).map((l) => l.name) || [];
  if (topLangs.length > 0) {
    parts.push(`Specialized in ${topLangs.join(", ")}.`);
  }

  // Project highlights
  if (rankedProjects.length > 0) {
    const topProject = rankedProjects[0];
    if (topProject.stars > 10) {
      parts.push(
        `Creator of ${topProject.name}, a project with ${topProject.stars} stars.`
      );
    }
  }

  // Stats
  if (statistics.totalStars > 50) {
    parts.push(
      `Open source contributions have received ${statistics.totalStars} stars across ${statistics.originalRepos} repositories.`
    );
  }

  return parts.join(" ");
}

/**
 * Converts analysis to CV-ready data structure
 * @param {Object} analysis - Complete analysis
 * @returns {Object} - CV data structure
 */
export function analysisToCV(analysis) {
  const { profile, rankedProjects, skills, statistics, techStack } = analysis;

  // Group skills by category
  const skillsByCategory = {};
  for (const skill of skills) {
    const cat = skill.category || "Other";
    if (!skillsByCategory[cat]) {
      skillsByCategory[cat] = [];
    }
    skillsByCategory[cat].push(skill);
  }

  // Format projects for CV
  const projects = rankedProjects.map((project) => ({
    name: project.name,
    description: project.extractedDescription || project.description || "",
    url: project.url,
    technologies: [
      project.language,
      ...(project.topics?.slice(0, 3) || []),
    ].filter(Boolean),
    highlights: [
      project.stars > 0 ? `${project.stars} GitHub stars` : null,
      project.forks > 0 ? `${project.forks} forks` : null,
    ].filter(Boolean),
    startDate: project.createdAt,
    endDate: project.updatedAt,
  }));

  return {
    personalInfo: {
      name: profile.name,
      title: "Software Developer",
      email: profile.email,
      location: profile.location,
      website: profile.blog,
      github: profile.profileUrl,
      bio: profile.bio,
    },
    summary: generateSummary(analysis),
    skills: skillsByCategory,
    projects,
    statistics: {
      show: true,
      ...statistics,
    },
  };
}
