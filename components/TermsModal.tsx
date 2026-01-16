
import React from 'react';

interface TermsModalProps {
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center transform transition-all scale-100 animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <span className="text-4xl">📜</span>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Important Notice</h2>
        
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed mb-8 text-left max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          <p className="font-bold text-slate-800">
            By continuing to use PawSay, you agree that usual Terms and Conditions apply.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
              <span className="mr-1">⚖️</span> Liability Disclaimer
            </h3>
            <p className="text-xs text-slate-500 italic">
              PawSay and its creators accept <b>no liability</b> for any actions taken, or not taken, based on AI-generated translations. AI interpretations of animal behavior are probabilistic and for entertainment purposes only.
            </p>
          </div>

          <p>
            This app requires <b>microphone access</b> to analyze pet vocalizations. Audio is processed securely via Google Gemini AI.
          </p>

          <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 font-medium">
            <b>Safety First:</b> This tool is not a substitute for professional veterinary care. Always consult a veterinarian for health or emergency concerns.
          </p>
        </div>

        <button 
          onClick={onAccept}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg transition transform active:scale-95 flex items-center justify-center space-x-2"
        >
          <span>I Accept & Agree</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <p className="mt-4 text-[9px] text-slate-400 uppercase tracking-widest leading-tight">
          Continuing constitutes acceptance of all terms
        </p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default TermsModal;
