import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/logo.png';

const LOADING_STEPS = [
  "Iniciando Protocolos NonoTV Elite...",
  "Sincronizando Malha de Satélites...",
  "Mapeando Transponders Digitais...",
  "Otimizando Fluxo de Dados HDR...",
  "Verificando Segurança da Camada...",
  "Sintonização Completa. Bem-vindo."
];

export default function SplashScreen({ onFinish }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logoPhase, setLogoPhase] = useState('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setLogoPhase('scale'), 100);
    const t2 = setTimeout(() => setLogoPhase('settle'), 900);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => prev >= 100 ? 100 : prev + 1);
    }, 30);

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
      style={{ backgroundColor: '#000000' }}
    >
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] border border-white/[0.06] rounded-full animate-pulse opacity-30" />
        <div className="w-[600px] h-[600px] border border-white/[0.03] rounded-full animate-pulse opacity-15" />
        <div className="w-[1000px] h-[1000px] bg-white/[0.02] blur-[150px] rounded-full animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <div
          className="relative mb-14"
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            transition: 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 800ms ease-out',
          }}
        >
          <div className="absolute inset-0 bg-white/[0.08] blur-[80px] rounded-full animate-pulse" />
          <div className="relative w-36 h-36 md:w-48 md:h-48 bg-transparent flex items-center justify-center drop-shadow-2xl">
            <img src={logoImg} alt="NonoTV Elite" className="w-full h-full object-contain" />
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
            Nono<span className="text-white/40 italic">TV</span>
          </h1>
          <p className="text-white/20 font-bold text-[9px] md:text-[11px] uppercase tracking-[0.8em]">Elite Broadcast Network</p>
        </div>

        {/* Loading Info */}
        <div className="w-64 md:w-96 space-y-6">
          <div className="relative h-1 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.03]">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/30 to-white/70 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-white/40 transition-all duration-700">
              <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-ping" />
              <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] min-h-[1.5em] text-center">
                {LOADING_STEPS[stepIndex]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
