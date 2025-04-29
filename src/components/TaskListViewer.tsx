import { useEffect, useState, useRef, useCallback } from "react";
import { getTasksByList } from "@/services/clickupAPI";
import { CalendarDays, User2 } from "lucide-react";


interface TaskListViewerProps {
  listId?: string;
  accessToken?: string;
  listName?: string;
  tasks?: any[];
  onTaskSelect: (taskId: string) => void;
}


export default function TaskListViewer({
  listId,
  accessToken,
  listName,
  onTaskSelect,
  tasks: externalTasks,
}: TaskListViewerProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  const externalTasksProvided = externalTasks && externalTasks.length > 0;


  const groupTasksByStatus = (taskList: any[]) => {
    return taskList.reduce((acc: any, task: any) => {
      const status = task.status?.status || "Sem status";
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {});
  };

  const fetchTasks = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const allTasks = await getTasksByList(listId!, accessToken!);
      setTasks(allTasks);
      setHasMore(false); // ainda sem paginação
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setLoading(false);
    }
  }, [listId, accessToken, loading, hasMore]);

  useEffect(() => {
    if (externalTasksProvided) {
      setTasks(externalTasks || []);
      return;
    }
  
    if (!listId || !accessToken) return;
  
    async function fetchTasks() {
      if (!listId || !accessToken) return
      setLoading(true);
      const newTasks = await getTasksByList(listId!, accessToken!);
      setTasks(newTasks);
      setLoading(false);
    }
  
    fetchTasks();
  }, [listId, accessToken, externalTasks]);
  
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, loading]);

  const groupedTasks = groupTasksByStatus(tasks || []);

  return (
    <div className="space-y-4">
          <div className="flex justify-end items-center mb-2">
          </div>

      {Object.entries(groupedTasks as Record<string, any[]>).map(
        ([status, grouped]) => (
          <div key={status}>
            <h3 className="text-sm font-semibold text-zinc-600 mb-2">
              {status}
            </h3>
            <div className="space-y-2">
              {grouped.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => onTaskSelect(task.id)}
                  className="border border-zinc-200 p-3 rounded-md bg-white shadow-sm space-y-1 text-left hover:border-zinc-300 cursor-pointer transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium flex gap-2 items-center text-sm text-zinc-600">
                      {task.name}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: task.status?.color || "#999" }}
                    >
                      {task.status?.status || "Sem status"}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-500 text-xs mt-1">
                    <span className="flex items-center gap-1">
                      <User2 size={12} />
                      {task.assignees?.[0]?.username || "Sem responsável"}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} />
                      {task.start_date
                        ? new Date(+task.start_date).toLocaleDateString()
                        : "?"}{" "}
                      -{" "}
                      {task.due_date
                        ? new Date(+task.due_date).toLocaleDateString()
                        : "?"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {loading && (
        <div className="text-sm text-zinc-500">Carregando tarefas...</div>
      )}
      <div ref={loaderRef} />
    </div>
  );
}
