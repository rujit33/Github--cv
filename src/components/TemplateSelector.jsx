import React from "react";
import { getTemplateList } from "../templates/index";

/**
 * Template selector component
 */
function TemplateSelector({ selected, onChange }) {
  const templates = getTemplateList();

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">CV Template</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onChange(template.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selected === template.id
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
            }`}
          >
            <div className="text-2xl mb-2">{template.preview}</div>
            <div className="font-medium text-white text-sm">
              {template.name}
            </div>
            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
              {template.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelector;
