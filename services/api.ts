// --- Centralized API configuration and fetch helper ---

const API_URL = 'http://localhost:3001/api';

/**
 * A centralized helper function for making API calls to the backend.
 * It standardizes headers, error handling, and response parsing.
 * @param endpoint The API endpoint to call (e.g., '/login').
 * @param options The standard RequestInit options for fetch.
 * @returns A promise that resolves with the JSON response.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Ocorreu um erro na comunicação com o servidor.');
    }
    
    // Handle empty responses for methods like DELETE.
    if (response.status === 204) {
        return null;
    }

    return response.json();
  } catch (error: any) {
    // This specifically catches network errors (e.g., backend is down).
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3001.');
    }
    // Re-throw other caught errors (like JSON parsing errors or custom errors).
    throw error;
  }
}
