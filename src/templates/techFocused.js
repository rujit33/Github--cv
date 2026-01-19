/**
 * Tech-Focused CV Template
 * Developer-oriented design with code styling and metrics
 */

export const techFocusedTemplate = {
  id: "tech-focused",
  name: "Tech Focused",
  description: "Developer-centric design with metrics and technical details",
  preview: "💻",

  /**
   * Generates LaTeX code for the tech-focused CV template
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

    // Generate skill bars
    const generateSkillBars = (skillList) => {
      return skillList
        .slice(0, 8)
        .map((s) => {
          const name = typeof s === "string" ? s : s.name;
          const level = (typeof s === "object" && s.level) || "Proficient";
          const percentage =
            level === "Expert"
              ? 95
              : level === "Advanced"
              ? 80
              : level === "Intermediate"
              ? 60
              : 40;
          return `${escape(name)} & \\progressbar{${percentage}} \\\\`;
        })
        .join("\n");
    };

    // Get top skills from each category
    const topSkills = Object.values(skills || {})
      .flat()
      .slice(0, 12);
    const skillBars = generateSkillBars(topSkills);

    // Generate tech stack boxes - handle both strings and objects
    const techStackLatex = Object.entries(skills || {})
      .filter(
        ([_, skillList]) => Array.isArray(skillList) && skillList.length > 0
      )
      .slice(0, 4)
      .map(([category, skillList]) => {
        const names = skillList
          .slice(0, 5)
          .map((s) => {
            const name = typeof s === "string" ? s : s.name;
            return `\\techbox{${escape(name)}}`;
          })
          .join(" ");
        return `\\textbf{${escape(category)}}\\\\[0.2em]
${names}\\\\[0.5em]`;
      })
      .join("\n");

    // Generate projects with metrics
    const projectsLatex = (projects || [])
      .slice(0, 6)
      .map((project) => {
        const techs = (project.technologies || [])
          .slice(0, 4)
          .map((t) => `\\techbox{${escape(t)}}`)
          .join(" ");
        const stars = project.highlights?.find((h) => h.includes("star"));
        const forks = project.highlights?.find((h) => h.includes("fork"));
        const repoLink = project.url
          ? `\\\\\\href{${project.url}}{View on GitHub}`
          : "";

        return `\\projectentry{${escape(project.name)}}{${
          stars ? `★ ${stars.replace(/[^0-9]/g, "")}` : ""
        }${forks ? ` · ⑂ ${forks.replace(/[^0-9]/g, "")}` : ""}}{${escape(
          project.description || ""
        )}}

${techs}${repoLink}

`;
      })
      .join("\\vspace{0.5em}\n\n");

    return `\\documentclass[10pt,a4paper]{article}

% Packages
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{inconsolata}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{enumitem}

% Colors
\\definecolor{primary}{HTML}{0366D6}
\\definecolor{secondary}{HTML}{586069}
\\definecolor{accent}{HTML}{28A745}
\\definecolor{dark}{HTML}{24292E}
\\definecolor{light}{HTML}{F6F8FA}
\\definecolor{border}{HTML}{E1E4E8}

% Hyperref setup
\\hypersetup{
    colorlinks=true,
    linkcolor=primary,
    urlcolor=primary
}

% Custom commands
\\newcommand{\\techbox}[1]{%
  \\tikz[baseline=(text.base)]\\node[fill=light, draw=border, rounded corners=2pt, inner sep=3pt](text){\\footnotesize\\texttt{#1}};%
}

\\newcommand{\\progressbar}[1]{%
  \\begin{tikzpicture}[baseline=-0.5ex]
    \\fill[light] (0,0) rectangle (3,0.25);
    \\fill[primary] (0,0) rectangle ({3*#1/100},0.25);
  \\end{tikzpicture}%
}

\\newcommand{\\projectentry}[3]{%
  \\textbf{\\color{dark}#1} \\hfill {\\small\\color{secondary}#2}\\\\
  {\\small #3}%
}

\\newcommand{\\metric}[2]{%
  \\begin{minipage}[t]{0.22\\textwidth}
    \\centering
    {\\Large\\bfseries\\color{primary}#1}\\\\
    {\\small\\color{secondary}#2}
  \\end{minipage}%
}

% Remove page numbers
\\pagenumbering{gobble}

\\begin{document}

% Header
\\begin{center}
{\\Huge\\bfseries\\color{dark} ${escape(personalInfo.name)}}

\\vspace{0.3em}

{\\large\\color{secondary} ${escape(
      personalInfo.title || "Software Developer"
    )}}

\\vspace{0.5em}

{\\small
${
  personalInfo.location ? `\\faMapMarker* ${escape(personalInfo.location)}` : ""
} 
${
  personalInfo.email
    ? `\\quad \\faEnvelope\\ \\href{mailto:${escape(
        personalInfo.email
      )}}{${escape(personalInfo.email)}}`
    : ""
}
${
  personalInfo.github
    ? `\\quad \\faGithub\\ \\href{${escape(personalInfo.github)}}{GitHub}`
    : ""
}
${
  personalInfo.website
    ? `\\quad \\faGlobe\\ \\href{${escape(personalInfo.website)}}{Website}`
    : ""
}
}
\\end{center}

\\vspace{0.5em}

% Metrics bar
${
  statistics?.show
    ? `\\begin{center}
\\metric{${statistics.originalRepos}}{Repositories}
\\metric{${statistics.totalStars}}{Stars}
\\metric{${statistics.languageCount}}{Languages}
\\metric{${statistics.yearsActive}+}{Years}
\\end{center}

\\vspace{1em}`
    : ""
}

% Two column layout
\\begin{minipage}[t]{0.35\\textwidth}
\\section*{\\color{primary}Skills}
\\begin{tabular}{@{}lr@{}}
${skillBars}
\\end{tabular}

\\vspace{1em}

\\section*{\\color{primary}Tech Stack}
${techStackLatex}

\\end{minipage}%
\\hfill%
\\begin{minipage}[t]{0.60\\textwidth}

\\section*{\\color{primary}About}
${escape(summary)}

\\vspace{1em}

\\section*{\\color{primary}Featured Projects}
${projectsLatex}

\\end{minipage}

\\end{document}`;
  },
};
