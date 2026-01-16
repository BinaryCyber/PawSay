
import React from 'react';

interface TermsModalProps {
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center transform transition-all scale-100 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎙️</span>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to PawSay!</h2>
        
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed mb-8">
          <p>
            To help you understand your pet, we need access to your <b>microphone</b> to listen to their unique vocalizations.
          </p>
          <p>
            By tapping the button below, you agree to our <b>Terms & Conditions</b> and understand that audio is processed by AI to decypher emotions. We prioritize your pet's privacy!
          </p>
        </div>

        <button 
          onClick={onAccept}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg transition transform active:scale-95 flex items-center justify-center space-x-2"
        >
          <span>Accept & Get Started</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-widest">
          Microphone access is required for core features
        </p>
      </div>
    </div>
  );
};

export default TermsModal;
