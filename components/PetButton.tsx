
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
  const [timeLeft, setTimeLeft] = useState(8.0);
  const [showShortWarning, setShowShortWarning] = useState(false);
  
  const pressStartTimeRef = useRef<number | null>(null);
  const stopCallbackRef = useRef(onStopRecording);
  
  const MAX_DURATION = 8000; // 8 seconds in ms

  // Keep the latest callback in a ref to avoid re-triggering the interval effect
  useEffect(() => {
    stopCallbackRef.current = onStopRecording;
  }, [onStopRecording]);

  useEffect(() => {
    let interval: number;
    
    if (isPressed) {
      // Only set the start time if it's not already set
      if (pressStartTimeRef.current === null) {
        pressStartTimeRef.current = Date.now();
      }
      
      const start = pressStartTimeRef.current;
      setShowShortWarning(false);
      
      interval = window.setInterval(() => {
        const now = Date.now();
        const elapsed = now - start;
        
        const newProgress = Math.min((elapsed / MAX_DURATION) * 100, 100);
        const newTimeLeft = Math.max(0, (MAX_DURATION - elapsed) / 1000);
        
        setProgress(newProgress);
        setTimeLeft(newTimeLeft);
        
        if (elapsed >= MAX_DURATION) {
          setIsPressed(false);
          pressStartTimeRef.current = null;
          stopCallbackRef.current();
        }
      }, 30);
    } else {
      setProgress(0);
      setTimeLeft(8.0);
      pressStartTimeRef.current = null;
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPressed]); // Removed onStopRecording from dependencies to prevent resets

  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent starting if already analyzing or if it's a right click
    if (appState === AppState.ANALYZING || e.button !== 0) return;
    setIsPressed(true);
    onStartRecording();
  };

  const handlePointerUp = () => {
    if (!isPressed) return;
    
    const duration = pressStartTimeRef.current ? (Date.now() - pressStartTimeRef.current) : 0;
    if (duration < 2000) {
      setShowShortWarning(true);
      setTimeout(() => setShowShortWarning(false), 2000);
    }
    
    setIsPressed(false);
    onStopRecording();
  };

  const catImg = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&auto=format&fit=crop";
  const dogImg = "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=400&auto=format&fit=crop";
  
  const currentImg = selectedProfile?.imageUrl || (petType === PetType.CAT ? catImg : dogImg);

  const radius = 140;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div 
        className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 touch-none ${
          isPressed ? 'scale-105' : 'hover:scale-105'
        }`}
        style={{ width: '320px', height: '320px' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
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
            className="text-pink-400 transition-all duration-75 ease-linear"
          />
        </svg>

        <div className={`absolute inset-10 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full blur-2xl opacity-40 transition-opacity duration-500 ${
          isPressed ? 'opacity-80' : 'opacity-0'
        }`}></div>
        
        <div className={`relative w-64 h-64 rounded-full border-8 bg-white overflow-hidden shadow-2xl transition-all duration-300 ${
          isPressed ? 'border-pink-400' : 'border-white'
        }`}>
          <img 
            key={currentImg} 
            src={currentImg} 
            alt={selectedProfile?.name || petType} 
            className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ${
              isPressed ? 'scale-110' : ''
            }`}
          />
          
          {isPressed && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-200">
              <div className="text-white font-bold text-xl animate-pulse mb-1 drop-shadow-md">
                Listening...
              </div>
              <div className="text-white/90 text-sm font-bold bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 shadow-sm">
                {timeLeft <= 0.1 ? "Limit Reached!" : `${timeLeft.toFixed(1)}s left`}
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
        <p className={`text-slate-600 font-medium text-lg transition-all duration-300 ${isPressed ? 'opacity-40 scale-95' : 'opacity-100'}`}>
          Hold to listen to {selectedProfile?.name || 'your ' + petType}
        </p>
        <div className="flex items-center justify-center space-x-4 mt-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] bg-slate-100 px-3 py-1 rounded-full">Min 2s</span>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] bg-slate-100 px-3 py-1 rounded-full">Max 8s</span>
        </div>
      </div>
    </div>
  );
};

export default PetButton;
