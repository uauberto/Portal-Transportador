import { User, Transportadora } from '../types';
import { apiFetch } from './api';

const SESSION_KEY = 'portal_session';

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
  // In a real app, you might want to invalidate the token on the backend here.
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
