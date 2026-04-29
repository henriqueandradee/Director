export interface ApiUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface ApiCompany {
  id: string;
  userId: string;
  name: string;
  description?: string;
  market?: string;
  targetAudience?: string;
  valueProposition?: string;
  problemsSolved?: string;
  solutions?: string;
  benefits?: string;
  icp?: string;
  persona?: string;
  createdAt: string;
}

export interface ApiChat {
  id: string;
  userId: string;
  companyId: string;
  type: "marketing" | "sales" | "revenue" | "business";
  createdAt: string;
  company?: { id: string; name: string };
}

export interface ApiMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
console.log("Base URL da API em uso:", API_BASE_URL);

async function req<T>(
  method: string,
  path: string,
  options: { body?: unknown; token?: string } = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errorMsg = (err as { error?: string }).error ?? `Erro ${res.status}`;

    if (res.status === 401 && !path.startsWith("/auth")) {
      localStorage.removeItem("diretoria_token");
      localStorage.removeItem("diretoria_user");
      window.location.href = "/auth";
      throw new Error("Sessão expirada");
    }

    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const authApi = {
  register: (email: string, password: string) =>
    req<{ token: string; user: ApiUser }>("POST", "/auth/register", { body: { email, password } }),
  login: (email: string, password: string) =>
    req<{ token: string; user: ApiUser }>("POST", "/auth/login", { body: { email, password } }),
};

export const companiesApi = {
  list: (token: string) => req<ApiCompany[]>("GET", "/companies", { token }),
  create: (token: string, data: Partial<ApiCompany>) =>
    req<ApiCompany>("POST", "/companies", { token, body: data }),
  update: (token: string, id: string, data: Partial<ApiCompany>) =>
    req<ApiCompany>("PUT", `/companies/${id}`, { token, body: data }),
};

export const chatsApi = {
  list: (token: string) => req<ApiChat[]>("GET", "/chats", { token }),
  create: (token: string, companyId: string, type: string) =>
    req<ApiChat>("POST", "/chats", { token, body: { companyId, type } }),
  delete: (token: string, id: string) =>
    req<void>("DELETE", `/chats/${id}`, { token }),
};

export const messagesApi = {
  send: (token: string, chatId: string, content: string) =>
    req<ApiMessage>("POST", "/messages/send", { token, body: { chatId, content } }),
  list: (token: string, chatId: string) =>
    req<ApiMessage[]>("GET", `/messages/${chatId}`, { token }),
};
