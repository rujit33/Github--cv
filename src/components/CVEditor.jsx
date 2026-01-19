import React, { useState } from "react";

/**
 * CV Editor component - allows editing all CV sections
 */
function CVEditor({ cvData, onUpdate, analysis }) {
  const [activeSection, setActiveSection] = useState("personal");

  const updateField = (section, field, value) => {
    const updated = { ...cvData };

    if (section === "root") {
      updated[field] = value;
    } else {
      updated[section] = {
        ...updated[section],
        [field]: value,
      };
    }

    onUpdate(updated);
  };

  const updateProject = (index, field, value) => {
    const updated = { ...cvData };
    updated.projects = [...updated.projects];
    updated.projects[index] = {
      ...updated.projects[index],
      [field]: value,
    };
    onUpdate(updated);
  };

  const removeProject = (index) => {
    const updated = { ...cvData };
    updated.projects = updated.projects.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const addProject = () => {
    const updated = { ...cvData };
    updated.projects = [
      ...updated.projects,
      {
        name: "New Project",
        description: "Project description",
        technologies: [],
        highlights: [],
        url: "",
      },
    ];
    onUpdate(updated);
  };

  const updateSkillCategory = (category, skills) => {
    const updated = { ...cvData };
    updated.skills = {
      ...updated.skills,
      [category]: skills
        .split(",")
        .map((s) => ({ name: s.trim(), level: "Proficient" }))
        .filter((s) => s.name),
    };
    onUpdate(updated);
  };

  const removeSkillCategory = (category) => {
    const updated = { ...cvData };
    const { [category]: removed, ...rest } = updated.skills;
    updated.skills = rest;
    onUpdate(updated);
  };

  const addSkillCategory = () => {
    const updated = { ...cvData };
    const newCategoryName = `Category ${
      Object.keys(updated.skills).length + 1
    }`;
    updated.skills = {
      ...updated.skills,
      [newCategoryName]: [],
    };
    onUpdate(updated);
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: "👤" },
    { id: "summary", label: "Summary", icon: "📝" },
    { id: "skills", label: "Skills", icon: "🛠️" },
    { id: "projects", label: "Projects", icon: "📦" },
    { id: "stats", label: "Statistics", icon: "📊" },
  ];

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeSection === section.id
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <span>{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Personal Info Section */}
      {activeSection === "personal" && (
        <div className="space-y-4">
          <h4 className="font-semibold text-white">Personal Information</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={cvData.personalInfo.name || ""}
                onChange={(e) =>
                  updateField("personalInfo", "name", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={cvData.personalInfo.title || ""}
                onChange={(e) =>
                  updateField("personalInfo", "title", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={cvData.personalInfo.email || ""}
                onChange={(e) =>
                  updateField("personalInfo", "email", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Location
              </label>
              <input
                type="text"
                value={cvData.personalInfo.location || ""}
                onChange={(e) =>
                  updateField("personalInfo", "location", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Website
              </label>
              <input
                type="url"
                value={cvData.personalInfo.website || ""}
                onChange={(e) =>
                  updateField("personalInfo", "website", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={cvData.personalInfo.github || ""}
                onChange={(e) =>
                  updateField("personalInfo", "github", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary Section */}
      {activeSection === "summary" && (
        <div className="space-y-4">
          <h4 className="font-semibold text-white">Professional Summary</h4>
          <textarea
            value={cvData.summary || ""}
            onChange={(e) => updateField("root", "summary", e.target.value)}
            rows={6}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Write a brief professional summary..."
          />
          <p className="text-xs text-gray-500">
            This summary appears at the top of your CV. Keep it concise and
            highlight your key strengths.
          </p>
        </div>
      )}

      {/* Skills Section */}
      {activeSection === "skills" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Skills by Category</h4>
            <button
              onClick={addSkillCategory}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Category
            </button>
          </div>

          {Object.entries(cvData.skills || {}).map(([category, skills]) => (
            <div key={category} className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    const updated = { ...cvData };
                    const skillList = updated.skills[category];
                    delete updated.skills[category];
                    updated.skills[e.target.value] = skillList;
                    onUpdate(updated);
                  }}
                  className="bg-transparent border-none text-white font-medium focus:outline-none"
                />
                <button
                  onClick={() => removeSkillCategory(category)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={skills.map((s) => s.name).join(", ")}
                onChange={(e) => updateSkillCategory(category, e.target.value)}
                placeholder="Enter skills separated by commas"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Projects Section */}
      {activeSection === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Projects</h4>
            <button
              onClick={addProject}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Project
            </button>
          </div>

          {(cvData.projects || []).map((project, index) => (
            <div
              key={index}
              className="p-3 bg-gray-700/50 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => updateProject(index, "name", e.target.value)}
                  className="bg-transparent border-none text-white font-medium focus:outline-none flex-1"
                />
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) =>
                    updateProject(index, "description", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Technologies (comma-separated)
                </label>
                <input
                  type="text"
                  value={(project.technologies || []).join(", ")}
                  onChange={(e) =>
                    updateProject(
                      index,
                      "technologies",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">URL</label>
                <input
                  type="url"
                  value={project.url || ""}
                  onChange={(e) => updateProject(index, "url", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}

          {/* Available projects from analysis */}
          {analysis?.rankedProjects && (
            <div className="mt-6">
              <h5 className="text-sm text-gray-400 mb-2">
                Add from analyzed projects:
              </h5>
              <div className="flex flex-wrap gap-2">
                {analysis.rankedProjects
                  .filter(
                    (p) => !cvData.projects.some((cp) => cp.name === p.name)
                  )
                  .slice(0, 5)
                  .map((project) => (
                    <button
                      key={project.name}
                      onClick={() => {
                        const updated = { ...cvData };
                        updated.projects = [
                          ...updated.projects,
                          {
                            name: project.name,
                            description:
                              project.extractedDescription ||
                              project.description ||
                              "",
                            technologies: [
                              project.language,
                              ...(project.topics?.slice(0, 3) || []),
                            ].filter(Boolean),
                            highlights: [],
                            url: project.url,
                          },
                        ];
                        onUpdate(updated);
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      + {project.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics Section */}
      {activeSection === "stats" && (
        <div className="space-y-4">
          <h4 className="font-semibold text-white">GitHub Statistics</h4>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cvData.statistics?.show ?? true}
              onChange={(e) =>
                updateField("statistics", "show", e.target.checked)
              }
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-300">Show GitHub statistics in CV</span>
          </label>

          {cvData.statistics?.show && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/50 rounded-lg">
              <div>
                <span className="text-gray-400 text-sm">Repositories:</span>
                <span className="text-white ml-2">
                  {cvData.statistics.originalRepos}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Stars:</span>
                <span className="text-white ml-2">
                  {cvData.statistics.totalStars}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Languages:</span>
                <span className="text-white ml-2">
                  {cvData.statistics.languageCount}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Years Active:</span>
                <span className="text-white ml-2">
                  {cvData.statistics.yearsActive}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CVEditor;
