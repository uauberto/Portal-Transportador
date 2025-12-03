import { User, UserRole, Transportadora } from '../types';

const API_URL = 'http://localhost:3001/api';
const SESSION_KEY = 'portal_session';

// --- Helper for API calls ---
async function apiFetch(endpoint: string, options: RequestInit = {}) {
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
    
    // Handle empty responses for DELETE, etc.
    if (response.status === 204) {
        return null;
    }

    return response.json();
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3001.');
    }
    // Re-throw other errors
    throw error;
  }
}

// --- Session Management ---
const setSession = (user: User) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// --- Authentication Service ---
export const login = async (email: string, password: string): Promise<User> => {
  const user = await apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (user && user.token) {
    setSession(user);
  }
  return user;
};

export const logout = async (): Promise<void> => {
  clearSession();
  // Em um app real, você pode querer invalidar o token no backend aqui.
};

export const getCurrentSession = (): User | null => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
};

// --- Admin User Services ---
export const getAllUsers = async (): Promise<User[]> => {
  return await apiFetch('/users');
};

export const updateUserConfig = async (userId: string, updates: Partial<User>): Promise<User> => {
  return await apiFetch(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

// --- Carrier (Transportadora) Services ---
export const getAllCarriers = async (): Promise<Transportadora[]> => {
   return await apiFetch('/carriers');
};

export const createCarrier = async (data: Omit<Transportadora, 'id'>): Promise<Transportadora> => {
  return await apiFetch('/carriers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCarrier = async (id: string, data: Partial<Transportadora>): Promise<Transportadora> => {
  return await apiFetch(`/carriers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCarrier = async (id: string): Promise<void> => {
  await apiFetch(`/carriers/${id}`, {
    method: 'DELETE',
  });
};