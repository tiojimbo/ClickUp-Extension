const API_URL = "https://api.clickup.com/api/v2";
const TOKEN = "pk_72687719_UI9ZLFXOJDJ7O3HA8C6PISP9XLRRJPER";

const headers = {
  Authorization: TOKEN,
  "Content-Type": "application/json",
};

// 🔹 Equipes
export async function getTeams() {
  const res = await fetch(`${API_URL}/team`, { headers });
  const data = await res.json();
  return data.teams || [];
}

// 🔹 Espaços
export async function getSpaces(teamId: string) {
  const res = await fetch(`${API_URL}/team/${teamId}/space`, { headers });
  const data = await res.json();
  return data.spaces || [];
}

// 🔹 Pastas
export async function getFolders(spaceId: string) {
  const res = await fetch(`${API_URL}/space/${spaceId}/folder`, { headers });
  const data = await res.json();
  return data.folders || [];
}

// 🔹 Listas (de pastas ou independentes)
export async function getLists(parentId: string, isSpaceLevel = false) {
  const endpoint = isSpaceLevel
    ? `${API_URL}/space/${parentId}/list`
    : `${API_URL}/folder/${parentId}/list`;
  const res = await fetch(endpoint, { headers });
  const data = await res.json();
  return data.lists || [];
}

// 🔹 Tarefas dentro de uma lista
export async function getTasks(listId: string) {
  const res = await fetch(`${API_URL}/list/${listId}/task`, { headers });
  const data = await res.json();
  return data.tasks || [];
}

// 🔹 Dados completos de uma tarefa
export async function getTask(taskId: string) {
  const res = await fetch(`${API_URL}/task/${taskId}`, { headers });
  const data = await res.json();
  return data;
}

// 🔹 Atualizar tarefa (status, datas, etc)
export async function updateTask(taskId: string, updates: any) {
  const res = await fetch(`${API_URL}/task/${taskId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updates),
  });
  return await res.json();
}

// 🔹 Atualizar campo personalizado
export async function updateCustomField(taskId: string, fieldId: string, value: any) {
  const res = await fetch(`${API_URL}/task/${taskId}/field/${fieldId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ value }),
  });
  return await res.json();
}

// 🔹 Adicionar comentário
export async function addComment(taskId: string, text: string) {
  const res = await fetch(`${API_URL}/task/${taskId}/comment`, {
    method: "POST",
    headers,
    body: JSON.stringify({ comment_text: text }),
  });
  return await res.json();
}
