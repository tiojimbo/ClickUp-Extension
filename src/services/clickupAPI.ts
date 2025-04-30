export async function getTaskDetails(taskId: string, accessToken: string) {
  const response = await fetch(
    `${import.meta.env.VITE_OAUTH_BACKEND_URL}/api/tasks/details/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar detalhes da tarefa");
  }

  const task = await response.json();
  return task;
}

export async function updateTask(taskId: string, accessToken: string, updates: any) {
  const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  return response.json();
}

export async function addComment(taskId: string, accessToken: string, comment: string) {
  const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}/comment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      comment,
    }),
  });
  return response.json();
}

export async function getCustomFields(taskId: string, accessToken: string) {
  const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}/field`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data.fields || [];
}

export async function getSpacesByTeam(teamId: string, accessToken: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_OAUTH_BACKEND_URL}/api/spaces?team_id=${teamId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    console.log("📡 [clickupAPI] Resposta da API /api/spaces:", JSON.stringify(data, null, 2));

    return data.spaces || [];
  } catch (error) {
    console.error("❌ [clickupAPI] Erro ao buscar espaços:", error);
    return [];
  }
}

export async function getFolders(spaceId: string, accessToken: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_OAUTH_BACKEND_URL}/api/folders?space_id=${spaceId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    console.log("📁 [clickupAPI] Folders recebidos:", data.folders);
    return data.folders || [];
  } catch (error) {
    console.error("❌ [clickupAPI] Erro ao buscar folders:", error);
    return [];
  }
}


export async function getLists(folderId: string, accessToken: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_OAUTH_BACKEND_URL}/api/lists?folder_id=${folderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    console.log("📄 [clickupAPI] Lists recebidas:", data.lists);
    return data.lists || [];
  } catch (error) {
    console.error("❌ [clickupAPI] Erro ao buscar lists:", error);
    return [];
  }
}

export async function getTasksByList(listId: string, accessToken: string) {
  const response = await fetch(`${import.meta.env.VITE_OAUTH_BACKEND_URL}/api/tasks/${listId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar tarefas");
  }
  const data = await response.json();
  return data.tasks;

}

export async function getTaskTypes(teamId: string, accessToken: string) {
  const response = await fetch(`https://api.clickup.com/api/v2/team/${teamId}/task_type`, {
    method: "GET",
    headers: {
      Authorization: accessToken,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar os tipos de tarefa");
  }

  const data = await response.json();
  return data.task_types; // array com task_type.id, name e icon
}


export async function getTaskById(taskId: string, accessToken: string) {
  const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}?include_subtasks=true&include_markdown_description=true`, {
    headers: {
      Authorization: accessToken,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar detalhes da tarefa");
  }

  return await response.json();
}


export async function getListStatusesFromListObject(listId: string, accessToken: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_OAUTH_BACKEND_URL}/api/lists/${listId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("Erro ao buscar dados da lista");

    const data = await response.json();
    return data || []; // Os status já vêm como array direto no .json()
  } catch (error) {
    console.error("Erro ao buscar status da lista:", error);
    return [];
  }
}

export async function getListsByFolder(folderId: string, accessToken: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_OAUTH_BACKEND_URL}/api/folders/${folderId}/lists`, {
      headers: {
        Authorization: accessToken,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar listas da pasta");
    }

    const data = await response.json();
    return data.lists || [];
  } catch (error) {
    console.error("❌ Erro ao buscar listas da pasta via backend:", error);
    return [];
  }
}



export const getTasks = async (listId: string, accessToken: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_OAUTH_BACKEND_URL}/api/lists/${listId}/tasks`, {
      headers: {
        Authorization: accessToken,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar tarefas da lista');
    }

    const data = await response.json();
    return data.tasks || [];
  } catch (error) {
    console.error('Erro na função getTasks:', error);
    return [];
  }
};


