const ClientInfo = () => {
    return (
       <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6 border border-gray-700 w-[100%] md:w-[50%]">
            <div className="flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 text-indigo-400">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <h2 className="text-lg font-semibold text-white">Student Info</h2>
            </div>
            <div className="space-y-3">
                <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="font-medium text-gray-100">Juan Dela Cruz</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Student ID</p>
                    <p className="font-medium text-gray-100">2024-12345</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Program</p>
                    <p className="font-medium text-gray-100">BS Computer Science</p>
                </div>
            </div>
       </div>
    )
}

export default ClientInfo;