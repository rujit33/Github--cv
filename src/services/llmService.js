/**
 * LLM Service
 * Now communicates with backend server for secure API access
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Check if LLM features are enabled (check backend status)
 * @returns {Promise<boolean>}
 */
let llmStatusCache = null;

export async function isLLMEnabled() {
  if (llmStatusCache !== null) {
    return llmStatusCache;
  }

  try {
    const response = await fetch(`${API_BASE}/api/llm/status`);
    const data = await response.json();
    llmStatusCache = data.enabled;
    return data.enabled;
  } catch (error) {
    console.warn("Failed to check LLM status:", error);
    return false;
  }
}

/**
 * Makes a request to the backend LLM API
 * @param {string} prompt - User prompt
 * @param {string} systemPrompt - System instructions
 * @param {number} maxTokens - Maximum tokens in response
 * @returns {Promise<string>} - Generated text
 */
async function callLLM(prompt, systemPrompt, maxTokens = 1000) {
  try {
    const response = await fetch(`${API_BASE}/api/llm/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        systemPrompt,
        maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content || "";
  } catch (error) {
    console.error("LLM API Error:", error);
    throw error;
  }
}

/**
 * Clean LLM response - remove markdown, options, explanations
 * @param {string} text - Raw LLM response
 * @returns {string} - Cleaned text
 */
function cleanResponse(text) {
  if (!text) return "";

  // Remove markdown bold/italic
  let cleaned = text.replace(/\*\*/g, "").replace(/\*/g, "");

  // Remove "Option X:" patterns
  cleaned = cleaned.replace(/\*?\*?Option \d+[^:]*:\*?\*?/gi, "");

  // Remove "> " quote markers
  cleaned = cleaned.replace(/^>\s*/gm, "");

  // Remove explanatory sections
  cleaned = cleaned.replace(
    /\*\*Key (Considerations|improvements)[^*]*\*\*/gi,
    "",
  );
  cleaned = cleaned.replace(/Key (Considerations|improvements).*$/gis, "");

  // Remove "Here are" introductions
  cleaned = cleaned.replace(/^Here (are|is)[^.]*\.\s*/i, "");

  // Take only first paragraph if multiple exist
  const paragraphs = cleaned.split(/\n\n+/).filter((p) => p.trim().length > 20);
  if (paragraphs.length > 0) {
    cleaned = paragraphs[0];
  }

  // Remove trailing incomplete sentences
  cleaned = cleaned.replace(/\s+\*\*[^*]+$/, "");
  cleaned = cleaned.replace(/\([^)]*$/, "");

  return cleaned.trim();
}

/**
 * Generates a professional project name from repository data
 * @param {Object} repo - Repository data
 * @param {string} readmeContent - README content if available
 * @returns {Promise<string>} - Professional project name
 */
export async function generateProjectName(repo, readmeContent = null) {
  if (!isLLMEnabled()) {
    return formatRepoName(repo.name);
  }

  const systemPrompt = `You are a CV writer. Output ONLY a project name. No quotes. No explanation. No options. Maximum 6 words.`;

  const prompt = `Convert this GitHub repo name to a professional CV project title.

Repo: ${repo.name}
Description: ${repo.description || "None"}
Language: ${repo.language || "Unknown"}
${readmeContent ? `README: ${readmeContent.slice(0, 300)}` : ""}

Output ONLY the title. Example: "Real-Time Analytics Dashboard"`;

  try {
    const name = await callLLM(prompt, systemPrompt, 30);
    const cleaned = name
      .replace(/^["']|["']$/g, "")
      .replace(/\*\*/g, "")
      .trim();
    return cleaned.split("\n")[0] || formatRepoName(repo.name);
  } catch (error) {
    console.warn("Failed to generate project name:", error);
    return formatRepoName(repo.name);
  }
}

/**
 * Format repo name as a readable title (fallback)
 * @param {string} name - Repository name
 * @returns {string} - Formatted name
 */
function formatRepoName(name) {
  return name
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Generates a professional project description
 * @param {Object} project - Project data
 * @param {string} readmeContent - README content if available
 * @returns {Promise<string>} - Professional description
 */
export async function generateProjectDescription(
  project,
  readmeContent = null,
) {
  if (!isLLMEnabled()) {
    return project.description || "";
  }

  const systemPrompt = `You are a CV writer. Write exactly ONE concise project description (2-3 sentences max). 
NO options. NO explanations. NO "Option 1/2/3". NO markdown. NO asterisks. 
Just output the description directly.`;

  const prompt = `Write a CV project description.

Project: ${project.displayName || project.name}
Tech: ${project.language || ""}${
    project.topics?.length ? ", " + project.topics.slice(0, 3).join(", ") : ""
  }
Description: ${project.description || "No description"}
${readmeContent ? `README excerpt: ${readmeContent.slice(0, 400)}` : ""}

Write 2-3 sentences describing what this project does. Be specific but concise. Output ONLY the description.`;

  try {
    const response = await callLLM(prompt, systemPrompt, 150);
    return cleanResponse(response) || project.description || "";
  } catch (error) {
    console.warn("Failed to generate project description:", error);
    return project.description || "";
  }
}

/**
 * Generates a professional CV summary
 * @param {Object} analysisData - GitHub analysis data
 * @param {string} style - Summary style: 'professional', 'technical', 'concise'
 * @returns {Promise<string>} - Professional summary
 */
export async function generateProfessionalSummary(
  analysisData,
  style = "professional",
) {
  if (!isLLMEnabled()) {
    return generateFallbackSummary(analysisData);
  }

  const { profile, statistics, languages, rankedProjects } = analysisData;

  const topLanguages =
    languages?.languages
      ?.slice(0, 5)
      .map((l) => l.name)
      .join(", ") || "various languages";
  const topProjects =
    rankedProjects
      ?.slice(0, 3)
      .map((p) => p.displayName || p.name)
      .join(", ") || "";

  const styleGuide = {
    professional:
      "Write a balanced, professional summary suitable for any employer.",
    technical:
      "Focus heavily on technical skills and technologies. Use technical terminology.",
    concise:
      "Be extremely brief - maximum 2 sentences. Focus on core competencies only.",
  };

  const systemPrompt = `You are a professional CV writer. Write exactly ONE summary paragraph (3-4 sentences).
CRITICAL RULES:
- Output ONLY the summary text
- NO "Option 1", "Option 2", etc.
- NO bullet points
- NO markdown formatting
- NO explanations or alternatives
- NO asterisks or bold text
- Start directly with the summary`;

  const prompt = `Write a CV professional summary for this developer:

Name: ${profile.name || profile.login}
Bio: ${profile.bio || "Not provided"}
GitHub Experience: ${statistics.yearsActive} years
Stars Earned: ${statistics.totalStars}
Original Repos: ${statistics.originalRepos}
Top Languages: ${topLanguages}
Key Projects: ${topProjects}
Location: ${profile.location || "Not specified"}

Style: ${styleGuide[style] || styleGuide.professional}

Output ONLY the summary paragraph. No introduction, no options, no explanation.`;

  try {
    const response = await callLLM(prompt, systemPrompt, 200);
    return cleanResponse(response) || generateFallbackSummary(analysisData);
  } catch (error) {
    console.warn("Failed to generate summary:", error);
    return generateFallbackSummary(analysisData);
  }
}

/**
 * Fallback summary generation without LLM
 */
function generateFallbackSummary(analysisData) {
  const { profile, statistics, languages } = analysisData;
  const topLangs = languages?.languages?.slice(0, 3).map((l) => l.name) || [];

  let summary = `Software developer with ${statistics.yearsActive}+ years of experience on GitHub.`;
  if (topLangs.length > 0) {
    summary += ` Specialized in ${topLangs.join(", ")}.`;
  }
  if (statistics.totalStars > 10) {
    summary += ` Open source contributions have received ${statistics.totalStars} stars.`;
  }
  return summary;
}

/**
 * Generates skill descriptions for CV
 * @param {Array} skills - Skills array
 * @param {Object} context - Additional context
 * @returns {Promise<Object>} - Categorized skills
 */
export async function enhanceSkills(skills, context = {}) {
  if (!isLLMEnabled() || skills.length === 0) {
    return groupSkillsByCategory(skills);
  }

  const systemPrompt = `You categorize skills for CVs. Return ONLY a JSON object. No explanation. No markdown code blocks.`;

  const skillNames = skills
    .slice(0, 25)
    .map((s) => s.name)
    .join(", ");

  const prompt = `Categorize these skills into a JSON object:

Skills: ${skillNames}

Categories to use: "Programming Languages", "Frameworks & Libraries", "Tools & Platforms", "Databases", "Other"

Return ONLY valid JSON like: {"Programming Languages": ["Python"], "Frameworks & Libraries": ["React"]}`;

  try {
    const response = await callLLM(prompt, systemPrompt, 400);
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.warn("Failed to enhance skills:", error);
  }

  return groupSkillsByCategory(skills);
}

/**
 * Group skills by their existing category (fallback)
 */
function groupSkillsByCategory(skills) {
  const grouped = {};
  for (const skill of skills) {
    const category = skill.category || "Other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(skill.name);
  }
  return grouped;
}

/**
 * Generates complete CV content using LLM
 * @param {Object} analysisData - Full analysis data
 * @param {Array} selectedProjects - User-selected projects
 * @param {Map} readmeMap - Map of repo name to readme content
 * @param {string} style - CV style
 * @returns {Promise<Object>} - Complete CV data
 */
export async function generateCompleteCVContent(
  analysisData,
  selectedProjects,
  readmeMap = new Map(),
  style = "professional",
) {
  const { profile, statistics, languages, skills } = analysisData;

  // Generate summary
  const summary = await generateProfessionalSummary(analysisData, style);

  // Generate project names and descriptions
  const enhancedProjects = [];
  for (const project of selectedProjects.slice(0, 6)) {
    const readmeContent = readmeMap.get(project.name);
    const displayName = await generateProjectName(project, readmeContent);
    const description = await generateProjectDescription(
      { ...project, displayName },
      readmeContent,
    );

    enhancedProjects.push({
      name: displayName,
      repoName: project.name,
      description: description,
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
    });

    // Small delay between API calls
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Enhance skills
  const enhancedSkills = await enhanceSkills(skills, {
    primaryLanguage: languages?.primaryLanguage,
  });

  return {
    personalInfo: {
      name: profile.name || profile.login,
      title: "Software Developer",
      email: profile.email,
      location: profile.location,
      website: profile.blog,
      github: profile.profileUrl,
      bio: profile.bio,
    },
    summary,
    skills: enhancedSkills,
    projects: enhancedProjects,
    statistics: {
      show: true,
      ...statistics,
    },
  };
}

/**
 * Regenerate a specific section of the CV
 * @param {string} section - Section to regenerate ('summary', 'project')
 * @param {Object} data - Data for regeneration
 * @param {string} style - Style variant
 * @returns {Promise<string|Object>} - Regenerated content
 */
export async function regenerateSection(section, data, style = "professional") {
  switch (section) {
    case "summary":
      return generateProfessionalSummary(data, style);
    case "project":
      const desc = await generateProjectDescription(data.project, data.readme);
      return desc;
    default:
      throw new Error(`Unknown section: ${section}`);
  }
}

/**
 * LLM Service configuration status
 * @returns {Promise<Object>} - Configuration status
 */
export async function getLLMStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/llm/status`);
    const data = await response.json();
    return {
      enabled: data.enabled,
      hasApiKey: data.configured,
      model: data.model,
      provider: "OpenRouter (via Backend)",
    };
  } catch (error) {
    return {
      enabled: false,
      hasApiKey: false,
      model: "N/A",
      provider: "Backend Unavailable",
    };
  }
}
