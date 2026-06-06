function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

function getHeaders() {
  const token = getToken();
  const headers: any = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function getTasks(params: { completed?: boolean } = {}) {
  const queryParams = new URLSearchParams();
  if (params.completed !== undefined) {
    queryParams.append("completed", params.completed.toString());
  }
  
  const url = `/api/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const res = await fetch(url, {
    credentials: "include", 
    cache: "no-store",
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return res.json();
}

export async function createTask(task: any) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    throw new Error("Failed to create task");
  }

  return res.json();
};

export async function updateTask(taskId: string, updatedData: any) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PUT",
    credentials: "include",
    headers: getHeaders(),
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) {
    throw new Error("Failed to update task");
  }
  return res.json();
}

export async function deleteTask(taskId: string) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
    credentials: "include",
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to delete task");
  }
  return res.json();
};