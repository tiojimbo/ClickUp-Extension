const API_BASE = "https://api.clickup.com/api/v2";

// Buscar espaços (Spaces) de um workspace (Team)
export async function getSpaces(workspaceId: string, accessToken: string) {
  const res = await fetch(`${API_BASE}/team/${workspaceId}/space`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await res.json();
  return data.spaces || [];
}

// Buscar pastas (Folders) dentro de um espaço
export async function getFolders(spaceId: string, accessToken: string) {
  const res = await fetch(`${API_BASE}/space/${spaceId}/folder`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await res.json();
  return data.folders || [];
}

// Buscar listas dentro de uma pasta OU espaço (caso sem pasta)
export async function getLists(id: string, noFolder = false, accessToken: string) {
  const url = noFolder
    ? `${API_BASE}/space/${id}/list`
    : `${API_BASE}/folder/${id}/list`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  return data.lists || [];
}

// Buscar tarefas dentro de uma lista
export async function getTasks(listId: string, accessToken: string) {
  const res = await fetch(`${API_BASE}/list/${listId}/task`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await res.json();
  return data.tasks || [];
}
