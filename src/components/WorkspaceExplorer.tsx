import { useEffect, useState } from "react";
import {
  getFolders,
  getLists,
  getSpacesByTeam,
} from "@/services/clickupAPI";
import { Folder, FolderOpen, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkspaceExplorerProps {
  accessToken: string;
  workspaceId: string;
  onListSelect: (listId: string, list: any) => void;
  selectedFolderId?: string; 
}

const WorkspaceExplorer: React.FC<WorkspaceExplorerProps> = ({
  accessToken,
  workspaceId,
  onListSelect,
}) => {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [foldersBySpace, setFoldersBySpace] = useState<Record<string, any[]>>({});
  const [listsByFolder, setListsByFolder] = useState<Record<string, any[]>>({});
  const [expandedSpaceId, setExpandedSpaceId] = useState<string | null>(null);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [loadingFolders, setLoadingFolders] = useState<Record<string, boolean>>({});
  const [loadingLists, setLoadingLists] = useState<Record<string, boolean>>({});

  
  useEffect(() => {
    const fetchSpaces = async () => {
      const fetchedSpaces = await getSpacesByTeam(workspaceId, accessToken);
      setSpaces(fetchedSpaces);
    };

    fetchSpaces();
  }, [workspaceId, accessToken]);

  const handleToggleSpace = async (spaceId: string) => {
    const isExpanded = expandedSpaceId === spaceId;
    setExpandedSpaceId(isExpanded ? null : spaceId);

    if (!isExpanded && !foldersBySpace[spaceId]) {
      setLoadingFolders((prev) => ({ ...prev, [spaceId]: true }));
      try {
        const folders = await getFolders(spaceId, accessToken);
        setFoldersBySpace((prev) => ({ ...prev, [spaceId]: folders }));
      } catch (error) {
        console.error("Erro ao buscar pastas:", error);
      } finally {
        setLoadingFolders((prev) => ({ ...prev, [spaceId]: false }));
      }
    }
  };

  const handleToggleFolder = async (folderId: string) => {
    const isExpanded = expandedFolderId === folderId;
    setExpandedFolderId(isExpanded ? null : folderId);

    if (!isExpanded && !listsByFolder[folderId]) {
      setLoadingLists((prev) => ({ ...prev, [folderId]: true }));
      try {
        const lists = await getLists(folderId, accessToken);
        setListsByFolder((prev) => ({ ...prev, [folderId]: lists }));
      } catch (error) {
        console.error("Erro ao buscar listas:", error);
      } finally {
        setLoadingLists((prev) => ({ ...prev, [folderId]: false }));
      }
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-700 mb-1">Selecionar Lista</h3>

      {spaces.map((space) => (
        <div key={space.id}>
          <button
            onClick={() => handleToggleSpace(space.id)}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: space.color || "#ccc" }}
            />
            {space.name}
          </button>

          {expandedSpaceId === space.id && (
            <div className="ml-6 mt-1">
              {loadingFolders[space.id] ? (
                <Skeleton className="h-5 w-32 mb-2" />
              ) : (
                foldersBySpace[space.id]?.map((folder) =>
                  folder?.id && folder?.name ? (
                    <div key={folder.id} className="mb-1">
                      <button
                        onClick={() => handleToggleFolder(folder.id)}
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                      <span className="flex items-center justify-center w-4 h-4">
                        {expandedFolderId === folder.id ? (
                          <FolderOpen size={16} className="text-muted-foreground" />
                        ) : (
                          <Folder size={16} className="text-muted-foreground" />
                        )}
                        </span> 
                        {folder.name}
                      </button>

                      {expandedFolderId === folder.id && (
                        <div className="ml-6 mt-1">
                          {loadingLists[folder.id] ? (
                            <Skeleton className="h-4 w-32 mb-1" />
                          ) : (
                            listsByFolder[folder.id]?.map((list) =>
                              list?.id && list?.name ? (
                                <button
                                  key={list.id}
                                  onClick={() => {
                                    onListSelect(list.id, list);
                                  }}
    
                                  className="text-sm ml-4 hover:underline flex items-center gap-2"
                                >
                                  <FileText size={14} className="text-muted-foreground" />
                                  {list.name}
                                </button>
                              ) : null
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ) : null
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WorkspaceExplorer;
