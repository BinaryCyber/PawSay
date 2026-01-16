
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { PetType, AppState, TranslationResult, PetProfile, UserProfile, ViewMode, CommunityPost } from './types';
import PetButton from './components/PetButton';
import ResultDisplay from './components/ResultDisplay';
import ProfileForm from './components/ProfileForm';
import AuthForm from './components/UserForm';
import TermsModal from './components/TermsModal';
import CommunityChat from './components/CommunityChat';
import SubscriptionPrompt from './components/SubscriptionPrompt';
import AdminDashboard from './components/AdminDashboard';
import AnalyzingOverlay from './components/AnalyzingOverlay';
import { AudioRecorder } from './utils/audioRecorder';
import { analyzePetAudio } from './services/geminiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allProfiles, setAllProfiles] = useState<PetProfile[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TRANSLATOR);
  
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [isAuthFormOpen, setIsAuthFormOpen] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  
  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());

  // Data persistence
  useEffect(() => {
    const savedUsers = localStorage.getItem('pawsay_users_list');
    if (savedUsers) setAllUsers(JSON.parse(savedUsers));

    const savedProfiles = localStorage.getItem('pawsay_all_profiles');
    if (savedProfiles) setAllProfiles(JSON.parse(savedProfiles));

    const savedPosts = localStorage.getItem('pawsay_community_posts');
    if (savedPosts) setCommunityPosts(JSON.parse(savedPosts));

    const sessionUser = sessionStorage.getItem('pawsay_current_session');
    if (sessionUser) {
      const parsed = JSON.parse(sessionUser);
      // Fresh check against master list for deactivation/admin status
      const masterUser = (JSON.parse(savedUsers || '[]') as UserProfile[]).find(u => u.id === parsed.id);
      if (masterUser && !masterUser.isDeactivated) {
        setCurrentUser(masterUser);
      } else if (masterUser?.isDeactivated) {
        sessionStorage.removeItem('pawsay_current_session');
        alert("This account has been deactivated for violating community guidelines.");
      }
    } else {
      const guestFlag = sessionStorage.getItem('pawsay_is_guest');
      if (guestFlag === 'true') setIsGuest(true);
    }

    const accepted = localStorage.getItem('pawsay_terms_accepted');
    setHasAcceptedTerms(accepted === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('pawsay_users_list', JSON.stringify(allUsers));
    // Update current user if they are in the list (sync warnings/admin status)
    if (currentUser) {
      const updated = allUsers.find(u => u.id === currentUser.id);
      if (updated && (updated.warnings !== currentUser.warnings || updated.isDeactivated !== currentUser.isDeactivated)) {
        if (updated.isDeactivated) {
          logout();
        } else {
          setCurrentUser(updated);
        }
      }
    }
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('pawsay_all_profiles', JSON.stringify(allProfiles));
  }, [allProfiles]);

  useEffect(() => {
    localStorage.setItem('pawsay_community_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('pawsay_current_session', JSON.stringify(currentUser));
      sessionStorage.removeItem('pawsay_is_guest');
      setIsGuest(false);
    } else {
      sessionStorage.removeItem('pawsay_current_session');
    }
  }, [currentUser]);

  const userProfiles = useMemo(() => {
    if (currentUser) {
      return allProfiles.filter(p => p.ownerId === currentUser.id);
    }
    return allProfiles.filter(p => !p.ownerId || p.ownerId === 'guest');
  }, [allProfiles, currentUser]);

  const selectedProfile = useMemo(() => 
    userProfiles.find(p => p.id === selectedProfileId) || userProfiles[0] || null,
  [userProfiles, selectedProfileId]);

  const currentPetType = selectedProfile?.type || PetType.CAT;

  const handleAcceptTerms = () => {
    localStorage.setItem('pawsay_terms_accepted', 'true');
    setHasAcceptedTerms(true);
  };

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
      const translation = await analyzePetAudio(audioBase64, currentPetType, selectedProfile || undefined);
      
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

  const addPetProfile = (newProfile: PetProfile) => {
    const ownerId = currentUser ? currentUser.id : 'guest';
    const profileWithOwnership = { ...newProfile, ownerId };
    setAllProfiles(prev => [...prev, profileWithOwnership]);
    setSelectedProfileId(newProfile.id);
    setIsProfileFormOpen(false);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    if (user.isDeactivated) {
      setError("This account has been deactivated.");
      return;
    }
    if (!allUsers.some(u => u.id === user.id)) {
      // Secret backdoor for first user or "admin" username to be admin
      if (allUsers.length === 0 || user.username.toLowerCase().includes('admin')) {
        user.isAdmin = true;
      }
      setAllUsers(prev => [...prev, user]);
    }
    setCurrentUser(user);
    setIsGuest(false);
    setIsAuthFormOpen(false);
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    setCurrentUser(null);
    setIsAuthFormOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsGuest(false);
    sessionStorage.removeItem('pawsay_is_guest');
    sessionStorage.removeItem('pawsay_current_session');
    setSelectedProfileId(null);
    setViewMode(ViewMode.TRANSLATOR);
  };

  const handleSubscribe = () => {
    if (currentUser) {
      const updatedUser = { ...currentUser, isSubscribed: true };
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setError(null);
  };

  if (hasAcceptedTerms === null) return null;

  return (
    <div className="min-h-screen flex flex-col items-center p-0 max-w-lg mx-auto relative overflow-hidden bg-slate-50">
      {!hasAcceptedTerms && <TermsModal onAccept={handleAcceptTerms} />}

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl"></div>
      </div>

      <header className="w-full flex items-center justify-between p-6 bg-white/40 backdrop-blur-md sticky top-0 z-40 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => { if (!currentUser) setIsAuthFormOpen(true); else if (currentUser.isAdmin) setViewMode(ViewMode.ADMIN); }}
            className={`w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer transition ${currentUser?.isAdmin ? 'ring-2 ring-yellow-400 hover:ring-yellow-500' : 'hover:border-blue-300'}`}
          >
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-xl">
                {isGuest ? '👤' : (currentUser?.isAdmin ? '🛠️' : '🔐')}
              </div>
            )}
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold text-slate-800 leading-none">PawSay</h1>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">
              {currentUser ? (currentUser.isAdmin ? '🛡️ Admin' : (currentUser.isSubscribed ? '👑 Premium' : `Hi, ${currentUser.username}`)) : (isGuest ? 'Guest Mode' : 'Account Required')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setViewMode(ViewMode.TRANSLATOR)}
            className={`p-2 rounded-xl transition ${viewMode === ViewMode.TRANSLATOR ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.COMMUNITY)}
            className={`p-2 rounded-xl transition ${viewMode === ViewMode.COMMUNITY ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          {currentUser?.isAdmin && (
            <button 
              onClick={() => setViewMode(ViewMode.ADMIN)}
              className={`p-2 rounded-xl transition ${viewMode === ViewMode.ADMIN ? 'bg-yellow-500 text-white shadow-md' : 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
          {currentUser && (
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full pb-10">
        {viewMode === ViewMode.TRANSLATOR ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-10 px-6 pt-10">
            {(!currentUser && !isGuest) ? (
              <div className="text-center p-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl">
                <span className="text-5xl mb-4 block">🏠</span>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to PawSay</h2>
                <p className="text-slate-500 text-sm mb-8">Join our pet-loving family to save profiles and share moments!</p>
                <div className="space-y-3">
                  <button onClick={() => setIsAuthFormOpen(true)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg w-full">Get Started</button>
                  <button onClick={handleContinueAsGuest} className="w-full py-3 text-slate-500 font-bold">Continue as Guest</button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full flex flex-col items-center space-y-4 max-w-sm">
                  {userProfiles.length > 0 ? (
                    <div className="flex items-center space-x-2 w-full">
                      <div className="flex-1 bg-white/80 rounded-2xl p-1 shadow-sm border border-slate-100 flex overflow-x-auto no-scrollbar">
                        {userProfiles.map(p => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedProfileId(p.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 ${(selectedProfileId === p.id || (!selectedProfileId && userProfiles[0].id === p.id)) ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                          >
                            <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-white/20">
                              {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : (p.type === PetType.CAT ? '🐈' : '🐕')}
                            </span>
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setIsProfileFormOpen(true)} className="w-10 h-10 bg-white shadow-sm border rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setIsProfileFormOpen(true)} className="bg-white/80 px-8 py-4 rounded-3xl border-2 border-dashed text-slate-500 font-bold w-full">✨ Create Pet Profile</button>
                  )}
                </div>

                <PetButton petType={currentPetType} appState={appState} selectedProfile={selectedProfile || undefined} onStartRecording={handleStartRecording} onStopRecording={handleStopRecording} />
                
                <div className="h-28 flex items-center justify-center w-full">
                  {error && (
                    <div className="bg-red-50 text-red-600 px-6 py-4 rounded-3xl text-center font-bold border-2 border-red-100 animate-bounce max-w-xs">
                      {error}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : viewMode === ViewMode.COMMUNITY ? (
          <div className="flex-1">
            {!currentUser?.isSubscribed && !currentUser?.isAdmin ? (
              <SubscriptionPrompt onSubscribe={handleSubscribe} onLogin={() => setIsAuthFormOpen(true)} isGuest={!currentUser} />
            ) : (
              <CommunityChat 
                currentUser={currentUser!} 
                posts={communityPosts}
                onPostsChange={setCommunityPosts}
              />
            )}
          </div>
        ) : (
          <AdminDashboard 
            currentUser={currentUser!} 
            allUsers={allUsers} 
            onUsersChange={setAllUsers}
            communityPosts={communityPosts}
            onPostsChange={setCommunityPosts}
          />
        )}
      </main>

      {appState === AppState.ANALYZING && (
        <AnalyzingOverlay petType={currentPetType} />
      )}

      {appState === AppState.RESULT && result && (
        <ResultDisplay result={result} petType={currentPetType} onClose={reset} />
      )}

      {isProfileFormOpen && (
        <ProfileForm onSave={addPetProfile} onCancel={() => setIsProfileFormOpen(false)} />
      )}

      {isAuthFormOpen && (
        <AuthForm onAuth={handleAuthSuccess} onCancel={() => setIsAuthFormOpen(false)} onContinueAsGuest={handleContinueAsGuest} existingUsers={allUsers} />
      )}
    </div>
  );
};

export default App;
