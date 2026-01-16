
import React, { useState, useRef, useEffect } from 'react';
import { PetProfile, PetType } from '../types';

interface ProfileFormProps {
  onSave: (profile: PetProfile) => void;
  onCancel: () => void;
  initialData?: PetProfile;
}

const CAT_BREEDS = [
  "Abyssinian",
  "Bengal",
  "British Shorthair",
  "Burmese",
  "Maine Coon",
  "Mixed Breed",
  "Persian",
  "Ragdoll",
  "Russian Blue",
  "Scottish Fold",
  "Siamese",
  "Sphynx",
  "Tabby (Domestic Shorthair)",
  "Other"
];

const DOG_BREEDS = [
  "Australian Shepherd",
  "Beagle",
  "Border Collie",
  "Boxer",
  "Bulldog",
  "Chihuahua",
  "Cocker Spaniel",
  "Dachshund",
  "French Bulldog",
  "German Shepherd",
  "Golden Retriever",
  "Labrador Retriever",
  "Mixed Breed",
  "Pomeranian",
  "Poodle",
  "Pug",
  "Rottweiler",
  "Siberian Husky",
  "Yorkshire Terrier",
  "Other"
];

const ProfileForm: React.FC<ProfileFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<PetProfile>>(
    initialData || { type: PetType.CAT, name: '', breed: '', age: '', personality: '', imageUrl: '' }
  );
  
  // Track if we are currently in "Other" mode for the breed
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentBreedOptions = formData.type === PetType.CAT ? CAT_BREEDS : DOG_BREEDS;

  // Initialize "Other" state if initial data has a breed not in the predefined list
  useEffect(() => {
    if (formData.breed && !currentBreedOptions.includes(formData.breed) && formData.breed !== '') {
      setIsOtherSelected(true);
    } else if (formData.breed === 'Other') {
      setIsOtherSelected(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    // If "Other" was selected but no custom text was entered, default to "Other"
    const finalBreed = isOtherSelected && (!formData.breed || formData.breed === 'Other') 
      ? 'Other' 
      : formData.breed;

    onSave({
      id: initialData?.id || Date.now().toString(),
      ownerId: initialData?.ownerId || 'guest',
      name: formData.name!,
      type: formData.type || PetType.CAT,
      breed: finalBreed || '',
      age: formData.age || '',
      personality: formData.personality || '',
      imageUrl: formData.imageUrl,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBreedSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Other') {
      setIsOtherSelected(true);
      setFormData({ ...formData, breed: '' }); // Clear to allow fresh manual input
    } else {
      setIsOtherSelected(false);
      setFormData({ ...formData, breed: val });
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <form 
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {initialData ? 'Edit Pet Profile' : 'Add New Pet'}
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-4 border-white shadow-md hover:border-pink-200 transition"
            >
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Pet" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📸</span>
              )}
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-pink-500 mt-2 uppercase tracking-widest"
            >
              Set Photo
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Species</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: PetType.CAT, breed: '' });
                  setIsOtherSelected(false);
                }}
                className={`flex-1 py-2 rounded-lg font-bold transition ${formData.type === PetType.CAT ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
              >
                🐈 Cat
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: PetType.DOG, breed: '' });
                  setIsOtherSelected(false);
                }}
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition text-black font-medium"
              placeholder="e.g. Whiskers"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Breed</label>
              <div className="space-y-3">
                <div className="relative">
                  <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition text-black appearance-none cursor-pointer font-medium"
                    value={isOtherSelected ? 'Other' : (currentBreedOptions.includes(formData.breed || '') ? formData.breed : '')}
                    onChange={handleBreedSelectChange}
                  >
                    <option value="" disabled>Select Breed</option>
                    {currentBreedOptions.map(breed => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isOtherSelected && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1 ml-1">Manual Entry</label>
                    <input
                      required
                      autoFocus
                      className="w-full bg-slate-50 border border-pink-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition text-black font-medium"
                      placeholder="Enter custom breed..."
                      value={formData.breed === 'Other' ? '' : formData.breed}
                      onChange={e => setFormData({ ...formData, breed: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Age</label>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition text-black font-medium"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400 transition resize-none text-black font-medium"
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
