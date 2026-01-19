/**
 * LLM API Routes
 * Proxies requests to OpenRouter API with authentication
 */

import express from "express";

const router = express.Router();
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Check if LLM service is configured
 */
router.get("/status", (req, res) => {
  const isConfigured = !!process.env.OPENROUTER_API_KEY;
  res.json({
    enabled: isConfigured,
    model: process.env.LLM_MODEL || "google/gemma-3-27b-it:free",
    configured: isConfigured,
  });
});

/**
 * Generate CV content using LLM
 */
router.post("/generate", async (req, res, next) => {
  try {
    const { prompt, systemPrompt, maxTokens = 2000 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({
        error:
          "LLM service not configured. Please add OPENROUTER_API_KEY to server environment.",
      });
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": req.headers.referer || "http://localhost:5173",
        "X-Title": "GitHub to CV Generator",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "google/gemma-3-27b-it:free",
        messages: [
          {
            role: "system",
            content:
              systemPrompt || "You are a professional CV writer assistant.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: Math.min(maxTokens, 4000),
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `OpenRouter API error: ${response.status}`,
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    res.json({
      content,
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    console.error("LLM Generation Error:", error);
    next(error);
  }
});

/**
 * Generate professional summary
 */
router.post("/generate-summary", async (req, res, next) => {
  try {
    const { profile, repositories, style } = req.body;

    if (!profile || !repositories) {
      return res
        .status(400)
        .json({ error: "Profile and repositories are required" });
    }

    const systemPrompt = `You are a professional CV writer. Generate a compelling professional summary for a software developer's CV based on their GitHub profile and projects. Be concise (3-4 sentences), professional, and highlight their strengths.`;

    const prompt = `
Profile: ${profile.name || profile.login}
Bio: ${profile.bio || "Not provided"}
Location: ${profile.location || "Not specified"}
${profile.company ? `Company: ${profile.company}` : ""}

Top Repositories:
${repositories
  .slice(0, 5)
  .map(
    (r) =>
      `- ${r.name}: ${r.description || "No description"} (${r.language || "Unknown language"})`,
  )
  .join("\n")}

Style: ${style || "professional"}

Generate a professional summary (3-4 sentences) that showcases this developer's expertise and experience.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": req.headers.referer || "http://localhost:5173",
        "X-Title": "GitHub to CV Generator",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "google/gemma-3-27b-it:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    res.json({ content });
  } catch (error) {
    next(error);
  }
});

/**
 * Enhance project descriptions
 */
router.post("/enhance-projects", async (req, res, next) => {
  try {
    const { projects, style } = req.body;

    if (!projects || !Array.isArray(projects)) {
      return res.status(400).json({ error: "Projects array is required" });
    }

    const systemPrompt = `You are a professional CV writer. Enhance project descriptions to be more impactful and professional. Keep them concise but compelling. Focus on achievements and technologies used.`;

    const prompt = `
Enhance these project descriptions for a professional CV. Keep each description to 2-3 sentences. Make them ${style || "professional"} and impactful.

Projects:
${projects
  .map(
    (p, i) => `${i + 1}. ${p.name}
   Current description: ${p.description || "No description"}
   Technologies: ${p.technologies?.join(", ") || "Unknown"}
`,
  )
  .join("\n")}

Return the enhanced descriptions in the same order, one per line, without numbering.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": req.headers.referer || "http://localhost:5173",
        "X-Title": "GitHub to CV Generator",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "google/gemma-3-27b-it:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    res.json({ content });
  } catch (error) {
    next(error);
  }
});

export default router;
