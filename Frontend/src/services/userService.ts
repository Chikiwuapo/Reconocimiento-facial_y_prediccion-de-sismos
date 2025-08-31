// userService.ts - Servicio de usuarios con persistencia en localStorage (TypeScript)

export type UserRole = 'Administrador' | 'Supervisor' | 'Usuario';
export type UserStatus = 'Activo' | 'Inactivo';
export type Theme = 'light' | 'dark';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null; // base64 o URL
  notifications?: boolean;
  theme?: Theme;
  createdAt: string;
  updatedAt: string;
}

export const USER_ROLES: UserRole[] = ['Administrador', 'Supervisor', 'Usuario'];
export const USER_STATUSES: UserStatus[] = ['Activo', 'Inactivo'];

const STORAGE_KEYS = {
  users: 'app_users',
  currentUserId: 'app_current_user_id',
};

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as User[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function generateId(users: User[]): number {
  const maxId = users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0);
  return maxId + 1;
}

export function getUsers(): User[] {
  return readUsers();
}

export function getUserById(id: number | string): User | null {
  return readUsers().find(u => String(u.id) === String(id)) || null;
}

export function createUser(payload: Partial<User> & { name: string; email: string; role: UserRole; status: UserStatus; avatar?: string | null; }): User {
  const users = readUsers();
  const id = generateId(users);
  const now = new Date().toISOString();
  const newUser: User = {
    id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    status: payload.status,
    avatar: payload.avatar ?? null,
    notifications: payload.notifications ?? true,
    theme: payload.theme ?? 'light',
    createdAt: now,
    updatedAt: now,
  };
  users.push(newUser);
  writeUsers(users);
  return newUser;
}

export function updateUser(id: number | string, payload: Partial<User>): User {
  const users = readUsers();
  const idx = users.findIndex(u => String(u.id) === String(id));
  if (idx === -1) throw new Error('Usuario no encontrado');
  const base = users[idx] as User;
  const updated: User = {
    ...base,
    ...payload,
    id: base.id,
    name: payload.name ?? base.name,
    email: payload.email ?? base.email,
    role: (payload.role ?? base.role) as typeof base.role,
    status: (payload.status ?? base.status) as typeof base.status,
    avatar: payload.avatar === undefined ? base.avatar : payload.avatar,
    notifications: payload.notifications !== undefined ? payload.notifications : (base.notifications ?? true),
    theme: payload.theme !== undefined ? payload.theme : (base.theme ?? 'light'),
    createdAt: base.createdAt,
    updatedAt: new Date().toISOString(),
  };
  users[idx] = updated;
  writeUsers(users);
  return updated;
}

export function deleteUser(id: number | string): void {
  const users = readUsers();
  const filtered = users.filter(u => String(u.id) !== String(id));
  writeUsers(filtered);
}

export function getCurrentUser(): User | null {
  const id = localStorage.getItem(STORAGE_KEYS.currentUserId);
  if (!id) return null;
  return getUserById(id);
}

export function setCurrentUser(id: number | string): void {
  localStorage.setItem(STORAGE_KEYS.currentUserId, String(id));
}

export function updateCurrentUser(payload: Partial<User>): User {
  const current = getCurrentUser();
  if (!current) throw new Error('No hay usuario actual');
  return updateUser(current.id, payload);
}

// Helpers de rol
export function isAdmin(user?: User | null): boolean {
  return (user?.role || '').toString() === 'Administrador';
}

export function isSupervisor(user?: User | null): boolean {
  return (user?.role || '').toString() === 'Supervisor';
}

(function bootstrap() {
  const users = readUsers();
  if (users.length === 0) {
    const admin = createUser({
      name: 'Admin',
      email: 'admin@example.com',
      role: 'Administrador',
      status: 'Activo',
      avatar: null,
      notifications: true,
      theme: 'light',
    });
    setCurrentUser(admin.id);
  } else {
    const current = localStorage.getItem(STORAGE_KEYS.currentUserId);
    if (!current) {
      setCurrentUser(users[0].id);
    }
  }
})(); 