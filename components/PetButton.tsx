
import React, { useState, useEffect, useRef } from 'react';
import { PetType, AppState, PetProfile } from '../types';

interface PetButtonProps {
  petType: PetType;
  appState: AppState;
  selectedProfile?: PetProfile;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const PetButton: React.FC<PetButtonProps> = ({ petType, appState, selectedProfile, onStartRecording, onStopRecording }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showShortWarning, setShowShortWarning] = useState(false);
  const pressStartTime = useRef<number>(0);

  useEffect(() => {
    let interval: number;
    if (isPressed) {
      const start = Date.now();
      pressStartTime.current = start;
      setShowShortWarning(false);
      interval = window.setInterval(() => {
        const elapsed = Date.now() - start;
        const newProgress = Math.min((elapsed / 8000) * 100, 100);
        setProgress(newProgress);
        
        if (elapsed >= 8000) {
          setIsPressed(false);
          onStopRecording();
        }
      }, 50);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPressed, onStopRecording]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (appState === AppState.ANALYZING) return;
    setIsPressed(true);
    onStartRecording();
  };

  const handlePointerUp = () => {
    if (!isPressed) return;
    
    const duration = Date.now() - pressStartTime.current;
    if (duration < 2000) {
      setShowShortWarning(true);
      setTimeout(() => setShowShortWarning(false), 2000);
    }
    
    setIsPressed(false);
    onStopRecording();
  };

  const catImg = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop";
  const dogImg = "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=400&auto=format&fit=crop";
  const currentImg = petType === PetType.CAT ? catImg : dogImg;

  const radius = 140;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div 
        className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 ${
          isPressed ? 'scale-105' : 'hover:scale-105'
        }`}
        style={{ width: '320px', height: '320px' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Progress Ring */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10" 
          viewBox="0 0 300 300"
        >
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-100"
          />
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * progress) / 100}
            strokeLinecap="round"
            className="text-pink-400 transition-all duration-75"
          />
        </svg>

        {/* Glow Effect */}
        <div className={`absolute inset-10 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full blur-2xl opacity-40 transition-opacity duration-500 ${
          isPressed ? 'opacity-80' : 'opacity-0'
        }`}></div>
        
        {/* Main Image Button */}
        <div className={`relative w-64 h-64 rounded-full border-8 bg-white overflow-hidden shadow-2xl transition-all duration-300 ${
          isPressed ? 'border-pink-400' : 'border-white'
        }`}>
          <img 
            src={currentImg} 
            alt={petType} 
            className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ${
              isPressed ? 'scale-110' : ''
            }`}
          />
          
          {isPressed && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px]">
              <div className="text-white font-bold text-xl animate-pulse mb-1">
                Listening...
              </div>
              <div className="text-white/80 text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
                {progress > 95 ? "Limit Reached!" : `${(8 - (progress * 8) / 100).toFixed(1)}s left`}
              </div>
            </div>
          )}

          {showShortWarning && !isPressed && (
            <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in zoom-in duration-200">
              <span className="text-3xl mb-1">⏱️</span>
              <div className="text-white font-bold text-lg text-center px-4">
                Too Short!<br/><span className="text-xs uppercase opacity-90">Hold for 2s+</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-6 w-full">
        <p className={`text-slate-600 font-medium text-lg transition-opacity duration-300 ${isPressed ? 'opacity-0' : 'opacity-100'}`}>
          Hold to listen to {selectedProfile?.name || 'your ' + petType}
        </p>
        <div className="flex items-center justify-center space-x-4 mt-2">
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em] border border-slate-200 px-2 py-0.5 rounded">Min 2s</span>
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em] border border-slate-200 px-2 py-0.5 rounded">Max 8s</span>
        </div>
      </div>
    </div>
  );
};

export default PetButton;
