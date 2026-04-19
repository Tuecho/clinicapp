const STORAGE_KEY = 'clinica_auth';

export function getAuthHeaders(): Record<string, string> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const { username, password, userId } = JSON.parse(stored);
    const headers: Record<string, string> = {};
    if (username && password) {
      headers.username = username;
      headers.password = password;
    }
    if (userId) {
      headers.userId = String(userId);
    }
    return headers;
  }
  return {};
}

export function getAuthBasic(): { username: string; password: string } | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const { username, password } = JSON.parse(stored);
    if (username && password) {
      return { username, password };
    }
  }
  return null;
}
