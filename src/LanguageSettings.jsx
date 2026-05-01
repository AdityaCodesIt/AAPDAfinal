import React, { useState } from 'react';

const languages = [
  {"code": "en", "language": "English"},
  {"code": "zh", "language": "Chinese (Mandarin)"},
  {"code": "hi", "language": "Hindi"},
  {"code": "es", "language": "Spanish"},
  {"code": "fr", "language": "French"},
  {"code": "ar", "language": "Arabic"},
  {"code": "bn", "language": "Bengali"},
  {"code": "pt", "language": "Portuguese"},
  {"code": "ru", "language": "Russian"},
  {"code": "ur", "language": "Urdu"},
  {"code": "mr", "language": "Marathi"},
  {"code": "ta", "language": "Tamil"},
  {"code": "te", "language": "Telugu"},
  {"code": "kn", "language": "Kannada"},
  {"code": "ml", "language": "Malayalam"},
  {"code": "gu", "language": "Gujarati"},
  {"code": "pa", "language": "Punjabi"},
  {"code": "th", "language": "Thai"},
  {"code": "vi", "language": "Vietnamese"},
  {"code": "id", "language": "Indonesian"},
  {"code": "de", "language": "German"},
  {"code": "it", "language": "Italian"},
  {"code": "nl", "language": "Dutch"},
  {"code": "pl", "language": "Polish"},
  {"code": "uk", "language": "Ukrainian"},
  {"code": "el", "language": "Greek"},
  {"code": "sv", "language": "Swedish"},
  {"code": "sw", "language": "Swahili"},
  {"code": "ha", "language": "Hausa"},
  {"code": "yo", "language": "Yoruba"},
  {"code": "am", "language": "Amharic"},
  {"code": "ja", "language": "Japanese"},
  {"code": "ko", "language": "Korean"}
];

export default function LanguageSettings({ onInitialize, formData, updateFormData }) {
  const [selectedLanguage, setSelectedLanguage] = useState(formData?.preferred_language || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    updateFormData({ preferred_language: lang });
  };

  const handleEnglishOverride = () => {
    const newVal = selectedLanguage === 'ENGLISH (GLOBAL)' ? '' : 'ENGLISH (GLOBAL)';
    setSelectedLanguage(newVal);
    updateFormData({ 
      preferred_language: newVal, 
      emergency_override_english: newVal === 'ENGLISH (GLOBAL)' 
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onInitialize();
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#131313] text-[#e2e2e2] font-body min-h-[max(884px,100dvh)] selection:bg-white selection:text-[#1a1c1c] w-full">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-neutral-950/60 backdrop-blur-md flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
          <span className="font-['Space_Grotesk'] uppercase text-xl font-bold tracking-[0.2em] text-white">AAPDA</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-neutral-500 hover:text-white transition-opacity duration-100 cursor-pointer">close</span>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-md mx-auto relative z-10">
        {/* Hero Section */}
        <section className="mb-12">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-2">SYSTEM_AUTH // 004</p>
          <h1 className="font-headline text-5xl font-bold leading-none tracking-tighter uppercase text-white mb-4">
            LANGUAGE<br />CONFIGURATION
          </h1>
          <div className="h-px w-12 bg-white mb-6"></div>
          <p className="text-[#c6c6c6] text-sm leading-relaxed max-w-[80%]">
            Initialize communication protocols. Select primary linguistic anchors for the emergency interface.
          </p>
        </section>

        {/* Input Fields */}
        <div className="space-y-8">
          {/* Field 1: Preferred Language */}
          <div className="group focus-within:animate-[flicker_0.15s_ease-in-out] relative">
            <label className="block font-label text-[10px] uppercase tracking-widest text-neutral-500 mb-3">01 // PREFERRED_LANGUAGE</label>
            <div 
              className="relative bg-[#1b1b1b] p-4 flex items-center justify-between hover:bg-[#2a2a2a] transition-colors cursor-pointer group-hover:border-l-2 border-white"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="font-headline text-lg uppercase tracking-tight text-white">
                {selectedLanguage || 'Select Language'}
              </span>
              <span className={`material-symbols-outlined text-white transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </div>
            {/* Dropdown Panel */}
            {dropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-0 bg-[#0a0a0a] border border-neutral-700 max-h-64 overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-all hover:bg-white/10 hover:pl-6 border-b border-neutral-800/50 ${selectedLanguage === lang.language.toUpperCase() ? 'bg-white/10 border-l-2 border-l-white' : ''}`}
                    onClick={() => {
                      handleLanguageSelect(lang.language.toUpperCase());
                      setDropdownOpen(false);
                    }}
                  >
                    <span className="font-headline text-sm uppercase tracking-wider text-white">{lang.language}</span>
                    <span className="font-mono text-[9px] text-neutral-600 uppercase tracking-widest">{lang.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Field 2: Detected Language */}
          <div className="group focus-within:animate-[flicker_0.15s_ease-in-out]">
            <label className="block font-label text-[10px] uppercase tracking-widest text-neutral-500 mb-3">02 // DETECTED_SYSTEM_LOCALE</label>
            <div className="relative bg-[#1b1b1b] p-4 flex items-center justify-between border-l-2 border-neutral-700">
              <div className="flex items-center gap-2">
                <span className="font-headline text-lg uppercase tracking-tight text-neutral-400">AUTO-DETECT: </span>
                <span className="font-headline text-lg uppercase tracking-tight text-white">{formData?.detected_locale || 'SCANNING...'}</span>
              </div>
              <span className="material-symbols-outlined text-neutral-600">lock</span>
            </div>
            <p className="mt-2 font-label text-[9px] uppercase text-neutral-600 tracking-tight">Geolocation origin detected. Field locked by default.</p>
          </div>

          {/* Field 3: English Override */}
          <div className="group">
            <label className="block font-label text-[10px] uppercase tracking-widest text-neutral-500 mb-3">03 // EMERGENCY_OVERRIDE (ENGLISH)</label>
            <div 
              className="relative bg-[#2a2a2a] p-4 flex items-center justify-between cursor-pointer"
              onClick={handleEnglishOverride}
            >
              <span className="font-headline text-lg uppercase tracking-tight text-white">ENGLISH (GLOBAL)</span>
              <div className={`w-12 h-6 flex items-center px-1 transition-colors ${selectedLanguage === 'ENGLISH (GLOBAL)' ? 'bg-white' : 'bg-neutral-600'}`}>
                <div className={`w-4 h-4 transition-all duration-200 ${selectedLanguage === 'ENGLISH (GLOBAL)' ? 'bg-[#1a1c1c] translate-x-6' : 'bg-white translate-x-0'}`}></div>
              </div>
            </div>
            <p className="mt-2 font-label text-[9px] uppercase text-white tracking-tight">Secondary fail-safe enabled.</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full bg-white text-[#1a1c1c] font-label font-bold py-5 px-6 flex items-center justify-between group hover:bg-[#c8c6c6] transition-all active:translate-x-1 duration-75 ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
          >
            <span className="uppercase tracking-[0.2em] text-sm">
              {isSubmitting ? 'TRANSMITTING DATA...' : 'INITIALIZE LANGUAGE PROTOCOL'}
            </span>
            <span className="material-symbols-outlined">
              {isSubmitting ? 'sync' : 'terminal'}
            </span>
          </button>
          <div className="mt-6 p-4 border border-[#474747]/30 flex items-start gap-4">
            <span className="material-symbols-outlined text-[#ffb4ab] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <p className="font-label text-[10px] text-neutral-500 uppercase leading-normal">
              Warning: Changing communication protocols during active deployment may cause temporary synchronization delays. 
            </p>
          </div>
        </div>
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] text-[20rem] font-bold text-white/[0.02] font-headline select-none leading-none tracking-tighter">
          VOID
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>
    </div>
  );
}
