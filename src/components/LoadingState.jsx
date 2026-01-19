import React from "react";
import { AnalysisStatus } from "../services/repoAnalyzer";

/**
 * Loading state component with progress indication
 */
function LoadingState({ status, message }) {
  const steps = [
    {
      key: AnalysisStatus.FETCHING_PROFILE,
      label: "Fetching profile",
      icon: "👤",
    },
    {
      key: AnalysisStatus.FETCHING_REPOS,
      label: "Fetching repositories",
      icon: "📦",
    },
    {
      key: AnalysisStatus.ANALYZING_LANGUAGES,
      label: "Analyzing languages",
      icon: "💻",
    },
    {
      key: AnalysisStatus.FETCHING_READMES,
      label: "Reading documentation",
      icon: "📄",
    },
    {
      key: AnalysisStatus.DETECTING_TECH_STACK,
      label: "Detecting tech stack",
      icon: "🔧",
    },
    {
      key: AnalysisStatus.RANKING_PROJECTS,
      label: "Ranking projects",
      icon: "⭐",
    },
  ];

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-600 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>

      <p className="text-center text-white font-medium mb-6">{message}</p>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCurrent ? "bg-blue-900/30 border border-blue-500/30" : ""
              }`}
            >
              <span className="text-xl">{step.icon}</span>
              <span
                className={`flex-1 ${
                  isComplete
                    ? "text-green-400"
                    : isCurrent
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
              {isComplete && (
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {isCurrent && (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              {isPending && (
                <div className="w-5 h-5 border-2 border-gray-600 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-gray-500 text-sm">
        This may take a moment for profiles with many repositories
      </p>
    </div>
  );
}

export default LoadingState;
