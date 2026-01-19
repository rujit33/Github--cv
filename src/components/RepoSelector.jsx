import React, { useState, useMemo } from "react";
import {
  Star,
  GitFork,
  Calendar,
  Check,
  Activity,
  Code,
  Search,
  Filter,
  AlertCircle,
} from "lucide-react";
import { differenceInDays, format } from "date-fns";

/**
 * Calculate activity score for a repository
 * @param {Object} repo - Repository data
 * @returns {number} - Activity score (0-100)
 */
function calculateActivityScore(repo) {
  let score = 0;

  // Recency of commits (max 40 points)
  const daysSinceUpdate = differenceInDays(
    new Date(),
    new Date(repo.updatedAt),
  );
  if (daysSinceUpdate < 7) score += 40;
  else if (daysSinceUpdate < 30) score += 30;
  else if (daysSinceUpdate < 90) score += 20;
  else if (daysSinceUpdate < 180) score += 10;
  else score += 5;

  // Stars (max 25 points)
  score += Math.min(25, repo.stars * 2);

  // Activity based on update recency (max 20 points)
  if (daysSinceUpdate < 30) score += 20;
  else if (daysSinceUpdate < 90) score += 15;
  else if (daysSinceUpdate < 180) score += 10;

  // Has description (5 points)
  if (repo.description) score += 5;

  // Has topics (5 points)
  if (repo.topics?.length > 0) score += 5;

  // Activity indicator (5 points)
  if (repo.description || repo.topics?.length) score += 5;

  return Math.min(100, Math.round(score));
}

/**
 * Get activity level label and color
 * @param {number} score - Activity score
 * @returns {Object} - Label and color class
 */
function getActivityLevel(score) {
  if (score >= 70)
    return {
      label: "High",
      color: "bg-green-100 text-green-700 border-green-300",
    };
  if (score >= 50)
    return {
      label: "Good",
      color: "bg-blue-100 text-blue-700 border-blue-300",
    };
  if (score >= 30)
    return {
      label: "Medium",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    };
  return { label: "Low", color: "bg-gray-100 text-gray-600 border-gray-300" };
}

/**
 * Repository card component - Improved visual design
 */
