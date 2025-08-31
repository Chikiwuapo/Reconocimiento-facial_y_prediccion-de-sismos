export type RegisterPayload = {
  username: string;
  face_image: string; // dataURL base64
  dni?: string;
  email?: string;
};

export type LoginPayload = {
  face_image: string; // dataURL base64
};

const AUTH_API = (import.meta as any).env?.VITE_AUTH_API || 'http://localhost:8001';

export async function registerUser(data: RegisterPayload) {
  const params = new URLSearchParams();
  params.append('username', data.username);
  params.append('face_image', data.face_image);
  if (data.dni) params.append('dni', data.dni);
  if (data.email) params.append('email', data.email);

  const res = await fetch(`${AUTH_API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Register error:', res.status, errorText);
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export async function loginFace(data: LoginPayload) {
  const params = new URLSearchParams();
  params.append('face_image', data.face_image);

  console.log('Attempting facial login to:', `${AUTH_API}/auth/login/face`);
  
  const res = await fetch(`${AUTH_API}/auth/login/face`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Login error:', res.status, errorText);
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  
  return res.json() as Promise<{ access_token: string; token_type: string }>;
}

export async function me(token: string) {
  const res = await fetch(`${AUTH_API}/auth/me?token=${encodeURIComponent(token)}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Me error:', res.status, errorText);
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  return res.json();
}
