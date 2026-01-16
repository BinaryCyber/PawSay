
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface AuthFormProps {
  onAuth: (user: UserProfile) => void;
  onCancel: () => void;
  onContinueAsGuest: () => void;
  existingUsers: UserProfile[];
}

type AuthMode = 'login' | 'signup';

const AuthForm: React.FC<AuthFormProps> = ({ onAuth, onCancel, onContinueAsGuest, existingUsers }) => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    avatarUrl: ''
  });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (existingUsers.some(u => u.email === formData.email)) {
        setError("An account with this email already exists.");
        return;
      }
      const newUser: UserProfile = {
        id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        password: formData.password,
        avatarUrl: formData.avatarUrl
      };
      onAuth(newUser);
    } else {
      const user = existingUsers.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        onAuth(user);
      } else {
        setError("Invalid email or password.");
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <form 
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 p-1 rounded-2xl flex w-full max-w-[240px]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${mode === 'login' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${mode === 'signup' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
          {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
        </h2>

        {/* Security Warning */}
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl mb-6 flex items-start space-x-3">
          <span className="text-lg">🛡️</span>
          <p className="text-[10px] text-amber-700 font-medium leading-tight">
            <span className="font-bold block uppercase tracking-tighter mb-1">Security Notice</span>
            This is a demo application. Data is stored in your browser's local storage in plaintext. Do not use real or sensitive passwords.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {mode === 'signup' && (
            <div className="flex flex-col items-center mb-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-4 border-white shadow-lg hover:border-blue-200 transition"
              >
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold text-blue-500 mt-2 uppercase tracking-widest"
              >
                Set Profile Picture
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Username</label>
              <input
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition text-black font-medium"
                placeholder="Username"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Email</label>
            <input
              required
              type="email"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition text-black font-medium"
              placeholder="Email address"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Password</label>
            <input
              required
              type="password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition text-black font-medium"
              placeholder="Password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xl transition"
            >
              {mode === 'signup' ? 'Create Account' : 'Log In'}
            </button>
          </div>
          
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="w-full py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition text-sm underline underline-offset-4 decoration-slate-200"
          >
            Continue as Guest
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
