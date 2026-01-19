/**
 * LaTeX Renderer Service
 * Renders LaTeX to HTML/PDF in the browser
 * Uses custom HTML rendering with LaTeX source export
 */

/**
 * Attempts to render LaTeX to HTML
 * Uses HTML preview since latex.js has bundler compatibility issues
 * @param {string} latex - LaTeX source code
 * @returns {Object} - Rendered result with HTML and errors
 */
export function renderLatexToHtml(latex) {
  // latex.js has compatibility issues in modern bundlers
  // We provide a pure HTML fallback that works reliably
  return {
    success: false,
    html: "",
    styles: "",
    document: null,
    errors: ["Using HTML preview mode"],
  };
}

/**
 * Creates a simplified HTML representation for CV preview
 * Falls back to this when latex.js has issues with complex templates
 * @param {Object} cvData - CV data
 * @param {string} templateId - Template ID
 * @returns {string} - HTML string
 */
export function renderCVToHtml(cvData, templateId = "modern") {
  const { personalInfo, summary, skills, projects, statistics } = cvData;

  // Generate skills HTML - handle both string arrays and object arrays
  const skillsHtml = Object.entries(skills || {})
    .filter(
      ([_, skillList]) => Array.isArray(skillList) && skillList.length > 0
    )
    .map(
      ([category, skillList]) => `
      <div class="skill-category">
        <h4>${escapeHtml(category)}</h4>
        <div class="skill-tags">
          ${skillList
            .map((s) => {
              const skillName = typeof s === "string" ? s : s.name;
              return `<span class="skill-tag">${escapeHtml(skillName)}</span>`;
            })
            .join("")}
        </div>
      </div>
    `
    )
    .join("");

  // Generate projects HTML
  const projectsHtml = (projects || [])
    .slice(0, 6)
    .map(
      (project) => `
      <div class="project">
        <div class="project-header">
          <h4>${escapeHtml(project.name)}</h4>
          <span class="project-tech">${(project.technologies || [])
            .slice(0, 3)
            .map((t) => escapeHtml(t))
            .join(", ")}</span>
        </div>
        <p>${escapeHtml(project.description || "")}</p>
        ${
          project.highlights?.length
            ? `
          <ul class="project-highlights">
            ${project.highlights
              .map((h) => `<li>${escapeHtml(h)}</li>`)
              .join("")}
          </ul>
        `
            : ""
        }
        ${
          project.url
            ? `<a href="${escapeHtml(
                project.url
              )}" class="project-link" target="_blank">View on GitHub →</a>`
            : ""
        }
      </div>
    `
    )
    .join("");

  // Stats section
  const statsHtml = statistics?.show
    ? `
    <section class="cv-section">
      <h3>GitHub Statistics</h3>
      <div class="stats-grid">
        <div class="stat">
          <span class="stat-value">${statistics.originalRepos}</span>
          <span class="stat-label">Repositories</span>
        </div>
        <div class="stat">
          <span class="stat-value">${statistics.totalStars}</span>
          <span class="stat-label">Stars</span>
        </div>
        <div class="stat">
          <span class="stat-value">${statistics.languageCount}</span>
          <span class="stat-label">Languages</span>
        </div>
        <div class="stat">
          <span class="stat-value">${statistics.yearsActive}+</span>
          <span class="stat-label">Years Active</span>
        </div>
      </div>
    </section>
  `
    : "";

  const templateStyles = getTemplateStyles(templateId);

  return `
    <style>${templateStyles}</style>
    <div class="cv-container template-${templateId}">
      <header class="cv-header">
        <h1>${escapeHtml(personalInfo.name)}</h1>
        <p class="title">${escapeHtml(
          personalInfo.title || "Software Developer"
        )}</p>
        <div class="contact-info">
          ${
            personalInfo.location
              ? `<span>📍 ${escapeHtml(personalInfo.location)}</span>`
              : ""
          }
          ${
            personalInfo.email
              ? `<span>✉️ <a href="mailto:${escapeHtml(
                  personalInfo.email
                )}">${escapeHtml(personalInfo.email)}</a></span>`
              : ""
          }
          ${
            personalInfo.github
              ? `<span>🔗 <a href="${escapeHtml(
                  personalInfo.github
                )}" target="_blank">GitHub</a></span>`
              : ""
          }
          ${
            personalInfo.website
              ? `<span>🌐 <a href="${escapeHtml(
                  personalInfo.website
                )}" target="_blank">Website</a></span>`
              : ""
          }
        </div>
      </header>

      <section class="cv-section">
        <h3>Professional Summary</h3>
        <p>${escapeHtml(summary)}</p>
      </section>

      <section class="cv-section">
        <h3>Technical Skills</h3>
        <div class="skills-container">
          ${skillsHtml}
        </div>
      </section>

      <section class="cv-section">
        <h3>Notable Projects</h3>
        <div class="projects-container">
          ${projectsHtml}
        </div>
      </section>

      ${statsHtml}
    </div>
  `;
}

/**
 * Gets CSS styles for each template
 * @param {string} templateId - Template ID
 * @returns {string} - CSS styles
 */
function getTemplateStyles(templateId) {
  const baseStyles = `
    .cv-container {
      font-family: 'Segoe UI', system-ui, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: white;
      color: #333;
      line-height: 1.6;
    }
    .cv-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
    }
    .cv-header h1 {
      margin: 0 0 8px 0;
      font-size: 2.2rem;
    }
    .cv-header .title {
      margin: 0 0 12px 0;
      font-size: 1.1rem;
      color: #666;
    }
    .contact-info {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 15px;
      font-size: 0.9rem;
    }
    .contact-info a {
      color: #0366d6;
      text-decoration: none;
    }
    .cv-section {
      margin-bottom: 25px;
    }
    .cv-section h3 {
      font-size: 1.3rem;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .skills-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    .skill-category h4 {
      margin: 0 0 10px 0;
      font-size: 0.95rem;
      color: #555;
    }
    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .skill-tag {
      background: #f1f3f5;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .project {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f0f0f0;
    }
    .project:last-child {
      border-bottom: none;
    }
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .project-header h4 {
      margin: 0;
      font-size: 1.1rem;
    }
    .project-tech {
      color: #666;
      font-size: 0.85rem;
      font-style: italic;
    }
    .project p {
      margin: 8px 0;
    }
    .project-highlights {
      margin: 5px 0 0 0;
      padding-left: 20px;
      font-size: 0.9rem;
      color: #555;
    }
    .project-link {
      display: inline-block;
      margin-top: 8px;
      color: #0366d6;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .project-link:hover {
      text-decoration: underline;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      text-align: center;
    }
    .stat-value {
      display: block;
      font-size: 1.8rem;
      font-weight: bold;
      color: #0366d6;
    }
    .stat-label {
      font-size: 0.85rem;
      color: #666;
    }
    .cv-footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 0.8rem;
      color: #999;
    }
  `;

  const templateOverrides = {
    modern: `
      .template-modern .cv-header h1 { color: #2980b9; }
      .template-modern .cv-section h3 { color: #2980b9; border-color: #2980b9; }
      .template-modern .skill-tag { background: #ebf5fb; color: #2980b9; }
      .template-modern .stat-value { color: #2980b9; }
    `,
    minimal: `
      .template-minimal { font-family: Georgia, serif; }
      .template-minimal .cv-header { border-bottom: 1px solid #333; }
      .template-minimal .cv-section h3 { border-bottom: none; font-weight: normal; font-style: italic; }
      .template-minimal .skill-tag { background: transparent; border: 1px solid #ddd; }
    `,
    academic: `
      .template-academic { font-family: 'Times New Roman', serif; }
      .template-academic .cv-header h1 { font-size: 1.8rem; }
      .template-academic .cv-section h3 { text-transform: uppercase; font-size: 1rem; letter-spacing: 1px; }
    `,
    "tech-focused": `
      .template-tech-focused { font-family: 'Consolas', 'Monaco', monospace; background: #f6f8fa; }
      .template-tech-focused .cv-header { background: #24292e; color: white; padding: 30px; margin: -40px -40px 30px -40px; }
      .template-tech-focused .cv-header h1 { color: white; }
      .template-tech-focused .cv-header .title { color: #8b949e; }
      .template-tech-focused .contact-info a { color: #58a6ff; }
      .template-tech-focused .skill-tag { background: #21262d; color: #c9d1d9; font-family: monospace; }
      .template-tech-focused .stat-value { color: #238636; }
    `,
  };

  return baseStyles + (templateOverrides[templateId] || "");
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generates a downloadable PDF from the CV
 * Uses browser print functionality
 * @param {Object} cvData - CV data
 * @param {string} templateId - Template ID
 */
export function downloadAsPDF(cvData, templateId) {
  const html = renderCVToHtml(cvData, templateId);

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${cvData.personalInfo.name} - CV</title>
      <style>
        @media print {
          body { margin: 0; }
          .cv-container { padding: 20px; }
        }
      </style>
    </head>
    <body>
      ${html}
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Downloads the LaTeX source file
 * @param {string} latex - LaTeX source code
 * @param {string} filename - Filename
 */
export function downloadLatexSource(latex, filename = "cv.tex") {
  const blob = new Blob([latex], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
