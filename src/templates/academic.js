/**
 * Academic CV Template
 * Traditional academic style with structured sections
 */

export const academicTemplate = {
  id: "academic",
  name: "Academic",
  description: "Traditional academic CV format with detailed sections",
  preview: "🎓",

  /**
   * Generates LaTeX code for the academic CV template
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

    // Format date
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    };

    // Generate skills by category - handle both strings and objects
    const skillsLatex = Object.entries(skills || {})
      .filter(
        ([_, skillList]) => Array.isArray(skillList) && skillList.length > 0
      )
      .map(([category, skillList]) => {
        const items = skillList
          .map((s) => {
            const name = typeof s === "string" ? s : s.name;
            return `\\item ${escape(name)}`;
          })
          .join("\n");
        return `\\subsection*{${escape(category)}}
\\begin{itemize}[leftmargin=*, nosep]
${items}
\\end{itemize}`;
      })
      .join("\n\n");

    // Generate projects as publications-style entries
    const projectsLatex = (projects || [])
      .slice(0, 8)
      .map((project, index) => {
        const techs = (project.technologies || [])
          .map((t) => escape(t))
          .join(", ");
        const dates = `${formatDate(project.startDate)} -- ${formatDate(
          project.endDate
        )}`;
        const repoLink = project.url ? ` \\href{${project.url}}{[GitHub]}` : "";

        return `\\item[${index + 1}.] \\textbf{${escape(
          project.name
        )}} (${dates})${repoLink}\\\\
\\textit{Technologies: ${techs}}\\\\
${escape(project.description || "")}${
          project.highlights?.length
            ? `\\\\
\\textit{Impact: ${project.highlights.join(", ")}}`
            : ""
        }`;
      })
      .join("\n\n");

    return `\\documentclass[11pt,a4paper]{article}

% Packages
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{times}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}

% Section formatting
\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\vspace{-0.5em}\\rule{\\textwidth}{0.5pt}]
\\titleformat{\\subsection}{\\normalsize\\bfseries}{}{0em}{}

% Hyperref setup
\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    urlcolor=blue
}

\\begin{document}

% Header
\\begin{center}
{\\Large\\bfseries ${escape(personalInfo.name)}}

\\vspace{0.5em}

${escape(personalInfo.title || "Software Developer")}

\\vspace{0.3em}

\\begin{tabular}{c}
${
  personalInfo.email
    ? `Email: \\href{mailto:${escape(personalInfo.email)}}{${escape(
        personalInfo.email
      )}}`
    : ""
}
${
  personalInfo.location ? `\\\\ Location: ${escape(personalInfo.location)}` : ""
}
${
  personalInfo.github
    ? `\\\\ GitHub: \\href{${escape(personalInfo.github)}}{${escape(
        personalInfo.github
      )}}`
    : ""
}
${
  personalInfo.website
    ? `\\\\ Website: \\href{${escape(personalInfo.website)}}{${escape(
        personalInfo.website
      )}}`
    : ""
}
\\end{tabular}
\\end{center}

\\section*{Research Interests \\& Summary}
${escape(summary)}

\\section*{Technical Expertise}
${skillsLatex}

\\section*{Selected Projects \\& Contributions}
\\begin{enumerate}[leftmargin=*, label={[\\arabic*]}]
${projectsLatex}
\\end{enumerate}

${
  statistics?.show
    ? `\\section*{Open Source Metrics}
\\begin{tabular}{ll}
\\textbf{Public Repositories:} & ${statistics.originalRepos} \\\\
\\textbf{Total Stars Received:} & ${statistics.totalStars} \\\\
\\textbf{Repository Forks:} & ${statistics.totalForks} \\\\
\\textbf{Programming Languages:} & ${statistics.languageCount} \\\\
\\textbf{Years Active:} & ${statistics.yearsActive} \\\\
\\end{tabular}`
    : ""
}

\\end{document}`;
  },
};
