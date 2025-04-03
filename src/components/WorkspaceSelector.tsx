import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  avatar: string;
}

interface WorkspaceSelectorProps {
  accessToken: string;
  onSelect: (workspaceId: string) => void;
}

export default function WorkspaceSelector({ accessToken, onSelect }: WorkspaceSelectorProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch("https://api.clickup.com/api/v2/team", {
          headers: {
            Authorization: accessToken,
          },
        });
        const data = await res.json();
        setWorkspaces(data.teams || []);
      } catch (error) {
        console.error("Erro ao buscar workspaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [accessToken]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 h-[400px]">
      <h2 className="text-xl font-semibold">Selecione um Workspace</h2>

      {loading ? (
        <Loader2 className="animate-spin h-6 w-6 text-zinc-500" />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => onSelect(ws.id)}
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
  );
}
