import React, { useState } from "react";

const FolderNode = ({ folder, onToggleSelect, selectedFolderIds }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = folder.children.length > 0;

  const toggleAccordion = () => {
    if (hasChildren) {
      setIsOpen(prev => !prev);
    }
  };

  const handleCheckbox = (e) => {
    e.stopPropagation();
    onToggleSelect(folder);
  };

  const isSelected = selectedFolderIds.includes(folder.id);

  return (
    <div className="py-1">
      <button
        onClick={toggleAccordion}
        className={`pl-6 flex items-center gap-[5px] w-full text-left rounded
          ${isSelected ? "bg-gray-700 text-indigo-400" : "text-gray-400 hover:text-indigo-400"}
        `}
      >
        {/* Chevron */}
        {hasChildren && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        )}

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onClick={handleCheckbox}
          readOnly
          className="w-4 h-4 accent-indigo-600"
        />

        {/* Folder icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        </svg>

        <span className="text-sm">{folder.name}</span>
      </button>

      {/* 🔁 CHILDREN */}
      {hasChildren && isOpen && (
        <div className="ml-4">
          {folder.children.map(child => (
            <FolderNode
              key={child.id}
              folder={child}
              onToggleSelect={onToggleSelect}
              selectedFolderIds={selectedFolderIds}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderNode;
