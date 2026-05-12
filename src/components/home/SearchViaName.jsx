const SearchViaName = () => {
    const handleChange = () => {

    }

    return (
        <>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-16 h-16 mx-auto text-indigo-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <div className="text-[#ffffff] flex flex-col justify-center items-center py-[20px] gap-[10px]">
                    <h2 className="text-2xl">Search by Name or ID</h2>
                    <p className="text-gray-400">Enter student name or ID to find their photos</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Student Name</label>
                    <input
                        type="text"
                        value={""}
                        onChange={handleChange}
                        placeholder="e.g., Juan Dela Cruz"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-lg"
                    />
                </div>
            </div>
        </>
    )
}

export default SearchViaName;