import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './FacialLogin.css';
import { loginFace, me } from '@/services/auth';
import { speak } from '@/utils/tts';
import { saveFaceSnapshot, setCurrentUserFromBackendProfile } from '@/services/userService';

const videoConstraints = { width: 640, height: 480, facingMode: 'user' };

// Precarga de MediaPipe en paralelo a la inicialización del video
const FACE_MESH_IMPORT = Promise.all([
  import('@mediapipe/face_mesh'),
  import('@mediapipe/camera_utils'),
]);

const FacialLogin: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false); // login loading
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [faceReady, setFaceReady] = useState(false); // FaceMesh cargado
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceStable, setFaceStable] = useState(false);
  const stableCounterRef = useRef(0);
  // Fases de UI para login
  const [phase, setPhase] = useState<'idle'|'detecting'|'analyzing'|'no_match'>('idle');
  const phaseRef = useRef<'idle'|'detecting'|'analyzing'|'no_match'>('idle');
  const attemptActiveRef = useRef(false);
  const farRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const lastSpeakRef = useRef<{code: string, at: number} | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const cameraRef = useRef<any>(null);
  const faceMeshRef = useRef<any>(null);
  const runningRef = useRef<boolean>(false);
  const lastDrawAtRef = useRef<number>(0);
  const farFramesRef = useRef(0);
  const nearFramesRef = useRef(0);
  const lastLoginShotRef = useRef<string | null>(null);
  // Controlar rojo temporal cuando no hay coincidencias (solo ref para evitar estado obsoleto en callbacks)
  const noMatchUntilRef = useRef<number>(0);

  // Componente de LOGIN únicamente

  // Mantener phase disponible en callbacks de MediaPipe
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const canSubmit = useMemo(() => true, []);

  const captureDataURL = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (!shot) throw new Error('No se pudo capturar imagen de la cámara');
    return shot; // dataURL base64
  }, []);

  // Helpers de progreso
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

  const afterLoginSuccess = useCallback((token: string) => {
    localStorage.setItem('access_token', token);
    setMsg('Autenticado. Redirigiendo al dashboard...');
    // Forzamos re-render de App al cambiar el token
    setTimeout(() => window.location.reload(), 600);
  }, []);

  // Inicializa MediaPipe FaceMesh con importación dinámica
  useEffect(() => {
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
          minDetectionConfidence: 0.4, // más permisivo para demo
          minTrackingConfidence: 0.4,  // más permisivo para demo
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
            if (stableCounterRef.current > 3) setFaceStable(true); // umbral más rápido para habilitar acciones

            // Calcular "lejanía" usando distancia interocular (landmarks 33 y 263)
            // Histéresis: exigir 4 frames consecutivos para cambiar de estado
            let isFar = false;
            try {
              const L = landmarks[33];
              const R = landmarks[263];
              if (L && R) {
                const dx = (L.x - R.x);
                const dy = (L.y - R.y);
                const dist = Math.hypot(dx, dy); // ~proporcional al tamaño de rostro
                const FAR_THRESHOLD = 0.16; // más sensible (valor mayor => detecta "lejos" antes)
                const rawFar = dist < FAR_THRESHOLD;
                if (rawFar) {
                  farFramesRef.current = Math.min(farFramesRef.current + 1, 10);
                  nearFramesRef.current = 0;
                } else {
                  nearFramesRef.current = Math.min(nearFramesRef.current + 1, 10);
                  farFramesRef.current = 0;
                }
                if (farRef.current) {
                  // Para volver a "cerca" requerimos 4 frames cerca
                  if (nearFramesRef.current >= 4) isFar = false; else isFar = true;
                } else {
                  // Para pasar a "lejos" requerimos 4 frames lejos
                  if (farFramesRef.current >= 4) isFar = true; else isFar = false;
                }
              }
            } catch {}
            farRef.current = isFar;

            // Dibujo de malla (tesselation) y puntos
            // Color con prioridad con rojo temporal: no_match (<=2s) > rosa (lejos) > fases (login) > verde
            let color = '#22c55e'; // verde por defecto
            const nowTs = Date.now();
            if (phaseRef.current === 'no_match' && nowTs < noMatchUntilRef.current) {
              color = '#EF4444'; // rojo temporal
            } else if (farRef.current) {
              color = '#EC4899'; // rosa
            } else if (attemptActiveRef.current) {
              if (phaseRef.current === 'detecting') color = '#3B82F6'; // azul
              else if (phaseRef.current === 'analyzing') color = '#F59E0B'; // amarillo
            }
            // Malla - líneas
            const w = canvasEl.width;
            const h = canvasEl.height;
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

            // Puntos (landmarks)
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

            // Aviso en tiempo real si estás lejos (anti-spam) en login y registro.
            // Evitar hablar si estamos en estado rojo (no_match)
            if (farRef.current && phaseRef.current !== 'no_match') {
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
        // Guardar refs para reinicios
        cameraRef.current = camera;
        faceMeshRef.current = faceMesh;
        runningRef.current = true;
      } catch (e) {
        console.warn('FaceMesh no disponible. Instala @mediapipe/face_mesh, @mediapipe/camera_utils, @mediapipe/drawing_utils');
        setFaceReady(false);
      }
    }

    // Espera a que el video esté listo
    const waitForVideo = setInterval(() => {
      const video = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
      if (video && video.readyState >= 2) {
        clearInterval(waitForVideo);
        init();
      }
    }, 100);

    // Watchdog: si no se dibuja por >2s y el video está listo, intentamos relanzar frame
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
          // Si no hay frames recientes, intenta relanzar
          if (Date.now() - lastDrawAtRef.current > 2000) {
            faceMeshRef.current && faceMeshRef.current.send({ image: video });
          }
          // Si la cámara se detuvo, reiniciar
          if (cameraRef.current && cameraRef.current.start) cameraRef.current.start();
        } catch {}
      }
    };
    window.addEventListener('visibilitychange', onVisibleOrFocus);
    window.addEventListener('focus', onVisibleOrFocus);

    return () => {
      running = false;
      runningRef.current = false;
      try { camera && camera.stop && camera.stop(); } catch {}
      window.clearInterval(watchdog);
      window.removeEventListener('visibilitychange', onVisibleOrFocus);
      window.removeEventListener('focus', onVisibleOrFocus);
    };
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      // Progreso por fases
      setProgress(0);
      setError(null);
      setMsg(null);
      // Activar intento y fases de UI con TTS
      attemptActiveRef.current = true;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      setPhase('detecting');
      // Alinear TTS y barra de progreso: ambos ~2000ms
      sayOnce('detecting', 'Detectando rostro', 2000);
      animateProgressTo(35, 2000);
      timersRef.current.push(window.setTimeout(() => {
        if (!attemptActiveRef.current) return;
        if (farRef.current) {
          sayOnce('far', 'Estas muy lejos', 1000);
        }
        setPhase('analyzing');
        // Alinear TTS y barra de progreso: ambos ~2000ms
        sayOnce('analyzing', 'Analizando rostro', 2000);
        animateProgressTo(70, 2000);
      }, 2000));
      // Intentar login tras 4s (2s azul + 2s amarillo)
      await new Promise<void>((resolve) => {
        const t = window.setTimeout(() => { resolve(); }, 4000);
        timersRef.current.push(t);
      });
      if (!attemptActiveRef.current) return; // abortado
      animateProgressTo(90, 1200);
      // Reintentos automáticos: hasta 3 capturas secuenciales
      const tryOnce = async () => {
        const face_image = captureDataURL();
        lastLoginShotRef.current = face_image;
        console.log('Attempting facial login with image length:', face_image.length);
        const { access_token } = await loginFace({ face_image });
        return access_token as string;
      };
      let access_token: string | null = null;
      let lastErr: any = null;
      for (let i = 0; i < 3; i++) {
        try {
          access_token = await tryOnce();
          break;
        } catch (err) {
          lastErr = err;
          console.error(`Login attempt ${i + 1} failed:`, err);
          // pequeña espera entre reintentos
          await new Promise((r) => setTimeout(r, 200));
        }
      }
      if (!access_token) {
        console.error('All login attempts failed:', lastErr);
        throw lastErr || new Error('No se pudo autenticar');
      }
      // Obtener username/email, anunciar TTS y guardar snapshot como avatar local
      try {
        const meData = await me(access_token);
        if (meData?.username) {
          try { localStorage.setItem('username', meData.username); } catch {}
          speak(`Bienvenido, ${meData.username}`);
        }
        // Sincronizar currentUser local con el perfil del backend (separa perfiles correctamente)
        if (meData?.email) {
          const avatarDataUrl = lastLoginShotRef.current || null;
          setCurrentUserFromBackendProfile({ username: meData?.username, email: meData.email, avatarDataUrl });
          if (avatarDataUrl) {
            try { saveFaceSnapshot({ email: meData.email, dataUrl: avatarDataUrl, type: 'login', name: meData?.username }); } catch {}
          }
        }
      } catch {}
      clearProgressTimer();
      finishProgress();
      setMsg('Login exitoso. Redirigiendo...');
      afterLoginSuccess(access_token);
      attemptActiveRef.current = false;
      setPhase('idle');
    } catch (e: any) {
      clearProgressTimer();
      // En fallo no llevar a 100: mantener ~70-80 y resetear
      setProgress((p) => (p < 70 ? 70 : p));
      setTimeout(() => setProgress(0), 800);
      // Suprimir detalle del backend, y reflejar solo estado rojo + voz
      setError(null);
      setMsg(null);
      setPhase('no_match');
      // Activar rojo por 2.5s y luego volver a estado base
      const until = Date.now() + 2500;
      noMatchUntilRef.current = until;
      const t = window.setTimeout(() => {
        // Al vencer el rojo, si no hay otro intento, volvemos a idle
        if (phaseRef.current === 'no_match') setPhase('idle');
      }, 2500);
      timersRef.current.push(t);
      sayOnce('no_match', 'Sin registros', 800);
      attemptActiveRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Evitar spam de voz
  const sayOnce = (code: string, text: string, minIntervalMs: number) => {
    const now = Date.now();
    if (lastSpeakRef.current && lastSpeakRef.current.code === code && now - lastSpeakRef.current.at < minIntervalMs) return;
    lastSpeakRef.current = { code, at: now };
    try { speak(text); } catch {}
  };

  return (
    <div className="fl-container">
      <div className="fl-card">
        {/* Decoración: íconos flotantes (sismos / Sudamérica) */}
        <div className="fl-decor" aria-hidden>
          {/* Onda sísmica */}
          <svg className="fl-icon fl-icon-wave" width="120" height="24" viewBox="0 0 60 12" fill="none">
            <polyline points="0,6 5,2 10,9 15,4 20,10 25,6 30,11 35,3 40,9 45,5 50,10 55,6 60,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Pin/marker */}
          <svg className="fl-icon fl-icon-marker" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="10" r="2.5" fill="currentColor" />
          </svg>
          {/* Brújula simple */}
          <svg className="fl-icon fl-icon-compass" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14.8 9.2L11 11l-1.8 3.8L13 13l1.8-3.8z" fill="currentColor" />
          </svg>
        </div>
        <h1 className="fl-title">Login Facial</h1>
        <div className="fl-content">
          <div className="fl-camera">
            <div className="fl-video-wrap">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={1}
                videoConstraints={videoConstraints}
                className="fl-webcam"
              />
              <canvas ref={canvasRef} className="fl-canvas" />
            </div>
            <p className="fl-hint">Alinea tu rostro dentro del recuadro</p>
            {loading && (
              <div style={{width:'100%', maxWidth:640}}>
                <div className="fl-progress">
                  <div className="fl-progress-bar" style={{width: `${progress}%`}} />
                </div>
                <div className="fl-progress-text">{progress}%</div>
              </div>
            )}
            {!loading && (
              <div className="fl-status">
                {!faceReady && <span style={{color:'#9CA3AF'}}>Inicializando modelo facial...</span>}
                {faceReady && !faceDetected && <span style={{color:'#F59E0B'}}>No se detecta rostro</span>}
                {faceReady && faceDetected && !faceStable && <span style={{color:'#22C55E'}}>Estabilizando...</span>}
                {faceReady && faceStable && !farRef.current && <span style={{color:'#22C55E'}}>Rostro listo</span>}
                {faceReady && faceStable && farRef.current && <span style={{color:'#EC4899'}}>Acércate un poco (muy lejos)</span>}
              </div>
            )}
          </div>

          <div className="fl-form">
            {/* Componente de login: no se solicita usuario aquí */}

            {/* Instrucciones de uso */}
            <div className="fl-instructions">
              <div className="fl-instructions-title">¿Cómo iniciar sesión con tu rostro?</div>
              <ol>
                <li>Asegúrate de tener buena iluminación frontal (evita contraluz fuerte).</li>
                <li>Coloca tu rostro dentro del recuadro y mira de frente a la cámara.</li>
                <li>Quédate quieto hasta ver el estado <b>“Rostro listo”</b> y el progreso llegar a <b>100%</b>.</li>
                <li>Si aparece “muy lejos”, acércate un poco; si no detecta, reencuadra tu rostro.</li>
                <li>Cuando esté listo, pulsa <b>“Iniciar sesión (facial)”</b> y espera la verificación.</li>
              </ol>
            </div>

            <div className="fl-actions">
              <>
                <button
                  className="fl-btn primary"
                  disabled={!canSubmit || loading || !faceDetected}
                  onClick={handleLogin}
                >
                  <span>{loading ? 'Procesando...' : 'Iniciar sesión (facial)'}</span>
                </button>
              </>
            </div>

            {msg && <div className="fl-msg ok">{msg}</div>}
            {error && <div className="fl-msg err">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacialLogin;