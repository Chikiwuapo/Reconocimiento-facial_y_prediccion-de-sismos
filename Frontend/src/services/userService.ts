// userService.ts - Servicio de usuarios con persistencia en localStorage (TypeScript)
import { registerUser, type RegisterPayload } from './auth';

export type UserRole = 'CEO' | 'Administrador' | 'Supervisor' | 'Usuario';
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

export const USER_ROLES: UserRole[] = ['CEO', 'Administrador', 'Supervisor', 'Usuario'];
export const USER_STATUSES: UserStatus[] = ['Activo', 'Inactivo'];

const STORAGE_KEYS = {
  users: 'app_users',
  currentUserId: 'app_current_user_id',
};

// Mapa persistente de roles por email (permite controlar permisos sin tocar DB)
const ROLE_KEY = 'app_user_roles';
type RoleStore = Record<string, UserRole>;
function readRoles(): RoleStore {
  try {
    const raw = localStorage.getItem(ROLE_KEY);
    return raw ? (JSON.parse(raw) as RoleStore) : {};
  } catch { return {}; }
}
function writeRoles(map: RoleStore) { localStorage.setItem(ROLE_KEY, JSON.stringify(map)); }
export function getRoleByEmail(email?: string | null): UserRole | null {
  if (!email) return null;
  const roles = readRoles();
  return (roles[email] as UserRole) || null;
}
export function setRoleByEmail(email: string, role: UserRole): void {
  const roles = readRoles();
  roles[email] = role;
  writeRoles(roles);
}

export function grantAdminByEmail(email: string): void { setRoleByEmail(email, 'Administrador'); }
export function revokeAdminByEmail(email: string): void {
  const roles = readRoles();
  if (roles[email]) { delete roles[email]; writeRoles(roles); }
}
export function grantCEOByEmail(email: string): void { setRoleByEmail(email, 'CEO'); }
export function revokeCEOByEmail(email: string): void {
  const roles = readRoles();
  if (roles[email] === 'CEO') { delete roles[email]; writeRoles(roles); }
}
export function getAllRoleMappings(): Array<{ email: string; role: UserRole }>{
  const roles = readRoles();
  const out: Array<{ email: string; role: UserRole }> = [];
  for (const email of Object.keys(roles)) {
    const role = roles[email];
    if (role) out.push({ email, role });
  }
  return out;
}

// Visibilidad de secciones según permisos
export type SectionKey = 'perfil' | 'rostro' | 'usuarios' | 'permisos';
export function visibleSectionsFor(user?: User | null): SectionKey[] {
  if (isAdmin(user) || isCEO(user)) return ['perfil', 'rostro', 'usuarios', 'permisos'];
  return ['perfil'];
}
export function canManageUsers(user?: User | null): boolean { return isAdmin(user) || isCEO(user); }
export function canEditPermissions(user?: User | null): boolean { return isAdmin(user) || isCEO(user); }
export function isRegularUser(user?: User | null): boolean { return !isAdmin(user) && !isSupervisor(user) && !isCEO(user); }
export function getCurrentUserRole(): UserRole | null { return getRoleByEmail(getCurrentUser()?.email || null) || (getCurrentUser()?.role ?? null); }

// Normalizador genérico de errores provenientes del backend
export function normalizeBackendError(e: any, fallback = 'Error'): string {
  const raw = String(e?.message || e || fallback);
  try {
    const maybe = JSON.parse(raw);
    if (maybe?.detail) return String(maybe.detail);
  } catch {}
  const m = raw.match(/detail\"?\s*:\s*\"([^\"]+)/i) || raw.match(/\{\s*"detail"\s*:\s*"([^"]+)/);
  if (m && m[1]) return m[1];
  if (/existe por email o DNI/i.test(raw)) return 'Usuario ya existe por email o DNI';
  return raw;
}

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

// Sincroniza el usuario local con el perfil del backend tras login exitoso
export function setCurrentUserFromBackendProfile(p: { username?: string; email: string; avatarDataUrl?: string | null }): User {
  const email = p.email;
  const username = (p.username || '').trim() || (email.split('@')[0] || 'Usuario');
  const users = readUsers();
  let user = users.find(u => u.email === email) || null;
  if (!user) {
    user = createUser({
      name: username,
      email,
      role: 'Usuario',
      status: 'Activo',
      avatar: p.avatarDataUrl ?? null,
    });
  } else {
    user = updateUser(user.id, { name: username, avatar: p.avatarDataUrl ?? user.avatar });
  }
  // Si el usuario es "Eduard" y no tiene rol mapeado aún, promover a CEO para permitir secciones de administración
  try {
    const existingRole = getRoleByEmail(email);
    if (!existingRole && username === 'Eduard') {
      setRoleByEmail(email, 'CEO');
      // Opcionalmente reflejar también en el objeto local
      try { user = updateUser(user.id, { role: 'CEO' }); } catch {}
    }
  } catch {}
  setCurrentUser(user.id);
  return user;
}

// Helpers de rol
export function isAdmin(user?: User | null): boolean {
  const byRole = (user?.role || '').toString() === 'Administrador' || (getRoleByEmail(user?.email || null) === 'Administrador');
  return !!byRole;
}

export function isSupervisor(user?: User | null): boolean {
  return (user?.role || '').toString() === 'Supervisor';
}

export function isCEO(user?: User | null): boolean {
  const byRole = (user?.role || '').toString() === 'CEO' || (getRoleByEmail(user?.email || null) === 'CEO');
  return !!byRole;
}

// bootstrap eliminado: no crear usuario Admin por defecto ni forzar sesión.

// ==== Extensiones para integración con backend/auth y snapshots faciales ====

const AUTH_API = (import.meta as any).env?.VITE_AUTH_API || 'http://localhost:8001';

type SnapshotType = 'login' | 'register';

type SnapshotStore = Record<string, {
  lastImage?: string; // dataURL
  loginAt?: string;
  registerAt?: string;
}>;

const SNAPSHOT_KEY = 'app_user_face_snapshots';

function readSnapshots(): SnapshotStore {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) as SnapshotStore : {};
  } catch {
    return {};
  }
}

function writeSnapshots(data: SnapshotStore) {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data));
}

export async function fetchAllUsersFromBackend(): Promise<Array<{username: string; email: string;}>> {
  const res = await fetch(`${AUTH_API}/auth/users`);
  if (!res.ok) throw new Error(await res.text());
  const list = await res.json();
  // Normalizar mínimo a username/email si vienen más campos
  return (Array.isArray(list) ? list : []).map((u: any) => ({
    username: String(u?.username ?? ''),
    email: String(u?.email ?? ''),
  }));
}

// ==== Gestión de usuarios (lectura directa de user.db vía backend) ====
export type BackendUser = {
  id: number;
  username: string;
  email: string;
  dni?: string | null | undefined;
  created_at?: string;
};

export async function fetchUsersForManagement(): Promise<BackendUser[]> {
  const res = await fetch(`${AUTH_API}/auth/users`);
  if (!res.ok) throw new Error(await res.text());
  const list = await res.json();
  return (Array.isArray(list) ? list : []).map((u: any) => ({
    id: Number(u?.id ?? 0),
    username: String(u?.username ?? ''),
    email: String(u?.email ?? ''),
    dni: u?.dni != null ? String(u.dni) : undefined,
    created_at: u?.created_at || undefined,
  }));
}

