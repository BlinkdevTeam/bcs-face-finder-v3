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
    const [indexFolders, setIndexFolders] = useState([]);

    // Sync status
    const [syncing, setSyncing] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncMessage, setSyncMessage] = useState("");
    const [syncDone, setSyncDone] = useState(false);
    const pollRef = useRef(null);

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

    // Cleanup poll on unmount
    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
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

        setSearching(true);
        setResults([]);

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
            setSearching(false);
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

    async function handleConfirmSync() {
        const type = confirmModal.type;
        setConfirmModal(null);
        setShowAdminMenu(false);
        setSyncing(true);
        setShowSyncModal(true);
        setSyncDone(false);
        setSyncMessage("⏳ Starting...");

        try {
            if (type === "folders") {
                await fetch(`${API_URL}/sync-folders-start`, { method: "POST" });
                startPolling("folders");
            } else if (type === "embeddings") {
                const folderIds = indexFolders.map(f => f.id).join(",");
                const url = folderIds
                    ? `${API_URL}/sync-embeddings-start?folder_ids=${folderIds}&batch_size=1`
                    : `${API_URL}/sync-embeddings-start?batch_size=1`;
                await fetch(url, { method: "POST" });
                startPolling("embeddings");
            } else if (type === "embeddings-batch") {
                const folderIds = indexFolders.map(f => f.id).join(",");
                const url = folderIds
                    ? `${API_URL}/sync-embeddings-start?folder_ids=${folderIds}&batch_size=3`
                    : `${API_URL}/sync-embeddings-start?batch_size=3`;
                await fetch(url, { method: "POST" });
                startPolling("embeddings");
            }
        } catch (err) {
            setSyncing(false);
            setSyncDone(true);
            setSyncMessage("❌ Failed to start. Please try again.");
        }
    }

    function startPolling(statusType) {
        if (pollRef.current) clearInterval(pollRef.current);

        pollRef.current = setInterval(async () => {
            try {
                const endpoint = statusType === "folders"
                    ? `${API_URL}/sync-folders-status`
                    : `${API_URL}/sync-embeddings-status`;

                const res = await fetch(endpoint);
                const data = await res.json();

                setSyncMessage(data.message);

                if (data.done) {
                    clearInterval(pollRef.current);
                    setSyncing(false);
                    setSyncDone(true);
                    setShowSyncModal(true); // reopen modal to show completion

                    if (statusType === "folders" && !data.error) {
                        setSyncMessage("✅ Sync complete! Refreshing in 2 seconds...");
                        setTimeout(() => window.location.reload(), 2000);
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000);
    }

    return (
        <div className="custom-container py-[100px] px-[20px] w-auto">

            {/* ⚙️ Admin Gear Icon - fixed top right */}
            <div className="fixed top-4 right-4 z-50" ref={adminMenuRef}>
                <button
                    onClick={() => syncing ? setShowSyncModal(true) : setShowAdminMenu(prev => !prev)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors relative"
                    title={syncing ? "Sync in progress - click to view" : "Admin"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {/* Blue pulsing dot when syncing */}
                    {syncing && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full animate-pulse border-2 border-gray-700" />
                    )}
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
                        <button
                            // disabled
                            onClick={() => { setIndexFolders([]); setConfirmModal({ type: "embeddings-batch" }); setShowAdminMenu(false); }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-500 cursor-not-allowed opacity-50 border-t border-gray-700"
                        >
                            <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zM4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                            </svg>
                            Index Faces ×3
                            <span className="ml-auto text-xs bg-green-700 px-1.5 py-0.5 rounded">4vCPU ✅</span>
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
                                        ⚠️ <strong>Note:</strong> Face indexing can take several minutes to hours. You can close this window — indexing continues on the server.
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

            {/* Sync Progress Modal */}
            {showSyncModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-8 w-[90%] max-w-md flex flex-col items-center gap-4">

                        {syncing ? (
                            <svg className="animate-spin w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                        ) : (
                            <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5"/>
                            </svg>
                        )}

                        <p className="text-white font-medium text-center">
                            {syncing ? "Processing..." : "Complete!"}
                        </p>

                        <p className={`text-sm text-center ${
                            syncMessage.startsWith("✅") ? "text-green-400" :
                            syncMessage.startsWith("❌") ? "text-red-400" :
                            syncMessage.startsWith("⚠️") ? "text-yellow-400" :
                            "text-gray-300"
                        }`}>
                            {syncMessage}
                        </p>

                        {syncing && (
                            <p className="text-xs text-gray-500 text-center">
                                You can hide this window — the process continues on the server.
                            </p>
                        )}

                        <div className="flex gap-3">
                            {syncing && (
                                <button
                                    onClick={() => setShowSyncModal(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
                                >
                                    Hide
                                </button>
                            )}
                            {syncDone && (
                                <button
                                    onClick={() => { setSyncDone(false); setShowSyncModal(false); }}
                                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex flex-col-reverse lg:flex-row gap-[20px]`}>
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6 border border-gray-700 w-[100%] lg:w-[70%]">
                    <div className="flex justify-between gap-[20px] pb-[20px] px-12">
                        <div className="flex gap-[20px]">
                            <button
                                onClick={() => setSearchMethod('name')}
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
                            onClick={() => searchMethod === 'photo' ? searchFaces() : searchByName()}
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
