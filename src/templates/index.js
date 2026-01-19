/**
 * Template Registry
 * Central export for all CV templates
 */

import { modernTemplate } from "./modern.js";
import { minimalTemplate } from "./minimal.js";
import { academicTemplate } from "./academic.js";
import { techFocusedTemplate } from "./techFocused.js";

/**
 * All available templates
 */
export const templates = {
  modern: modernTemplate,
  minimal: minimalTemplate,
  academic: academicTemplate,
  "tech-focused": techFocusedTemplate,
};

/**
 * Get template by ID
 * @param {string} id - Template ID
 * @returns {Object} - Template object
 */
export function getTemplate(id) {
  return templates[id] || templates.modern;
}

/**
 * Get list of all templates for selection
 * @returns {Array} - Template list with metadata
 */
export function getTemplateList() {
  return Object.values(templates).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    preview: t.preview,
  }));
}

/**
 * Generate LaTeX from CV data using specified template
 * @param {string} templateId - Template ID
 * @param {Object} cvData - CV data
 * @returns {string} - Generated LaTeX
 */
export function generateLatex(templateId, cvData) {
  const template = getTemplate(templateId);
  return template.generate(cvData);
}

export {
  modernTemplate,
  minimalTemplate,
  academicTemplate,
  techFocusedTemplate,
};
