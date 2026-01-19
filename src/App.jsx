import React, { useState, useCallback } from "react";
import GitHubInput from "./components/GitHubInput";
import CVEditor from "./components/CVEditor";
import CVPreview from "./components/CVPreview";
import TemplateSelector from "./components/TemplateSelector";
import Header from "./components/Header";
import LoadingState from "./components/LoadingState";
import ErrorDisplay from "./components/ErrorDisplay";
import RepoSelector from "./components/RepoSelector";
import {
  analyzeGitHubProfile,
  analysisToCV,
  AnalysisStatus,
} from "./services/repoAnalyzer";
import { generateLatex } from "./templates/index";
import { downloadAsPDF, downloadLatexSource } from "./services/latexRenderer";
import {
  generateCompleteCVContent,
  isLLMEnabled,
  getLLMStatus,
  regenerateSection,
} from "./services/llmService";

// App stages
const AppStage = {
  INPUT: "input",
  ANALYZING: "analyzing",
  SELECT_REPOS: "select_repos",
  GENERATING_CV: "generating_cv",
  CV_READY: "cv_ready",
};

// CV Style options
const CV_STYLES = [
  { id: "professional", label: "Professional", desc: "Balanced and formal" },
  { id: "technical", label: "Technical", desc: "Focus on tech skills" },
  { id: "concise", label: "Concise", desc: "Brief and to the point" },
];

