import { useState } from "react";
// import Summary from "./home/summary";
import ClientInfo from "./home/ClientInfo";
import Results from "./home/Result";
import Directory from "./home/Directory";
import SearchViaPhoto from "./home/SearchViaPhoto";
import SearchViaName from "./home/SearchViaName";

const Home = () => {
    const [searchMethod, setSearchMethod] = useState('photo');
    const [selectedFolders, setSelectedFolders] = useState([]);
    const [preview, setPreview] = useState(null);             // string (URL/base64)
    const [selectedImage, setSelectedImage] = useState(null); // File
    const [results,setResults] = useState([]);

    async function searchFaces() {
        console.log("selectedFolders", selectedFolders)

        if (!selectedImage || selectedFolders.length === 0) {
            alert("Select an image and at least one folder");
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append(
            "folder_ids",
            selectedFolders.map(f => f.id).join(",")
        );

        try {
            const res = await fetch("http://127.0.0.1:8000/face-search", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Backend error:", text);
                throw new Error("Face search failed");
            }

            const data = await res.json();
            console.log("Search results:", data);

            setResults(data.matches || []);

        } catch (err) {
            console.error("Search failed:", err);
            alert("Search failed. Check backend.");
        }
    }



    return (
        <div className="custom-container py-[100px] px-[20px] w-auto">
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
                            onClick={() => searchFaces()} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer bg-[#138a4e] hover:bg-[#05df72] text-white`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera w-5 h-5">
                                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                <circle cx="12" cy="13" r="3"></circle>
                            </svg>Search
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
                <ClientInfo/>
                {/* <Summary/> */}
            </div>
            <Results 
                results={results}
            />
        </div>
    )
}

export default Home;