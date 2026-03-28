import React, { useState, useEffect } from 'react';
import { EliteLogo } from '../Layout/Sidebar';

const LOADING_STEPS = [
  "Iniciando Protocolos Nonoh Elite...",
  "Sincronizando Malha de Satélites...",
  "Mapeando Transponders Digitais...",
  "Otimizando Fluxo de Dados HDR...",
  "Verificando Segurança da Camada...",
  "Sintonização Completa. Bem-vindo."
];

export default function SplashScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 30);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-bg-dark flex flex-col items-center justify-center overflow-hidden font-body">
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] border border-primary/10 rounded-full animate-pulse opacity-20" />
        <div className="w-[600px] h-[600px] border border-primary/5 rounded-full animate-pulse opacity-10 animation-delay-500" />
        <div className="w-[1000px] h-[1000px] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="animate-scanline opacity-5" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <div className="relative mb-14 group">
          <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full animate-pulse" />
          <div className="relative w-36 h-36 md:w-48 md:h-48 bg-bg-secondary/40 border border-white/5 backdrop-blur-3xl rounded-[40px] flex items-center justify-center shadow-elevation-2xl transform transition-transform duration-1000 hover:scale-105">
            <EliteLogo className="w-20 h-20 md:w-24 md:h-24 text-primary drop-shadow-glow animate-bounce-slow" />
            
            {/* Scanning Effect Overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 shadow-glow-sm animate-scanline-fast opacity-50" />
          </div>
        </div>

        {/* Branding - NonohTV */}
        <div className="text-center mb-16 space-y-3">
          <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none font-display">
            Nonoh<span className="text-primary italic">TV</span>
          </h1>
          <p className="text-primary font-black text-[9px] md:text-[11px] uppercase tracking-[0.8em] opacity-40">Elite Broadcast Network</p>
        </div>

        {/* Loading Info */}
        <div className="w-64 md:w-96 space-y-6">
           {/* Progress Bar Container */}
           <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-md">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/50 to-primary shadow-glow-md transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
           </div>

           {/* Step Info */}
           <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4 text-primary transition-all duration-700">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping shadow-glow-sm" />
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
