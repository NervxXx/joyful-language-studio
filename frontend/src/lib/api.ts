const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getCsrfToken(): string | null {
  return document.cookie
    .split("; ")
    .find((r) => r.startsWith("csrf_token="))
    ?.split("=")[1] ?? null;
}

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { credentials = "include", headers = {}, method = "GET", ...rest } = options;
  const csrf = getCsrfToken();
  const headersWithCsrf: Record<string, string> = {
    "Content-Type": "application/json",
    "X-User-Timezone": getUserTimezone(),
    ...(headers as Record<string, string>),
  };
  if (csrf && method !== "GET" && method !== "HEAD") {
    headersWithCsrf["X-CSRF-Token"] = csrf;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    method,
    credentials,
    headers: headersWithCsrf,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || res.statusText);
  }
  return res.json();
}

export const api = {
  getStats: () => request<{
    user: { id: number; full_name: string; username: string } | null;
    words_count: number;
    streak_days: number;
    today_minutes: number;
    level: string;
    daily_goal_minutes: number;
    last_conversation: { id: number; title: string; coach_type: string } | null;
    conversations_count?: number;
  }>("/stats"),

  getStatsActivity: () =>
    request<{ activity: { date: string; minutes: number }[] }>("/stats/activity"),

  me: () =>
    request<{
      id: number;
      username: string;
      full_name: string | null;
      email: string;
    }>("/auth/me").catch(() => null),

  login: (email: string, password: string) => {
    const body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);
    const csrf = getCsrfToken();
    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
    if (csrf) headers["X-CSRF-Token"] = csrf;
    return request<{ access_token: string; user: { full_name: string } }>("/auth/login", {
      method: "POST",
      headers,
      body: body.toString(),
    });
  },

  logout: () =>
    fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }),

  updateMe: (data: {
    full_name?: string;
    password?: string;
    daily_goal_minutes?: number;
    notifications_enabled?: boolean;
    sound_enabled?: boolean;
  }) =>
    request<{ id: number; full_name: string | null }>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  exportData: () =>
    request<{ user: object; vocabulary: object[]; conversations: object[]; exported_at: string }>("/auth/me/export"),

  deleteAccount: () =>
    request<{ ok: boolean }>("/auth/me", { method: "DELETE" }),

  register: (email: string, password: string, full_name?: string) =>
    request<{ id: number; full_name: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }),

  lookupWord: (word: string) =>
    request<{ word_en: string; word_ru: string; phonetic: string | null; examples: string | null }>(
      "/vocabulary/lookup",
      { method: "POST", body: JSON.stringify({ word: word.trim() }) }
    ),

  addVocabularyWord: (data: { word_en: string; word_ru: string; phonetic?: string; example?: string; is_active?: boolean; sort_order?: number }) =>
    request<{ id: number; word_en: string; word_ru: string }>("/vocabulary/words", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateVocabularyWord: (wordId: number, data: { is_active?: boolean; sort_order?: number }) =>
    request<{ id: number; word_en: string; word_ru: string; is_active: boolean; sort_order: number }>(`/vocabulary/words/${wordId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  reorderVocabularyWords: (items: { id: number; is_active: boolean; sort_order: number }[]) =>
    request<{ ok: boolean }>("/vocabulary/words/reorder", {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),

  deleteVocabularyWord: (wordId: number) =>
    request<{ ok: boolean }>(`/vocabulary/words/${wordId}`, { method: "DELETE" }),

  getVocabularyWords: (setId?: number, activeOnly?: boolean) => {
    const params = new URLSearchParams();
    if (setId != null) params.set("set_id", String(setId));
    if (activeOnly != null) params.set("active_only", String(activeOnly));
    const q = params.toString();
    return request<{ id: number; word_en: string; word_ru: string; set_id: number | null; phonetic?: string; example?: string; is_active?: boolean; sort_order?: number }[]>(
      `/vocabulary/words${q ? `?${q}` : ""}`
    );
  },

  createChat: (params: {
    title?: string;
    avatar?: string | null;
    coachType?: string;
    context?: string;
    explainLang?: "ru" | "en";
  }) =>
    request<{ id: number; conversation_id: number; title: string; avatar?: string | null; coach_type: string }>("/chat/new", {
      method: "POST",
      body: JSON.stringify({
        title: params.title ?? "New Chat",
        avatar: params.avatar ?? null,
        coach_type: params.coachType ?? "friendly",
        context: params.context ?? null,
        explain_lang: params.explainLang ?? "ru",
      }),
    }),

  sendMessage: (
    message: string,
    conversationId?: number,
    coachType?: string,
    title?: string,
    options?: { voiceMode?: boolean; explainLang?: "ru" | "en"; extraContext?: string; vocabWords?: string[] }
  ) =>
    request<{
      conversation_id: number;
      user_message: string;
      agent_response: string;
      message_id: number;
      correction: { wrong: string; right: string; reason: string } | null;
    }>("/chat/send", {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_id: conversationId ?? null,
        coach_type: coachType ?? "friendly",
        title: title ?? null,
        voice_mode: options?.voiceMode ?? false,
        explain_lang: options?.explainLang ?? null,
        extra_context: options?.extraContext ?? null,
        vocab_words: options?.vocabWords ?? null,
      }),
    }),

  getConversation: (id: number) =>
    request<{
      id: number;
      title: string;
      avatar?: string | null;
      coach_type: string;
      context: string | null;
      explain_lang: string;
      created_at: string;
      updated_at: string;
      is_pinned: boolean;
    }>(`/conversations/${id}`),

  getConversations: () =>
    request<
      {
        id: number;
        title: string;
        avatar?: string | null;
        coach_type: string;
        explain_lang?: string;
        created_at: string;
        updated_at: string;
        is_pinned?: boolean;
      }[]
    >("/conversations/"),

  updateConversation: (
    id: number,
    data: {
      title?: string;
      avatar?: string | null;
      is_pinned?: boolean;
      coach_type?: string;
      context?: string;
      explain_lang?: "ru" | "en";
    }
  ) =>
    request<{ id: number; title: string; is_pinned: boolean; coach_type: string; explain_lang: string; updated_at: string }>(
      `/conversations/${id}`,
      { method: "PATCH", body: JSON.stringify(data) }
    ),

  deleteConversation: (id: number) =>
    request<{ ok: boolean }>(`/conversations/${id}`, { method: "DELETE" }),

  getMessages: (conversationId: number) =>
    request<
      {
        id: number;
        content: string;
        is_from_user: boolean;
        correction_wrong: string | null;
        correction_right: string | null;
        correction_reason: string | null;
        created_at: string;
      }[]
    >(`/conversations/${conversationId}/messages`),
};
