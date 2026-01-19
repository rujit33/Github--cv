import React, { useState } from "react";

/**
 * GitHub username input component
 */
function GitHubInput({ onSubmit, disabled }) {
  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState("");

  const validateUsername = (value) => {
    // GitHub username rules: alphanumeric and hyphens, no consecutive hyphens
    // Cannot start or end with hyphen, max 39 characters
    if (!value) {
      return "Username is required";
    }
    if (value.length > 39) {
      return "Username must be 39 characters or less";
    }
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9]))*$/.test(value)) {
      return "Invalid GitHub username format";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const error = validateUsername(username.trim());
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError("");
    onSubmit(username.trim());
  };

  const handleChange = (e) => {
    setUsername(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <input
            type="text"
            value={username}
            onChange={handleChange}
            placeholder="Enter GitHub username"
            disabled={disabled}
            className={`w-full pl-12 pr-4 py-4 rounded-lg border bg-gray-800 text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              validationError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        </div>

        <button
          type="submit"
          disabled={disabled || !username.trim()}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
            disabled || !username.trim()
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
          }`}
        >
          {disabled ? (
            <>
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              Generate CV
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>

      {validationError && (
        <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {validationError}
        </p>
      )}

      <p className="mt-4 text-gray-500 text-sm text-center">
        Enter any public GitHub username to analyze their profile and generate a
        CV
      </p>
    </form>
  );
}

export default GitHubInput;
