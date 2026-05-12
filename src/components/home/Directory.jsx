import React, { useState, useEffect } from "react";
import buildFolderTree from "../functions/buildFoldertree";
import FolderNode from "./FolderNode";

const Directory = ({ selectedFolders, setSelectedFolders }) => {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/folders")   // ✅ FIXED URL
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch folders");
        return res.json();
      })
      .then(data => {
        const nestedFolders = buildFolderTree(data.folders);
        setFolders(nestedFolders);
      })
      .catch(err => {
        console.error("Folder fetch error:", err.message);
      });
  }, []);

  const toggleFolderSelection = (folder) => {
    setSelectedFolders(prev => {
      const exists = prev.find(f => f.id === folder.id);
      return exists
        ? prev.filter(f => f.id !== folder.id)
        : [...prev, folder];
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        </svg>
        <h2 className="text-lg font-semibold text-white">Select Search Scope</h2>
      </div>

      {/* Info */}
      <div className="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600">
        <p className="text-sm text-gray-300 mb-2">
          <span className="font-semibold text-indigo-400">Search Scope:</span> Select folders to search
        </p>
        <p className="text-xs text-gray-400">
          • Select parent folders for broad searches<br />
          • Select specific subfolders for targeted searches
        </p>
      </div>

      {/* Folder Tree */}
      <div className="max-h-96 overflow-y-auto bg-gray-750 rounded-lg p-2 border border-gray-700">
        {folders.map(folder => (
          <FolderNode
            key={folder.id}
            folder={folder}
            onToggleSelect={toggleFolderSelection}
            selectedFolderIds={selectedFolders.map(f => f.id)}
          />
        ))}
      </div>

      {/* Debug */}
      <div className="mt-4 text-xs text-green-400">
        Selected folders: {selectedFolders.map(f => f.name).join(", ")}
      </div>
    </div>
  );
};

export default Directory;
