const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

interface ApiErrorResponse {
  message?: string;
  issues?: Array<{
    path?: string;
    message?: string;
  }>;
}

function formatApiError(error: ApiErrorResponse) {
  const issueMessages = error.issues
    ?.map((issue) => [issue.path, issue.message].filter(Boolean).join(": "))
    .filter(Boolean);

  if (issueMessages?.length) {
    return issueMessages.join("\n");
  }

  return error.message ?? "Request failed";
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(formatApiError(error));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