function RepoCard({ repo, isSelected, onToggle, activityScore }) {
  const activity = getActivityLevel(activityScore);

  return (
    <div
      className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
          : "border-gray-200 hover:border-blue-300 hover:shadow-md bg-white"
      }`}
      onClick={onToggle}
    >
      {/* Selection indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected
              ? "bg-blue-500 border-blue-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>

      <div className="pr-10">
        {/* Repository name */}
        <div className="flex items-center gap-2 mb-2">
          <Code className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <h3 className="font-bold text-lg text-gray-900 truncate">
            {repo.name}
          </h3>
        </div>

        {/* Language badge */}
        {repo.language && (
          <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium mb-2">
            {repo.language}
          </span>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[2.5rem]">
          {repo.description || "No description available"}
        </p>

        {/* Topics */}
        {repo.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-xs px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200"
              >
                #{topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="text-xs text-gray-500 self-center">
                +{repo.topics.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-500" />
            <span className="font-medium">{repo.stars}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <GitFork className="w-4 h-4" />
            <span className="font-medium">{repo.forks}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">
              {format(new Date(repo.updatedAt), "MMM d, yyyy")}
            </span>
          </span>
        </div>

        {/* Activity score badge */}
        <div className="flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${activity.color}`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{activity.label} Activity</span>
            <span className="ml-1 opacity-70">({activityScore})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * RepoSelector Component - Enhanced visual design
 * Allows users to select repositories to include in their CV
 */
export default function RepoSelector({
  repositories,
  onConfirm,
  onCancel,
  maxSelections = 6,
  preselectedCount = 4,
}) {
  // Calculate activity scores for all repos
  const reposWithScores = useMemo(() => {
    return repositories.map((repo) => ({
      ...repo,
      activityScore: calculateActivityScore(repo),
    }));
  }, [repositories]);

  // Sort by activity score
  const sortedRepos = useMemo(() => {
    return [...reposWithScores].sort(
      (a, b) => b.activityScore - a.activityScore,
    );
  }, [reposWithScores]);

  // Initialize with top repos pre-selected
  const [selectedRepos, setSelectedRepos] = useState(() => {
    return new Set(sortedRepos.slice(0, preselectedCount).map((r) => r.name));
  });

  // Sorting and filtering state
  const [sortBy, setSortBy] = useState("activity");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique languages for filter
  const languages = useMemo(() => {
    const langs = new Set(repositories.map((r) => r.language).filter(Boolean));
    return Array.from(langs).sort();
  }, [repositories]);

  // Filtered and sorted repos
  const displayedRepos = useMemo(() => {
    let filtered = [...sortedRepos];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.topics?.some((t) => t.toLowerCase().includes(query)),
      );
    }

    // Apply language filter
    if (filterLanguage !== "all") {
      filtered = filtered.filter((r) => r.language === filterLanguage);
    }

    // Apply sorting
    switch (sortBy) {
      case "activity":
        filtered.sort((a, b) => b.activityScore - a.activityScore);
        break;
      case "stars":
        filtered.sort((a, b) => b.stars - a.stars);
        break;
      case "recent":
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [sortedRepos, sortBy, filterLanguage, searchQuery]);

  // Toggle repo selection
  const toggleRepo = (repoName) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repoName)) {
        next.delete(repoName);
      } else if (next.size < maxSelections) {
        next.add(repoName);
      }
      return next;
    });
  };

  // Select top visible repos
  const selectTopVisible = () => {
    const newSelection = new Set(selectedRepos);
    for (const repo of displayedRepos) {
      if (newSelection.size >= maxSelections) break;
      newSelection.add(repo.name);
    }
    setSelectedRepos(newSelection);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedRepos(new Set());
  };

  // Handle confirm
  const handleConfirm = () => {
    const selected = repositories.filter((r) => selectedRepos.has(r.name));
    onConfirm(selected);
  };

  const selectionFull = selectedRepos.size >= maxSelections;
  const selectionEmpty = selectedRepos.size === 0;

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-6xl mx-auto border border-gray-200">
      {/* Header */}
      <div className="p-8 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Select Your Best Projects
        </h2>
        <p className="text-gray-600 text-lg">
          Choose up to <strong>{maxSelections}</strong> repositories to showcase
          in your CV. We've pre-selected your most active projects based on
          recent activity, stars, and engagement.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search repositories by name, description, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="activity">⚡ Activity Score</option>
              <option value="stars">⭐ Most Stars</option>
              <option value="recent">📅 Recently Updated</option>
              <option value="name">🔤 Name (A-Z)</option>
            </select>

            {/* Language filter */}
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Languages ({repositories.length})</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            {/* Quick actions */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={selectTopVisible}
                disabled={selectionFull}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select Top {maxSelections}
              </button>
              <button
                onClick={clearSelection}
                disabled={selectionEmpty}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      <div
        className={`px-6 py-4 flex items-center justify-between ${selectionFull ? "bg-amber-50 border-b border-amber-200" : "bg-blue-50 border-b border-blue-200"}`}
      >
        <div className="flex items-center gap-2">
          {selectionFull ? (
            <AlertCircle className="w-5 h-5 text-amber-600" />
          ) : (
            <Check className="w-5 h-5 text-blue-600" />
          )}
          <span
            className={`text-sm font-semibold ${selectionFull ? "text-amber-800" : "text-blue-800"}`}
          >
            <strong className="text-lg">{selectedRepos.size}</strong> of{" "}
            {maxSelections} repositories selected
            {selectionFull && " (Maximum reached)"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Activity className="w-4 h-4" />
          <span>Activity = Recent commits + Stars + Engagement</span>
        </div>
      </div>

      {/* Repository grid */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {displayedRepos.length === 0 ? (
          <div className="text-center py-16">
            <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg font-medium">
              No repositories match your filters
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {displayedRepos.map((repo) => (
              <RepoCard
                key={repo.name}
                repo={repo}
                isSelected={selectedRepos.has(repo.name)}
                onToggle={() => toggleRepo(repo.name)}
                activityScore={repo.activityScore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with actions */}
      <div className="p-6 border-t bg-gray-50 flex items-center justify-between sticky bottom-0">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors hover:bg-gray-100 rounded-lg"
        >
          ← Back
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Showing {displayedRepos.length} of {repositories.length}{" "}
            repositories
          </span>
          <button
            onClick={handleConfirm}
            disabled={selectionEmpty}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              !selectionEmpty
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continue with {selectedRepos.size} Project
            {selectedRepos.size !== 1 ? "s" : ""} →
          </button>
        </div>
      </div>
    </div>
  );
}
