const Results = ({ results }) => {
  // Group results by folder_path
  const groupedResults = Array.isArray(results)
    ? results.reduce((acc, item) => {
        if (!item?.folder_path) return acc;

        const folderPath = item.folder_path.substring(0, item.folder_path.lastIndexOf("/"));

        if (!acc[folderPath]) {
          acc[folderPath] = [];
        }

        acc[folderPath].push(item);
        return acc;
      }, {})
    : {};


  return (
    <div className="lg:col-span-2">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6 border border-gray-700">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-indigo-400"
          >
            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
          </svg>

          <h2 className="text-xl font-semibold text-white">Folders</h2>
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
            <div
              key={path}
              className="border border-gray-600 rounded-lg overflow-hidden hover:shadow-lg hover:border-indigo-500 transition-all"
            >
              {/* Folder Path Header */}
              <div className="bg-gray-700 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">

                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20" height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>

                      {/* Folder name from last 3 levels */}
                      <h3 className="font-semibold text-white">
                        {path}
                      </h3>
                    </div>

                    {/* Full folder path */}
                    <p className="text-sm text-gray-400 font-mono">{path}</p>
                  </div>

                  {/* Count */}
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
                          src={`https://facefinder.blinkcreativestudio.com/image/${item.file_id}`}
                          className="w-full h-full object-cover"
                          alt={item.file_name}
                        />
                      </div>

                      {/* Filename */}
                      <p className="text-white text-xs mt-1">
                        {item.file_name.length > 12
                          ? item.file_name.slice(0, 12) + "..."
                          : item.file_name}
                      </p>

                      {/* Similarity score */}
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
    </div>
  );
};

export default Results;
