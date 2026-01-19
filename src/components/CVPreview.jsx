import React from "react";
import { renderCVToHtml } from "../services/latexRenderer";

/**
 * CV Preview component - renders the CV in the browser
 */
function CVPreview({ cvData, templateId }) {
  if (!cvData) {
    return (
      <div className="p-8 text-center text-gray-500">No CV data to preview</div>
    );
  }

  // Render CV to HTML
  const html = renderCVToHtml(cvData, templateId);

  return (
    <div className="cv-preview-container">
      <div
        className="cv-rendered-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export default CVPreview;
