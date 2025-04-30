import { useEffect, useState } from "react";
import { getFolders, getLists, getSpacesByTeam, getTasks } from "@/services/clickupAPI";
import { Folder, FolderOpen, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getListsByFolder } from "@/services/clickupAPI";

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
  const [selectedListTasks, setSelectedListTasks] = useState<any[]>([]);
  const [selectedListName, setSelectedListName] = useState<string>("");
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  
  

  
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
        const lists = await getListsByFolder(folderId, accessToken);
  
        setListsByFolder((prev) => ({
          ...prev,
          [folderId]: lists,
        }));
      } catch (error) {
        console.error("Erro ao buscar listas da pasta:", error);
        setListsByFolder((prev) => ({ ...prev, [folderId]: [] }));
      } finally {
        setLoadingLists((prev) => ({ ...prev, [folderId]: false }));
      }
    }
  };  

  const handleListClick = async (listId: string, listName: string) => {
    if (!listId || !accessToken) return;
  
    setLoadingTasks(true);
    setSelectedListName(listName);
  
    try {
      const tasks = await getTasks(listId, accessToken);
      setSelectedListTasks(tasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas da lista:", error);
      setSelectedListTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };
  
  

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-700 mb-1">Selecionar Lista</h3>

      {spaces.map((space) => (
  <div key={space.id} className="mb-2">
    <div
      onClick={() => handleToggleSpace(space.id)}
      className="cursor-pointer flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-md"
    >
      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: space.color }} />
      <span>{space.name}</span>
    </div>

    {expandedSpaceId === space.id &&
      foldersBySpace[space.id]?.map((folder) => (
        <div key={folder.id} className="ml-4">
          <div
            onClick={() => handleToggleFolder(folder.id)}
            className="cursor-pointer flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-md"
          >
            {expandedFolderId === folder.id ? (
              <FolderOpen className="w-4 h-4 text-gray-600" />
            ) : (
              <Folder className="w-4 h-4 text-gray-600" />
            )}
            <span>{folder.name}</span>
          </div>

          {expandedFolderId === folder.id && (
            <div className="ml-4 mt-2 space-y-2">
              {loadingLists[folder.id] ? (
                <div className="text-sm text-gray-500">Carregando listas...</div>
              ) : (
                listsByFolder[folder.id]?.map((list) => (
                  <div
                    key={list.id}
                    onClick={() => {
                      setSelectedListName(list.id);
                    }}                    
                    className="cursor-pointer p-2 rounded-md hover:bg-gray-100 text-sm transition flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>{list.name}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
  </div>
))}
    </div>
  );
};




export default WorkspaceExplorer;
