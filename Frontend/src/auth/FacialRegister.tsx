import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './FacialLogin.css';
import { registerUser, loginFace } from '@/services/auth';
import { speak } from '@/utils/tts';

const videoConstraints = { width: 640, height: 480, facingMode: 'user' };

const FacialRegister: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faceReady, setFaceReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceStable, setFaceStable] = useState(false);
  const stableCounterRef = useRef(0);
  const farRef = useRef(false);
  const lastSpeakRef = useRef<{code: string, at: number} | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const cameraRef = useRef<any>(null);
  const faceMeshRef = useRef<any>(null);
  const runningRef = useRef<boolean>(false);
  const lastDrawAtRef = useRef<number>(0);
  const farFramesRef = useRef(0);
  const nearFramesRef = useRef(0);

  const canSubmit = useMemo(() => Boolean(username.trim()), [username]);

  const captureDataURL = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (!shot) throw new Error('No se pudo capturar imagen de la cámara');
    return shot;
  }, []);

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

  useEffect(() => {
    let camera: any;
    let faceMesh: any;
    let running = true;

    async function init() {
      try {
        const [{ FaceMesh }, { Camera }] = await Promise.all([
          import('@mediapipe/face_mesh'),
          import('@mediapipe/camera_utils'),
        ]);

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

            // Distancia interocular como proxy de lejanía
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
                  if (nearFramesRef.current >= 3) isFar = false; else isFar = true;
                } else {
                  if (farFramesRef.current >= 3) isFar = true; else isFar = false;
                }
              }
            } catch {}
            farRef.current = isFar;

            // Pintado de puntos con color por estado
            let color = '#22c55e';
            if (farRef.current) color = '#EC4899';
            const w = canvasEl.width;
            const h = canvasEl.height;
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
        runningRef.current = true;
      } catch (e) {
        console.warn('FaceMesh no disponible. Instala @mediapipe/face_mesh, @mediapipe/camera_utils');
        setFaceReady(false);
      }
    }

    const waitForVideo = setInterval(() => {
      const video = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
      if (video && video.readyState >= 2) {
        clearInterval(waitForVideo);
        init();
      }
    }, 200);

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
      setMsg(null);
      // Fases/feedback
      animateProgressTo(35, 1500);
      // Capturar
      const face_image = captureDataURL();
      // Registrar
      const u = await registerUser({ username: username.trim(), face_image });
      if (u?.username) {
        try { localStorage.setItem('username', u.username); } catch {}
        speak(`Gracias por registrarte, ${u.username}`);
      } else {
        try { localStorage.setItem('username', username.trim()); } catch {}
        speak(`Gracias por registrarte, ${username.trim()}`);
      }
      setMsg('Registro exitoso. Iniciando sesión...');
      animateProgressTo(70, 1200);
      // Auto-login con misma captura
      const { access_token } = await loginFace({ face_image });
      animateProgressTo(95, 800);
      finishProgress();
      try { localStorage.setItem('access_token', access_token); } catch {}
      setTimeout(() => window.location.reload(), 600);
    } catch (e: any) {
      setMsg(null);
      setError(e?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  }, [username, captureDataURL, animateProgressTo, finishProgress]);

  const sayOnce = (code: string, text: string, minIntervalMs: number) => {
    const now = Date.now();
    if (lastSpeakRef.current && lastSpeakRef.current.code === code && now - lastSpeakRef.current.at < minIntervalMs) return;
    lastSpeakRef.current = { code, at: now };
    try { speak(text); } catch {}
  };

  return (
    <div className="fl-container">
      <div className="fl-card">
        <h1 className="fl-title">Registro Facial</h1>
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
                {!faceReady && <span>Inicializando modelo facial...</span>}
                {faceReady && !faceDetected && <span>No se detecta rostro</span>}
                {faceReady && faceDetected && !faceStable && <span>Estabilizando...</span>}
                {faceReady && faceStable && !farRef.current && <span>Rostro listo</span>}
                {faceReady && faceStable && farRef.current && <span style={{color:'#EC4899'}}>Acércate un poco (muy lejos)</span>}
              </div>
            )}
          </div>

          <div className="fl-form">
            <label className="fl-label">
              Usuario
              <input
                className="fl-input"
                placeholder="tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </label>

            <div className="fl-actions">
              <>
                <button
                  className="fl-btn primary"
                  disabled={!canSubmit || loading || !faceDetected}
                  onClick={handleRegister}
                >
                  {loading ? 'Procesando...' : 'Registrar rostro'}
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

export default FacialRegister;
