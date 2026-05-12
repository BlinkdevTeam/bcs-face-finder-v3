const buildFolderTree = (folders) => {
    const map = {};
    const roots = [];
    folders.forEach(folder => {
        map[folder.id] = { ...folder, children: [] };
    });

    folders.forEach(folder => {
        if (folder.parent_id === null) {
            roots.push(map[folder.id]);
        } else {
            map[folder.parent_id]?.children.push(map[folder.id]);
        }
    });
    console.log("map", map)
    return roots;
}

export default buildFolderTree;


function FolderNode({ folder }) {
  return (
    <li>
      <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">
        📁 {folder.name}
      </div>

      {folder.children.length > 0 && (
        <ul className="ml-4 mt-1 space-y-1">
          {folder.children.map(child => (
            <FolderNode key={child.id} folder={child} />
          ))}
        </ul>
      )}
    </li>
  );
}