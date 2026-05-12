const Summary = () => {
    return (
        <div className="bg-indigo-900 bg-opacity-40 rounded-lg shadow-2xl p-6 border-2 border-indigo-600 mb-6 w-[100%] md:w-[50%]">
            <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-300">Total Photos:</span>
                    <span className="font-bold text-indigo-400">12</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-300">Locations:</span>
                    <span className="font-bold text-indigo-400">4</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-300">Physical Boxes:</span>
                    <span className="font-bold text-indigo-400">2</span>
                </div>
            </div>
        </div>
    )
}

export default Summary