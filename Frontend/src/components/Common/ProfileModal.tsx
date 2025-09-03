import React from 'react';
import AppModal from './AppModal';
import '../../styles/ProfileModal.css';

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
import { registerWithSnapshot, getCurrentUser as getCurrentUserSrv } from '@/services/userService';
import { speak } from '@/utils/tts';
import {
  getCurrentUser,
  fetchUsersForManagement,
  deleteBackendUserByUsername,
  isAdmin,
  isCEO,
  updateBackendUser,
  type User,
  type BackendUser,
} from '@/services/userService';

const videoConstraints = { width: 640, height: 480, facingMode: 'user' } as const;
// Precarga de MediaPipe en paralelo
const FACE_MESH_IMPORT = Promise.all([
  import('@mediapipe/face_mesh'),
  import('@mediapipe/camera_utils'),
]);

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
  // Mensajes visuales de éxito eliminados; usar TTS via speak()
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
  // Clave para forzar remount de la cámara al reingresar a la pestaña
  const [camKey, setCamKey] = useState<number>(0);

  // Tabs & roles
  const [activeTab, setActiveTab] = useState<'perfil' | 'rostro' | 'usuarios'>('perfil');
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  // Users CRUD state (admin only)
  const [usersList, setUsersList] = useState<BackendUser[]>([]);
  const [rolesVersion, setRolesVersion] = useState(0); // aún usado para forzar refresh tras cambios

  const [editForm, setEditForm] = useState<{username: string; email: string; dni?: string | null}>({ username: '', email: '', dni: '' });
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permTarget, setPermTarget] = useState<BackendUser | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BackendUser | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BackendUser | null>(null);

  useEffect(() => {
    try {
      const cu = getCurrentUser();
      setCurrentUserState(cu);
    } catch {}
  }, [isOpen]);

  useEffect(() => {
    let cancelled = false;
    if (isOpen && activeTab === 'usuarios' && (isAdmin(currentUser) || isCEO(currentUser))) {
      fetchUsersForManagement()
        .then(list => {
          if (cancelled) return;
          setUsersList(list);
          setRolesVersion(v=>v+1);
        })
        .catch(() => { if (!cancelled) setUsersList([]); });
    }
    return () => { cancelled = true; };
  }, [isOpen, activeTab]);

  // Forzar pestaña Perfil para usuarios sin permisos
  useEffect(() => {
    if (!(isAdmin(currentUser) || isCEO(currentUser)) && activeTab !== 'perfil') {
      setActiveTab('perfil');
    }
  }, [currentUser, activeTab]);

  const removeUser = async (username: string) => {
    if (!(isAdmin(currentUser) || isCEO(currentUser))) return;
    try {
      await deleteBackendUserByUsername(username);
      setUsersList(prev => prev.filter(u => u.username !== username));
    } catch {}
  };

  const openDeleteModal = (u: BackendUser) => {
    if (!(isAdmin(currentUser) || isCEO(currentUser))) return;
    setDeleteTarget(u);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => { setDeleteModalOpen(false); setDeleteTarget(null); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await removeUser(deleteTarget.username);
    closeDeleteModal();
  };

  const openEditModal = (u: BackendUser) => {
    if (!(isAdmin(currentUser) || isCEO(currentUser))) return;
    setEditTarget(u);
    setEditForm({ username: u.username, email: u.email, dni: u.dni ?? '' });
    setEditModalOpen(true);
  };
  const closeEditModal = () => { setEditModalOpen(false); setEditTarget(null); };
  const saveEditModal = async () => {
    if (!(isAdmin(currentUser) || isCEO(currentUser))) return;
    if (!editTarget) return;
    try {
      await updateBackendUser(editTarget.id, { username: editForm.username, email: editForm.email, dni: (editForm.dni ?? undefined) });
      setUsersList(prev => prev.map(it => it.id === editTarget.id ? { ...it, username: editForm.username, email: editForm.email, dni: editForm.dni || null } : it));
      closeEditModal();
    } catch (e) {
      // opcional: mostrar error
    }
  };

  const getDisplayRole = useCallback((u: BackendUser): string => {
    return (u.role as string) || 'Usuario';
  }, [rolesVersion]);

  // Abrir modal de permisos avanzados
  const openPermModal = (u: BackendUser) => {
    setPermTarget(u);
    setPermModalOpen(true);
  };
  const closePermModal = () => { setPermModalOpen(false); setPermTarget(null); };

  // Acciones dentro del modal
  const applyMakeCEO = async () => {
    if (!permTarget) return;
    if (!isCEO(currentUser)) return; // solo CEO puede
    if (currentUser?.email === permTarget.email) return; // evitar auto-cambio opcional
    try {
      await updateBackendUser(permTarget.id, { role: 'CEO' });
      setUsersList(prev => prev.map(x => x.id === permTarget.id ? { ...x, role: 'CEO' } : x));
      setRolesVersion(v=>v+1);
    } catch {}
    closePermModal();
  };

  const applyMakeAdmin = async () => {
    if (!permTarget) return;
    // CEO y Admin pueden dar admin; Admin no puede tocar CEO ni admins existentes
    const role = getDisplayRole(permTarget);
    if (isCEO(currentUser)) {
      try { await updateBackendUser(permTarget.id, { role: 'Administrador' }); setUsersList(prev => prev.map(x => x.id === permTarget.id ? { ...x, role: 'Administrador' } : x)); setRolesVersion(v=>v+1); } catch {}
      closePermModal();
      return;
    }
    if (isAdmin(currentUser)) {
      if (role === 'CEO' || role === 'Administrador') return; // restricciones
      try { await updateBackendUser(permTarget.id, { role: 'Administrador' }); setUsersList(prev => prev.map(x => x.id === permTarget.id ? { ...x, role: 'Administrador' } : x)); setRolesVersion(v=>v+1); } catch {}
      closePermModal();
    }
  };

  const applyMakeUser = async () => {
    if (!permTarget) return;
    // CEO puede devolver a Usuario; Admin no
    if (!isCEO(currentUser)) return;
    if (currentUser?.email === permTarget.email) return; // no auto-degradarse
    try { await updateBackendUser(permTarget.id, { role: 'Usuario' }); setUsersList(prev => prev.map(x => x.id === permTarget.id ? { ...x, role: 'Usuario' } : x)); setRolesVersion(v=>v+1); } catch {}
    closePermModal();
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

  // Inicializar FaceMesh optimizado (precarga y polling rápido)
  // Se re-inicializa cada vez que se entra a la pestaña 'rostro' (camKey cambia)
  useEffect(() => {
    if (activeTab !== 'rostro') return;
    let camera: any;
    let faceMesh: any;
    let running = true;

    async function init() {
      try {
        const [fm, { Camera }] = await FACE_MESH_IMPORT;

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
                const FAR_THRESHOLD = 0.16; // más sensible
                const rawFar = dist < FAR_THRESHOLD;
                if (rawFar) {
                  farFramesRef.current = Math.min(farFramesRef.current + 1, 10);
                  nearFramesRef.current = 0;
                } else {
                  nearFramesRef.current = Math.min(nearFramesRef.current + 1, 10);
                  farFramesRef.current = 0;
                }
                if (farRef.current) {
                  // volver a cerca requiere 4 frames cerca
                  isFar = !(nearFramesRef.current >= 4);
                } else {
                  // pasar a lejos requiere 4 frames lejos
                  isFar = farFramesRef.current >= 4;
                }
              }
            } catch {}
            farRef.current = isFar;

            // Dibujo de malla (tesselation) y puntos
            // Mantener rosa mientras realmente estés lejos
            const color = farRef.current ? '#EC4899' : '#22c55e';
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
    }, 100);

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
  }, [activeTab, camKey]);

  // Reiniciar/Detener cámara al cambiar de pestaña
  useEffect(() => {
    const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
    if (activeTab === 'rostro') {
      // Forzar remount para asegurar nuevo videoEl y re-init del pipeline
      setCamKey((k) => k + 1);
      // Si hay cámara instanciada (de una sesión previa), intentar arrancarla
      try { if (cameraRef.current && cameraRef.current.start) cameraRef.current.start(); } catch {}
      try { if (videoEl && faceMeshRef.current) faceMeshRef.current.send({ image: videoEl }); } catch {}
    } else {
      // Al salir, detener cámara para liberar y evitar estados zombies
      try { cameraRef.current && cameraRef.current.stop && cameraRef.current.stop(); } catch {}
      // Resetear estados para asegurar re-init limpio al volver
      setFaceReady(false);
      setFaceDetected(false);
      setFaceStable(false);
      stableCounterRef.current = 0;
      farRef.current = false;
      try { faceMeshRef.current = null; } catch {}
      try { cameraRef.current = null; } catch {}
    }
  }, [activeTab]);

  const handleRegister = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Barra de progreso como FacialRegister
      animateProgressTo(35, 1500);
      const dataUrl = captureDataURL();

      // Registrar y guardar snapshot/avatar mediante userService
      const payload: Parameters<typeof registerWithSnapshot>[0] = {
        username: name.trim(),
        dataUrl,
        ...(dni.trim() ? { dni: dni.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
      };
      await registerWithSnapshot(payload);

      // Actualizar usuario actual en el modal inmediatamente
      const cu = getCurrentUserSrv();
      setCurrentUserState(cu);

      // Quitar mensaje visual de éxito; mantener TTS si está disponible
      try { speak(`Gracias por registrarte ${name.trim()}`); } catch {}
      animateProgressTo(95, 800);
      finishProgress();
    } catch (e: any) {
      setError(e?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  }, [name, dni, email, captureDataURL]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil de Usuario"
      size="lg"
    >
      <div className="profile-modal">
      {/* Tabs: mostrar solo para Admin/CEO */}
      {(isAdmin(currentUser) || isCEO(currentUser)) && (
        <div className="pm-tabs flex gap-2 px-2 md:px-4">
          <button
            className={`px-3 py-2 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/60 ${activeTab === 'perfil' ? 'bg-sky-600 text-white shadow-sm' : 'bg-sky-50 text-slate-800 dark:bg-slate-700 dark:text-gray-100'}`}
            onClick={() => setActiveTab('perfil')}
          >
            Perfil
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/60 ${activeTab === 'rostro' ? 'bg-sky-600 text-white shadow-sm' : 'bg-sky-50 text-slate-800 dark:bg-slate-700 dark:text-gray-100'}`}
            onClick={() => setActiveTab('rostro')}
          >
            Registrar/Actualizar rostro
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/60 ${activeTab === 'usuarios' ? 'bg-sky-600 text-white shadow-sm' : 'bg-sky-50 text-slate-800 dark:bg-slate-700 dark:text-gray-100'}`}
            onClick={() => setActiveTab('usuarios')}
          >
            Gestión de usuarios
          </button>
        </div>
      )}

      <div className={`${activeTab === 'perfil' || activeTab === 'usuarios' ? 'grid grid-cols-1' : 'grid grid-cols-1 md:grid-cols-2'} gap-6 py-4 px-2 md:px-4`}>
        {/* Columna izquierda */}
        <div className="flex flex-col items-center">
          {activeTab === 'rostro' && (isAdmin(currentUser) || isCEO(currentUser)) ? (
            <>
              <div className="pm-webcam relative w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-black ring-1 ring-sky-500/30 shadow-lg" style={{ aspectRatio: '4 / 3' }}>
                <Webcam
                  key={camKey}
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={1}
                  className="w-full h-full object-cover opacity-95 transition-opacity"
                  videoConstraints={videoConstraints}
                />
                <canvas key={`c-${camKey}`} ref={canvasRef} className="absolute inset-0 w-full h-full" />
              </div>
              <div className="w-full mt-3 text-sm">
                {!faceReady && <span className="text-slate-400">Inicializando modelo facial...</span>}
                {faceReady && !faceDetected && <span className="text-amber-500">No se detecta rostro</span>}
                {faceReady && faceDetected && !faceStable && <span className="text-emerald-500">Estabilizando...</span>}
                {faceReady && faceStable && !farRef.current && <span className="text-emerald-500">Rostro listo</span>}
                {faceReady && faceStable && farRef.current && <span className="text-fuchsia-400">Acércate un poco (muy lejos)</span>}
              </div>
              {loading && (
                <div className="w-full max-w-[640px]">
                  <div className="pm-progress w-full h-2 bg-slate-600/30 rounded overflow-hidden">
                    <div className="pm-progress__bar h-2 bg-gradient-to-r from-sky-400 to-blue-600 animate-[pulse_1.2s_ease-in-out_infinite] rounded" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{progress}%</div>
                </div>
              )}

          {/* Modal Confirmar Eliminación */}
          {deleteModalOpen && deleteTarget && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="pm-card w-full max-w-lg bg-white/95 dark:bg-slate-900/90 rounded-xl p-6 shadow-2xl border border-sky-200/70 dark:border-slate-700 backdrop-blur">
                <h5 className="text-xl mb-2">Eliminar usuario</h5>
                <p className="text-sm mb-4">¿Seguro que deseas eliminar a <b>{deleteTarget.username}</b>? Esta acción afecta sólo la base de usuarios del reconocimiento facial.</p>
                <div className="flex justify-end gap-2">
                  <button className="px-3 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white" onClick={closeDeleteModal}>Cancelar</button>
                  <button className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white" onClick={confirmDelete}>Eliminar</button>
                </div>
              </div>
            </div>
          )}
            </>
          ) : activeTab === 'perfil' ? (
            <div className="pm-card w-full max-w-md mx-auto p-5 rounded-xl border border-sky-200/70 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 backdrop-blur shadow-md transition-all">
              {/* Centro: imagen grande, luego nombre y correo, y nota de administrador */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-40 h-40 rounded-xl bg-sky-50 dark:bg-slate-700 overflow-hidden ring-1 ring-sky-200/60">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="text-lg font-semibold text-center">{currentUser?.name || '—'}</div>
                <div className="pm-email text-sm text-center">{currentUser?.email || '—'}</div>
                {!(isAdmin(currentUser) || isCEO(currentUser)) && (
                  <div className="text-xs text-center text-slate-500 mt-2">
                    Solo un Administrador puede cambiar roles y crear usuarios.
                  </div>
                )}
              </div>
              {onLogout && (
                <button onClick={onLogout} className="mt-4 w-full px-4 py-2 rounded-lg text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-colors">
                  Cerrar sesión
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col space-y-4">
          {activeTab === 'rostro' && (isAdmin(currentUser) || isCEO(currentUser)) && (
            <div className="pm-card rounded-xl border border-sky-200/70 bg-white/90 dark:bg-slate-900/60 backdrop-blur p-4 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Registrar/Actualizar rostro</h4>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex flex-col text-sm">
                  <span className="font-bold text-black">Nombre</span>
                  <input
                    className="mt-1 px-3 py-2 rounded-md border border-sky-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    disabled={loading}
                  />
                </label>
                <label className="flex flex-col text-sm">
                  <span className="font-bold text-black">DNI</span>
                  <input
                    className="mt-1 px-3 py-2 rounded-md border border-sky-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Tu DNI (opcional)"
                    disabled={loading}
                  />
                </label>
                <label className="flex flex-col text-sm md:col-span-2">
                  <span className="font-bold text-black">Correo</span>
                  <input
                    type="email"
                    className="mt-1 px-3 py-2 rounded-md border border-sky-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    className="w-full px-4 py-2 text-white font-medium rounded-lg transition-all flex items-center justify-center bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-60"
                  >
                    {loading ? 'Procesando…' : 'Registrar Usuario'}
                  </button>
                  {/* Mensaje visual de éxito eliminado */}
                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal Editar Usuario */}
          {editModalOpen && editTarget && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="pm-card w-full max-w-2xl bg-white/95 dark:bg-slate-900/90 rounded-xl p-6 shadow-2xl border border-sky-200/70 dark:border-slate-700 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-xl text-black">Editar usuario</h5>
                  <button className="text-sm px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600" onClick={closeEditModal}>Cerrar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col text-sm">
                    <span className="font-bold text-black">Nombre de usuario</span>
                    <input
                      className="mt-1 px-3 py-2 rounded-md border border-sky-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </label>
                  <label className="flex flex-col text-sm">
                    <span className="font-bold text-black">Correo</span>
                    <input
                      type="email"
                      className="mt-1 px-3 py-2 rounded-md border border-sky-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </label>
                  <label className="flex flex-col text-sm md:col-span-2">
                    <span className="font-bold text-black">DNI</span>
                    <input
                      className="mt-1 px-3 py-2 rounded-md border border-sky-300 bg-white text-black focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={editForm.dni ?? ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dni: e.target.value }))}
                    />
                  </label>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button className="px-3 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white" onClick={closeEditModal}>Cancelar</button>
                  <button className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white" onClick={saveEditModal}>Guardar cambios</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'perfil' && null}

          {activeTab === 'usuarios' && (isAdmin(currentUser) || isCEO(currentUser)) && (
            <div className="space-y-4 max-w-2xl mx-auto w-full">
              <div className="flex items-center justify-center">
                <h4 className="text-lg font-semibold">Gestión de usuarios</h4>
              </div>
              {/* Tabla (solo lectura desde user.db). Sin formulario de creación. */}
              <div className="pm-table overflow-auto border border-sky-200/70 dark:border-slate-700 rounded-md shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-sky-50 dark:bg-slate-800/60">
                    <tr>
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Nombre</th>
                      <th className="text-left p-2">Correo</th>
                      <th className="text-left p-2">DNI</th>
                      <th className="text-left p-2">Rol</th>
                      <th className="text-left p-2">Permisos avanzados</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                      {usersList.map(u => {
                       const role = getDisplayRole(u);
                       return (
                         <tr key={u.id} className="border-t border-sky-200/70 dark:border-slate-700">
                          <td className="p-2">{u.id}</td>
                          <td className="p-2">
                            {u.username}
                          </td>
                          <td className="p-2">
                            {u.email}
                          </td>
                          <td className="p-2">
                            {u.dni ?? '—'}
                          </td>
                          <td className="p-2">{role}</td>
                          <td className="p-2">
                            {(isAdmin(currentUser) || isCEO(currentUser)) ? (
                              <button
                                className="px-2 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                                onClick={() => openPermModal(u)}
                              >Gestionar</button>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="p-2 flex gap-2">
                            {(isAdmin(currentUser) || isCEO(currentUser)) ? (
                              <>
                                <button
                                  className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                                  onClick={() => openEditModal(u)}
                                >Editar</button>
                                <button
                                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                                  onClick={() => openDeleteModal(u)}
                                >Eliminar</button>
                              </>
                              ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Permisos Avanzados */}
          {permModalOpen && permTarget && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="pm-card pm-perms w-full max-w-md bg-white/95 dark:bg-slate-900/90 rounded-xl p-5 shadow-2xl border border-sky-200/70 dark:border-slate-700 backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-lg text-slate-800 dark:text-slate-100">Gestionar permisos</h5>
                  <button className="text-sm px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600" onClick={closePermModal}>Cerrar</button>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  Usuario: <b>{permTarget.username}</b> — <span className="ml-1">{permTarget.email}</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded border border-sky-200/70 dark:border-slate-700">
                    <div className="font-bold text-slate-800 dark:text-slate-100 mb-2">Asignar rol</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 transition-colors"
                        onClick={applyMakeAdmin}
                        disabled={
                          (permTarget && ((permTarget.username || '').trim().toLowerCase() === 'eduard')) ||
                          (permTarget && ((permTarget.username||'').trim().toLowerCase() === 'eduard')) ||
                          (getDisplayRole(permTarget) === 'Administrador') ||
                          (currentUser?.email === permTarget.email)
                        }
                      >Hacer Administrador</button>
                      <button
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors"
                        onClick={applyMakeCEO}
                        disabled={!isCEO(currentUser) || (currentUser?.email === permTarget.email) || ((permTarget.username||'').trim().toLowerCase() === 'eduard') || (getDisplayRole(permTarget) === 'CEO')}
                      >Hacer CEO</button>
                      <button
                        className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 transition-colors"
                        onClick={applyMakeUser}
                        disabled={!isCEO(currentUser) || (currentUser?.email === permTarget.email) || ((permTarget.username||'').trim().toLowerCase() === 'eduard') || (getDisplayRole(permTarget) === 'Usuario')}
                      >Volver a Usuario</button>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      {isCEO(currentUser) ? (
                        <>
                          El CEO puede asignar y quitar cualquier rol (salvo a sí mismo).
                        </>
                      ) : (
                        <>
                          Un Administrador solo puede conceder rol de Administrador a usuarios. No puede quitarlo ni tocar roles CEO.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </AppModal>
  );
};

export default ProfileModal;