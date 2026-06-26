import { useState } from "react";

const API_URL = "https://facefinder.blinkcreativestudio.com";

const Results = ({ results }) => {
  // Group results by folder_path
  const groupedResults = Array.isArray(results)
    ? results.reduce((acc, item) => {
        if (!item?.folder_path) return acc;
        const folderPath = item.folder_path;
        if (!acc[folderPath]) acc[folderPath] = [];
        acc[folderPath].push(item);
        return acc;
      }, {})
    : {};

  // Create Copies modal state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [sortedFolders, setSortedFolders] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [copying, setCopying] = useState(false);
  const [copyResult, setCopyResult] = useState(null);

  // All file IDs from results
  const allFileIds = results.map(r => r.file_id);

  async function openCopyModal() {
    setCopyResult(null);
    setSelectedParent(null);
    setFolderName("");

    try {
      const res = await fetch(`${API_URL}/sorted-folders`);
      const data = await res.json();
      setSortedFolders(data.folders || []);
    } catch (err) {
      console.error("Failed to fetch sorted folders:", err);
    }

    setShowCopyModal(true);
  }

  async function handleSelectParent(folder) {
    setSelectedParent(folder);
    setFolderName("");

    try {
      const res = await fetch(`${API_URL}/sorted-next-name?parent_folder=${encodeURIComponent(folder.name)}`);
      const data = await res.json();
      setFolderName(data.next_name);
    } catch (err) {
      console.error("Failed to get next name:", err);
      setFolderName(`${folder.name}_01`);
    }
  }

  async function handleCreateCopies() {
    if (!selectedParent || !folderName.trim()) {
      alert("Please select a parent folder and enter a folder name.");
      return;
    }

    setCopying(true);
    setCopyResult(null);

    try {
      const res = await fetch(`${API_URL}/create-copies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_folder: selectedParent.name,
          folder_name: folderName.trim(),
          file_ids: allFileIds
        })
      });

      const data = await res.json();
      setCopyResult(data);
    } catch (err) {
      setCopyResult({ error: "Failed to create copies. Please try again." });
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="lg:col-span-2">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6 border border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-indigo-400">
              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
            </svg>
            <h2 className="text-xl font-semibold text-white">Folders</h2>
          </div>

          {/* Create Copies Button */}
          {results.length > 0 && (
            <button
              onClick={openCopyModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              Create Copies ({results.length} photos)
            </button>
          )}
        </div>

        {/* No results state */}
        {Object.keys(groupedResults).length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-gray-600">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p>No results yet. Upload a photo and search.</p>
          </div>
        )}

        {/* ALL FOLDER GROUPS */}
        <div className="space-y-6">
          {Object.entries(groupedResults).map(([path, images]) => (
            <div key={path} className="border border-gray-600 rounded-lg overflow-hidden hover:shadow-lg hover:border-indigo-500 transition-all">
              {/* Folder Path Header */}
              <div className="bg-gray-700 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                      <h3 className="font-semibold text-white">{path}</h3>
                    </div>
                    <p className="text-sm text-gray-400 font-mono">{path}</p>
                  </div>
                  <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold ml-4">
                    {images.length} photos
                  </span>
                </div>
              </div>

              {/* PHOTOS INSIDE THIS FOLDER */}
              <div className="p-4 bg-gray-750">
                <div className="flex gap-3 flex-wrap">
                  {images.map((item) => (
                    <div key={item.file_id} className="text-center">
                      <div className="w-32 h-32 bg-gray-600 rounded border border-gray-500 overflow-hidden">
                        <img
                          src={`${API_URL}/image/${item.file_id}`}
                          className="w-full h-full object-cover"
                          alt={item.file_name}
                        />
                      </div>
                      <p className="text-white text-xs mt-1">
                        {item.file_name.length > 12 ? item.file_name.slice(0, 12) + "..." : item.file_name}
                      </p>
                      <p className="text-indigo-400 text-xs mt-1">
                        {Math.round(item.similarity * 100)}% match
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Copies Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-6 w-[90%] max-w-md">

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-green-400">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <h3 className="text-white font-semibold text-lg">Create Copies</h3>
            </div>

            {!copyResult ? (
              <>
                <p className="text-gray-400 text-sm mb-4">
                  Select a parent folder in <span className="text-indigo-400 font-mono">/sorted</span> to copy <strong className="text-white">{results.length} photos</strong> into.
                </p>

                {/* Parent Folder Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Parent Folder</label>
                  {sortedFolders.length === 0 ? (
                    <p className="text-yellow-400 text-xs bg-yellow-900 border border-yellow-600 rounded-lg p-3">
                      ⚠️ No folders found in /mnt/nas/sorted. Please create parent folders on the NAS first.
                    </p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto bg-gray-900 rounded-lg border border-gray-600">
                      {sortedFolders.map(folder => (
                        <button
                          key={folder.name}
                          onClick={() => handleSelectParent(folder)}
                          className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left transition-colors ${
                            selectedParent?.name === folder.name
                              ? "bg-indigo-700 text-white"
                              : "text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
                            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                          </svg>
                          {folder.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Folder Name */}
                {selectedParent && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Folder Name
                      <span className="text-gray-500 font-normal ml-2">(auto-generated, can be edited)</span>
                    </label>
                    <input
                      type="text"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="e.g. Engineering_01"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Will be created at: <span className="text-indigo-400 font-mono">/sorted/{selectedParent.name}/{folderName}</span>
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowCopyModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCopies}
                    disabled={!selectedParent || !folderName.trim() || copying}
                    className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {copying ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Copying...
                      </>
                    ) : (
                      <>Confirm Copy</>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Result state */
              <div>
                {copyResult.error ? (
                  <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4">
                    <p className="text-red-300 text-sm">❌ {copyResult.error}</p>
                  </div>
                ) : (
                  <div className="bg-green-900 border border-green-600 rounded-lg p-4 mb-4">
                    <p className="text-green-300 text-sm font-medium mb-2">✅ Copies created successfully!</p>
                    <p className="text-green-400 text-xs font-mono mb-1">{copyResult.destination}</p>
                    <p className="text-gray-300 text-xs">
                      {copyResult.copied} photos copied
                      {copyResult.failed > 0 && `, ${copyResult.failed} failed`}
                    </p>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowCopyModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
