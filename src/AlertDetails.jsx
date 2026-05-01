import React, { useState, useEffect } from 'react';
import { translateText, extractLangCode, LANGUAGE_OPTIONS } from './translateService.js';

export default function AlertDetails({ alert, userLocale, preferredLanguage, onBack, onHome, onAI, onProfile }) {
  // Translation states
  const [localeTranslation, setLocaleTranslation] = useState(null);
  const [prefLangTranslation, setPrefLangTranslation] = useState(null);
  const [customTranslation, setCustomTranslation] = useState(null);
  const [customLang, setCustomLang] = useState('');
  const [isTranslatingLocale, setIsTranslatingLocale] = useState(true);
  const [isTranslatingPrefLang, setIsTranslatingPrefLang] = useState(false);
  const [isTranslatingCustom, setIsTranslatingCustom] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [playingAudio, setPlayingAudio] = useState(false);

  // AI Summarizer states
  const [aiSummary, setAiSummary] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Fallback if no alert was passed
  const data = alert || {
    title: 'NO ALERT DATA',
    description: 'No alert was selected. Return to the home screen.',
    severity: 'low',
    timestamp: 'N/A',
    source: 'SYSTEM',
    location: 'UNKNOWN',
    alertLevel: 'Green',
    eventType: 'SYSTEM',
    guidelines: [],
    emergency: '',
  };

  const localeLangCode = extractLangCode(userLocale);
  const localeLangName = LANGUAGE_OPTIONS.find(l => l.code === localeLangCode)?.label || userLocale || 'Regional';

  const prefLangCode = extractLangCode(preferredLanguage);
  const prefLangName = LANGUAGE_OPTIONS.find(l => l.code === prefLangCode)?.label || preferredLanguage || '';
  // Only show preferred language card if it's different from locale and not english
  const showPrefLangCard = prefLangCode && prefLangCode !== 'en' && prefLangCode !== localeLangCode;

  // Severity config
  const severityConfig = {
    high: { color: '#ff3b3b', label: 'CRITICAL', borderColor: 'border-[#ff3b3b]', bgGlow: 'shadow-[0_0_60px_rgba(255,59,59,0.15)]', badgeBg: 'bg-[#ff3b3b]', badgeText: 'text-white' },
    medium: { color: '#eab308', label: 'ELEVATED', borderColor: 'border-yellow-500', bgGlow: 'shadow-[0_0_60px_rgba(234,179,8,0.1)]', badgeBg: 'bg-yellow-500', badgeText: 'text-black' },
    low: { color: '#22c55e', label: 'ADVISORY', borderColor: 'border-green-500', bgGlow: 'shadow-[0_0_60px_rgba(34,197,94,0.1)]', badgeBg: 'bg-green-600', badgeText: 'text-white' },
  };
  const sev = severityConfig[data.severity] || severityConfig.low;

  // AI Summarizer
  const fetchAiSummary = async () => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      setAiError('API key missing.');
      return;
    }
    setIsAiLoading(true);
    setAiError(null);
    setAiSummary(null);
    try {
      const alertContext = [
        `Title: ${data.title}`,
        `Type: ${data.eventType}`,
        `Severity: ${sev.label}`,
        `Location: ${data.location}`,
        `Timestamp: ${data.timestamp}`,
        `Source: ${data.source}`,
        `Description: ${data.description}`,
        data.guidelines?.length ? `Safety Guidelines:\n${data.guidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}` : '',
        data.emergency ? `Emergency Info: ${data.emergency}` : '',
      ].filter(Boolean).join('\n');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AAPDA_SUMMARIZER'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b:free',
          messages: [
            {
              role: 'system',
              content: `You are an emergency alert summarizer for AAPDA, a disaster management platform used by ordinary citizens in India. Your job is to read a raw disaster alert and produce a clear, simple, human-friendly summary. Respond ONLY with a valid JSON object in this exact shape:
{
  "headline": "One short sentence (max 15 words) describing what happened",
  "what": "1-2 sentences explaining what is happening in simple words",
  "who": "1 sentence on who is affected",
  "action": "1-2 sentences on the single most important thing the user should do RIGHT NOW",
  "risk": "low" | "medium" | "high"
}
Do NOT include any text outside the JSON. Do NOT use markdown. Keep language simple, like explaining to a non-expert.`
            },
            {
              role: 'user',
              content: `Summarize this alert:\n\n${alertContext}`
            }
          ]
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      const raw = result.choices?.[0]?.message?.content || '';
      // Strip potential markdown code fences
      const clean = raw.replace(/```json\n?/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      setAiSummary(parsed);
    } catch (err) {
      console.error('AI summarizer error:', err);
      setAiError('Could not generate summary. Try again.');
    }
    setIsAiLoading(false);
  };

  // Trigger AI summary on mount
  useEffect(() => {
    fetchAiSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id]);

  // Auto-translate to detected locale on mount
  useEffect(() => {
    if (localeLangCode === 'en') {
      setLocaleTranslation({ title: data.title, description: data.description, guidelines: data.guidelines, emergency: data.emergency });
      setIsTranslatingLocale(false);
      return;
    }

    let cancelled = false;
    async function doTranslate() {
      setIsTranslatingLocale(true);
      try {
        const tTitle = await translateText(data.title, localeLangCode);
        const tDesc = await translateText(data.description, localeLangCode);
        const tGuidelines = [];
        if (data.guidelines) {
          for (const g of data.guidelines) {
            tGuidelines.push(await translateText(g, localeLangCode));
          }
        }
        const tEmergency = data.emergency ? await translateText(data.emergency, localeLangCode) : '';
        if (!cancelled) {
          setLocaleTranslation({ title: tTitle, description: tDesc, guidelines: tGuidelines, emergency: tEmergency });
        }
      } catch (e) {
        console.error('Locale translation failed:', e);
        if (!cancelled) {
          setLocaleTranslation({ title: data.title, description: data.description, guidelines: data.guidelines || [], emergency: data.emergency || '' });
        }
      }
      if (!cancelled) setIsTranslatingLocale(false);
    }
    doTranslate();
    return () => { cancelled = true; };
  }, [data.id, localeLangCode]);

  // Auto-translate to preferred language on mount (if different from locale)
  useEffect(() => {
    if (!showPrefLangCard) return;

    let cancelled = false;
    async function doPrefTranslate() {
      setIsTranslatingPrefLang(true);
      try {
        const tTitle = await translateText(data.title, prefLangCode);
        const tDesc = await translateText(data.description, prefLangCode);
        const tGuidelines = [];
        if (data.guidelines) {
          for (const g of data.guidelines) {
            tGuidelines.push(await translateText(g, prefLangCode));
          }
        }
        const tEmergency = data.emergency ? await translateText(data.emergency, prefLangCode) : '';
        if (!cancelled) {
          setPrefLangTranslation({ title: tTitle, description: tDesc, guidelines: tGuidelines, emergency: tEmergency });
        }
      } catch (e) {
        console.error('Preferred language translation failed:', e);
        if (!cancelled) {
          setPrefLangTranslation({ title: data.title, description: data.description, guidelines: data.guidelines || [], emergency: data.emergency || '' });
        }
      }
      if (!cancelled) setIsTranslatingPrefLang(false);
    }
    doPrefTranslate();
    return () => { cancelled = true; };
  }, [data.id, prefLangCode, showPrefLangCard]);

  // Translate to custom language
  const handleCustomTranslate = async (langCode) => {
    setCustomLang(langCode);
    setShowLangPicker(false);
    setIsTranslatingCustom(true);
    try {
      const tTitle = await translateText(data.title, langCode);
      const tDesc = await translateText(data.description, langCode);
      const tGuidelines = [];
      if (data.guidelines) {
        for (const g of data.guidelines) {
          tGuidelines.push(await translateText(g, langCode));
        }
      }
      const tEmergency = data.emergency ? await translateText(data.emergency, langCode) : '';
      setCustomTranslation({ title: tTitle, description: tDesc, guidelines: tGuidelines, emergency: tEmergency });
    } catch (e) {
      console.error('Custom translation failed:', e);
    }
    setIsTranslatingCustom(false);
  };

  const customLangLabel = LANGUAGE_OPTIONS.find(l => l.code === customLang)?.label || customLang.toUpperCase();
  const customLangNative = LANGUAGE_OPTIONS.find(l => l.code === customLang)?.native || '';

  const handleSpeak = async (text) => {
    if (playingAudio || !text) return;
    setPlayingAudio(true);
    try {
      const apiKey = 'sk_4b44f228a49554b32dc31c4217963dfb600cf8b16e304f2f';
      const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
        }),
      });

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setPlayingAudio(false);
      audio.onerror = () => setPlayingAudio(false);
      audio.play();
    } catch (error) {
      console.error(error);
      setPlayingAudio(false);
    }
  };

  const filteredLangs = LANGUAGE_OPTIONS.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.native.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.includes(langSearch.toLowerCase())
  );

  return (
    <div className="absolute inset-0 w-screen min-h-screen z-0 bg-[#0a0a0a] text-[#e2e2e2] font-body overflow-x-hidden text-left">
      <style>{`
        @keyframes pulse-border { 0%, 100% { border-color: ${sev.color}40; } 50% { border-color: ${sev.color}; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .shimmer-loading {
          background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }
        .lang-picker-backdrop { backdrop-filter: blur(20px); }
        .translate-card { transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
        .translate-card:hover { transform: translateY(-2px); }

        /* --- DESKTOP REDESIGN (1024px+) --- */
        @media (min-width: 1024px) {
            main {
                max-width: 100% !important;
                padding-left: 48px !important;
                padding-right: 48px !important;
                padding-bottom: 100px !important;
            }

            header {
                padding-left: 48px !important;
                padding-right: 48px !important;
            }
        }

        /* --- NEW FLOATING NAV --- */
        .ui-nav-pill {
            --col-active: #fff;
            --col-dark: rgba(12, 15, 20, 0.85);
            --col-darkGray: #52555a;
            --col-gray: #aeaeae;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            width: fit-content;
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            background-color: var(--col-dark);
            border-radius: 40px;
            padding: 4px 12px;
            box-shadow: 0 0 20px rgba(255,255,255,0.15), 0 10px 40px rgba(0,0,0,0.8);
        }
        .ui-nav-label {
            padding: 12px 24px;
            transition: all 200ms;
            display: inline-block;
            cursor: pointer;
            position: relative;
        }
        .ui-nav-label input[type="radio"] {
            display: none;
        }
        .ui-nav-label > span.material-symbols-outlined {
            transition: all 300ms;
            color: var(--col-darkGray);
            display: block;
            margin-top: 0;
            text-align: center;
        }
        .ui-nav-label:hover:not(:has(input:checked)) > span.material-symbols-outlined {
            color: var(--col-active);
            opacity: 0.6;
        }
        .ui-nav-label::before {
            content: "";
            display: block;
            width: 0%;
            height: 3px;
            border-radius: 5px;
            position: absolute;
            left: 50%;
            bottom: 4px;
            transform: translateX(-50%);
            background: var(--col-active);
            transition: all 200ms;
            box-shadow: 0 0 10px var(--col-active);
        }
        .ui-nav-label:has(input:checked) > span.material-symbols-outlined {
            color: var(--col-active);
            scale: 1.2;
            margin-top: -6px;
            text-shadow: 0 0 15px rgba(255,255,255,0.5);
        }
        .ui-nav-label:has(input:checked)::before {
            width: 40%;
        }
        @keyframes ai-glow-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
          50% { box-shadow: 0 0 30px 4px rgba(139,92,246,0.25); }
        }
        .ai-brief-card {
          animation: ai-glow-pulse 3s ease-in-out infinite;
        }
        @keyframes ai-scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .ai-scanline {
          animation: ai-scanline 2.5s linear infinite;
        }
      `}</style>

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-xl flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="hover:bg-white/10 transition-all p-2 -ml-2">
            <span className="material-symbols-outlined text-white text-2xl">arrow_back</span>
          </button>
          <span className="text-2xl font-black tracking-tighter text-white font-headline uppercase">AAPDA</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`${sev.badgeBg} ${sev.badgeText} font-headline text-[10px] font-black px-3 py-1.5 tracking-wider uppercase`}>
            {sev.label}
          </span>
        </div>
      </header>

      <main className="pt-24 pb-32 min-h-screen px-6 max-w-5xl mx-auto space-y-10">
        
        {/* Hero Alert Banner */}
        <section className={`border-l-8 ${sev.borderColor} ${sev.bgGlow} bg-white/[0.02] p-8 md:p-12 space-y-6`} style={{ animation: data.severity === 'high' ? 'pulse-border 2s infinite' : 'none' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`${sev.badgeBg} ${sev.badgeText} font-headline text-xs font-black px-3 py-1 tracking-tighter uppercase`}>
              {data.severity === 'high' ? 'CRITICAL_EVENT' : data.severity === 'medium' ? 'ELEVATED_RISK' : 'INFO_LOG'}
            </span>
            <span className="font-mono text-[10px] text-[#919191] tracking-widest uppercase">STAMP: {data.timestamp}</span>
            <span className="font-mono text-[10px] text-[#919191] tracking-widest uppercase">SRC: {data.source}</span>
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-black text-white leading-[0.95] tracking-tighter uppercase">
            {data.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#919191] uppercase tracking-widest">LOC_ID</span>
              <span className="font-mono font-bold text-white text-sm border-b border-white/20 pb-0.5">{data.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#919191] uppercase tracking-widest">TYPE</span>
              <span className="font-mono font-bold text-white text-sm border-b border-white/20 pb-0.5">{data.eventType}</span>
            </div>
          </div>
        </section>

        {/* ===== AI BRIEF CARD ===== */}
        <section className="ai-brief-card relative overflow-hidden bg-gradient-to-br from-[#1a0a2e] via-[#0f0f1a] to-[#0a0a0a] border border-purple-500/30 p-8 space-y-6">
          {/* Decorative scanline sweep */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="ai-scanline absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
          </div>

          {/* Header row */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 bg-purple-500/20 border border-purple-500/40">
                <span className="material-symbols-outlined text-purple-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <p className="font-mono text-[10px] text-purple-400 uppercase tracking-[0.35em]">AI_BRIEF // AAPDA_CORE</p>
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Plain-language summary • Powered by OpenRouter</p>
              </div>
            </div>
            <button
              onClick={fetchAiSummary}
              disabled={isAiLoading}
              className="flex items-center gap-2 border border-purple-500/40 px-4 py-2 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/60 transition-all font-mono text-[10px] uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className={`material-symbols-outlined text-sm ${isAiLoading ? 'animate-spin' : ''}`}>{isAiLoading ? 'sync' : 'refresh'}</span>
              {isAiLoading ? 'GENERATING...' : 'REGENERATE'}
            </button>
          </div>

          {/* Loading shimmer */}
          {isAiLoading && (
            <div className="space-y-4">
              <div className="h-7 w-4/5 rounded" style={{ background: 'linear-gradient(90deg,#1e1040 25%,#2d1a60 50%,#1e1040 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}></div>
              <div className="space-y-3 pt-2">
                {[1, 0.8, 0.9, 0.7].map((w, i) => (
                  <div key={i} className="h-4 rounded" style={{ width: `${w * 100}%`, background: 'linear-gradient(90deg,#1e1040 25%,#2d1a60 50%,#1e1040 75%)', backgroundSize: '200% 100%', animation: `shimmer 1.5s infinite ${i * 0.15}s` }}></div>
                ))}
              </div>
              <p className="font-mono text-[10px] text-purple-400/60 uppercase tracking-widest animate-pulse">ANALYZING ALERT DATA...</p>
            </div>
          )}

          {/* Error state */}
          {aiError && !isAiLoading && (
            <div className="flex items-center gap-3 text-red-400/80">
              <span className="material-symbols-outlined text-lg">error</span>
              <p className="font-mono text-xs uppercase tracking-widest">{aiError}</p>
            </div>
          )}

          {/* Summary content */}
          {aiSummary && !isAiLoading && (
            <div className="space-y-5">
              {/* Headline */}
              <p className="font-headline text-2xl md:text-3xl font-black text-white leading-tight">
                {aiSummary.headline}
              </p>

              {/* Risk badge */}
              <div className="flex items-center gap-3">
                <span className={`font-mono text-[10px] px-3 py-1 uppercase tracking-widest font-bold ${
                  aiSummary.risk === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  aiSummary.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                  'bg-green-500/20 text-green-400 border border-green-500/40'
                }`}>
                  RISK: {(aiSummary.risk || 'unknown').toUpperCase()}
                </span>
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">AI ASSESSMENT</span>
              </div>

              {/* Info blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.07] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400 text-base">info</span>
                    <span className="font-mono text-[9px] text-purple-400 uppercase tracking-[0.3em]">WHAT'S HAPPENING</span>
                  </div>
                  <p className="font-body text-white/80 text-sm leading-relaxed">{aiSummary.what}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.07] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400 text-base">group</span>
                    <span className="font-mono text-[9px] text-purple-400 uppercase tracking-[0.3em]">WHO'S AFFECTED</span>
                  </div>
                  <p className="font-body text-white/80 text-sm leading-relaxed">{aiSummary.who}</p>
                </div>
                <div className="bg-purple-500/[0.08] border border-purple-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-300 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
                    <span className="font-mono text-[9px] text-purple-300 uppercase tracking-[0.3em]">DO THIS NOW</span>
                  </div>
                  <p className="font-body text-purple-100 text-sm font-semibold leading-relaxed">{aiSummary.action}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Translation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CARD 1: Detected Locale Translation */}
          <div className="translate-card bg-white/[0.03] border border-white/10 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white/40 text-lg">translate</span>
                <span className="font-mono text-[10px] text-[#919191] uppercase tracking-[0.3em]">
                  REGIONAL: {localeLangName.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleSpeak(`${localeTranslation?.title || ''}. ${localeTranslation?.description || ''}`)}
                  disabled={playingAudio || isTranslatingLocale}
                  title="Play audio"
                  className={`flex items-center justify-center p-2 rounded-full transition-all ${playingAudio ? 'bg-white/20 text-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-lg">volume_up</span>
                </button>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sev.color }}></span>
              </div>
            </div>
            
            {isTranslatingLocale ? (
              <div className="space-y-4">
                <div className="shimmer-loading h-8 w-3/4"></div>
                <div className="shimmer-loading h-4 w-full"></div>
                <div className="shimmer-loading h-4 w-5/6"></div>
                <div className="shimmer-loading h-4 w-2/3"></div>
                <p className="font-mono text-[10px] text-[#919191] uppercase tracking-widest animate-pulse mt-4">TRANSLATING_VIA_GOOGLE_API...</p>
              </div>
            ) : (
              <>
                <h2 className="font-headline text-2xl md:text-3xl font-black text-white leading-tight">
                  {localeTranslation?.title}
                </h2>
                <p className="font-body text-white/80 text-sm md:text-base leading-relaxed">
                  {localeTranslation?.description}
                </p>
                {localeTranslation?.guidelines?.length > 0 && (
                  <ul className="text-white/60 font-body text-sm list-disc pl-5 space-y-1.5">
                    {localeTranslation.guidelines.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                )}
                {localeTranslation?.emergency && (
                  <p className="font-mono text-sm" style={{ color: sev.color }}>{localeTranslation.emergency}</p>
                )}
              </>
            )}
          </div>

        {/* CARD 3: Preferred Language (from sign-up) */}
        {showPrefLangCard && (
          <div className="translate-card bg-white/[0.03] border border-white/10 p-8 space-y-6" style={{ borderTop: '2px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white/40 text-lg">record_voice_over</span>
                <span className="font-mono text-[10px] text-[#919191] uppercase tracking-[0.3em]">
                  PREFERRED: {prefLangName.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleSpeak(`${prefLangTranslation?.title || ''}. ${prefLangTranslation?.description || ''}`)}
                  disabled={playingAudio || isTranslatingPrefLang}
                  title="Play audio"
                  className={`flex items-center justify-center p-2 rounded-full transition-all ${playingAudio ? 'bg-white/20 text-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-lg">volume_up</span>
                </button>
                <span className="font-mono text-[10px] px-2 py-0.5 border border-white/20 text-white/40 uppercase tracking-widest">USER PREF</span>
              </div>
            </div>

            {isTranslatingPrefLang ? (
              <div className="space-y-4">
                <div className="shimmer-loading h-8 w-3/4"></div>
                <div className="shimmer-loading h-4 w-full"></div>
                <div className="shimmer-loading h-4 w-5/6"></div>
                <div className="shimmer-loading h-4 w-2/3"></div>
                <p className="font-mono text-[10px] text-[#919191] uppercase tracking-widest animate-pulse mt-4">TRANSLATING_VIA_GOOGLE_API...</p>
              </div>
            ) : (
              <>
                <h2 className="font-headline text-2xl md:text-3xl font-black text-white leading-tight">
                  {prefLangTranslation?.title}
                </h2>
                <p className="font-body text-white/80 text-sm md:text-base leading-relaxed">
                  {prefLangTranslation?.description}
                </p>
                {prefLangTranslation?.guidelines?.length > 0 && (
                  <ul className="text-white/60 font-body text-sm list-disc pl-5 space-y-1.5">
                    {prefLangTranslation.guidelines.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                )}
                {prefLangTranslation?.emergency && (
                  <p className="font-mono text-sm" style={{ color: sev.color }}>{prefLangTranslation.emergency}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* CARD: English (Original) */}
          <div className="translate-card bg-white/[0.03] border border-white/10 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white/40 text-lg">language</span>
                <span className="font-mono text-[10px] text-[#919191] uppercase tracking-[0.3em]">GLOBAL STANDARD: ENGLISH</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleSpeak(`${data.title || ''}. ${data.description || ''}`)}
                  disabled={playingAudio}
                  title="Play audio"
                  className={`flex items-center justify-center p-2 rounded-full transition-all ${playingAudio ? 'bg-white/20 text-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-lg">volume_up</span>
                </button>
                <span className="w-2 h-2 rounded-full bg-white/30"></span>
              </div>
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-black text-white leading-tight">
              {data.title}
            </h2>
            <p className="font-body text-white/80 text-sm md:text-base leading-relaxed">
              {data.description}
            </p>
            {data.guidelines?.length > 0 && (
              <ul className="text-white/60 font-body text-sm list-disc pl-5 space-y-1.5">
                {data.guidelines.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            )}
            {data.emergency && (
              <p className="font-mono text-sm" style={{ color: sev.color }}>{data.emergency}</p>
            )}
          </div>
        </div>

        {/* CARD 3: Custom Language Translation */}
        <div className={`translate-card bg-white/[0.03] border border-white/10 p-8 space-y-6 relative ${showLangPicker ? 'z-50' : 'z-10'}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white/40 text-lg">g_translate</span>
              <span className="font-mono text-[10px] text-[#919191] uppercase tracking-[0.3em]">
                {customTranslation ? `CUSTOM: ${customLangLabel.toUpperCase()}` : 'TRANSLATE TO ANY LANGUAGE'}
              </span>
            </div>
            <button
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="bg-white text-[#0a0a0a] font-headline font-black text-xs uppercase tracking-widest px-6 py-3 hover:bg-white/90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">translate</span>
              {customTranslation ? 'CHANGE LANGUAGE' : 'SELECT LANGUAGE'}
            </button>
          </div>

          {/* Language Picker Dropdown */}
          {showLangPicker && (
            <div className="absolute top-20 right-8 z-50 w-80 max-h-96 overflow-hidden bg-[#131313] border border-white/20 lang-picker-backdrop flex flex-col" style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}>
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2">
                  <span className="material-symbols-outlined text-white/40 text-lg">search</span>
                  <input
                    type="text"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder="Search language..."
                    className="bg-transparent text-white font-mono text-sm w-full outline-none placeholder:text-white/30"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {filteredLangs.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLangSearch(''); handleCustomTranslate(lang.code); }}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors border-b border-white/5 ${customLang === lang.code ? 'bg-white/10' : ''}`}
                  >
                    <div>
                      <span className="text-white font-bold text-sm">{lang.label}</span>
                      <span className="text-white/40 text-sm ml-2">{lang.native}</span>
                    </div>
                    <span className="font-mono text-[10px] text-white/30 uppercase">{lang.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Translation Content */}
          {isTranslatingCustom ? (
            <div className="space-y-4 pt-2">
              <div className="shimmer-loading h-8 w-3/4"></div>
              <div className="shimmer-loading h-4 w-full"></div>
              <div className="shimmer-loading h-4 w-5/6"></div>
              <div className="shimmer-loading h-4 w-2/3"></div>
              <p className="font-mono text-[10px] text-[#919191] uppercase tracking-widest animate-pulse mt-4">
                TRANSLATING_TO_{customLangLabel.toUpperCase()}_VIA_GOOGLE_API...
              </p>
            </div>
          ) : customTranslation ? (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-white/40 uppercase tracking-widest">{customLangLabel}</span>
                  {customLangNative && <span className="text-white/60 text-lg">{customLangNative}</span>}
                </div>
                <button 
                  onClick={() => handleSpeak(`${customTranslation?.title || ''}. ${customTranslation?.description || ''}`)}
                  disabled={playingAudio || isTranslatingCustom}
                  title="Play audio"
                  className={`flex items-center justify-center p-2 rounded-full transition-all ${playingAudio ? 'bg-white/20 text-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-lg">volume_up</span>
                </button>
              </div>
              <h2 className="font-headline text-2xl md:text-3xl font-black text-white leading-tight">
                {customTranslation.title}
              </h2>
              <p className="font-body text-white/80 text-sm md:text-base leading-relaxed">
                {customTranslation.description}
              </p>
              {customTranslation.guidelines?.length > 0 && (
                <ul className="text-white/60 font-body text-sm list-disc pl-5 space-y-1.5">
                  {customTranslation.guidelines.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              )}
              {customTranslation.emergency && (
                <p className="font-mono text-sm" style={{ color: sev.color }}>{customTranslation.emergency}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-40">
              <span className="material-symbols-outlined text-6xl text-white/20">translate</span>
              <p className="font-mono text-xs text-white/40 uppercase tracking-widest">SELECT A LANGUAGE TO TRANSLATE THIS ALERT</p>
              <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest">POWERED BY GOOGLE TRANSLATE API</p>
            </div>
          )}
        </div>

        {/* Alert Metadata & Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'THREAT LVL', value: sev.label, color: sev.color },
            { label: 'ALERT CODE', value: data.alertLevel?.toUpperCase() || 'N/A', color: sev.color },
            { label: 'EVENT TYPE', value: data.eventType, color: '#fff' },
            { label: 'REGION', value: data.location, color: '#fff' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 p-6 space-y-2">
              <span className="font-mono text-[9px] text-[#919191] uppercase tracking-widest block">{stat.label}</span>
              <span className="font-headline text-lg font-black uppercase" style={{ color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </section>

        {/* Emergency Action */}
        {data.emergency && (
          <section className="bg-white/[0.02] border border-white/10 border-l-4 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style={{ borderLeftColor: sev.color }}>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl" style={{ color: sev.color }}>emergency</span>
              <div>
                <h3 className="font-headline text-xl font-black text-white uppercase tracking-tighter mb-1">EMERGENCY CONTACTS</h3>
                <p className="font-mono text-sm text-white/70">{data.emergency}</p>
              </div>
            </div>
            <a href="tel:112" className="bg-white text-[#0a0a0a] font-headline font-black text-sm uppercase tracking-widest px-8 py-4 hover:bg-white/90 transition-all flex items-center gap-2 whitespace-nowrap">
              <span className="material-symbols-outlined">call</span>
              CALL 112
            </a>
          </section>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-8 left-0 w-full flex justify-center z-50 pointer-events-none">
        <section className="ui-nav-pill pointer-events-auto">
          <label title="AI Terminal" className="ui-nav-label">
            <input name="page" type="radio" onClick={onAI} />
            <span className="material-symbols-outlined text-3xl">smart_toy</span>
          </label>
          <label title="Home" className="ui-nav-label">
            <input name="page" type="radio" onClick={onHome} />
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          </label>
          <label title="Profile" className="ui-nav-label">
            <input name="page" type="radio" onClick={onProfile} />
            <span className="material-symbols-outlined text-3xl">person</span>
          </label>
        </section>
      </div>

      {/* Click outside to close lang picker */}
      {showLangPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowLangPicker(false)}></div>
      )}
    </div>
  );
}
