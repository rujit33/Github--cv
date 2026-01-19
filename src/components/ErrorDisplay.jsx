import React from "react";

/**
 * Error display component
 */
function ErrorDisplay({ message, onRetry }) {
  const isRateLimit = message?.toLowerCase().includes("rate limit");
  const isNotFound = message?.toLowerCase().includes("not found");

  return (
    <div className="mt-8 p-6 bg-red-900/20 rounded-lg border border-red-500/30">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg
            className="w-8 h-8 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            {isRateLimit
              ? "Rate Limit Exceeded"
              : isNotFound
              ? "User Not Found"
              : "Error Occurred"}
          </h3>

          <p className="text-gray-300 mb-4">{message}</p>

          {isRateLimit && (
            <div className="text-sm text-gray-400 mb-4">
              <p>
                GitHub API has rate limits for unauthenticated requests (60 per
                hour).
              </p>
              <p className="mt-1">
                Please wait a few minutes before trying again.
              </p>
            </div>
          )}

          {isNotFound && (
            <div className="text-sm text-gray-400 mb-4">
              <p>
                Make sure the username is spelled correctly and the profile is
                public.
              </p>
            </div>
          )}

          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorDisplay;
