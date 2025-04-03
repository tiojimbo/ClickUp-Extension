import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Minus } from "lucide-react";
import TaskSelector from "./TaskSelector";

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
          className="bg-[#7b68ee] text-white hover:bg-[#6858d6] px-6 py-2 rounded-md"
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
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("OPORTUNIDADE");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [description, setDescription] = useState("Texto da descrição da tarefa que pode ser muito longa...");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [lastPosition, setLastPosition] = useState({ x: window.innerWidth - 440, y: 32 });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const storedToken = localStorage.getItem("clickup_access_token");

    if (storedToken) {
      setAccessToken(storedToken);
    } else if (code) {
      console.log("URL de troca de token:", `${import.meta.env.VITE_OAUTH_BACKEND_URL}/auth/token`);
      fetch(`${import.meta.env.VITE_OAUTH_BACKEND_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            localStorage.setItem("clickup_access_token", data.access_token);
            setAccessToken(data.access_token);
            window.history.replaceState({}, "", window.location.pathname);
          }
        })
        .catch(err => {
          console.error("Erro ao autenticar com ClickUp:", err);
        });
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

  const handleMinimize = () => {
    const currentX = x.get();
    const currentY = y.get();
    const clampedX = Math.max(0, Math.min(window.innerWidth - 400, currentX));
    const clampedY = Math.max(0, Math.min(window.innerHeight - 300, currentY));
    setLastPosition({ x: clampedX, y: clampedY });
    setIsMinimized(true);
  };

  const statusOptions = [
    { label: "OPORTUNIDADE", color: "bg-yellow-400 text-yellow-800" },
    { label: "EM QUALIFICAÇÃO", color: "bg-yellow-500 text-white" },
    { label: "AGENDA DE REUNIÃO", color: "bg-blue-500 text-white" },
    { label: "NÃO COMPARECIMENTO", color: "bg-gray-400 text-white" },
    { label: "EM ACOMPANHAMENTO", color: "bg-purple-500 text-white" },
    { label: "PERDIDO", color: "bg-black text-white" }
  ];

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
            className="absolute max-h-screen w-[420px] overflow-y-auto bg-white border border-zinc-200 shadow-xl p-6 space-y-6 rounded-lg z-50"
          >
            {!accessToken ? (
              <ClickUpLoginScreen onClose={() => setIsVisible(false)} onMinimize={handleMinimize} />
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-xl font-semibold">
                      {selectedTaskId ? "Nome da tarefa" : "Selecionar tarefa"}
                    </h1>
                    {selectedTaskId && (
                      <p className="text-sm text-zinc-500 mt-1">
                        Vendas &gt; Funil grátis &gt; Qualificação
                      </p>
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

                {!selectedTaskId ? (
                  <TaskSelector onTaskSelect={(taskId: string) => setSelectedTaskId(taskId)} />
                ) : (
                  <>
                    {/* Status */}
                    <div className="flex justify-between items-center z-[9999] p-2 rounded-md">
                      <label className="text-sm font-medium">Status</label>
                      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={`min-w-[150px] ${getCurrentStatusColor()} font-semibold`}>
                            {status}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 w-64 z-[9999] bg-white shadow-lg">
                          {statusOptions.map((option) => (
                            <Button
                              key={option.label}
                              variant="ghost"
                              className={`w-full justify-start ${option.color} font-semibold shadow-sm`}
                              onClick={() => {
                                setStatus(option.label);
                                setIsPopoverOpen(false);
                              }}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Datas */}
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-1 w-1/2">
                        <label className="text-sm font-medium">Data Inicial</label>
                        <Input value={startDate?.toLocaleDateString()} readOnly />
                      </div>
                      <div className="flex flex-col gap-1 w-1/2">
                        <label className="text-sm font-medium">Data de Vencimento</label>
                        <Input value={dueDate?.toLocaleDateString()} readOnly />
                      </div>
                    </div>

                    {/* Descrição */}
                    <div className="flex flex-col gap-1 relative">
                      <label className="text-sm font-medium">Descrição</label>
                      <div className="relative">
                        <Textarea
                          value={description.length > 120 ? description.slice(0, 100) + "..." : description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="min-h-[100px] pr-20"
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

                    {/* Campos personalizados */}
                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-2">Campos Personalizados</h3>
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="text-sm">WhatsApp</label>
                          <Input placeholder="(11) 91234-5678" />
                        </div>
                        <div className="w-1/2">
                          <label className="text-sm">E-mail</label>
                          <Input placeholder="exemplo@email.com" />
                        </div>
                      </div>
                      <div className="pt-2">
                        <label className="text-sm">Valor da Oportunidade</label>
                        <Input placeholder="R$ 5.000,00" />
                      </div>
                    </div>

                    {/* Comentários */}
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
                        className="bg-[#5C47CD] text-white hover:bg-[#4b3bb1]"
                        onClick={() => setIsCommentDialogOpen(true)}
                      >
                        Adicionar Comentário
                      </Button>
                    </div>

                    {/* Responsáveis e tags */}
                    <div className="pt-4 space-y-2">
                      <div>
                        <label className="text-sm font-medium">Responsáveis</label>
                        <div className="flex space-x-2 mt-1">
                          <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
                          <Avatar><AvatarFallback>AS</AvatarFallback></Avatar>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">#negociação</span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">#lead</span>
                        </div>
                      </div>
                    </div>

                    {/* Ver detalhes no ClickUp */}
                    <div className="pt-4">
                      <Button variant="outline" className="w-full text-sm">
                        Ver detalhes no ClickUp
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
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
  );
}
