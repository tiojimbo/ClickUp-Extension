export async function getTaskDetails(taskId: string, accessToken: string) {
  const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
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
