import React, { useState, useEffect, useCallback, useRef } from 'react';
import bgVideo from '../video/ref.mp4';
import bgVideoMobile from '../video/refMobile.mp4';
import Registration from './Registration.jsx';
import ContactVerification from './ContactVerification.jsx';
import LanguageSettings from './LanguageSettings.jsx';
import TerminalHomepage from './TerminalHomepage.jsx';
import AlertDetails from './AlertDetails.jsx';
import AITerminal from './AITerminal.jsx';
import AapdaAccountProfileFixed from './AapdaAccountProfileFixed.jsx';
import ScreenTransition from './HomeTransition.jsx';
import Tutorial from './Tutorial.jsx';
import { supabase } from './supabaseClient.js';

// Indian state → regional language mapping
const stateLanguageMap = {
  'andhra pradesh': 'Telugu (TE)',
  'arunachal pradesh': 'Hindi (HI)',
  'assam': 'Assamese (AS)',
  'bihar': 'Hindi (HI)',
  'chhattisgarh': 'Hindi (HI)',
  'goa': 'Konkani (KK)',
  'gujarat': 'Gujarati (GU)',
  'haryana': 'Hindi (HI)',
  'himachal pradesh': 'Hindi (HI)',
  'jharkhand': 'Hindi (HI)',
  'karnataka': 'Kannada (KN)',
  'kerala': 'Malayalam (ML)',
  'madhya pradesh': 'Hindi (HI)',
  'maharashtra': 'Marathi (MR)',
  'manipur': 'Meitei (MNI)',
  'meghalaya': 'English (EN)',
  'mizoram': 'Mizo (LUS)',
  'nagaland': 'English (EN)',
  'odisha': 'Odia (OR)',
  'punjab': 'Punjabi (PA)',
  'rajasthan': 'Hindi (HI)',
  'sikkim': 'Nepali (NE)',
  'tamil nadu': 'Tamil (TA)',
  'telangana': 'Telugu (TE)',
  'tripura': 'Bengali (BN)',
  'uttar pradesh': 'Hindi (HI)',
  'uttarakhand': 'Hindi (HI)',
  'west bengal': 'Bengali (BN)',
  'delhi': 'Hindi (HI)',
  'national capital territory of delhi': 'Hindi (HI)',
  'chandigarh': 'Hindi (HI)',
  'jammu and kashmir': 'Urdu (UR)',
  'ladakh': 'Hindi (HI)',
  'puducherry': 'Tamil (TA)',
  'lakshadweep': 'Malayalam (ML)',
  'andaman and nicobar islands': 'Hindi (HI)',
  'dadra and nagar haveli and daman and diu': 'Gujarati (GU)',
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem('aapda_tutorial_done');
  });

  const handleTutorialComplete = () => {
    localStorage.setItem('aapda_tutorial_done', '1');
    setShowTutorial(false);
  };

  // --- Unified Transition State ---
  const [transitionActive, setTransitionActive] = useState(false);
  const [transitionConfig, setTransitionConfig] = useState({ icon: 'home', floodColor: '#ffffff', iconColor: '#1a1a1a' });
  const transitionDestinationRef = useRef(null);

  // General navigation trigger
  const navigateWithTransition = useCallback((destination, icon = 'home', floodColor = '#ffffff', iconColor = '#1a1a1a') => {
    if (currentScreen === destination) return;
    transitionDestinationRef.current = destination;
    setTransitionConfig({ icon, floodColor, iconColor });
    setTransitionActive(true);
  }, [currentScreen]);

  // Called by ScreenTransition when phase 5 (reveal) starts
  const onTransitionComplete = useCallback(() => {
    if (transitionDestinationRef.current) {
      setCurrentScreen(transitionDestinationRef.current);
      transitionDestinationRef.current = null;
    }
    setTransitionActive(false);
  }, []);

  // Pre-configured navigators for child components
  const navHome = useCallback(() => navigateWithTransition('terminal', 'home', '#ffffff', '#1a1a1a'), [navigateWithTransition]);
  const navAI = useCallback(() => navigateWithTransition('ai_terminal', 'psychology', '#ffffff', '#1a1a1a'), [navigateWithTransition]);
  const navProfile = useCallback(() => navigateWithTransition('profile', 'person', '#ffffff', '#1a1a1a'), [navigateWithTransition]);

  // --- Shared form data ---
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    country: '',
    state: '',
    region: '',
    pin: '',
    email: '',
    verification_phone: '',
    preferred_language: '',
    detected_locale: 'AUTO-DETECT',
    emergency_override_english: false,
  });

  const updateFormData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  // --- Google Sign In ---
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Google sign-in error:', error.message);
      alert('AUTH_ERROR: ' + error.message);
    }
  };

  // --- Check for existing session & listen for auth changes ---
  useEffect(() => {
    // Timeout fallback: if auth check takes too long, proceed to splash
    const authTimeout = setTimeout(() => {
      setAuthLoading(false);
      console.warn('Auth check timed out — proceeding to splash screen.');
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(authTimeout);
      if (session?.user) {
        setAuthUser(session.user);
        checkExistingUser(session.user);
      } else {
        setAuthLoading(false);
      }
    }).catch((err) => {
      clearTimeout(authTimeout);
      console.error('Auth session check failed:', err);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setAuthUser(session.user);
          await checkExistingUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setAuthUser(null);
          setCurrentScreen('splash');
          setAuthLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // --- Check if user already has a profile in our DB ---
  const checkExistingUser = async (user) => {
    try {
      // Match by email (unique identifier from Google Auth)
      let { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (data) {
        // RETURNING USER → load saved data, skip straight to terminal
        console.log('Returning user detected, skipping registration');
        setFormData({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          country: data.country || '',
          state: data.state || '',
          region: data.region || '',
          pin: data.pin || '',
          email: data.email || user.email || '',
          verification_phone: data.verification_phone || '',
          preferred_language: data.preferred_language || '',
          detected_locale: data.detected_locale || 'AUTO-DETECT',
          emergency_override_english: data.emergency_override_english || false,
        });
        setCurrentScreen('terminal');
      } else {
        // NEW USER → pre-fill from Google profile, go to registration
        console.log('New user, starting registration flow');
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        }));
        setCurrentScreen('registration');
      }
    } catch (err) {
      console.error('Error checking user:', err);
      setFormData(prev => ({ ...prev, email: user.email || '' }));
      setCurrentScreen('registration');
    }
    setAuthLoading(false);
  };

  // --- Geolocation ---
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();
          const detectedState = data.principalSubdivision || '';
          const detectedCountry = data.countryName || '';
          const stateKey = detectedState.toLowerCase().trim();
          const regionalLang = stateLanguageMap[stateKey] || `${detectedState.toUpperCase()} (${data.countryCode || 'XX'})`;
          setFormData(prev => ({
            ...prev,
            detected_locale: regionalLang,
            country: prev.country || detectedCountry.toUpperCase(),
            state: prev.state || detectedState.toUpperCase(),
          }));
        } catch (err) {
          console.error('Reverse geocode failed:', err);
        }
      },
      (err) => console.warn('Geolocation denied:', err.message)
    );
  }, []);

  // --- Submit all collected data to Supabase ---
  const handleFinalSubmit = async () => {
    try {
      const payload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        country: formData.country,
        state: formData.state,
        region: formData.region,
        pin: formData.pin,
        email: formData.email,
        verification_phone: formData.verification_phone,
        preferred_language: formData.preferred_language,
        detected_locale: formData.detected_locale,
        emergency_override_english: formData.emergency_override_english,
        auth_id: authUser?.id || null,
      };

      console.log('Submitting user data to Supabase:', JSON.stringify(payload, null, 2));

      // Use upsert with email as conflict target so returning users update their data
      const upsertPromise = supabase
        .from('users')
        .upsert([payload], { onConflict: 'email' })
        .select();

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timed out after 8 seconds')), 8000));

      const { data, error } = await Promise.race([upsertPromise, timeoutPromise]);

      if (error) {
        console.error('Supabase insert/upsert error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        alert('ERROR: Data transmission failed. ' + error.message);
      } else {
        console.log('User data saved successfully:', data);
      }
      setCurrentScreen('terminal');
    } catch (err) {
      console.error('Unexpected error:', err);
      // alert('SYSTEM ERROR: ' + err.message); // Removing alert to prevent blocking the UI
      setCurrentScreen('terminal');
    }
  };

  const handleSignOut = async () => {
    try {
      // Add a timeout to signOut so it doesn't hang the UI
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Signout timeout')), 3000))
      ]);
    } catch (error) {
      console.error('Supabase signout error:', error);
    }
    setAuthUser(null);
    setFormData({
      full_name: '', phone_number: '', country: '', state: '', region: '', pin: '',
      email: '', verification_phone: '', preferred_language: '', detected_locale: 'AUTO-DETECT',
      emergency_override_english: false,
    });
    setCurrentScreen('splash');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // === SCREEN RENDERING ===

  // Loading screen while checking auth
  if (authLoading && currentScreen === 'splash') {
    return (
      <>
        {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
        <div className="absolute inset-0 w-screen h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-headline text-6xl font-black italic tracking-tighter text-white uppercase glitch-text mb-6">AAPDA</h1>
            <div className="flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-white text-2xl animate-spin">sync</span>
              <p className="font-mono text-[10px] text-[#919191] uppercase tracking-widest">AUTHENTICATING_SESSION...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentScreen === 'alert_details') {
    return (
      <>
        <ScreenTransition active={transitionActive} onComplete={onTransitionComplete} {...transitionConfig} />
        <AlertDetails 
          alert={selectedAlert}
          userLocale={formData.detected_locale}
          preferredLanguage={formData.preferred_language}
          onBack={() => setCurrentScreen('terminal')}
          onHome={navHome}
          onAI={navAI}
          onProfile={navProfile}
        />
      </>
    );
  }

  if (currentScreen === 'ai_terminal') {
    return (
      <>
        <ScreenTransition active={transitionActive} onComplete={onTransitionComplete} {...transitionConfig} />
        <AITerminal 
          onHome={navHome}
          onProfile={navProfile}
        />
      </>
    );
  }

  if (currentScreen === 'profile') {
    return (
      <>
        <ScreenTransition active={transitionActive} onComplete={onTransitionComplete} {...transitionConfig} />
        <AapdaAccountProfileFixed 
          onHome={navHome}
          onAI={navAI}
          onSignOut={handleSignOut}
          authUser={authUser}
          formData={formData}
          updateFormData={updateFormData}
        />
      </>
    );
  }

  if (currentScreen === 'terminal') {
    return (
      <>
        <ScreenTransition active={transitionActive} onComplete={onTransitionComplete} {...transitionConfig} />
        <TerminalHomepage 
          onAlertClick={(alert) => { setSelectedAlert(alert); setCurrentScreen('alert_details'); }} 
          onAIClick={navAI}
          onProfileClick={navProfile}
          userCountry={formData.country}
          userState={formData.state}
          userRegion={formData.region}
          userLocale={formData.detected_locale}
          userPhoneNumber={formData.phone_number}
        />
      </>
    );
  }

  if (currentScreen === 'language') {
    return (
      <LanguageSettings 
        formData={formData}
        updateFormData={updateFormData}
        onInitialize={handleFinalSubmit}
      />
    );
  }

  if (currentScreen === 'verification') {
    return (
      <ContactVerification 
        formData={formData}
        updateFormData={updateFormData}
        onVerify={() => setCurrentScreen('language')} 
      />
    );
  }

  if (currentScreen === 'registration') {
    return (
      <Registration 
        formData={formData}
        updateFormData={updateFormData}
        onNext={() => setCurrentScreen('verification')} 
      />
    );
  }

  // --- Splash Screen with Google Sign In ---
  return (
    <>
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
      <div className="absolute inset-0 w-screen min-h-screen bg-black overflow-hidden z-0">
      <video autoPlay loop muted playsInline
        className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
        src={bgVideo}
      ></video>
      <video autoPlay loop muted playsInline
        className="md:hidden absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
        src={bgVideoMobile}
      ></video>
      <div className="breach-overlay"></div>
      <div className="scanlines"></div>
      <div className="noise-layer"></div>
      <main className="flex-grow flex flex-col items-center justify-center w-full px-6 absolute inset-0 intro-motion-blur">
        <div className="flex flex-col items-center justify-center text-center space-y-24">
          <div>
            <h1 className="font-headline text-8xl md:text-9xl font-black italic tracking-tighter text-white uppercase glitch-text">
              AAPDA
            </h1>
            <p className="font-label text-[10px] tracking-[0.8em] text-outline uppercase mt-6 opacity-60 animate-pulse">
              Secure Void Protocol // Initializing
            </p>
          </div>
          <div className="w-full max-w-sm px-6 intro-motion-blur" style={{ animationDelay: '0.2s' }}>
            <button 
              onClick={handleGoogleSignIn}
              className="btn-surge group relative w-full bg-white text-black px-8 py-5 font-headline font-bold uppercase tracking-[0.25em] transition-all hover:bg-neutral-100 flex items-center justify-center gap-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Sign in with Google
              <div className="absolute inset-0 border border-white/40 -translate-x-1 -translate-y-1 pointer-events-none group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
              <div className="absolute -right-2 -top-2 w-4 h-4 border-r border-t border-white/50"></div>
              <div className="absolute -left-2 -bottom-2 w-4 h-4 border-l border-b border-white/50"></div>
            </button>
            <div className="mt-8 flex justify-center gap-1">
              <span className="h-1 w-8 bg-white/20"></span>
              <span className="h-1 w-2 bg-white/40"></span>
              <span className="h-1 w-1 bg-white/10"></span>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

export default App;
