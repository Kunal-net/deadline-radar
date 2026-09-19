const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  code?: string;
  status: number;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('deadline_radar_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: { error?: { code?: string; message?: string; details?: unknown } } = {};
    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parse failure
    }

    const message =
      errorData.error?.message ||
      `HTTP error ${response.status}: ${response.statusText}`;

    throw new ApiError(
      message,
      response.status,
      errorData.error?.code,
      errorData.error?.details
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
