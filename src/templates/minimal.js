/**
 * Minimal CV Template
 * Simple, elegant design with focus on content
 */

export const minimalTemplate = {
  id: "minimal",
  name: "Minimal",
  description: "Clean and simple design focusing on content",
  preview: "📄",

  /**
   * Generates LaTeX code for the minimal CV template
   * @param {Object} cvData - CV data
   * @returns {string} - LaTeX code
   */
  generate(cvData) {
    const { personalInfo, summary, skills, projects, statistics } = cvData;

    // Escape LaTeX special characters
    const escape = (text) => {
      if (!text) return "";
      return String(text)
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/&/g, "\\&")
        .replace(/%/g, "\\%")
        .replace(/\$/g, "\\$")
        .replace(/#/g, "\\#")
        .replace(/_/g, "\\_")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/\^/g, "\\textasciicircum{}");
    };

    // Generate skills as comma-separated list - handle both strings and objects
    const allSkills = Object.values(skills || {})
      .flat()
      .map((s) => {
        const name = typeof s === "string" ? s : s.name;
        return escape(name);
      })
      .join(" · ");

    // Generate projects section
    const projectsLatex = (projects || [])
      .slice(0, 5)
      .map((project) => {
        const techs = (project.technologies || [])
          .slice(0, 3)
          .map((t) => escape(t))
          .join(", ");
        const repoLink = project.url
          ? `\\\\\n\\href{${project.url}}{View on GitHub}`
          : "";

        return `\\textbf{${escape(project.name)}} \\hfill \\textit{${techs}}

${escape(project.description || "")}${repoLink}

`;
      })
      .join("\\vspace{0.5em}\n\n");

    return `\\documentclass[11pt,a4paper]{article}

% Packages
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=1.25in]{geometry}
\\usepackage{hyperref}
\\usepackage{parskip}

% Hyperref setup
\\hypersetup{
    colorlinks=true,
    linkcolor=black,
    urlcolor=darkgray
}

% Remove page numbers
\\pagenumbering{gobble}

% Custom commands
\\newcommand{\\sectionline}{\\vspace{0.3em}\\hrule\\vspace{0.5em}}

\\begin{document}

% Header
\\begin{center}
{\\LARGE\\bfseries ${escape(personalInfo.name)}}

\\vspace{0.2em}

${personalInfo.title || "Software Developer"}

\\vspace{0.3em}

\\small
${[
  personalInfo.email
    ? `\\href{mailto:${escape(personalInfo.email)}}{${escape(
        personalInfo.email
      )}}`
    : "",
  personalInfo.location ? escape(personalInfo.location) : "",
  personalInfo.github ? `\\href{${escape(personalInfo.github)}}{GitHub}` : "",
  personalInfo.website
    ? `\\href{${escape(personalInfo.website)}}{Website}`
    : "",
]
  .filter(Boolean)
  .join(" | ")}
\\end{center}

\\sectionline

% Summary
\\textbf{About}

${escape(summary)}

\\sectionline

% Skills
\\textbf{Skills}

${allSkills}

\\sectionline

% Projects
\\textbf{Projects}

${projectsLatex}

${
  statistics?.show
    ? `\\sectionline

\\textbf{GitHub}

${statistics.originalRepos} repositories · ${statistics.totalStars} stars · ${statistics.languageCount} languages
`
    : ""
}

\\end{document}`;
  },
};
