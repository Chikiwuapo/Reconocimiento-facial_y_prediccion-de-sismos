import React from 'react';
import AppModal from './AppModal';

interface UserInfo {
  name: string;
  email: string;
  dni?: string;
  role?: string;
  avatar?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserInfo;
  onLogout?: () => void;
}

// NUEVO: Integrar registro facial aquí
import Webcam from 'react-webcam';
import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { registerUser, loginFace } from '@/services/auth';
import { speak } from '@/utils/tts';
import {
  getCurrentUser,
  getUsers,
  createUser,
  updateUser as updateUserSrv,
  deleteUser as deleteUserSrv,
  USER_ROLES,
  USER_STATUSES,
  isAdmin,
  type User,
  type UserRole,
  type UserStatus,
} from '@/services/userService';

const videoConstraints = { width: 640, height: 480, facingMode: 'user' } as const;

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onLogout }) => {
  // Sin datos simulados: usar lo que venga en props o vacío

  // Form state
  const [name, setName] = useState<string>(user?.name ?? '');
  const [dni, setDni] = useState<string>(user?.dni ?? '');
  const [email, setEmail] = useState<string>(user?.email ?? '');

  // Camera & process state
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faceReady, setFaceReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceStable, setFaceStable] = useState(false);
  const stableCounterRef = useRef(0);
  const farRef = useRef(false);
  const lastSpeakRef = useRef<{ code: string; at: number } | null>(null);
  const cameraRef = useRef<any>(null);
  const faceMeshRef = useRef<any>(null);
  const lastDrawAtRef = useRef<number>(0);
  const progressTimerRef = useRef<number | null>(null);
  const farFramesRef = useRef(0);
  const nearFramesRef = useRef(0);

  // Tabs & roles
  const [activeTab, setActiveTab] = useState<'perfil' | 'rostro' | 'usuarios'>('perfil');
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  // Users CRUD state (admin only)
  const [usersList, setUsersList] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uRole, setURole] = useState<UserRole>('Usuario');
  const [uStatus, setUStatus] = useState<UserStatus>('Activo');

  useEffect(() => {
    try {
      const cu = getCurrentUser();
      setCurrentUserState(cu);
      setUsersList(getUsers());
    } catch {}
  }, [isOpen]);

  const resetUForm = () => {
    setEditingUser(null);
    setUName('');
    setUEmail('');
    setURole('Usuario');
    setUStatus('Activo');
  };

  const startEditUser = (u: User) => {
    setEditingUser(u);
    setUName(u.name);
    setUEmail(u.email);
    setURole(u.role);
    setUStatus(u.status);
  };

  const saveUser = () => {
    if (!isAdmin(currentUser)) return; // permisos
    const name = uName.trim();
    const email = uEmail.trim();
    if (!name || !email) return;
    if (editingUser) {
      const updated = updateUserSrv(editingUser.id, { name, email, role: uRole, status: uStatus });
      setUsersList(prev => prev.map(x => (x.id === updated.id ? updated : x)));
      resetUForm();
    } else {
      const created = createUser({ name, email, role: uRole, status: uStatus });
      setUsersList(prev => [...prev, created]);
      resetUForm();
    }
  };

  const removeUser = (id: number) => {
    if (!isAdmin(currentUser)) return;
    deleteUserSrv(id);
    setUsersList(getUsers());
    if (editingUser?.id === id) resetUForm();
  };

  const canSubmit = useMemo(() => !!name.trim() && !!email.trim(), [name, email]);

  const captureDataURL = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (!shot) throw new Error('No se pudo capturar imagen de la cámara');
    return shot;
  }, []);

  const sayOnce = (code: string, text: string, minIntervalMs: number) => {
    const now = Date.now();
    if (lastSpeakRef.current && lastSpeakRef.current.code === code && now - lastSpeakRef.current.at < minIntervalMs) return;
    lastSpeakRef.current = { code, at: now };
    try { speak(text); } catch {}
  };

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const animateProgressTo = useCallback((target: number, durationMs: number) => {
    clearProgressTimer();
    let startPct = 0;
    setProgress((p) => { startPct = p; return p; });
    const startTime = Date.now();
    const id = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - startTime) / durationMs);
      const value = Math.round(startPct + (target - startPct) * t);
      setProgress(value);
      if (t >= 1) clearProgressTimer();
    }, 80);
    progressTimerRef.current = id as unknown as number;
  }, [clearProgressTimer]);

  const finishProgress = useCallback(() => {
    setProgress(100);
    setTimeout(() => setProgress(0), 700);
  }, []);

  // Inicializar FaceMesh como en FacialRegister
  useEffect(() => {
    let camera: any;
    let faceMesh: any;
    let running = true;

    async function init() {
      try {
        const [fm, { Camera }] = await Promise.all([
          import('@mediapipe/face_mesh'),
          import('@mediapipe/camera_utils'),
        ]);

        const { FaceMesh, FACEMESH_TESSELATION } = fm as any;

        const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
        const canvasEl = canvasRef.current;
        if (!videoEl || !canvasEl) return;

        faceMesh = new FaceMesh({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.4,
          minTrackingConfidence: 0.4,
        });

        faceMesh.onResults((results: any) => {
          if (!running) return;
          const ctx = canvasEl.getContext('2d');
          if (!ctx) return;
          lastDrawAtRef.current = Date.now();

          canvasEl.width = videoEl.videoWidth;
          canvasEl.height = videoEl.videoHeight;
          ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

          const landmarks = results.multiFaceLandmarks?.[0];
          if (landmarks) {
            setFaceDetected(true);
            stableCounterRef.current = Math.min(stableCounterRef.current + 1, 9999);
            if (stableCounterRef.current > 3) setFaceStable(true);

            // Distancia interocular para evaluar lejanía
            let isFar = false;
            try {
              const L = landmarks[33];
              const R = landmarks[263];
              if (L && R) {
                const dx = (L.x - R.x);
                const dy = (L.y - R.y);
                const dist = Math.hypot(dx, dy);
                const FAR_THRESHOLD = 0.12;
                const rawFar = dist < FAR_THRESHOLD;
                if (rawFar) {
                  farFramesRef.current = Math.min(farFramesRef.current + 1, 10);
                  nearFramesRef.current = 0;
                } else {
                  nearFramesRef.current = Math.min(nearFramesRef.current + 1, 10);
                  farFramesRef.current = 0;
                }
                if (farRef.current) {
                  isFar = !(nearFramesRef.current >= 3);
                } else {
                  isFar = farFramesRef.current >= 3;
                }
              }
            } catch {}
            farRef.current = isFar;

            // Dibujo de malla (tesselation) y puntos
            let color = '#22c55e';
            if (farRef.current) color = '#EC4899';
            const w = canvasEl.width;
            const h = canvasEl.height;

            // Malla - líneas
            if (Array.isArray(FACEMESH_TESSELATION)) {
              ctx.save();
              ctx.strokeStyle = color;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              const edges = FACEMESH_TESSELATION as Array<[number, number]>;
              for (let k = 0; k < edges.length; k++) {
                const e = edges[k] as [number, number];
                const i = e[0];
                const j = e[1];
                const p = landmarks[i];
                const q = landmarks[j];
                if (!p || !q) continue;
                ctx.moveTo(p.x * w, p.y * h);
                ctx.lineTo(q.x * w, q.y * h);
              }
              ctx.stroke();
              ctx.restore();
            }

            // Puntos
            ctx.save();
            ctx.fillStyle = color;
            const r = 3.0;
            for (let i = 0; i < landmarks.length; i++) {
              const p = landmarks[i];
              const x = p.x * w;
              const y = p.y * h;
              ctx.beginPath();
              ctx.arc(x, y, r, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            if (farRef.current) {
              // Igual que FacialRegister (sin tilde)
              sayOnce('far', 'Estas muy lejos', 1500);
            }
          } else {
            setFaceDetected(false);
            setFaceStable(false);
            stableCounterRef.current = 0;
            farRef.current = false;
          }
        });

        camera = new Camera(videoEl, {
          onFrame: async () => {
            await faceMesh.send({ image: videoEl });
          },
          width: videoConstraints.width,
          height: videoConstraints.height,
        });

        camera.start();
        setFaceReady(true);
        cameraRef.current = camera;
        faceMeshRef.current = faceMesh;
      } catch (e) {
        console.warn('FaceMesh no disponible. Instala @mediapipe/face_mesh y @mediapipe/camera_utils');
        setFaceReady(false);
      }
    }

    // Esperar a que el video esté listo
    const waitForVideo = setInterval(() => {
      const video = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
      if (video && video.readyState >= 2) {
        clearInterval(waitForVideo);
        init();
      }
    }, 200);

    // Watchdog
    const watchdog = window.setInterval(() => {
      const video = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
      if (!video) return;
      if (document.hidden) return;
      if (video.readyState >= 2 && Date.now() - lastDrawAtRef.current > 2000) {
        try { faceMeshRef.current && faceMeshRef.current.send({ image: video }); } catch {}
      }
    }, 1200);

    const onVisibleOrFocus = () => {
      const video = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
      if (!video) return;
      if (video.readyState >= 2) {
        try {
          if (Date.now() - lastDrawAtRef.current > 2000) {
            faceMeshRef.current && faceMeshRef.current.send({ image: video });
          }
          if (cameraRef.current && cameraRef.current.start) cameraRef.current.start();
        } catch {}
      }
    };
    window.addEventListener('visibilitychange', onVisibleOrFocus);
    window.addEventListener('focus', onVisibleOrFocus);

    return () => {
      try { camera && camera.stop && camera.stop(); } catch {}
      window.clearInterval(watchdog);
      window.removeEventListener('visibilitychange', onVisibleOrFocus);
      window.removeEventListener('focus', onVisibleOrFocus);
    };
  }, []);

  const handleRegister = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      // Barra de progreso como FacialRegister
      animateProgressTo(35, 1500);
      const face_image = captureDataURL();
      // Usamos "name" como username para el backend de auth
      const payload: { username: string; face_image: string; dni?: string; email?: string } = {
        username: name.trim(),
        face_image,
      };
      const dniTrim = dni.trim();
      const emailTrim = email.trim();
      if (dniTrim) payload.dni = dniTrim;
      if (emailTrim) payload.email = emailTrim;
      const res = await registerUser(payload);
      setMessage('Registro exitoso. Iniciando sesión...');
      animateProgressTo(70, 1200);
      const { access_token } = await loginFace({ face_image });
      animateProgressTo(95, 800);
      finishProgress();
      try { localStorage.setItem('access_token', access_token); } catch {}
      try { localStorage.setItem('username', res?.username || name.trim()); } catch {}
      // Opcional: cerrar modal y refrescar dashboard
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 500);
    } catch (e: any) {
      setMessage(null);
      setError(e?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  }, [name, dni, email, captureDataURL, onClose]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil de Usuario"
      size="lg"
    >
      {/* Tabs */}
      <div className="flex gap-2 px-2 md:px-4">
        <button
          className={`px-3 py-2 rounded-md text-sm ${activeTab === 'perfil' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100'}`}
          onClick={() => setActiveTab('perfil')}
        >
          Perfil
        </button>
        <button
          className={`px-3 py-2 rounded-md text-sm ${activeTab === 'rostro' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100'}`}
          onClick={() => setActiveTab('rostro')}
        >
          Registrar/Actualizar rostro
        </button>
        <button
          className={`px-3 py-2 rounded-md text-sm ${activeTab === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100'}`}
          onClick={() => setActiveTab('usuarios')}
        >
          Gestión de usuarios
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 px-2 md:px-4">
        {/* Columna izquierda */}
        <div className="flex flex-col items-center">
          {activeTab === 'rostro' ? (
            <>
              <div className="relative w-full rounded-lg overflow-hidden bg-black/70" style={{ aspectRatio: '4 / 3' }}>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={1}
                  className="w-full h-full object-cover"
                  videoConstraints={videoConstraints}
                />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
              </div>
              <div className="w-full mt-3 text-sm text-gray-700 dark:text-gray-300">
                {!faceReady && <span>Inicializando modelo facial...</span>}
                {faceReady && !faceDetected && <span>No se detecta rostro</span>}
                {faceReady && faceDetected && !faceStable && <span>Estabilizando...</span>}
                {faceReady && faceStable && !farRef.current && <span>Rostro listo</span>}
                {faceReady && faceStable && farRef.current && <span className="text-pink-400">Acércate un poco (muy lejos)</span>}
              </div>
              {loading && (
                <div className="w-full max-w-[640px]">
                  <div className="w-full h-2 bg-gray-600/40 rounded">
                    <div className="h-2 bg-blue-500 rounded transition-[width] duration-100" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-gray-400">{progress}%</div>
                </div>
              )}
            </>
          ) : activeTab === 'perfil' ? (
            <div className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <div className="text-lg font-semibold">{currentUser?.name || '—'}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{currentUser?.email || '—'}</div>
                  <div className="text-xs mt-1">
                    <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">{currentUser?.role}</span> ·{' '}
                    <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">{currentUser?.status}</span>
                  </div>
                </div>
              </div>
              {onLogout && (
                <button onClick={onLogout} className="mt-4 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg transition-colors">
                  Cerrar sesión
                </button>
              )}
            </div>
          ) : (
            <div className="w-full p-4 text-sm text-gray-600 dark:text-gray-300">
              Gestiona usuarios a la derecha. Solo Administrador puede crear/editar/eliminar.
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col space-y-4">
          {activeTab === 'rostro' && (
            <div>
              <h4 className="text-lg font-semibold">Registrar/Actualizar rostro</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex flex-col text-sm">
                  Nombre
                  <input
                    className="mt-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    disabled={loading}
                  />
                </label>
                <label className="flex flex-col text-sm">
                  DNI
                  <input
                    className="mt-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Tu DNI (opcional)"
                    disabled={loading}
                  />
                </label>
                <label className="flex flex-col text-sm md:col-span-2">
                  Correo
                  <input
                    type="email"
                    className="mt-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    disabled={loading}
                  />
                </label>

                <div className="md:col-span-2 flex flex-col space-y-2">
                  <button
                    onClick={handleRegister}
                    disabled={!canSubmit || loading || !faceDetected}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                  >
                    {loading ? 'Procesando…' : 'Registrar Usuario'}
                  </button>
                  {message && (
                    <div className="text-sm text-green-600 dark:text-green-400">{message}</div>
                  )}
                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="space-y-2 text-sm">
              <div><b>Nombre:</b> {currentUser?.name || '—'}</div>
              <div><b>Correo:</b> {currentUser?.email || '—'}</div>
              <div><b>Rol:</b> {currentUser?.role || '—'}</div>
              <div><b>Estado:</b> {currentUser?.status || '—'}</div>
              <div className="text-xs text-gray-500">Solo un Administrador puede cambiar roles y crear usuarios.</div>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Gestión de usuarios</h4>
                {!isAdmin(currentUser) && <span className="text-xs text-gray-500">Solo lectura (no eres Administrador)</span>}
              </div>
              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-md border-gray-300 dark:border-gray-700">
                <label className="text-sm">Nombre<input className="mt-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" value={uName} onChange={e=>setUName(e.target.value)} disabled={!isAdmin(currentUser)} /></label>
                <label className="text-sm">Correo<input className="mt-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" value={uEmail} onChange={e=>setUEmail(e.target.value)} disabled={!isAdmin(currentUser)} /></label>
                <label className="text-sm">Rol<select className="mt-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" value={uRole} onChange={e=>setURole(e.target.value as UserRole)} disabled={!isAdmin(currentUser)}>{USER_ROLES.map(r=> <option key={r} value={r}>{r}</option>)}</select></label>
                <label className="text-sm">Estado<select className="mt-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" value={uStatus} onChange={e=>setUStatus(e.target.value as UserStatus)} disabled={!isAdmin(currentUser)}>{USER_STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}</select></label>
                <div className="md:col-span-2 flex gap-2 pt-1">
                  <button className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-60" onClick={saveUser} disabled={!isAdmin(currentUser)}>{editingUser? 'Guardar cambios':'Crear usuario'}</button>
                  {editingUser && <button className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700" onClick={resetUForm} disabled={!isAdmin(currentUser)}>Cancelar</button>}
                </div>
              </div>
              {/* Tabla */}
              <div className="overflow-auto border border-gray-300 dark:border-gray-700 rounded-md">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Nombre</th>
                      <th className="text-left p-2">Correo</th>
                      <th className="text-left p-2">Rol</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-2">{u.id}</td>
                        <td className="p-2">{u.name}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">{u.role}</td>
                        <td className="p-2">{u.status}</td>
                        <td className="p-2 flex gap-2">
                          <button className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700" onClick={()=>startEditUser(u)} disabled={!isAdmin(currentUser)}>Editar</button>
                          <button className="px-2 py-1 rounded bg-red-600 text-white disabled:opacity-60" onClick={()=>removeUser(u.id)} disabled={!isAdmin(currentUser)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default ProfileModal;