import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "./ui/skeleton";
import { getTeams, getSpaces, getFolders, getLists, getTasks } from "@/services/clickupAPI";

interface TaskSelectorProps {
  onTaskSelect: (taskId: string) => void;
}

const TaskSelector: React.FC<TaskSelectorProps> = ({ onTaskSelect }) => {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const teams = await getTeams();
      if (teams.length > 0) {
        const id = teams[0].id;
        setTeamId(id);
        const spaceRes = await getSpaces(id);
        setSpaces(spaceRes);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchLists = async () => {
      if (!selectedSpace) return;
      setLoading(true);
      const folders = await getFolders(selectedSpace);
      const listsFromFolders = await Promise.all(
        folders.map((folder: any) => getLists(folder.id))
      );
      const flatLists = listsFromFolders.flat();
      const noFolderLists = await getLists(selectedSpace, true);
      setLists([...flatLists, ...noFolderLists]);
      setLoading(false);
    };
    fetchLists();
  }, [selectedSpace]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedList) return;
      setLoading(true);
      const taskRes = await getTasks(selectedList);
      setTasks(taskRes);
      setLoading(false);
    };
    fetchTasks();
  }, [selectedList]);

  return (
    <div className="space-y-4">
      {/* Espaços */}
      <div>
        <p className="text-sm font-semibold text-zinc-700 mb-1">Selecione um espaço</p>
        <div className="space-y-2">
          {spaces.map((space) => (
            <Button
              key={space.id}
              variant={selectedSpace === space.id ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => {
                setSelectedSpace(space.id);
                setSelectedList(null);
                setTasks([]);
              }}
            >
              {space.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Listas */}
      {selectedSpace && (
        <div>
          <p className="text-sm font-semibold text-zinc-700 mb-1">Selecione uma lista</p>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="space-y-2">
              {lists.map((list) => (
                <Button
                  key={list.id}
                  variant={selectedList === list.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedList(list.id)}
                >
                  {list.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tarefas */}
      {selectedList && (
        <div>
          <p className="text-sm font-semibold text-zinc-700 mb-1">Selecione uma tarefa</p>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : tasks.length > 0 ? (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="p-2 border rounded-md cursor-pointer hover:bg-zinc-100"
                  onClick={() => onTaskSelect(task.id)}
                >
                  <div className="font-medium text-sm">{task.name}</div>
                  <div className="text-xs text-zinc-500">{task.status?.status}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">Nenhuma tarefa encontrada.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskSelector;