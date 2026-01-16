
import React from 'react';
import { TranslationResult, PetType } from '../types';

interface ResultDisplayProps {
  result: TranslationResult;
  petType: PetType;
  onClose: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, petType, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full transform transition-all scale-100 p-2">
        <div className="relative">
          {result.imageUrl && (
            <img 
              src={result.imageUrl} 
              alt={result.emotion} 
              className="w-full h-72 object-cover rounded-2xl"
            />
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-800 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-pink-100 text-pink-600 text-sm font-bold tracking-wider uppercase mb-4">
            {result.emotion}
          </span>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Your {petType} is {result.emotion}!
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed italic">
            "{result.explanation}"
          </p>
          
          <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
              <span className="mr-2">💡</span> Care Advice
            </h3>
            <p className="text-slate-700">{result.advice}</p>
          </div>

          <button 
            onClick={onClose}
            className="mt-8 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition shadow-lg"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
