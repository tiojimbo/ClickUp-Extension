import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import WorkspaceExplorer from "@/components/WorkspaceExplorer";
import { getListStatusesFromListObject } from "@/services/clickupAPI";
import { CustomField } from "@/types/customFields";
import { formatCustomFieldValue } from "@/types/customFields";
import { Calendar as CalendarIcon } from "lucide-react";
import { FolderIcon, ListIcon } from "lucide-react";

import {
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Minus } from "lucide-react";
import TaskListViewer from "./TaskListViewer";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";


type Space = {
  id: string;
  name: string;
  color?: string;
};

type Folder = {
  id: string;
  name: string;
};

const CLIENT_ID = import.meta.env.VITE_CLICKUP_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_CLICKUP_REDIRECT_URI;

function ClickUpLoginScreen({ onClose, onMinimize }: { onClose: () => void; onMinimize: () => void }) {
  const handleLogin = () => {
    const clickupAuthUrl = `https://app.clickup.com/api?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = clickupAuthUrl;
  };

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <div />
        <div className="flex gap-2">
          <button onClick={onMinimize} className="text-zinc-500 hover:text-zinc-800">
            <Minus size={16} />
          </button>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center h-[400px] text-center space-y-6">
        <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
        <Button
          className="bg-[#5C47CD] text-white hover:bg-[#5C47CD] px-6 py-2 rounded-md"
          onClick={handleLogin}
        >
          Conectar com ClickUp
        </Button>
      </div>
    </>
  );
}


export default function ClickUpTaskPanel() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(localStorage.getItem("clickup_workspace_id"));
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [description, setDescription] = useState("Texto da descrição da tarefa que pode ser muito longa...");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [statusOptions, setStatusOptions] = useState<{ label: string; color: string }[]>([]);
  const [showEmptyFields, setShowEmptyFields] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<"start" | "due">("start");
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [folderTasks, setFolderTasks] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [lastPosition, setLastPosition] = useState({ x: window.innerWidth - 440, y: 32 });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const alreadyUsedCode = sessionStorage.getItem("clickup_code_used");

    if (code && alreadyUsedCode === code) {
      console.warn("⚠️ Código já foi usado anteriormente. Evitando fetch duplicado.");
      return;
    }
  
    const storedToken = localStorage.getItem("clickup_access_token");
    const storedWorkspaceId = localStorage.getItem("clickup_workspace_id");

    console.log("🧠 useEffect STARTED");
    console.log("🔁 AccessToken (localStorage):", storedToken);
    console.log("📌 WorkspaceId (localStorage):", storedWorkspaceId);

    if (storedToken) {
      console.log("Token já salvo:", storedToken);
      setAccessToken(storedToken);
  
      if (storedWorkspaceId) {
        setWorkspaceId(storedWorkspaceId);
      }
    } 
  
    // Se tiver code, mas ainda não tem token
    if (code) {
      console.log("🎯 Código recebido da URL:", code);
      fetch(`${import.meta.env.VITE_OAUTH_BACKEND_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            console.log("✅ AccessToken recebido e salvo:", data.access_token);
            console.log("Token recebido:", data.access_token);
            localStorage.setItem("clickup_access_token", data.access_token);
            sessionStorage.setItem("clickup_code_used", code);
            setAccessToken(data.access_token);
  
            // Buscar workspace
            return fetch(`${import.meta.env.VITE_OAUTH_BACKEND_URL}/api/team`, {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            });
          } else {
            console.error("Erro ao obter token:", data);
          }
        })
        .then(res => res?.json())
        .then(teamData => {
          if (teamData?.teams?.length > 0) {
            const id = teamData.teams[0].id;
            console.log("✅ WorkspaceId salvo:", id);
            localStorage.setItem("clickup_workspace_id", id);
            setWorkspaceId(id);
          }

          window.history.replaceState({}, "", window.location.pathname);
        
        })
        .catch(err => console.error("Erro no login:", err));
    }
  }, []);
  


  useEffect(() => {
    if (!isMinimized) {
      x.set(lastPosition.x);
      y.set(lastPosition.y);
    }
  }, [isMinimized]);

  useEffect(() => {
    if (!isVisible) {
      setLastPosition({ x: window.innerWidth - 440, y: 32 });
    }
  }, [isVisible]);


  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!selectedTaskId || !accessToken) return;
  
      try {
        const response = await fetch(
          `${import.meta.env.VITE_OAUTH_BACKEND_URL}/api/tasks/details/${selectedTaskId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
  
        if (!response.ok) throw new Error("Erro ao buscar detalhes da tarefa");
  
        const task = await response.json();
  
        console.log("📌 Tarefa carregada:", task);

        setDescription(task?.description || "");
        setStartDate(task?.start_date ? new Date(Number(task.start_date)) : undefined);
        setDueDate(task?.due_date ? new Date(Number(task.due_date)) : undefined);
        setStatus(task?.status?.status);
        setSelectedTask(task);


      } catch (error) {
        console.error("❌ Erro ao buscar detalhes da tarefa:", error);
        
      }
    };
  
    fetchTaskDetails();
  }, [selectedTaskId, accessToken]);
  
  
  useEffect(() => {
    if (!selectedListId || !accessToken) return;
  
    const fetchStatuses = async () => {
      const statuses = await getListStatusesFromListObject(selectedListId, accessToken);
      console.log("✅ Status reais recebidos:", statuses);
      setStatusOptions(statuses.map((s: any) => ({ label: s.status, color: s.color || "" })));
    };
  
    fetchStatuses();
  }, [selectedListId, accessToken]);
  
  const handleMinimize = () => {
    const currentX = x.get();
    const currentY = y.get();
    const clampedX = Math.max(0, Math.min(window.innerWidth - 400, currentX));
    const clampedY = Math.max(0, Math.min(window.innerHeight - 300, currentY));
    setLastPosition({ x: clampedX, y: clampedY });
    setIsMinimized(true);
  };

  const getCurrentStatusColor = () => {
    const current = statusOptions.find((s) => s.label === status);
    return current?.color || "bg-zinc-200 text-zinc-800";
  };

  const handleCommentSubmit = () => {
    console.log("Comentário enviado:", comment);
    setComment("");
    setIsCommentDialogOpen(false);
  };


  return (
    <div>
      {isVisible && !isMinimized && (
        <div ref={containerRef} className="fixed inset-0 z-40">
        <motion.div
          ref={panelRef}
          drag
          dragConstraints={containerRef}
          dragElastic={0.15}
          style={{ x, y }}
          className="absolute max-h-screen w-[420px] overflow-y-auto bg-white border border-zinc-200 shadow-xl px-6 pt-4 pb-6 space-y-4 rounded-lg z-50"
        >
          
          <div className="flex flex-col gap-4 max-h-[calc(100vh-80px)] overflow-y-auto">

              {!accessToken ? (
                <ClickUpLoginScreen onClose={() => setIsVisible(false)} onMinimize={handleMinimize} />
              ) : !workspaceId ? (
                <div className="text-center py-10 text-zinc-500">Carregando workspace...</div>
              ) : (
                <>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-xl font-semibold">
                    {selectedTaskId && selectedTask
                    ? selectedTask.name || "Carregando tarefa..."
                    : selectedList?.name || "Espaços"}
                    </h1>
                    
          {selectedSpace && selectedList && (
            <div className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
              {/* Espaço */}
              <button
                onClick={() => {
                  if (selectedFolder || selectedList) {
                    setSelectedSpace(null);
                    setSelectedFolder(null);
                    setSelectedList(null);
                    setSelectedListId(null);
                    setSelectedTaskId(null);
                  }
                }}

                className="flex items-center gap-1 hover:underline hover:text-zinc-700 transition"
              >
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: selectedSpace.color }}
                />
                <span className="truncate max-w-[130px]">{selectedSpace.name}</span>
              </button>
              <span>/</span>

                  {/* Pasta */}
                  {selectedFolder && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedList(null);
                          setSelectedListId(null);
                          setSelectedTaskId(null);
                        }}
                        className="flex items-center gap-1 hover:underline hover:text-zinc-700 transition"
                      >
                        <FolderIcon className="w-3 h-3 text-zinc-400" />
                        <span className="truncate max-w-[130px]">{selectedFolder.name}</span>
                      </button>
                      <span>/</span>
                    </>
                  )}

                    {/* Lista */}
                    <button
                      onClick={() => {
                        setSelectedTaskId(null);
                      }}
                      className="flex items-center gap-1 hover:underline hover:text-zinc-700 transition"
                    >
                      <ListIcon className="w-3 h-3 text-zinc-400" />
                      <span
                        className="font-medium truncate max-w-[160px]"
                        style={{ color: selectedSpace.color }}
                        title={selectedList.name}
                      >
                        {selectedList.name}
                      </span>
                    </button>
                  </div>
                )}

                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleMinimize} className="text-zinc-500 hover:text-zinc-800">
                      <Minus size={16} />
                    </button>
                    <button onClick={() => setIsVisible(false)} className="text-zinc-500 hover:text-zinc-800">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {!selectedListId && !selectedTaskId && (
                  <WorkspaceExplorer
                    accessToken={accessToken!}
                    workspaceId={workspaceId}
                    onListSelect={(listId, list) => {
                      console.log("📂 Lista selecionada:", listId, list?.name);
                      setSelectedListId(listId);
                      setSelectedList(list);
                      if (list?.folder) setSelectedFolder(list.folder);
                      if (list?.space) setSelectedSpace(list.space);
                    }}                    
                  />
                )}
  
                  {folderTasks.length > 0 ? (
                  <TaskListViewer
                    tasks={folderTasks}
                    onTaskSelect={(taskId: string) => setSelectedTaskId(taskId)}
                  />
                ) : selectedListId && !selectedTaskId && (
                  <TaskListViewer
                    accessToken={accessToken} 
                    listId={selectedListId!}
                    listName={selectedList?.name || "Lista"}
                    onTaskSelect={(taskId: string) => setSelectedTaskId(taskId)}
                  />
                )}

                {selectedTaskId && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-medium text-zinc-700">Status</label>
                      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            className="text-xs font-semibold rounded px-3 py-1 transition"
                            style={{
                              backgroundColor: statusOptions.find((s) => s.label === status)?.color || "#e4e4e7",
                              color: "#ffffff",
                            }}
                          >
                            {status || "sem status"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="max-h-[200px] overflow-y-auto w-[200px] p-1 z-[9999] bg-white border border-zinc-200 rounded-md shadow-lg"
                          align="end"
                        >
                          {statusOptions.map((option) => (
                            <Button
                              key={option.label}
                              variant="ghost"
                              className="w-full justify-start px-3 py-2 text-sm font-normal rounded-sm text-zinc-800 hover:bg-zinc-100 flex items-center gap-2"
                              onClick={() => {
                                setStatus(option.label);
                                setIsPopoverOpen(false);
                              }}
                            >
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: option.color }}
                              />
                              <span className="leading-tight">{option.label}</span>
                            </Button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-zinc-700">Datas</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className="relative group">
                            <button className="flex items-center gap-2 text-sm text-zinc-700 border border-zinc-200 rounded-md px-3 py-2 pr-8 hover:bg-zinc-50 transition">
                            <CalendarIcon className="w-4 h-4 text-zinc-500" />
                            {startDate?.toLocaleDateString("pt-BR") || "Início"} →
                            <CalendarIcon className="w-4 h-4 text-zinc-500" />
                            {dueDate?.toLocaleDateString("pt-BR") || "Vencimento"}
                              </button>

                              {(startDate || dueDate) && (
                                <button
                                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition"
                                  onClick={(e) => {
                                    e.stopPropagation(); // impede o Popover de abrir
                                    setStartDate(undefined);
                                    setDueDate(undefined);
                                  }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </PopoverTrigger>

                          <PopoverContent
                            align="end"
                            className="z-[9999] w-auto bg-white p-4 rounded shadow-xl"
                          >
                            <div className="flex flex-col gap-3">
                              <Select
                                value={selectedDateType}
                                onValueChange={(value) =>
                                  setSelectedDateType(value as "start" | "due")
                                }
                              >
                                <SelectTrigger className="w-full border border-zinc-300 rounded px-3 py-2 text-sm text-zinc-700">
                                  <SelectValue placeholder="Selecionar tipo de data" />
                                </SelectTrigger>
                                <SelectContent className="z-[9999] bg-white rounded shadow-lg">
                                  <SelectItem value="start">Data inicial</SelectItem>
                                  <SelectItem value="due">Data de vencimento</SelectItem>
                                </SelectContent>
                              </Select>

                              <Calendar
                                key={selectedDateType}
                                mode="single"
                                selected={
                                  selectedDateType === "start" ? startDate : dueDate
                                }
                                onSelect={(date) => {
                                  if (!date) return;
                                  if (selectedDateType === "start") {
                                    setStartDate(date);
                                  } else {
                                    setDueDate(date);
                                  }
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
  
                    <div className="flex flex-col gap-1 relative">
                    <label className="text-sm font-medium text-zinc-700">Descrição</label>
                      <div className="relative">
                        <Textarea
                          value={description.length > 120 ? description.slice(0, 100) + "..." : description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="min-h-[120px] pr-20"
                        />
                        {description.length > 120 && (
                          <button
                            onClick={() => setDescriptionDialogOpen(true)}
                            className="absolute bottom-2 right-2 text-xs text-blue-500 underline"
                          >
                            Mostrar mais
                          </button>
                        )}
                      </div>
                      {description.length > 120 && descriptionDialogOpen && (
                        <>
                          <div className="fixed inset-0 bg-black/40 z-40" />
                          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[380px] bg-white shadow-lg rounded-md p-4">
                            <DialogHeader>
                              <h2 className="text-base font-semibold">Descrição</h2>
                            </DialogHeader>
                            <Textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="mt-2 mb-4 min-h-[120px]"
                            />
                            <DialogFooter className="flex justify-end">
                              <Button variant="outline" onClick={() => setDescriptionDialogOpen(false)}>
                                Fechar
                              </Button>
                            </DialogFooter>
                          </div>
                        </>
                      )}
                    </div>
  
                    {selectedTask?.custom_fields && (
                <div className="pt-2">
                  <h3 className="text-sm font-medium text-zinc-700 mb-2">Campos Personalizados</h3>

                  {/* Tabela com campos personalizados */}
                  <div className="max-h-[160px] overflow-y-auto pr-1 border border-zinc-200 rounded-md">
                    {selectedTask.custom_fields
                      .filter((field: CustomField) =>
                        field.value !== null &&
                        field.value !== "" &&
                        field.value !== undefined &&
                        !["dropdown", "drop_down", "label", "labels"].includes(field.type ?? "")
                      )
                      .map((field: CustomField) => (
                        <div
                          key={field.id}
                          className="flex justify-between items-center text-sm border-b border-zinc-200"
                        >
                          <div className="text-zinc-700 font-medium w-1/2 px-2 py-1 border-r border-zinc-200">
                            {field.name}
                          </div>
                          <div className="text-zinc-600 w-1/2 px-2 py-1 text-right truncate">
                          {formatCustomFieldValue(field)}
                          </div>
                        </div>
                      ))}

                    {showEmptyFields &&
                      selectedTask.custom_fields
                        .filter((field: CustomField) => !field.value)
                        .map((field: CustomField) => (
                          <div
                            key={field.id}
                            className="flex justify-between items-center text-sm border-b border-zinc-200"
                          >
                            <div className="text-zinc-700 font-medium w-1/2 px-2 py-1 border-r border-zinc-200">
                              {field.name}
                            </div>
                            <div className="text-zinc-400 w-1/2 px-2 py-1 text-right">–</div>
                          </div>
                        ))}
                  </div>

                  {/* Botão: Mostrar mais */}
                  {!showEmptyFields &&
                    selectedTask.custom_fields.some((field: CustomField) => !field.value) && (
                      <button
                        onClick={() => setShowEmptyFields(true)}
                        className="mt-2 bg-zinc-100 text-zinc-700 px-3 py-1 rounded text-sm hover:bg-zinc-200 transition"
                      >
                        Mostrar mais
                      </button>
                    )}

                  {/* Botão: Ocultar campos vazios */}
                  {showEmptyFields && (
                    <button
                      onClick={() => setShowEmptyFields(false)}
                      className="mt-3 bg-zinc-100 text-zinc-700 px-3 py-1 rounded text-sm hover:bg-zinc-200 transition"
                    >
                      Ocultar campos vazios
                    </button>
                  )}
                </div>
              )}


                    {isCommentDialogOpen && (
                      <>
                        <div className="fixed inset-0 bg-black/40 z-40" />
                        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[380px] bg-white shadow-lg rounded-md p-4">
                          <DialogHeader>
                            <h2 className="text-base font-semibold">Adicionar Comentário</h2>
                          </DialogHeader>
                          <Textarea
                            placeholder="Escreva seu comentário aqui..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="mt-4 mb-4"
                          />
                          <DialogFooter className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button className="bg-[#5C47CD] text-white hover:bg-[#4b3bb1]" onClick={handleCommentSubmit}>
                              Enviar
                            </Button>
                          </DialogFooter>
                        </div>
                      </>
                    )}
  
                    <div className="pt-4 relative flex justify-end">
                      <Button
                        className="bg-[#5C47CD] text-white hover:bg-[]"
                        onClick={() => setIsCommentDialogOpen(true)}
                      >
                        Adicionar Comentário
                      </Button>
                    </div>
  
                    <div className="pt-4 space-y-2">
                      <div>
                      <label className="text-sm font-medium text-zinc-700">Responsáveis</label>
                        <div className="flex space-x-2 mt-1">
                        {selectedTask?.assignees?.length > 0 ? (
                            selectedTask.assignees.map((user: any) => (
                              <Avatar key={user.id}>
                                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            ))
                          ) : (
                            <p className="text-sm text-zinc-500">Sem responsáveis</p>
                          )}

                        </div>
                      </div>
                      <div>
                      <label className="text-sm font-medium text-zinc-700">Tags</label>
                        {selectedTask?.tags?.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedTask.tags.map((tag: any) => (
                              <span
                                key={tag.name}
                                className="text-xs font-medium px-2 py-0.5 rounded-md text-white"
                                style={{ backgroundColor: tag.tag_bg }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-500 mt-1">Sem tags</p>
                        )}
                        </div>
                    </div>
                    <div className="pt-4">
                  <a
                    href={`https://app.clickup.com/t/${selectedTask?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-center border border-zinc-300 rounded-md py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
                  >
                    <img 
                    src="/icon.png" 
                    alt="ClickUp" 
                    className="w-5 h-5 object-contain"
                    />
                    Ver detalhes no ClickUp
                  </a>
                </div>

                  </>
                )}
              </>
            )}
            </div>
          </motion.div>
        </div>
      )}
  
      {isMinimized && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsMinimized(false)}
            className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-md hover:scale-105 transition"
          >
            <img src="/icon.png" alt="Abrir painel" className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
)};