export async function deleteBackendUserByUsername(username: string): Promise<void> {
  const res = await fetch(`${AUTH_API}/auth/users/by-username/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  });
  // FastAPI devuelve 204 sin cuerpo; considerar 200-299 como éxito
  if (!res.ok && res.status !== 204) {
    throw new Error(await res.text());
  }
}

export async function updateBackendUser(userId: number, payload: { username?: string; email?: string; dni?: string | undefined }): Promise<BackendUser> {
  const res = await fetch(`${AUTH_API}/auth/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  const u = await res.json();
  return { id: Number(u.id), username: String(u.username), email: String(u.email), dni: u?.dni };
}

export async function fetchEmailsFromBackend(): Promise<string[]> {
  const users = await fetchAllUsersFromBackend();
  return users.map(u => u.email).filter(Boolean);
}

export async function fetchProfileFromToken(token: string): Promise<{username?: string; email?: string;}> {
  const res = await fetch(`${AUTH_API}/auth/me?token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { username: data?.username, email: data?.email };
}

export function saveFaceSnapshot(params: { email: string; name?: string; dataUrl: string; type: SnapshotType }): void {
  const { email, name, dataUrl, type } = params;
  const users = readUsers();
  const idx = users.findIndex(u => u.email === email);
  const nowIso = new Date().toISOString();

  if (idx === -1) {
    // Crear usuario local para UI pero SIN cambiar la sesión actual (mantener admin)
    createUser({
      name: name || email.split('@')[0] || 'Usuario',
      email,
      role: 'Usuario',
      status: 'Activo',
      avatar: dataUrl,
    });
  } else {
    const existing = users[idx]!;
    updateUser(existing.id, { avatar: dataUrl });
  }

  // Guardar en snapshots
  const snaps = readSnapshots();
  const prev = snaps[email] || {};
  const next: { lastImage?: string; loginAt?: string; registerAt?: string } = { ...prev };
  next.lastImage = dataUrl;
  if (type === 'login') next.loginAt = nowIso;
  if (type === 'register') next.registerAt = nowIso;
  snaps[email] = next;
  writeSnapshots(snaps);
}

export function getLastSnapshot(email: string): { image?: string; loginAt?: string; registerAt?: string } | null {
  const snaps = readSnapshots();
  const s = snaps[email];
  if (!s) return null;
  const out: { image?: string; loginAt?: string; registerAt?: string } = {};
  if (s.lastImage) out.image = s.lastImage;
  if (s.loginAt) out.loginAt = s.loginAt;
  if (s.registerAt) out.registerAt = s.registerAt;
  return out;
}

// ==== API de alto nivel para Registro con Snapshot + Perfil ====

export type RegisterWithSnapshotParams = {
  username: string;
  dataUrl: string; // imagen capturada (dataURL)
  dni?: string;
  email?: string; // si no se provee, se usará el del backend o uno autogenerado
};

export type ProfileDisplay = {
  name: string;
  email: string;
  avatar: string | null;
};

export async function registerWithSnapshot(params: RegisterWithSnapshotParams): Promise<ProfileDisplay> {
  const { username, dataUrl, dni, email } = params;

  // 1) Registrar en backend (retorna al menos username/email)
  const payload: RegisterPayload = {
    username,
    face_image: dataUrl,
    ...(dni ? { dni } : {}),
    ...(email ? { email } : {}),
  };
  let res: any;
  try {
    res = await registerUser(payload);
  } catch (e: any) {
    // Limpiar mensaje de error para 400 del backend
    const raw = String(e?.message || e || 'Error');
    // Intentar parsear JSON {"detail":"..."}
    let clean = raw;
    try {
      const maybe = JSON.parse(raw);
      if (maybe?.detail) clean = String(maybe.detail);
    } catch {
      // Extraer "detail":"..."
      const m = raw.match(/detail\"?\s*:\s*\"([^\"]+)/i) || raw.match(/\{\s*"detail"\s*:\s*"([^"]+)/);
      if (m && m[1]) clean = m[1];
    }
    // Caso específico conocido
    if (/existe por email o DNI/i.test(raw)) clean = 'Usuario ya existe por email o DNI';
    throw new Error(clean);
  }
  const emailFinal: string = String(res?.email || email || `${username}@local.test`);

  // 2) Guardar snapshot local y sincronizar user local (avatar, name, email)
  saveFaceSnapshot({ email: emailFinal, name: username, dataUrl, type: 'register' });

  // 3) Ajustar/asegurar el user local con name/email
  const users = getUsers();
  const idx = users.findIndex(u => u.email === emailFinal);
  if (idx >= 0) {
    const existing = users[idx] as User; // asegurar no undefined
    updateUser(existing.id, { name: username, email: emailFinal });
    // Importante: NO cambiar la sesión actual; mantener al administrador conectado
  }

  // 4) Retornar perfil para pintar en UI inmediatamente
  const current = getUsers().find(u => u.email === emailFinal) || null;
  return {
    name: current?.name || username,
    email: emailFinal,
    avatar: current?.avatar || dataUrl || null,
  };
}

export function getProfileForDisplay(targetEmail?: string): ProfileDisplay | null {
  const user = targetEmail
    ? getUsers().find(u => u.email === targetEmail) || null
    : getCurrentUser();
  if (!user) return null;
  return { name: user.name, email: user.email, avatar: user.avatar };
}