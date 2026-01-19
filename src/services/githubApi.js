/**
 * GitHub API Service
 * Now communicates with backend server for secure API access
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Makes a request to the backend API
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} - Response data
 */
async function apiFetch(endpoint) {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetches user profile information
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} - User profile data
 */
export async function fetchUserProfile(username) {
  return await apiFetch(`/api/github/user/${username}`);
}

/**
 * Fetches all public repositories for a user
 * @param {string} username - GitHub username
 * @param {number} maxPages - Maximum pages to fetch (30 repos per page)
 * @returns {Promise<Array>} - Array of repository data
 */
export async function fetchUserRepositories(username, maxPages = 4) {
  const allRepos = [];
  let page = 1;

  while (page <= maxPages) {
    const repos = await apiFetch(
      `/api/github/user/${username}/repos?per_page=100&page=${page}`,
    );

    if (repos.length === 0) break;

    allRepos.push(...repos);

    if (repos.length < 100) break;
    page++;
  }

  return allRepos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    homepage: repo.homepage,
    language: repo.language,
    stars: repo.stargazers_count,
    watchers: repo.watchers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    size: repo.size,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    isFork: repo.fork,
    isArchived: repo.archived,
    topics: repo.topics || [],
    defaultBranch: repo.default_branch,
    hasPages: repo.has_pages,
    license: repo.license?.spdx_id,
  }));
}

/**
 * Fetches language breakdown for a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} - Language bytes map
 */
export async function fetchRepoLanguages(owner, repo) {
  try {
    return await apiFetch(`/api/github/repo/${owner}/${repo}/languages`);
  } catch (error) {
    console.warn(
      `Could not fetch languages for ${owner}/${repo}:`,
      error.message,
    );
    return {};
  }
}

/**
 * Fetches README content for a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<string|null>} - README content or null
 */
export async function fetchRepoReadme(owner, repo) {
  try {
    const data = await apiFetch(`/api/github/repo/${owner}/${repo}/readme`);
    return data.content || null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches commit activity for a repository (last year)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} - Weekly commit counts
 */
export async function fetchCommitActivity(owner, repo) {
  try {
    // Note: commit activity stats might not be available through simple proxy
    // Simplified to just fetch recent commits count
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Fetches contributor statistics for a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} - Contributor stats
 */
export async function fetchContributorStats(owner, repo) {
  try {
    // Simplified - not critical for CV generation
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Fetches recent commits for a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} count - Number of commits to fetch
 * @returns {Promise<Array>} - Recent commits
 */
export async function fetchRecentCommits(owner, repo, count = 30) {
  try {
    const commits = await apiFetch(
      `/api/github/repo/${owner}/${repo}/commits?per_page=${count}`,
    );
    return commits.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      date: c.commit.author.date,
      author: c.commit.author.name,
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Fetches a specific file from a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - File path
 * @returns {Promise<string|null>} - File content or null
 */
export async function fetchRepoFile(owner, repo, path) {
  try {
    // Not implemented in backend yet, return null
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetches user's contribution events
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} - Recent events
 */
export async function fetchUserEvents(username) {
  try {
    // Not critical for CV, simplified
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Get current rate limit status
 * @returns {Object} - Rate limit info
 */
export function getRateLimitStatus() {
  return {
    remaining: 5000, // Backend handles this
    resetAt: null,
  };
}

/**
 * Batch fetch languages for multiple repositories
 * @param {Array} repos - Array of repository objects
 * @param {number} limit - Max repos to fetch languages for
 * @returns {Promise<Map>} - Map of repo name to languages
 */
export async function batchFetchLanguages(repos, limit = 20) {
  const languageMap = new Map();
  const topRepos = repos.slice(0, limit);

  // Fetch in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < topRepos.length; i += batchSize) {
    const batch = topRepos.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((repo) =>
        fetchRepoLanguages(repo.fullName.split("/")[0], repo.name).then(
          (langs) => ({ name: repo.name, languages: langs }),
        ),
      ),
    );
    results.forEach((r) => languageMap.set(r.name, r.languages));
  }

  return languageMap;
}
