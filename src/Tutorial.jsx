import React, { useState, useEffect } from 'react';

const STEPS = [
  {
    icon: 'emergency',
    iconColor: '#ffffff',
    tag: 'WELCOME // INITIALIZING',
    headline: 'Welcome to\nAAPDA',
    subheadline: 'आपदा — Disaster Intelligence',
    description:
      'AAPDA is a real-time disaster alerting platform built for India. It monitors earthquakes, floods, cyclones, wildfires, and more — delivering location-specific alerts instantly to your device.',
    highlight: null,
  },
  {
    icon: 'crisis_alert',
    iconColor: '#ff3b3b',
    tag: 'FEATURE // 01',
    headline: 'Real-Time\nDisaster Alerts',
    subheadline: 'Live data. Zero delay.',
    description:
      'The home screen feeds you live disaster alerts filtered to your exact country, state, and region. Alerts are color-coded by severity — RED for critical, ORANGE for elevated, and GREEN for advisory.',
    highlight: 'Powered by GDACS and ReliefWeb — the same systems used by the United Nations.',
  },
  {
    icon: 'translate',
    iconColor: '#60a5fa',
    tag: 'FEATURE // 02',
    headline: 'Your Language.\nEvery Alert.',
    subheadline: '30+ languages supported.',
    description:
      'Hit the TRANSLATE button on the home screen and every alert instantly switches to your regional language — Hindi, Marathi, Tamil, Bengali, Telugu, and 25+ more. One tap. Your language.',
    highlight: 'Auto-detection uses your registered state/region to pick the right language.',
  },
  {
    icon: 'psychology',
    iconColor: '#a78bfa',
    tag: 'FEATURE // 03',
    headline: 'AI Emergency\nAssistant',
    subheadline: 'AAPDA_CORE is always online.',
    description:
      'The AI Terminal is your personal emergency advisor. Ask it what to do during an earthquake, how to prepare for a cyclone, or how to navigate the app. It knows everything about AAPDA and disaster response.',
    highlight: 'Access it anytime via the brain icon in the bottom navigation bar.',
  },
  {
    icon: 'record_voice_over',
    iconColor: '#34d399',
    tag: 'FEATURE // 04',
    headline: 'Voice Readout\n& SMS Alerts',
    subheadline: 'Stay informed even offline.',
    description:
      'Tap any alert to open a detailed view. AAPDA can read the alert aloud in your language using voice synthesis. Emergency SMS alerts can also be dispatched to your registered phone number.',
    highlight: 'Open an alert → tap the speaker icon to activate voice readout.',
  },
  {
    icon: 'verified_user',
    iconColor: '#fbbf24',
    tag: 'SYSTEM_READY',
    headline: 'You Are Now\nCleared.',
    subheadline: 'Operator verification complete.',
    description:
      'Sign in with Google to initialize your profile. Enter your location (country, state, region) to receive alerts specific to your area. Your data is encrypted and stored securely on Supabase.',
    highlight: null,
  },
];

