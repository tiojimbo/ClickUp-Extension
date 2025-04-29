import React, { useEffect, useState } from "react";
import { getSpacesByTeam } from "@/services/clickupAPI";

interface TaskSelectorProps {
  accessToken: string;
  teamId: string;
  onTaskSelect: (taskId: string) => void;
}

const TaskSelector: React.FC<TaskSelectorProps> = ({ accessToken, teamId, onTaskSelect }) => {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      if (!teamId || !accessToken) {
        console.warn("⚠️ teamId ou accessToken ausentes", { teamId, accessToken });
        return;
      }

      console.log("📥 Chamando getSpaces com:", teamId, accessToken);

      try {
        const spaces = await getSpacesByTeam(teamId, accessToken);
        console.log("📦 Spaces extraídos:", spaces);
        setSpaces(spaces);
      } catch (err) {
        console.error("❌ Erro ao buscar espaços via getSpacesByTeam:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, [teamId, accessToken]);

  if (loading) {
    return <div className="text-center text-zinc-500 py-4">Carregando espaços...</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-700 mb-2">Selecionar Espaço</h3>
      {spaces.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum espaço encontrado.</p>
      ) : (
        <ul className="space-y-1">
          {spaces.map((space: any) => (
            <li key={space.id}>
              <button
                className="w-full text-left px-3 py-2 rounded hover:bg-zinc-100 border border-zinc-200 text-sm"
                onClick={() => {
                  console.log("Espaço selecionado:", space);
                  onTaskSelect(space.id); // ou talvez carregar folders/lists aqui
                }}
              >
                {space.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskSelector;
