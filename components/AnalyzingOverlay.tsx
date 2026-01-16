import React, { useState, useEffect } from 'react';
import { PetType } from '../types';

interface AnalyzingOverlayProps {
  petType: PetType;
}

const AnalyzingOverlay: React.FC<AnalyzingOverlayProps> = ({ petType }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const messages = petType === PetType.CAT 
    ? ["Decyphering meows", "Checking whiskers resonance", "Consulting the feline elders", "Translating purrs"]
    : ["Translating woofs", "Analyzing tail wag frequency", "Interpreting barks", "Checking treat motivation levels"];

  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-pink-400/20 rounded-full animate-ping"></div>
          <div className="absolute inset-4 bg-pink-400/10 rounded-full animate-pulse"></div>
          
          <div className="relative z-10 w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center text-4xl border-4 border-white">
            <span className="animate-bounce">
              {petType === PetType.CAT ? '🐱' : '🐶'}
            </span>
            <div className="absolute -top-2 -right-2 text-2xl animate-spin-slow">
              ✨
            </div>
          </div>
          
          <div className="absolute inset-0 animate-spin-slow pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xl">🦴</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xl">🐟</div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xl">🐾</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xl">🧶</div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-xl font-bold text-slate-800 transition-all duration-500">
            {messages[messageIdx]}{dots}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 animate-pulse">
            Gemini AI is decyphering...
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AnalyzingOverlay;