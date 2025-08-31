export type SpeakOpts = { rate?: number; pitch?: number; volume?: number; lang?: string };

export function speak(text: string, opts: SpeakOpts = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);

  // Intentar seleccionar una voz en español
  const voices = synth.getVoices();
  const preferred =
    voices.find((v) => /es(-|_)?(ES|MX|AR|CL|PE|CO|VE|UY|PY)/i.test(v.lang)) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('es')) ||
    voices[0];

  utter.voice = preferred || null;
  utter.lang = opts.lang || preferred?.lang || 'es-ES';
  utter.rate = opts.rate ?? 0.95;
  utter.pitch = opts.pitch ?? 1.0;
  utter.volume = opts.volume ?? 1.0;

  try {
    synth.cancel();
    synth.speak(utter);
  } catch {}
}

export function speakWait(text: string, opts: SpeakOpts = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return resolve();
    const synth = window.speechSynthesis;

    const play = () => {
      const utter = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices();
      const preferred =
        voices.find((v) => /es(-|_)?(ES|MX|AR|CL|PE|CO|VE|UY|PY)/i.test(v.lang)) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith('es')) ||
        voices[0];
      utter.voice = preferred || null;
      utter.lang = opts.lang || preferred?.lang || 'es-ES';
      utter.rate = opts.rate ?? 0.95;
      utter.pitch = opts.pitch ?? 1.0;
      utter.volume = opts.volume ?? 1.0;

      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      utter.onend = finish;
      utter.onerror = finish;
      try { synth.cancel(); } catch {}
      try { synth.speak(utter); } catch { finish(); }
      // Fallback: si por alguna razón no dispara eventos, resolvemos tras 1.2s
      setTimeout(finish, 1200);
    };

    // Algunas veces las voces no están listas la primera vez
    if (synth.getVoices().length === 0 && 'onvoiceschanged' in synth) {
      const handler = () => {
        try { (synth as any).onvoiceschanged = null; } catch {}
        play();
      };
      (synth as any).onvoiceschanged = handler;
      // Fallback si onvoiceschanged no se dispara
      setTimeout(() => { try { (synth as any).onvoiceschanged = null; } catch {}; play(); }, 300);
    } else {
      play();
    }
  });
}
