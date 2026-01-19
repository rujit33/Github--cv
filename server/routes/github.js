/**
 * GitHub API Routes
 * Proxies requests to GitHub API with authentication
 */

import express from "express";

const router = express.Router();
const GITHUB_API_BASE = "https://api.github.com";

/**
 * Makes an authenticated request to GitHub API
 */
async function githubFetch(endpoint) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${GITHUB_API_BASE}${endpoint}`;

  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "GitHub-To-CV-Backend",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
  const rateLimitReset = response.headers.get("X-RateLimit-Reset");

  if (!response.ok) {
    if (response.status === 403 && rateLimitRemaining === "0") {
      const resetDate = new Date(parseInt(rateLimitReset) * 1000);
      throw new Error(
        `GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`,
      );
    }
    if (response.status === 404) {
      throw new Error("User or resource not found");
    }
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

// Get user profile
router.get("/user/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await githubFetch(`/users/${username}`);

    res.json({
      login: user.login,
      name: user.name || user.login,
      bio: user.bio,
      company: user.company,
      location: user.location,
      email: user.email,
      blog: user.blog,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      createdAt: user.created_at,
      hireable: user.hireable,
    });
  } catch (error) {
    next(error);
  }
});

// Get user repositories
router.get("/user/:username/repos", async (req, res, next) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const perPage = Math.min(parseInt(req.query.per_page) || 100, 100);

    const repos = await githubFetch(
      `/users/${username}/repos?sort=updated&direction=desc&per_page=${perPage}&page=${page}`,
    );

    res.json(repos);
  } catch (error) {
    next(error);
  }
});

// Get repository details
router.get("/repo/:owner/:repo", async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const repoData = await githubFetch(`/repos/${owner}/${repo}`);

    res.json(repoData);
  } catch (error) {
    next(error);
  }
});

// Get repository languages
router.get("/repo/:owner/:repo/languages", async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const languages = await githubFetch(`/repos/${owner}/${repo}/languages`);

    res.json(languages);
  } catch (error) {
    next(error);
  }
});

// Get repository README
router.get("/repo/:owner/:repo/readme", async (req, res, next) => {
  try {
    const { owner, repo } = req.params;

    try {
      const readme = await githubFetch(`/repos/${owner}/${repo}/readme`);

      // Decode content if base64 encoded
      if (readme.encoding === "base64" && readme.content) {
        const decodedContent = Buffer.from(readme.content, "base64").toString(
          "utf-8",
        );
        res.json({
          content: decodedContent,
          name: readme.name,
          path: readme.path,
          downloadUrl: readme.download_url,
        });
      } else {
        res.json(readme);
      }
    } catch (error) {
      // README not found
      res.json({ content: null });
    }
  } catch (error) {
    next(error);
  }
});

// Get repository commits
router.get("/repo/:owner/:repo/commits", async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const perPage = Math.min(parseInt(req.query.per_page) || 100, 100);

    const commits = await githubFetch(
      `/repos/${owner}/${repo}/commits?per_page=${perPage}`,
    );

    res.json(commits);
  } catch (error) {
    next(error);
  }
});

// Search repositories
router.get("/search/repositories", async (req, res, next) => {
  try {
    const { q, sort, order, per_page, page } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const params = new URLSearchParams({
      q,
      sort: sort || "stars",
      order: order || "desc",
      per_page: Math.min(parseInt(per_page) || 30, 100),
      page: parseInt(page) || 1,
    });

    const data = await githubFetch(`/search/repositories?${params}`);

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