export default function Tutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const goTo = (nextStep) => {
    if (animating) return;
    setDirection(nextStep > step ? 1 : -1);
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 320);
  };

  const handleNext = () => {
    if (isLast) { onComplete(); return; }
    goTo(step + 1);
  };

  const handlePrev = () => {
    if (step === 0) return;
    goTo(step - 1);
  };

  const handleSkip = () => onComplete();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.97)' }}>
      <style>{`
        @keyframes tuteIn {
          0%  { opacity: 0; transform: translateY(28px) scale(0.97); filter: blur(8px); }
          100%{ opacity: 1; transform: translateY(0)   scale(1);    filter: blur(0); }
        }
        @keyframes tuteOut {
          0%  { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
          100%{ opacity: 0; transform: translateY(-20px) scale(0.97); filter: blur(6px); }
        }
        .tute-in  { animation: tuteIn  0.32s cubic-bezier(0.16,1,0.3,1) forwards; }
        .tute-out { animation: tuteOut 0.22s ease-in forwards; }

        @keyframes scanline { 0%{top:-100px} 100%{top:100%} }
        .tute-scanline {
          position:fixed; width:100%; height:80px; z-index:0;
          background:linear-gradient(0deg,transparent 0%,rgba(255,255,255,0.015) 50%,transparent 100%);
          pointer-events:none; animation:scanline 10s linear infinite;
        }
        @keyframes iconPulse {
          0%,100% { filter: drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor); }
          50%      { filter: drop-shadow(0 0 20px currentColor) drop-shadow(0 0 40px currentColor); }
        }
        .icon-pulse { animation: iconPulse 2.5s ease-in-out infinite; }

        @keyframes gridDrift {
          0%   { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .tute-grid {
          position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridDrift 8s linear infinite;
        }
        .progress-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          cursor: pointer;
        }
        .progress-dot.active {
          width: 24px; border-radius: 3px;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
        .tute-btn-next {
          background: white; color: black;
          font-family: 'Space Grotesk', monospace;
          font-weight: 800; font-size: 13px;
          letter-spacing: 0.15em; text-transform: uppercase;
          padding: 16px 36px;
          border: none; cursor: pointer;
          transition: all 0.2s ease;
          position: relative; overflow: hidden;
        }
        .tute-btn-next:hover { background: #e0e0e0; transform: translateY(-1px); }
        .tute-btn-next:active { transform: translateY(0); }
        .tute-btn-skip {
          background: transparent;
          color: rgba(255,255,255,0.35);
          font-family: monospace;
          font-size: 10px; letter-spacing: 0.3em;
          text-transform: uppercase; border: none;
          cursor: pointer; padding: 8px 16px;
          transition: color 0.2s;
        }
        .tute-btn-skip:hover { color: rgba(255,255,255,0.7); }
        .tute-btn-prev {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.5);
          font-family: monospace;
          font-size: 11px; letter-spacing: 0.2em;
          text-transform: uppercase; cursor: pointer;
          padding: 14px 24px;
          transition: all 0.2s;
        }
        .tute-btn-prev:hover { border-color: rgba(255,255,255,0.4); color: white; }
        .highlight-box {
          border-left: 2px solid rgba(255,255,255,0.3);
          padding-left: 16px;
          color: rgba(255,255,255,0.5);
          font-family: monospace;
          font-size: 11px; line-height: 1.7;
          letter-spacing: 0.05em;
        }
      `}</style>

      {/* Decorative layers */}
      <div className="tute-grid" />
      <div className="tute-scanline" />

      {/* Corner decorations */}
      <div style={{ position:'fixed', top:20, left:20, width:40, height:40, borderTop:'1px solid rgba(255,255,255,0.15)', borderLeft:'1px solid rgba(255,255,255,0.15)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', top:20, right:20, width:40, height:40, borderTop:'1px solid rgba(255,255,255,0.15)', borderRight:'1px solid rgba(255,255,255,0.15)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:20, left:20, width:40, height:40, borderBottom:'1px solid rgba(255,255,255,0.15)', borderLeft:'1px solid rgba(255,255,255,0.15)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:20, right:20, width:40, height:40, borderBottom:'1px solid rgba(255,255,255,0.15)', borderRight:'1px solid rgba(255,255,255,0.15)', pointerEvents:'none' }} />

      {/* Skip button — top right */}
      <div style={{ position:'fixed', top:28, right:72, zIndex:10 }}>
        <button className="tute-btn-skip" onClick={handleSkip}>SKIP TUTORIAL →</button>
      </div>

      {/* Step counter — top left */}
      <div style={{ position:'fixed', top:28, left:72, zIndex:10 }}>
        <span style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'0.3em', textTransform:'uppercase' }}>
          {String(step + 1).padStart(2,'0')} / {String(STEPS.length).padStart(2,'0')}
        </span>
      </div>

      {/* Main content card */}
      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:560, padding:'0 24px' }}>
        <div
          key={step}
          className={animating ? 'tute-out' : 'tute-in'}
          style={{ willChange:'transform,opacity,filter' }}
        >
          {/* Tag */}
          <div style={{ marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ height:1, width:32, background:'rgba(255,255,255,0.2)' }} />
            <span style={{ fontFamily:'monospace', fontSize:9, color:'rgba(255,255,255,0.4)', letterSpacing:'0.35em', textTransform:'uppercase' }}>
              {current.tag}
            </span>
          </div>

          {/* Icon */}
          <div style={{ marginBottom:28 }}>
            <span
              className="material-symbols-outlined icon-pulse"
              style={{ fontSize:52, color: current.iconColor }}
            >
              {current.icon}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontSize: 'clamp(36px, 8vw, 58px)',
            fontWeight: 900,
            lineHeight: 1.0,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            marginBottom: 8,
            whiteSpace: 'pre-line',
          }}>
            {current.headline}
          </h1>

          {/* Subheadline */}
          <p style={{ fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.4)', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:28 }}>
            {current.subheadline}
          </p>

          {/* Divider */}
          <div style={{ height:1, background:'linear-gradient(to right, rgba(255,255,255,0.15), transparent)', marginBottom:28 }} />

          {/* Description */}
          <p style={{ fontFamily:"'Inter', 'Space Grotesk', sans-serif", fontSize:15, color:'rgba(255,255,255,0.75)', lineHeight:1.75, marginBottom: current.highlight ? 24 : 40 }}>
            {current.description}
          </p>

          {/* Highlight box */}
          {current.highlight && (
            <div className="highlight-box" style={{ marginBottom:40 }}>
              {current.highlight}
            </div>
          )}

          {/* Actions row */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {step > 0 && (
              <button className="tute-btn-prev" onClick={handlePrev}>← BACK</button>
            )}
            <button className="tute-btn-next" onClick={handleNext}>
              {isLast ? 'INITIALIZE AAPDA →' : 'NEXT →'}
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:48 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i === step ? 'active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
