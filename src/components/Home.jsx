import { useState, useRef, useEffect } from "react";
import ClientInfo from "./home/ClientInfo";
import Results from "./home/Result";
import Directory from "./home/Directory";
import SearchViaPhoto from "./home/SearchViaPhoto";
import SearchViaName from "./home/SearchViaName";
import FolderNode from "./home/FolderNode";
import buildFolderTree from "./functions/buildFoldertree";

const API_URL = "https://facefinder.blinkcreativestudio.com";

const Home = () => {
    const [searchMethod, setSearchMethod] = useState('photo');
    const [selectedFolders, setSelectedFolders] = useState([]);
    const [preview, setPreview] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [results, setResults] = useState([]);

    // Admin dropdown
    const [showAdminMenu, setShowAdminMenu] = useState(false);
    const adminMenuRef = useRef(null);

    // Confirmation modal
    const [confirmModal, setConfirmModal] = useState(null);

    // Folder selection for indexing
    const [allFolders, setAllFolders] = useState([]);
    const [indexFolders, setIndexFolders] = useState([]); // selected folders for indexing

    // Streaming progress
    const [syncing, setSyncing] = useState(false);
    const [syncLogs, setSyncLogs] = useState([]);
    const [syncDone, setSyncDone] = useState(false);
    const logsEndRef = useRef(null);

    const [searching, setSearching] = useState(false);


    const [searchQuery, setSearchQuery] = useState("");

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) {
                setShowAdminMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto scroll logs to bottom
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [syncLogs]);

    // Fetch all folders for indexing modal
    useEffect(() => {
        fetch(`${API_URL}/folders`)
            .then(res => res.json())
            .then(data => {
                const nested = buildFolderTree(data.folders);
                setAllFolders(nested);
            })
            .catch(err => console.error("Failed to fetch folders:", err));
    }, []);

    const toggleIndexFolder = (folder) => {
        setIndexFolders(prev => {
            const exists = prev.find(f => f.id === folder.id);
            return exists ? prev.filter(f => f.id !== folder.id) : [...prev, folder];
        });
    };

    async function searchFaces() {
        if (!selectedImage || selectedFolders.length === 0) {
            alert("Select an image and at least one folder");
            return;
        }

        setSearching(true);  // ← ADD THIS
        setResults([]);       // ← ADD THIS (clear old results)

        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("folder_ids", selectedFolders.map(f => f.id).join(","));

        try {
            const res = await fetch(`${API_URL}/face-search`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Backend error:", text);
                throw new Error("Face search failed");
            }

            const data = await res.json();
            setResults(data.matches || []);

        } catch (err) {
            console.error("Search failed:", err);
            alert("Search failed. Check backend.");
        } finally {
            setSearching(false);  // ← ADD THIS
        }
    }


    async function searchByName() {
        if (!searchQuery.trim() || selectedFolders.length === 0) {
            alert("Enter a name and select at least one folder");
            return;
        }

        setSearching(true);
        setResults([]);

        try {
            const folderIds = selectedFolders.map(f => f.id).join(",");
            const res = await fetch(
                `${API_URL}/search-by-name?query=${encodeURIComponent(searchQuery)}&folder_ids=${folderIds}`
            );

            if (!res.ok) throw new Error("Search failed");

            const data = await res.json();
            setResults(data.matches || []);

        } catch (err) {
            console.error("Search failed:", err);
            alert("Search failed. Check backend.");
        } finally {
            setSearching(false);
        }
    }

    function handleConfirmSync() {
        const type = confirmModal.type;
        setConfirmModal(null);
        setShowAdminMenu(false);
        setSyncing(true);
        setSyncLogs([]);
        setSyncDone(false);

        let endpoint;
        if (type === "folders") {
            endpoint = `${API_URL}/sync-folders-stream`;
        } else {
            const folderIds = indexFolders.map(f => f.id).join(",");
            endpoint = folderIds
                ? `${API_URL}/sync-embeddings-stream?folder_ids=${folderIds}`
                : `${API_URL}/sync-embeddings-stream`;
        }

        const eventSource = new EventSource(endpoint);

        eventSource.onmessage = (e) => {
            if (e.data === "DONE") {
                eventSource.close();
                setSyncDone(true);
                setSyncing(false);
                if (type === "folders") {
                    setSyncLogs(prev => [...prev, "✅ Folders synced! Refreshing in 3 seconds..."]);
                    setTimeout(() => window.location.reload(), 3000);
                }
            } else if (e.data.trim() !== "") {
                setSyncLogs(prev => [...prev, e.data]);
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
            setSyncing(false);
            setSyncDone(true);
            setSyncLogs(prev => [...prev, "❌ Connection lost. Please check the server."]);
        };
    }

    return (
        <div className="custom-container py-[100px] px-[20px] w-auto">

            {/* ⚙️ Admin Gear Icon - fixed top right */}
            <div className="fixed top-4 right-4 z-50" ref={adminMenuRef}>
                <button
                    onClick={() => setShowAdminMenu(prev => !prev)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                    title="Admin"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>

                {/* Dropdown */}
                {showAdminMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
                        <div className="px-4 py-2 border-b border-gray-600">
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Admin</p>
                        </div>
                        <button
                            onClick={() => { setConfirmModal({ type: "folders" }); setShowAdminMenu(false); }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
                            </svg>
                            Sync Folders
                        </button>
                        <button
                            onClick={() => { setIndexFolders([]); setConfirmModal({ type: "embeddings" }); setShowAdminMenu(false); }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zM4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                            </svg>
                            Index Faces
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-6 w-[90%] max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            {confirmModal.type === "folders" ? (
                                <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zM4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                                </svg>
                            )}
                            <h3 className="text-white font-semibold text-lg">
                                {confirmModal.type === "folders" ? "Sync Folders" : "Index Faces"}
                            </h3>
                        </div>

                        {confirmModal.type === "folders" ? (
                            <p className="text-gray-300 text-sm mb-4">
                                This will scan the NAS and update the folder structure in the database.
                            </p>
                        ) : (
                            <>
                                <p className="text-gray-300 text-sm mb-3">
                                    Select folders to index. Leave all unchecked to index everything.
                                </p>

                                {/* Folder tree for selection */}
                                <div className="max-h-48 overflow-y-auto bg-gray-900 rounded-lg p-2 border border-gray-600 mb-3">
                                    {allFolders.map(folder => (
                                        <FolderNode
                                            key={folder.id}
                                            folder={folder}
                                            onToggleSelect={toggleIndexFolder}
                                            selectedFolderIds={indexFolders.map(f => f.id)}
                                        />
                                    ))}
                                </div>

                                {/* Selected folders display */}
                                <div className="mb-3">
                                    {indexFolders.length > 0 ? (
                                        <p className="text-xs text-indigo-400">
                                            Indexing: {indexFolders.map(f => f.name).join(", ")}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-400">
                                            No folders selected → will index all unindexed photos
                                        </p>
                                    )}
                                </div>

                                <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3 mb-4">
                                    <p className="text-yellow-300 text-xs">
                                        ⚠️ <strong>Note:</strong> Face indexing can take several minutes to hours. Do not close the browser while indexing.
                                    </p>
                                </div>
                            </>
                        )}

                        <p className="text-gray-400 text-sm mb-6">Are you sure you want to proceed?</p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSync}
                                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                                    confirmModal.type === "folders"
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-purple-600 hover:bg-purple-700"
                                }`}
                            >
                                {confirmModal.type === "folders" ? "Yes, Sync Folders" : "Yes, Start Indexing"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Streaming Progress Modal */}
            {(syncing || (syncDone && syncLogs.length > 0)) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-[90%] max-w-2xl flex flex-col" style={{maxHeight: '80vh'}}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-600">
                            <div className="flex items-center gap-3">
                                {syncing ? (
                                    <svg className="animate-spin w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 6L9 17l-5-5"/>
                                    </svg>
                                )}
                                <h3 className="text-white font-semibold">
                                    {syncing ? "Processing..." : "Complete!"}
                                </h3>
                            </div>
                            {syncDone && (
                                <button
                                    onClick={() => { setSyncLogs([]); setSyncDone(false); }}
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    Close
                                </button>
                            )}
                        </div>

                        {/* Live logs */}
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-gray-900 rounded-b-xl">
                            {syncLogs.map((log, i) => (
                                <div key={i} className={`mb-1 ${
                                    log.startsWith("✅") ? "text-green-400" :
                                    log.startsWith("❌") ? "text-red-400" :
                                    log.startsWith("⚠️") ? "text-yellow-400" :
                                    log.startsWith("⏳") ? "text-blue-400" :
                                    log.startsWith("📂") ? "text-indigo-400" :
                                    log.startsWith("🎉") ? "text-green-300" :
                                    "text-gray-300"
                                }`}>
                                    {log}
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>

                        {/* Footer */}
                        {syncing && (
                            <div className="px-6 py-3 border-t border-gray-600">
                                <p className="text-xs text-gray-400 text-center">
                                    Do not close the browser while processing...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={`flex flex-col-reverse lg:flex-row gap-[20px]`}>
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6 border border-gray-700 w-[100%] lg:w-[70%]">
                    <div className="flex justify-between gap-[20px] pb-[20px] px-12">
                        <div className="flex gap-[20px]">
                            <button
                                onClick={() => searchMethod === 'photo' ? searchFaces() : searchByName()}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                                    searchMethod === 'name'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-type w-5 h-5">
                                    <polyline points="4 7 4 4 20 4 20 7"></polyline>
                                    <line x1="9" x2="15" y1="20" y2="20"></line>
                                    <line x1="12" x2="12" y1="4" y2="20"></line>
                                </svg>Search Via Name
                            </button>
                            <button
                                onClick={() => setSearchMethod('photo')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                                    searchMethod === 'photo'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera w-5 h-5">
                                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                    <circle cx="12" cy="13" r="3"></circle>
                                </svg>Search Via Photo
                            </button>
                        </div>
                        <button
                            onClick={() => searchFaces()}
                            disabled={searching}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer bg-[#138a4e] hover:bg-[#05df72] text-white disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            {searching ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera w-5 h-5">
                                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                        <circle cx="12" cy="13" r="3"></circle>
                                    </svg>
                                    Search
                                </>
                            )}
                        </button>
                    </div>
                    {
                        searchMethod === "photo" ?
                            <SearchViaPhoto
                                preview={preview}
                                setPreview={setPreview}
                                setSelectedImage={setSelectedImage}
                            />
                            :
                            <SearchViaName
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />
                    }
                </div>
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700 w-[100%] lg:w-[30%] mb-6 h-auto">
                    <Directory
                        selectedFolders={selectedFolders}
                        setSelectedFolders={setSelectedFolders}
                    />
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-[20px]">
                <ClientInfo />
            </div>
            <Results results={results} />
        </div>
    )
}

export default Home;
