
import React, { useState } from 'react';
import { PetProfile, PetType } from '../types';

interface ProfileFormProps {
  onSave: (profile: PetProfile) => void;
  onCancel: () => void;
  initialData?: PetProfile;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<PetProfile>>(
    initialData || { type: PetType.CAT, name: '', breed: '', age: '', personality: '' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave({
      id: initialData?.id || Date.now().toString(),
      name: formData.name!,
      type: formData.type || PetType.CAT,
      breed: formData.breed || '',
      age: formData.age || '',
      personality: formData.personality || '',
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <form 
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {initialData ? 'Edit Pet Profile' : 'Add New Pet'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Species</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: PetType.CAT })}
                className={`flex-1 py-2 rounded-lg font-bold transition ${formData.type === PetType.CAT ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
              >
                🐈 Cat
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: PetType.DOG })}
                className={`flex-1 py-2 rounded-lg font-bold transition ${formData.type === PetType.DOG ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
              >
                🐕 Dog
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
            <input
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition text-black"
              placeholder="e.g. Whiskers"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Breed</label>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition text-black"
                placeholder="e.g. Tabby"
                value={formData.breed}
                onChange={e => setFormData({ ...formData, breed: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Age</label>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition text-black"
                placeholder="e.g. 3 years"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Personality</label>
            <textarea
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition resize-none text-black"
              placeholder="e.g. Friendly, but shy around strangers..."
              value={formData.personality}
              onChange={e => setFormData({ ...formData, personality: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-900 shadow-lg transition"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
