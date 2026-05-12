import { useState } from "react";

const SearchViaPhoto = ({preview, setPreview, setSelectedImage}) => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    const maxSizeMB = 10;

    function handleFileChange(e) {
        const selectedFile = e.target.files[0];
        setError("");

        if (!selectedFile) return;

        // Validate type
        if (!allowedTypes.includes(selectedFile.type)) {
        setError("Only JPG, PNG, and WEBP images are allowed.");
        return;
        }

        // Validate size
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be smaller than ${maxSizeMB}MB.`);
        return;
        }

        setSelectedImage(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    }

    // async function handleUpload() {
    //     if (!file) return;

    //     setLoading(true);
    //     setError("");

    //     const formData = new FormData();
    //     formData.append("file", file);

    //     try {
    //     const response = await fetch("http://localhost:8000/upload", {
    //         method: "POST",
    //         body: formData,
    //     });

    //     if (!response.ok) {
    //         throw new Error("Upload failed");
    //     }

    //     const data = await response.json();
    //     console.log("Upload success:", data);
    //         alert("Image uploaded successfully!");
    //     } catch (err) {
    //         setError("Upload failed. Please try again.");
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    return (
        <div>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera w-16 h-16 mx-auto text-indigo-400"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                <div className="text-[#ffffff] flex flex-col justify-center items-center py-[20px] gap-[10px]">
                    <h2 className="text-2xl">Upload Photo</h2>
                    <p className="text-gray-400">Take or upload a clear photo of the student's face</p>
                </div>
            </div>
            <div className={`gap-[20px]`}>
                <div className={`border-4 border-dashed border-gray-300 rounded-lg p-12 hover:border-indigo-400 transition-colors mx-[50px] w-[100%]"}`}>
                    <label for="photo-upload" className="cursor-pointer block flex flex-col items-center">
                        {
                            !preview ? <div className="">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload w-12 h-12 mx-auto text-gray-400 mb-3">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" x2="12" y1="3" y2="15"></line>
                                </svg>
                                <p className="text-gray-600 mb-2">Click to upload or capture photo</p>
                                <p className="text-sm text-gray-500">Supports JPG, PNG files</p>
                            </div> 
                            : 
                            <div className="w-auto">
                                <div className="relative">
                                    {preview && (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="rounded-lg max-h-64 object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                        }
                        <input
                            id="photo-upload"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            type="file"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            </div>
        </div>
    )
}

export default SearchViaPhoto;