
import React from 'react';

interface SubscriptionPromptProps {
  onSubscribe: () => void;
  onLogin: () => void;
  isGuest: boolean;
}

const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({ onSubscribe, onLogin, isGuest }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-3xl flex items-center justify-center text-4xl shadow-xl mb-8 transform rotate-3">
        👑
      </div>
      
      <h2 className="text-3xl font-bold text-slate-800 mb-4">PawSay Premium</h2>
      <p className="text-slate-600 mb-8 max-w-xs mx-auto leading-relaxed">
        Join our exclusive community of pet parents! Share photos, swap tips, and connect with fellow cat and dog lovers.
      </p>

      <div className="w-full space-y-4 max-w-sm">
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-800 shadow-xl text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] px-4 py-1 font-bold uppercase tracking-widest rounded-bl-xl">Best Value</div>
          <h3 className="text-xl font-bold text-slate-800">Community Access</h3>
          <p className="text-slate-500 text-sm mt-1">Unlock feed, photos, and chat</p>
          <div className="mt-6 flex items-baseline space-x-1">
            <span className="text-4xl font-bold text-slate-800">$4.99</span>
            <span className="text-slate-400 font-bold uppercase text-xs">/month</span>
          </div>
        </div>

        {isGuest ? (
          <button 
            onClick={onLogin}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 rounded-2xl transition"
          >
            Log in to Subscribe
          </button>
        ) : (
          <button 
            onClick={onSubscribe}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg transition transform active:scale-95"
          >
            Unlock Community Access
          </button>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="bg-white/40 p-3 rounded-2xl border border-white">
          <span className="text-xl block mb-1">📸</span>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Photo Sharing</p>
        </div>
        <div className="bg-white/40 p-3 rounded-2xl border border-white">
          <span className="text-xl block mb-1">💬</span>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Group Chat</p>
        </div>
        <div className="bg-white/40 p-3 rounded-2xl border border-white">
          <span className="text-xl block mb-1">❤️</span>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Post Likes</p>
        </div>
        <div className="bg-white/40 p-3 rounded-2xl border border-white">
          <span className="text-xl block mb-1">🛡️</span>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Moderated Space</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPrompt;
