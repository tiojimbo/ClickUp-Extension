import { useEffect, useState } from "react";
import { getSpacesByTeam, getFolders, getLists } from "@/services/clickupAPI";

interface WorkspaceExplorerProps {
  accessToken: string;
  workspaceId: string; // Também chamado de teamId
  onListSelect: (listId: string) => void;
}

interface Folder {
  id: string;
  name: string;
}

interface List {
  id: string;
  name: string;
}

const WorkspaceExplorer: React.FC<WorkspaceExplorerProps> = ({ accessToken, workspaceId, onListSelect }) => {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [expandedSpaceId, setExpandedSpaceId] = useState<string | null>(null);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [foldersBySpace, setFoldersBySpace] = useState<Record<string, Folder[]>>({});
  const [listsByFolder, setListsByFolder] = useState<Record<string, List[]>>({});
  const [loadingSpaces, setLoadingSpaces] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const result = await getSpacesByTeam(workspaceId, accessToken);
        setSpaces(result);
      } catch (err) {
        console.error("Erro ao buscar espaços:", err);
      } finally {
        setLoadingSpaces(false);
      }
    };
    fetchSpaces();
  }, [workspaceId, accessToken]);

  const handleToggleSpace = async (spaceId: string) => {
    setExpandedSpaceId(expandedSpaceId === spaceId ? null : spaceId);
    if (!foldersBySpace[spaceId]) {
      try {
        const folders = await getFolders(spaceId, accessToken);
        setFoldersBySpace((prev) => ({ ...prev, [spaceId]: folders }));
      } catch (err) {
        console.error("Erro ao buscar pastas:", err);
      }
    }
  };

  const handleToggleFolder = async (folderId: string, spaceId: string) => {
    setExpandedFolderId(expandedFolderId === folderId ? null : folderId);
    if (!listsByFolder[folderId]) {
      try {
        const lists = await getLists(folderId, accessToken);
        setListsByFolder((prev) => ({ ...prev, [folderId]: lists }));
      } catch (err) {
        console.error("Erro ao buscar listas:", err);
      }
    }
  };

  return (
    <div className="space-y-2">
      {loadingSpaces ? (
        <p className="text-zinc-500 text-sm">Carregando espaços...</p>
      ) : (
        spaces.map((space) => (
          <div key={space.id} className="border border-zinc-200 rounded-xl p-2">
            <button
              className="w-full text-left font-medium text-sm"
              onClick={() => handleToggleSpace(space.id)}
            >
              📁 {space.name}
            </button>

            {expandedSpaceId === space.id && foldersBySpace[space.id] && (
              <div className="ml-4 mt-2 space-y-1">
                {foldersBySpace[space.id].map((folder) => (
                  <div key={folder.id}>
                    <button
                      className="text-left text-sm text-zinc-700 hover:underline"
                      onClick={() => handleToggleFolder(folder.id, space.id)}
                    >
                      📂 {folder.name}
                    </button>

                    {expandedFolderId === folder.id && listsByFolder[folder.id] && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {listsByFolder[folder.id].map((list) => (
                          <li key={list.id}>
                            <button
                              className="text-left text-sm text-zinc-600 hover:text-zinc-900"
                              onClick={() => onListSelect(list.id)}
                            >
                              📝 {list.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default WorkspaceExplorer;
