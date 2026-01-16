
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PetType, AppState, TranslationResult, PetProfile } from './types';
import PetButton from './components/PetButton';
import ResultDisplay from './components/ResultDisplay';
import ProfileForm from './components/ProfileForm';
import TermsModal from './components/TermsModal';
import { AudioRecorder } from './utils/audioRecorder';
import { analyzePetAudio } from './services/geminiService';

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<PetProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  
  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());

  useEffect(() => {
    const savedProfiles = localStorage.getItem('pawsay_profiles');
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles);
        setProfiles(parsed);
        if (parsed.length > 0) setSelectedProfileId(parsed[0].id);
      } catch (e) {
        console.error("Failed to load profiles", e);
      }
    }
    const accepted = localStorage.getItem('pawsay_terms_accepted');
    setHasAcceptedTerms(accepted === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('pawsay_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const handleAcceptTerms = () => {
    localStorage.setItem('pawsay_terms_accepted', 'true');
    setHasAcceptedTerms(true);
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => stream.getTracks().forEach(t => t.stop()))
      .catch(console.warn);
  };

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);
  const currentPetType = selectedProfile?.type || PetType.CAT;

  const handleStartRecording = useCallback(async () => {
    try {
      setError(null);
      setRecordingStartTime(Date.now());
      await recorderRef.current.start();
      setAppState(AppState.RECORDING);
    } catch (err) {
      console.error(err);
      setError("Microphone access is needed to listen to your pet!");
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    if (appState !== AppState.RECORDING) return;
    
    const duration = Date.now() - recordingStartTime;
    
    if (duration < 2000) {
      await recorderRef.current.stop();
      setError("Too short! Hold for at least 2 seconds.");
      setAppState(AppState.IDLE);
      return;
    }

    setAppState(AppState.ANALYZING);
    try {
      const audioBase64 = await recorderRef.current.stop();
      const translation = await analyzePetAudio(audioBase64, currentPetType, selectedProfile);
      
      if (!translation.soundDetected) {
        setError(`No ${currentPetType} sound detected. Please try again!`);
        setAppState(AppState.IDLE);
      } else {
        setResult(translation);
        setAppState(AppState.RESULT);
      }
    } catch (err) {
      console.error(err);
      setError("AI couldn't hear that clearly. Try again?");
      setAppState(AppState.ERROR);
    }
  }, [appState, currentPetType, selectedProfile, recordingStartTime]);

  const addProfile = (newProfile: PetProfile) => {
    setProfiles([...profiles, newProfile]);
    setSelectedProfileId(newProfile.id);
    setIsProfileFormOpen(false);
  };

  const deleteProfile = (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    if (selectedProfileId === id) {
      setSelectedProfileId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setError(null);
  };

  if (hasAcceptedTerms === null) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 max-w-lg mx-auto relative overflow-hidden">
      {!hasAcceptedTerms && <TermsModal onAccept={handleAcceptTerms} />}

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl"></div>
      </div>

      <header className="w-full text-center py-6">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">PawSay</h1>
        <p className="text-slate-500 mt-2 font-medium">Decipher your pet's language</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-sm space-y-12">
        {/* Profile Switcher */}
        <div className="w-full flex flex-col items-center space-y-4">
          {profiles.length > 0 ? (
            <div className="flex items-center space-x-2 w-full">
              <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-sm border border-slate-100 flex overflow-x-auto no-scrollbar scroll-smooth">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (appState === AppState.IDLE) {
                        setSelectedProfileId(p.id);
                        setError(null);
                      }
                    }}
                    disabled={appState !== AppState.IDLE}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold transition-all text-sm ${
                      selectedProfileId === p.id 
                        ? 'bg-slate-800 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {p.type === PetType.CAT ? '🐈' : '🐕'} {p.name}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setIsProfileFormOpen(true)}
                className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-pink-500 transition shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsProfileFormOpen(true)}
              className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-3xl border-2 border-dashed border-slate-300 text-slate-500 font-bold hover:border-pink-300 hover:text-pink-500 transition flex items-center space-x-2 w-full justify-center"
            >
              <span>✨ Create First Pet Profile</span>
            </button>
          )}

          {selectedProfile && (
            <div className="text-xs text-slate-400 font-medium uppercase tracking-widest flex items-center space-x-2">
              <span>{selectedProfile.breed}</span>
              <span>•</span>
              <span>{selectedProfile.age}</span>
              <button 
                onClick={() => deleteProfile(selectedProfile.id)}
                className="ml-2 text-red-300 hover:text-red-500 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Main Recording Interface */}
        <div className="relative flex flex-col items-center">
          {appState === AppState.ANALYZING && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[25] w-32 h-32 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 animate-in zoom-in-50 fade-in duration-300">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-slate-200/50 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-pink-500 rounded-full animate-spin"></div>
              </div>
              <p className="mt-3 font-bold text-slate-800 text-[10px] uppercase tracking-widest text-center px-2">
                Analyzing Sound
              </p>
            </div>
          )}
          
          <PetButton 
            petType={currentPetType} 
            appState={appState}
            selectedProfile={selectedProfile || undefined}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        </div>

        {/* Large Feedback/Error Banner */}
        <div className="h-28 flex items-center justify-center w-full">
          {error && (
            <div className="bg-red-50 text-red-600 px-10 py-6 rounded-[2.5rem] text-center text-lg font-bold border-2 border-red-100 animate-bounce max-w-md shadow-xl transition-all duration-300">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-2xl">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {appState === AppState.RESULT && result && (
        <ResultDisplay 
          result={result} 
          petType={currentPetType} 
          onClose={reset} 
        />
      )}

      {isProfileFormOpen && (
        <ProfileForm 
          onSave={addProfile} 
          onCancel={() => setIsProfileFormOpen(false)} 
        />
      )}

      <footer className="w-full text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        Built with ❤️ & Gemini AI
      </footer>
    </div>
  );
};

export default App;
