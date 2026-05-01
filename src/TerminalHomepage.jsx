import React, { useEffect, useRef, useState } from 'react';
import { fetchDisasterAlerts } from './disasterService.js';
import { sendSMSAlert } from './smsService.js';

// Module-level flag so the boot sequence only plays once per session
let hasBootedOnce = false;

export default function TerminalHomepage({ onAlertClick, onAIClick, onProfileClick, userCountry, userState, userRegion, userLocale, userPhoneNumber }) {
  const canvasRef = useRef(null);
  const bootLayerRef = useRef(null);
  const bootContentRef = useRef(null);
  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const navRef = useRef(null);
  const alertsRef = useRef(null);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // --- TRANSLATION SYSTEM ---
  const [activeLang, setActiveLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedAlerts, setTranslatedAlerts] = useState({});

  async function translateText(text, targetLangCode) {
    if (!text) return '';
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0].map(x => x[0]).join('');
    } catch (e) {
      console.error('Translation failed', e);
      return text;
    }
  }

  const handleTranslate = async () => {
    if (activeLang !== 'en') return;
    
    // Extract lang code from "(MR)" -> "mr", default to Hindi "hi"
    const userLangCodeMatch = userLocale ? userLocale.match(/\(([A-Z]{2,3})\)/i) : null;
    const targetLangCode = userLangCodeMatch ? userLangCodeMatch[1].toLowerCase() : 'hi';
    
    setIsTranslating(true);
    
    const newTranslations = { ...translatedAlerts };
    for (const alert of alerts) {
      if (!newTranslations[alert.id]) {
        const tTitle = await translateText(alert.title, targetLangCode);
        const tDesc = await translateText(alert.description, targetLangCode);
        newTranslations[alert.id] = { title: tTitle, description: tDesc };
      }
    }
    
    setTranslatedAlerts(newTranslations);
    setActiveLang(targetLangCode);
    setIsTranslating(false);
  };

  const handleRevert = () => {
    setActiveLang('en');
  };

  useEffect(() => {
    // --- NOISE BACKGROUND ENGINE ---
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function noise() {
      const idata = ctx.createImageData(canvas.width, canvas.height);
      const buffer32 = new Uint32Array(idata.data.buffer);
      for (let i = 0; i < buffer32.length; i++) {
        // Increased noise frequency for higher intensity
        if (Math.random() < 0.12) buffer32[i] = Math.random() < 0.5 ? 0xffffffff : 0xff000000;
      }
      ctx.putImageData(idata, 0, 0);
      animationFrameId = requestAnimationFrame(noise);
    }
    noise();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- FETCH DISASTER ALERTS ---
  useEffect(() => {
    async function loadAlerts() {
      setLoadingAlerts(true);
      try {
        const data = await fetchDisasterAlerts(userCountry, userState, userRegion);
        setAlerts(data);
      } catch (err) {
        console.error('Failed to load alerts:', err);
      }
      setLoadingAlerts(false);
    }
    loadAlerts();
  }, [userCountry, userState, userRegion]);

  // --- AUTOMATED SMS ALERTS ---
  useEffect(() => {
    if (!userPhoneNumber || alerts.length === 0) return;
    
    // Use local storage to prevent duplicate alerts per device
    const notifiedKey = 'aapda_notified_alerts_sms';
    let notifiedList = [];
    try {
      notifiedList = JSON.parse(localStorage.getItem(notifiedKey)) || [];
    } catch (e) {}

    // Send SMS messages for new high-severity alerts (or custom mock alerts)
    alerts.forEach(alert => {
      if (alert.severity === 'high' && !notifiedList.includes(alert.id)) {
        console.log("Triggering auto SMS alert for:", alert.title);
        sendSMSAlert(alert, userPhoneNumber, userLocale || 'English');
        notifiedList.push(alert.id);
      }
    });

    localStorage.setItem(notifiedKey, JSON.stringify(notifiedList));
  }, [alerts, userPhoneNumber, userLocale]);

  // --- DYNAMIC REVEAL FOR ALERTS ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const dynamicElements = alertsRef.current?.querySelectorAll('.reveal-hidden:not(.reveal-visible)');
      if (dynamicElements) {
        dynamicElements.forEach((el, i) => {
          setTimeout(() => {
            el.classList.add('reveal-visible');
            const decryptText = el.querySelectorAll('.decrypting');
            decryptText.forEach(node => decryptEffect(node));
          }, i * 100);
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [alerts, loadingAlerts]);

  useEffect(() => {
    // --- INTRO SEQUENCE ENGINE ---
    const bootLines = [
      "AAPDA_OS v4.2.1 [STABLE]",
      "INITIALIZING CORE KERNEL...",
      "CHECKING ORBITAL UPLINK... [OK]",
      "VERIFYING ENCRYPTION KEYS... [OK]",
      "SYNCING TECTONIC SENSOR ARRAY...",
      "NODE_ID: 0x882_ALPHA",
      "ACCESS GRANTED.",
      "RUNNING MAIN_SEQUENCE...",
      "> BOOT_COMPLETE"
    ];

    const bootContent = bootContentRef.current;
    const bootLayer = bootLayerRef.current;

    let isMounted = true;

    function revealUI(instant) {
      const header = headerRef.current;
      const hero = heroRef.current;
      const nav = navRef.current;
      const alerts = alertsRef.current?.querySelectorAll('.reveal-hidden');

      if (instant) {
        // Skip animations — show everything immediately
        if (header) { header.style.transition = 'none'; header.classList.add('reveal-visible'); }
        if (hero) { hero.style.transition = 'none'; hero.classList.add('reveal-visible'); }
        if (nav) { nav.style.transition = 'none'; nav.classList.add('reveal-visible'); }
        if (alerts) {
          alerts.forEach((card) => {
            card.style.transition = 'none';
            card.classList.add('reveal-visible');
          });
        }
      } else {
        // Animated reveal (first boot)
        if (header) header.classList.add('reveal-visible');
        if (hero) setTimeout(() => hero.classList.add('reveal-visible'), 150);
        if (nav) setTimeout(() => nav.classList.add('reveal-visible'), 300);

        if (alerts) {
          alerts.forEach((card, i) => {
            setTimeout(() => {
              if (!isMounted) return;
              card.classList.add('reveal-visible');
              const decryptText = card.querySelectorAll('.decrypting');
              decryptText.forEach(el => decryptEffect(el));
            }, 450 + (i * 100));
          });
        }

        if (hero) {
          const decryptingHeroText = hero.querySelector('.decrypting');
          if (decryptingHeroText) decryptEffect(decryptingHeroText);
        }
      }
    }

    // If we've already booted once this session, skip the whole boot sequence
    if (hasBootedOnce) {
      if (bootLayer) { bootLayer.style.display = 'none'; }
      revealUI(true);
      return;
    }

    async function runBoot() {
      if (!bootContent || !bootLayer) return;
      
      // Stage 1 & 2
      for (let line of bootLines) {
        if (!isMounted) return;
        const div = document.createElement('div');
        div.className = 'boot-line';
        div.textContent = line;
        bootContent.appendChild(div);
        
        // Use requestAnimationFrame to ensure the div is added before changing opacity
        requestAnimationFrame(() => {
            if(isMounted) div.style.opacity = 1;
        });

        await new Promise(r => setTimeout(r, Math.random() * 100 + 30));
        if (bootLayer) bootLayer.scrollTop = bootLayer.scrollHeight;
      }

      await new Promise(r => setTimeout(r, 300));
      
      // Finalize boot
      if (bootLayer && isMounted) {
        bootLayer.style.transition = 'opacity 0.4s ease-out';
        bootLayer.style.opacity = '0';
        setTimeout(() => {
          if (bootLayer && isMounted) bootLayer.style.display = 'none';
        }, 400);
      }

      // Stage 3 & 4: UI Reveal
      if (isMounted) {
        revealUI(false);
        hasBootedOnce = true;
      }
    }

    runBoot();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- DECRYPTING EFFECT FUNCTION ---
  function decryptEffect(el) {
    if (!el) return;
    const targetText = el.getAttribute('data-text') || el.innerText;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let iterations = 0;
    
    const interval = setInterval(() => {
      el.innerText = targetText.split('')
        .map((char, index) => {
          if (index < iterations) return targetText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      
      if (iterations >= targetText.length) clearInterval(interval);
      iterations += 1/2;
    }, 20);
  }

  // --- MATRIX CHARACTER SHIFT ON HOVER ---
  const handleTitleHover = (e) => {
    const title = e.currentTarget;
    const original = title.getAttribute('data-original') || title.innerText;
    if (!title.getAttribute('data-original')) {
        title.setAttribute('data-original', original);
    }
    
    let count = 0;
    const glitchInterval = setInterval(() => {
      title.innerText = original.split('').map(c => Math.random() > 0.7 ? '§' : c).join('');
      if (++count > 5) {
        clearInterval(glitchInterval);
        title.innerText = original;
      }
    }, 40);
  };

  return (
    <div className="bg-[#0a0a0a] text-[#e2e2e2] font-body selection:bg-white selection:text-[#1a1c1c] overflow-x-hidden min-h-screen w-screen text-left absolute inset-0 z-0">
      <style>{`
        :root {
            --glitch-color: #ff3b3b;
        }

        /* --- STAGE 0: BOOT SEQUENCE --- */
        #boot-layer {
            position: fixed;
            inset: 0;
            background: #000;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding: 2rem;
            pointer-events: none;
            overflow: hidden;
        }

        .cursor {
            width: 12px;
            height: 24px;
            background: #fff;
            animation: blink 0.8s infinite;
        }

        @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
        }

        .boot-line {
            font-family: 'Space Mono', monospace;
            font-size: 14px;
            color: #0f0;
            margin-bottom: 2px;
            opacity: 0;
        }

        /* --- CRT EFFECT --- */
        .crt-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                        linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
            background-size: 100% 3px, 3px 100%;
            opacity: 0.15;
        }

        .crt-barrel {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 998;
            box-shadow: inset 0 0 100px rgba(0,0,0,0.5);
            background: radial-gradient(circle at center, transparent 70%, rgba(0,0,0,0.3) 100%);
        }

        /* --- SCANLINE --- */
        .scanline {
            width: 100%;
            height: 100px;
            z-index: 9999;
            background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(0, 0, 0, 0) 100%);
            opacity: 0.1;
            position: fixed;
            bottom: 100%;
            pointer-events: none;
            animation: scanline 8s linear infinite;
        }
        @keyframes scanline {
            0% { top: -100px; }
            100% { top: 100%; }
        }

        /* --- NOISE BACKGROUND --- */
        #noise-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            opacity: 0.08;
            pointer-events: none;
        }

        /* --- ANIMATIONS: JITTER & SHAKE --- */
        @keyframes jitter-soft {
            0%, 100% { transform: translateY(0); }
            25% { transform: translateY(-1px); }
            75% { transform: translateY(1px); }
        }
        @keyframes jitter-medium {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-2px, -1px); }
            30% { transform: translate(2px, 1px); }
            50% { transform: translate(-1px, 2px); }
            70% { transform: translate(1px, -2px); }
            90% { transform: translate(-2px, 1px); }
        }
        @keyframes shake-insane {
            0% { transform: translate(0,0) skew(0); }
            10% { transform: translate(-4px, 2px) skew(2deg); filter: hue-rotate(90deg); }
            20% { transform: translate(4px, -2px) skew(-2deg); }
            30% { transform: translate(-4px, -2px) skew(1deg); }
            40% { transform: translate(4px, 2px) skew(-1deg); filter: invert(0.1); }
            50% { transform: translate(-4px, 2px) skew(3deg); }
            60% { transform: translate(4px, -2px) skew(-3deg); }
            70% { transform: translate(-4px, -2px) skew(1deg); }
            80% { transform: translate(4px, 2px) skew(-1deg); }
            90% { transform: translate(-4px, 2px) skew(2deg); }
            100% { transform: translate(0,0) skew(0); }
        }
        @keyframes flicker-bg {
            0%, 100% { background-color: rgba(255,0,0,0.05); }
            5% { background-color: rgba(255,0,0,0.2); }
            10% { background-color: rgba(255,0,0,0.02); }
            15% { background-color: rgba(255,0,0,0.15); }
        }
        @keyframes nav-shockwave {
            0% { transform: scale(1); box-shadow: 0 0 0 0px rgba(255,255,255,0.4); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 40px rgba(255,255,255,0); }
        }
        @keyframes icon-displace {
            0% { transform: translate(0,0); }
            20% { transform: translate(-10px, 5px); }
            40% { transform: translate(10px, -5px); }
            60% { transform: translate(-5px, -10px); }
            80% { transform: translate(5px, 10px); }
            100% { transform: translate(0,0); }
        }

        /* --- TIERED ALERT CLASSES --- */
        .alert-low {
            animation: jitter-soft 3s infinite;
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.1);
        }
        .alert-low:hover {
            box-shadow: 0 0 25px rgba(34, 197, 94, 0.3);
        }

        .alert-medium {
            border-color: #eab308 !important;
            animation: jitter-medium 0.4s infinite;
            box-shadow: 0 0 20px rgba(234, 179, 8, 0.2);
        }
        .alert-medium:hover {
            box-shadow: 0 0 40px rgba(234, 179, 8, 0.5);
        }

        .alert-high {
            border-color: #ef4444 !important;
            animation: shake-insane 0.15s infinite, flicker-bg 2s infinite;
            box-shadow: 0 0 50px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.3);
            background: rgba(20, 0, 0, 0.4);
        }
        .alert-high::before {
            content: '';
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 3px);
            pointer-events: none;
        }

        /* --- NAV ANIMATIONS --- */
        .nav-item-crazy:hover span {
            animation: icon-displace 0.1s infinite;
            text-shadow: 5px 0 #ff00c1, -5px 0 #00fff9;
        }
        .nav-item-crazy:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
        }
        .nav-item-crazy:active {
            animation: nav-shockwave 0.3s ease-out;
        }

        /* --- GLITCH HEADLINE --- */
        .glitch-text {
            position: relative;
            animation: glitch-skew 4s infinite linear alternate-reverse;
        }
        .glitch-text::before, .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.8;
        }
        .glitch-text::before {
            left: 2px;
            text-shadow: -2px 0 #ff00c1;
            clip: rect(44px, 450px, 56px, 0);
            animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch-text::after {
            left: -2px;
            text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
            animation: glitch-anim2 1s infinite linear alternate-reverse;
        }

        @keyframes glitch-anim {
            0% { clip: rect(10px, 9999px, 50px, 0); transform: skew(0.3deg); }
            5% { clip: rect(80px, 9999px, 90px, 0); transform: skew(0.1deg); }
            10% { clip: rect(30px, 9999px, 40px, 0); transform: skew(0.5deg); }
            15% { clip: rect(60px, 9999px, 70px, 0); transform: skew(0.2deg); }
            100% { clip: rect(20px, 9999px, 30px, 0); transform: skew(0.1deg); }
        }
        @keyframes glitch-anim2 {
            0% { clip: rect(60px, 9999px, 80px, 0); transform: skew(1deg); }
            100% { clip: rect(10px, 9999px, 30px, 0); transform: skew(0.5deg); }
        }
        @keyframes glitch-skew {
            0%, 90% { transform: skew(0deg); }
            95% { transform: skew(-5deg); }
            100% { transform: skew(5deg); }
        }

        /* --- HOVER EFFECTS --- */
        .glass-morphism {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        /* --- HOME BUTTON GRAVITY --- */
        .home-btn-container {
            position: relative;
            overflow: visible;
        }
        .home-btn-ripple {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: white;
            opacity: 0;
            pointer-events: none;
        }
        .home-btn-container:active .home-btn-ripple {
            animation: ripple-out 0.8s ease-out forwards;
        }
        @keyframes ripple-out {
            0% { width: 10%; height: 10%; opacity: 0.8; }
            100% { width: 300%; height: 300%; opacity: 0; }
        }

        /* --- REVEAL CLASSES --- */
        .reveal-hidden { opacity: 0; transform: translateY(20px); }
        .reveal-visible { opacity: 1; transform: translateY(0); transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1); }

        .decrypting {
            font-family: 'Space Mono', monospace;
        }
      `}</style>
      {/* STAGE 1 & 2: BOOT SEQUENCE */}
      <div id="boot-layer" ref={bootLayerRef}>
        <div id="boot-content" ref={bootContentRef}></div>
        <div className="cursor mt-4" id="boot-cursor"></div>
      </div>
      
      {/* CRT & NOISE OVERLAYS */}
      <div className="crt-overlay"></div>
      <div className="crt-barrel"></div>
      <div className="scanline"></div>
      <canvas id="noise-canvas" ref={canvasRef}></canvas>
      
      {/* TopAppBar */}
      <header 
        ref={headerRef}
        className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-xl text-white flex justify-between items-center px-6 py-4 border-b border-white/10 reveal-hidden" 
        id="ui-header"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-white animate-pulse">sensors</span>
          <span className="text-2xl font-black text-white tracking-tighter font-headline">AAPDA</span>
        </div>
        <div className="flex gap-2 font-mono uppercase tracking-widest text-[10px]">
          <button 
            onClick={handleTranslate}
            disabled={isTranslating}
            className={`transition-all duration-150 px-3 py-1 border ${activeLang !== 'en' ? 'text-[#0a0a0a] bg-white border-white font-bold' : 'text-white border-white/20 hover:bg-white/20'}`}
          >
            {isTranslating ? 'TRANSLATING...' : `TR: ${userLocale || 'AUTO-DETECT'}`}
          </button>
          <button 
            onClick={handleRevert}
            className={`transition-all duration-150 px-3 py-1 border ${activeLang === 'en' ? 'text-[#0a0a0a] bg-white border-white font-bold' : 'text-white border-white/20 hover:bg-white/20'}`}
          >
            EN
          </button>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto min-h-screen relative z-20">
        {/* Hero Section */}
        <section className="mb-20 reveal-hidden" id="hero-section" ref={heroRef}>
          <h1 
            className="font-headline font-black text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] tracking-tighter mb-6 text-white glitch-text" 
            data-text="REAL-TIME ALERTS" 
            id="main-headline"
          >
            REAL-TIME<br />ALERTS<span className="inline-block w-4 h-16 md:h-24 bg-white animate-pulse ml-4 align-middle"></span>
          </h1>
          <div className="h-1.5 w-48 bg-white mb-10 shadow-[0_0_25px_rgba(255,255,255,0.7)]"></div>
          <p 
            className="font-mono text-[#c8c6c6] text-[10px] md:text-xs tracking-widest uppercase max-w-2xl decrypting" 
            data-text="[MONITORING_ACTIVE] Global monitoring active. Status: OPERATIONAL. Data-streams: 0x228, 0x441, 0x992."
          >
            [MONITORING_ACTIVE] Global monitoring active. Status: <span className="text-white font-bold bg-white/10 px-1">OPERATIONAL</span>. Data-streams: 0x228, 0x441, 0x992.
          </p>
        </section>

        {/* Alerts Feed */}
        <div className="space-y-8" id="alerts-container" ref={alertsRef}>
          {/* Loading State */}
          {loadingAlerts && (
            <div className="reveal-hidden">
              <div className="glass-morphism p-10 border-l-8 border-white/20 flex items-center gap-6">
                <span className="material-symbols-outlined text-white text-4xl animate-spin">sync</span>
                <div>
                  <h2 className="font-headline text-2xl font-black text-white uppercase tracking-tighter mb-2">SCANNING DATA STREAMS...</h2>
                  <p className="font-mono text-[10px] text-[#919191] uppercase tracking-widest">QUERYING RELIEFWEB // REGION: {userState || userCountry || 'GLOBAL'}</p>
                </div>
              </div>
            </div>
          )}

          {/* No Alerts State */}
          {!loadingAlerts && alerts.length === 0 && (
            <div className="reveal-hidden">
              <div className="glass-morphism p-10 border-l-8 border-green-500 flex items-center gap-6">
                <span className="material-symbols-outlined text-green-500 text-4xl">verified_user</span>
                <div>
                  <h2 className="font-headline text-2xl font-black text-white uppercase tracking-tighter mb-2">NO ACTIVE THREATS DETECTED</h2>
                  <p className="font-mono text-[10px] text-[#919191] uppercase tracking-widest">REGION: {userState || 'GLOBAL'} // STATUS: ALL_CLEAR</p>
                  <p className="text-[#c8c6c6] font-body text-sm mt-3 opacity-70">All disaster monitoring streams are nominal for your region. Stay prepared.</p>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Alert Cards */}
          {alerts.map((alert, index) => {
            const severityConfig = {
              high: {
                borderClass: 'alert-high',
                badgeClass: 'bg-[#ff3b3b] text-[#690005]',
                badgeText: 'CRITICAL_EVENT',
                iconColor: 'text-[#ff3b3b]',
                icon: 'warning',
              },
              medium: {
                borderClass: 'alert-medium border-yellow-500',
                badgeClass: 'bg-yellow-500 text-black',
                badgeText: 'ELEVATED_RISK',
                iconColor: 'text-yellow-500',
                icon: 'error',
              },
              low: {
                borderClass: 'alert-low border-green-500',
                badgeClass: 'bg-green-600 text-white',
                badgeText: 'INFO_LOG',
                iconColor: 'text-green-500',
                icon: 'info',
              },
            };
            const config = severityConfig[alert.severity] || severityConfig.low;
            
            const displayTitle = activeLang !== 'en' && translatedAlerts[alert.id] ? translatedAlerts[alert.id].title : alert.title;
            const displayDesc = activeLang !== 'en' && translatedAlerts[alert.id] ? translatedAlerts[alert.id].description : alert.description;

            return (
              <div className="reveal-hidden" key={alert.id}>
                <div 
                  onClick={() => onAlertClick(alert)}
                  className={`group relative glass-morphism p-6 md:p-10 border-l-8 ${config.borderClass} cursor-pointer`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <span className={`${config.badgeClass} font-headline text-xs font-black px-3 py-1 tracking-tighter uppercase shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>{config.badgeText}</span>
                        <span className="font-mono text-[10px] text-[#919191] tracking-widest uppercase">STAMP: {alert.timestamp}</span>
                      </div>
                      <h2 
                        className="font-headline text-2xl md:text-3xl font-black text-white mb-4 leading-tight uppercase group-hover:italic transition-all"
                        onMouseEnter={handleTitleHover}
                      >
                        {displayTitle}
                      </h2>
                      <p className="text-[#c8c6c6] font-body text-sm md:text-base max-w-2xl leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                        {displayDesc}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="font-mono text-[9px] text-[#919191] uppercase tracking-widest">SRC: {alert.source}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                      <span className="font-mono text-[9px] text-[#919191] uppercase tracking-widest">LOC_ID</span>
                      <span className="font-mono font-bold text-white uppercase text-sm border-b border-white/20 pb-1">{alert.location}</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-80 transition-all duration-150">
                    <span className={`material-symbols-outlined ${config.iconColor} text-6xl`}>{config.icon}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* System Status Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-hidden">
            <div className="md:col-span-2 glass-morphism p-8 group flex flex-col justify-center">
               <span className="font-mono text-[9px] text-[#919191] uppercase tracking-[0.3em] mb-4 block">SYSTEM_STATUS</span>
               <h2 className="font-headline text-2xl font-black text-white mb-4 tracking-tighter">
                  All Monitoring Streams Active
               </h2>
               <p className="font-body text-white/80 text-sm leading-relaxed mb-4">
                  Data is being sourced from GDACS, ReliefWeb, IMD, and CWC. Tap any alert card above to view full details with automatic translation into your regional language.
               </p>
               <div className="flex gap-4 flex-wrap">
                 <span className="font-mono text-[10px] text-green-500 bg-green-500/10 px-3 py-1">● GDACS: ONLINE</span>
                 <span className="font-mono text-[10px] text-green-500 bg-green-500/10 px-3 py-1">● RELIEFWEB: ONLINE</span>
                 <span className="font-mono text-[10px] text-green-500 bg-green-500/10 px-3 py-1">● IMD: ONLINE</span>
               </div>
            </div>

            <div className="md:col-span-1 relative glass-morphism p-8 flex flex-col justify-between overflow-hidden group">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/topography.png")' }}></div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90"></div>
               
               <div className="relative z-10">
                 <span className="bg-[#ff3b3b]/20 text-[#ff3b3b] font-mono text-[10px] px-2 py-1 mb-4 inline-block">EVAC_READY</span>
                 <h3 className="font-headline text-xl font-black text-white mb-2">Automated Response Active</h3>
                 <p className="font-mono text-xs text-white/50">Unit deployment initialized. Perimeter securing in progress.</p>
               </div>
               
               <button className="relative z-10 bg-white text-black font-headline font-black text-sm py-4 px-6 mt-8 flex justify-between items-center hover:bg-gray-200 transition-colors w-full">
                  OPEN EVAC ROUTE
                  <span className="material-symbols-outlined font-black">chevron_right</span>
               </button>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav 
        className="fixed bottom-0 left-0 w-full h-20 flex justify-around items-stretch bg-[#0a0a0a]/90 backdrop-blur-3xl z-50 border-t border-white/10 reveal-hidden" 
        id="ui-nav"
        ref={navRef}
      >
        <button onClick={onAIClick} className="flex items-center justify-center text-[#919191] w-full h-full transition-all group nav-item-crazy">
          <span className="material-symbols-outlined transition-transform text-3xl">smart_toy</span>
        </button>
        <div className="w-full home-btn-container">
          <a className="flex items-center justify-center bg-white text-[#0a0a0a] h-full w-full pulsate-core z-10 relative overflow-hidden group transition-all nav-item-crazy" href="#">
            <span className="material-symbols-outlined relative z-20 transition-transform text-3xl">home</span>
            <div className="absolute inset-0 bg-white group-hover:bg-[#f0f0f0] transition-colors"></div>
            <div className="home-btn-ripple"></div>
          </a>
        </div>
        <button onClick={onProfileClick} className="flex items-center justify-center text-[#919191] w-full h-full transition-all group nav-item-crazy">
          <span className="material-symbols-outlined transition-transform text-3xl">person</span>
        </button>
      </nav>
    </div>
  );
}