function App() {
  // State management
  const [stage, setStage] = useState(AppStage.INPUT);
  const [analysisState, setAnalysisState] = useState({
    status: AnalysisStatus.IDLE,
    message: "",
    progress: 0,
  });
  const [analysis, setAnalysis] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [cvStyle, setCvStyle] = useState("professional");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [llmStatus, setLlmStatus] = useState({
    enabled: false,
    hasApiKey: false,
    model: "N/A",
    provider: "Loading...",
  });

  // Load LLM status on mount
  React.useEffect(() => {
    getLLMStatus().then(setLlmStatus);
  }, []);

  // Handle GitHub profile analysis - Step 1
  const handleAnalyze = useCallback(async (username) => {
    setError(null);
    setAnalysis(null);
    setCvData(null);
    setStage(AppStage.ANALYZING);

    try {
      const result = await analyzeGitHubProfile(username, (progress) => {
        setAnalysisState(progress);
      });

      setAnalysis(result);
      // Move to repo selection stage
      setStage(AppStage.SELECT_REPOS);
    } catch (err) {
      setError(err.message);
      setAnalysisState({ status: AnalysisStatus.ERROR, message: err.message });
      setStage(AppStage.INPUT);
    }
  }, []);

  // Handle repo selection - Step 2
  const handleReposSelected = useCallback(
    async (repos) => {
      setSelectedRepos(repos);
      setStage(AppStage.GENERATING_CV);
      setAnalysisState({
        status: "generating",
        message: "Generating CV content with AI...",
      });

      try {
        const llmEnabled = await isLLMEnabled();
        if (llmEnabled) {
          // Use LLM to generate enhanced CV content
          const readmeMap = new Map();
          for (const repo of repos) {
            const repoData = analysis.repositories.find(
              (r) => r.name === repo.name,
            );
            if (repoData?.readme) {
              readmeMap.set(repo.name, repoData.readme);
            }
          }

          const cvContent = await generateCompleteCVContent(
            analysis,
            repos,
            readmeMap,
            cvStyle,
          );

          setCvData({
            personalInfo: cvContent.personalInfo,
            summary: cvContent.summary,
            skills: cvContent.skills,
            projects: cvContent.projects,
            education: [],
            experience: [],
            settings: {
              showStats: true,
              showTopLanguages: true,
              showContributionGraph: false,
            },
          });
        } else {
          // Fallback: Use basic analysis without LLM
          const cv = analysisToCV({
            ...analysis,
            rankedProjects: repos,
          });
          setCvData(cv);
        }

        setStage(AppStage.CV_READY);
        setActiveTab("preview");
      } catch (err) {
        console.error("CV generation error:", err);
        setError(err.message);
        setStage(AppStage.SELECT_REPOS);
      }
    },
    [analysis, cvStyle],
  );

  // Regenerate CV with a different style
  const handleRegenerate = useCallback(
    async (newStyle) => {
      const llmEnabled = await isLLMEnabled();
      if (!analysis || selectedRepos.length === 0 || !llmEnabled) return;

      setCvStyle(newStyle);
      setIsRegenerating(true);

      try {
        const readmeMap = new Map();
        for (const repo of selectedRepos) {
          const repoData = analysis.repositories.find(
            (r) => r.name === repo.name,
          );
          if (repoData?.readme) {
            readmeMap.set(repo.name, repoData.readme);
          }
        }

        const cvContent = await generateCompleteCVContent(
          analysis,
          selectedRepos,
          readmeMap,
          newStyle,
        );

        setCvData((prev) => ({
          ...prev,
          summary: cvContent.summary,
          projects: cvContent.projects,
        }));
      } catch (err) {
        console.error("Regeneration error:", err);
        setError(err.message);
      } finally {
        setIsRegenerating(false);
      }
    },
    [analysis, selectedRepos],
  );

  // Cancel repo selection
  const handleCancelSelection = useCallback(() => {
    setStage(AppStage.INPUT);
    setAnalysis(null);
  }, []);

  // Handle CV data updates from editor
  const handleCVUpdate = useCallback((updatedData) => {
    setCvData(updatedData);
  }, []);

  // Handle template change
  const handleTemplateChange = useCallback((templateId) => {
    setSelectedTemplate(templateId);
  }, []);

  // Download handlers
  const handleDownloadPDF = useCallback(() => {
    if (cvData) {
      downloadAsPDF(cvData, selectedTemplate);
    }
  }, [cvData, selectedTemplate]);

  const handleDownloadLatex = useCallback(() => {
    if (cvData) {
      const latex = generateLatex(selectedTemplate, cvData);
      downloadLatexSource(
        latex,
        `${cvData.personalInfo.name.replace(/\s+/g, "_")}_CV.tex`,
      );
    }
  }, [cvData, selectedTemplate]);

  // Reset to initial state
  const handleReset = useCallback(() => {
    setAnalysis(null);
    setCvData(null);
    setError(null);
    setStage(AppStage.INPUT);
    setAnalysisState({ status: AnalysisStatus.IDLE, message: "" });
  }, []);

  const isLoading =
    stage === AppStage.ANALYZING || stage === AppStage.GENERATING_CV;

  return (
    <div className="min-h-screen bg-github-dark">
      <Header onReset={handleReset} hasCV={stage === AppStage.CV_READY} />

      <main className="container mx-auto px-4 py-8">
        {/* Input Section - Initial stage */}
        {stage === AppStage.INPUT && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                GitHub to CV
              </h1>
              <p className="text-gray-400 text-lg">
                Transform your GitHub profile into a professional CV. Analyze
                your repositories, skills, and contributions automatically.
              </p>
            </div>

            <GitHubInput onSubmit={handleAnalyze} disabled={isLoading} />

            {error && (
              <ErrorDisplay message={error} onRetry={() => setError(null)} />
            )}
          </div>
        )}

        {/* Loading State - Analyzing */}
        {stage === AppStage.ANALYZING && (
          <div className="max-w-2xl mx-auto">
            <LoadingState
              status={analysisState.status}
              message={analysisState.message}
            />
          </div>
        )}

        {/* Repository Selection Stage */}
        {stage === AppStage.SELECT_REPOS && analysis && (
          <RepoSelector
            repositories={analysis.rankedProjects}
            onConfirm={handleReposSelected}
            onCancel={handleCancelSelection}
            maxSelections={6}
            preselectedCount={4}
          />
        )}

        {/* CV Generation Loading */}
        {stage === AppStage.GENERATING_CV && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Generating Your CV
              </h3>
              <p className="text-gray-400">
                {llmStatus.enabled
                  ? "AI is crafting professional descriptions for your projects..."
                  : "Preparing your CV content..."}
              </p>
            </div>
          </div>
        )}

        {/* CV Editor and Preview - CV Ready */}
        {stage === AppStage.CV_READY && cvData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Controls and Editor */}
            <div className="space-y-6">
              {/* Template Selector */}
              <TemplateSelector
                selected={selectedTemplate}
                onChange={handleTemplateChange}
              />

              {/* AI Style Regenerate Section */}
              {llmStatus.enabled && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    AI Content Style
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {CV_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => handleRegenerate(style.id)}
                        disabled={isRegenerating}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          cvStyle === style.id
                            ? "bg-purple-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        } ${isRegenerating ? "opacity-50 cursor-wait" : ""}`}
                        title={style.desc}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                  {isRegenerating && (
                    <p className="text-sm text-purple-300 mt-2 flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></span>
                      Regenerating with {cvStyle} style...
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Click a style to regenerate your CV content with AI
                  </p>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === "preview"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === "edit"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setActiveTab("latex")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === "latex"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  LaTeX
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {activeTab === "edit" && (
                  <CVEditor
                    cvData={cvData}
                    onUpdate={handleCVUpdate}
                    analysis={analysis}
                  />
                )}

                {activeTab === "latex" && (
                  <div className="font-mono text-sm">
                    <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900 p-4 rounded overflow-x-auto">
                      {generateLatex(selectedTemplate, cvData)}
                    </pre>
                  </div>
                )}

                {activeTab === "preview" && (
                  <div className="text-gray-300">
                    <h3 className="font-semibold mb-4">Analysis Summary</h3>
                    {analysis && (
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="text-gray-500">Profile:</span>{" "}
                          <a
                            href={analysis.profile.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            @{analysis.profile.login}
                          </a>
                        </p>
                        <p>
                          <span className="text-gray-500">
                            Repositories analyzed:
                          </span>{" "}
                          {analysis.repositories.length}
                        </p>
                        <p>
                          <span className="text-gray-500">
                            Top projects selected:
                          </span>{" "}
                          {analysis.rankedProjects.length}
                        </p>
                        <p>
                          <span className="text-gray-500">
                            Skills detected:
                          </span>{" "}
                          {analysis.skills.length}
                        </p>
                        <p>
                          <span className="text-gray-500">
                            Primary language:
                          </span>{" "}
                          {analysis.languages?.primaryLanguage || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={handleDownloadLatex}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Download LaTeX
                </button>
              </div>
            </div>

            {/* Right Panel - CV Preview */}
            <div className="lg:sticky lg:top-4 h-fit">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <CVPreview cvData={cvData} templateId={selectedTemplate} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>
          GitHub to CV Generator • Uses GitHub Public API • No backend required
        </p>
      </footer>
    </div>
  );
}

export default App;
