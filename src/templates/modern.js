/**
 * Modern CV Template (2026 Edition)
 * ATS-friendly, clean design following current market trends
 * - Single column for better ATS parsing
 * - Clear section headings
 * - Professional typography
 * - Quantifiable achievements emphasized
 */

export const modernTemplate = {
  id: "modern",
  name: "Modern Professional",
  description: "ATS-friendly design with modern typography and clear structure",
  preview: "🎨",

  /**
   * Generates LaTeX code for the modern CV template
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

    // Generate skills section with better formatting
    const skillsLatex = Object.entries(skills || {})
      .filter(
        ([_, skillList]) => Array.isArray(skillList) && skillList.length > 0,
      )
      .map(([category, skillList]) => {
        const skillNames = skillList
          .map((s) => {
            const name = typeof s === "string" ? s : s.name;
            return escape(name);
          })
          .join(" \\textbullet\\ ");
        return `\\textbf{${escape(category)}:} ${skillNames}`;
      })
      .join("\n\n");

    // Generate projects section with impact focus
    const projectsLatex = (projects || [])
      .slice(0, 5)
      .map((project) => {
        const techs = (project.technologies || [])
          .map((t) => escape(t))
          .join(" \\textbullet\\ ");
        const highlights = (project.highlights || [])
          .map((h) => `\\item ${escape(h)}`)
          .join("\n");

        return `\\textbf{${escape(project.name)}}${
          project.url
            ? ` \\hfill \\href{${project.url}}{\\small github.com}`
            : ""
        }

\\textit{${techs}}

${escape(project.description || "")}

${
  highlights
    ? `\\begin{itemize}[leftmargin=1.2em,itemsep=2pt,topsep=4pt]
${highlights}
\\end{itemize}`
    : ""
}`;
      })
      .join("\n\n\\vspace{0.3em}\n");

    // Generate compact GitHub stats
    const statsLatex = statistics?.show
      ? `\\section{GitHub Activity}
\\textbf{${statistics.originalRepos}} repositories \\textbullet\\ \\textbf{${statistics.totalStars}} stars earned \\textbullet\\ \\textbf{${statistics.languageCount}} languages \\textbullet\\ \\textbf{${statistics.yearsActive}} years active
`
      : "";

    return `\\documentclass[10pt,a4paper,sans]{article}

% Packages for modern, ATS-friendly CV
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{charter} % Professional serif font
\\usepackage[scaled=0.92]{helvet} % Sans-serif for headings
\\usepackage[margin=0.75in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{parskip}

% Professional color scheme (subtle, ATS-safe)
\\definecolor{primary}{RGB}{0, 51, 102}
\\definecolor{accent}{RGB}{70, 130, 180}
\\definecolor{text}{RGB}{51, 51, 51}

% Hyperref setup (ATS-friendly)
\\hypersetup{
    colorlinks=true,
    linkcolor=accent,
    urlcolor=accent,
    pdfborder={0 0 0}
}

% Section formatting - clear and ATS-friendly
\\titleformat{\\section}
  {\\normalfont\\sffamily\\Large\\bfseries\\color{primary}}
  {}{0em}{}[\\vspace{-0.5em}\\color{primary}\\titlerule\\vspace{0.2em}]

\\titlespacing*{\\section}{0pt}{1.2em}{0.6em}

% Remove page numbers for single-page CV
\\pagenumbering{gobble}

% Paragraph spacing
\\setlength{\\parskip}{0.4em}

\\begin{document}

% ========================
% HEADER - Clear and Professional
% ========================
\\begin{center}
{\\Huge\\sffamily\\bfseries\\color{primary} ${escape(personalInfo.name)}}

\\vspace{0.4em}

${personalInfo.location ? `${escape(personalInfo.location)} \\textbullet\\ ` : ""}${
      personalInfo.email
        ? `\\href{mailto:${escape(personalInfo.email)}}{${escape(
            personalInfo.email,
          )}}`
        : ""
    }${personalInfo.github ? ` \\textbullet\\ \\href{${escape(personalInfo.github)}}{GitHub}` : ""}${
      personalInfo.website
        ? ` \\textbullet\\ \\href{${escape(personalInfo.website)}}{Portfolio}`
        : ""
    }
\\end{center}

\\vspace{0.5em}

% ========================
% PROFESSIONAL SUMMARY
% ========================
\\section{Professional Summary}
${escape(summary)}

% ========================
% TECHNICAL SKILLS
% ========================
\\section{Technical Skills}
${skillsLatex}

% ========================
% PROJECTS & EXPERIENCE
% ========================
\\section{Key Projects \\& Contributions}
${projectsLatex}

% ========================
% GITHUB STATISTICS (Optional)
% ========================
${statsLatex}

\\end{document}`;
  },
};
