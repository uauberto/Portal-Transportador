import { db } from './mockData';
import { User, UserRole, Transportadora } from '../types';

export const login = async (email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = db.findUser(email);

  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  // In a real app, never store or compare plain text passwords.
  if (user.password !== password) {
    throw new Error('Senha incorreta.');
  }

  const safeUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    carrierId: user.carrierId,
    token: 'local-jwt-token'
  };

  db.setSession(safeUser);
  return safeUser;
};

export const loginDemo = async (): Promise<User> => {
  return login('admin@portal.com', '123');
};

export const logout = async (): Promise<void> => {
  db.clearSession();
};

export const getCurrentSession = async (): Promise<User | null> => {
  return db.getSession();
};

// --- ADMIN USER SERVICES ---

export const getAllUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return db.getUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    carrierId: u.carrierId
  }));
};

export const updateUserConfig = async (userId: string, updates: Partial<User>): Promise<User> => {
  const users = db.getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) throw new Error('User not found');

  const updatedUser = { ...user, ...updates };
  db.saveUser(updatedUser);

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    carrierId: updatedUser.carrierId
  };
};

// --- CARRIER (TRANSPORTADORA) SERVICES ---

export const getAllCarriers = async (): Promise<Transportadora[]> => {
   await new Promise(resolve => setTimeout(resolve, 300));
   return db.getCarriers();
};

export const createCarrier = async (data: Omit<Transportadora, 'id'>): Promise<Transportadora> => {
  const newCarrier: Transportadora = {
    ...data,
    id: Math.random().toString(36).substr(2, 9)
  };
  db.saveCarrier(newCarrier);
  return newCarrier;
};

export const updateCarrier = async (id: string, data: Partial<Transportadora>): Promise<Transportadora> => {
  const carriers = db.getCarriers();
  const existing = carriers.find(c => c.id === id);
  if (!existing) throw new Error('Carrier not found');

  const updated = { ...existing, ...data };
  db.saveCarrier(updated);
  return updated;
};

export const deleteCarrier = async (id: string): Promise<void> => {
  db.deleteCarrier(id);
};
