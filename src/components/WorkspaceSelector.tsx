import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, X } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  avatar: string;
}

interface WorkspaceSelectorProps {
  accessToken: string;
  onWorkspaceSelect: (workspace: Workspace) => void;
  onClose: () => void;
  onMinimize: () => void;
}

export default function WorkspaceSelector({
  accessToken,
  onWorkspaceSelect,
  onClose,
  onMinimize,
}: WorkspaceSelectorProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch("https://api.clickup.com/api/v2/team", {
          headers: {
            Authorization: accessToken,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.err || "Erro desconhecido ao buscar workspaces");
        }
        const data = await res.json();
        setWorkspaces(data.teams || []);
      } catch (err: any) {
        console.error("Erro ao buscar workspaces:", err);
        setError(err.message || "Erro ao buscar workspaces.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [accessToken]);

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

      <div className="flex flex-col items-center justify-center text-center space-y-6 h-[400px]">
        <h2 className="text-xl font-semibold">Selecione um Workspace</h2>

        {loading ? (
          <Loader2 className="animate-spin h-6 w-6 text-zinc-500" />
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : workspaces.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nenhum workspace encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => onWorkspaceSelect(ws)}
                className="flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform"
              >
                <img
                  src={ws.avatar || "/workspace-default-icon.png"}
                  alt={ws.name}
                  className="w-16 h-16 rounded-full border border-zinc-300 shadow-sm object-cover"
                />
                <span className="text-sm font-medium">{ws.name}</span>
              </button>
            ))}
          </div>
        )}

        <Button variant="outline" onClick={() => window.location.reload()}>
          Cancelar
        </Button>
      </div>
    </>
  );
}
