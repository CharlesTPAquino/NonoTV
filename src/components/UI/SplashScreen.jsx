import React, { useState, useEffect } from 'react';

const LOADING_STEPS = [
  "Iniciando Protocolos NonoTV Elite...",
  "Sincronizando Malha de Satélites...",
  "Mapeando Transponders Digitais...",
  "Otimizando Fluxo de Dados HDR...",
  "Verificando Segurança da Camada...",
  "Sintonização Completa. Bem-vindo."
];

/**
 * NonoTV — Splash Screen Cinematográfica v2.0
 * 
 * Super Prompt: "Escala 0.5 para 1.1 (Spring) + Opacidade 0 para 1 em 800ms"
 * Transição: Fade suave do preto para o grafite da Home
 */

export default function SplashScreen({ onFinish }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logoPhase, setLogoPhase] = useState('enter');

  useEffect(() => {
    // Spring animation: scale 0.5 -> 1.1 em 800ms
    const t1 = setTimeout(() => setLogoPhase('scale'), 100);
    const t2 = setTimeout(() => setLogoPhase('settle'), 900);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 30);

    // Fade out após carregamento
    const t3 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onFinish]);

  const logoScale = logoPhase === 'enter' ? 0.5 : logoPhase === 'scale' ? 1.1 : 1;
  const logoOpacity = logoPhase === 'enter' ? 0 : 1;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#000000',
        transition: 'opacity 500ms ease',
      }}
    >
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] border border-[#F7941D]/10 rounded-full animate-pulse opacity-20" />
        <div className="w-[600px] h-[600px] border border-[#F7941D]/5 rounded-full animate-pulse opacity-10" />
        <div className="w-[1000px] h-[1000px] bg-[#F7941D]/5 blur-[150px] rounded-full animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container com Spring */}
        <div
          className="relative mb-14"
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            transition: 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 800ms ease-out',
          }}
        >
          <div className="absolute inset-0 bg-[#F7941D]/20 blur-[80px] rounded-full animate-pulse" />
          <div className="relative w-36 h-36 md:w-48 md:h-48 bg-[#1C1C1E]/40 border border-white/5 backdrop-blur-3xl rounded-[40px] flex items-center justify-center shadow-2xl">
            <span className="text-[#F7941D] font-black text-5xl md:text-6xl drop-shadow-lg">N+</span>
          </div>
        </div>

        {/* Branding */}
        <div
          className="text-center mb-16 space-y-3"
          style={{
            opacity: logoPhase === 'settle' ? 1 : 0,
            transform: logoPhase === 'settle' ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 600ms ease-out',
          }}
        >
          <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
            Nono<span className="text-[#F7941D] italic">TV</span>
          </h1>
          <p className="text-[#F7941D] font-black text-[9px] md:text-[11px] uppercase tracking-[0.8em] opacity-40">Elite Broadcast Network</p>
        </div>

        {/* Loading Info */}
        <div className="w-64 md:w-96 space-y-6">
          <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-md">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F7941D]/50 to-[#F7941D] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-[#F7941D] transition-all duration-700">
              <div className="w-1.5 h-1.5 bg-[#F7941D] rounded-full animate-ping" />
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] min-h-[1.5em] text-center">
                {LOADING_STEPS[stepIndex]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
