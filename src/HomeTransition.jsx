import React, { useEffect, useState, useRef } from 'react';

/**
 * ScreenTransition — Premium 5-phase flood transition for all screen navigation.
 * 
 * Props:
 *   active      — boolean, triggers the flood animation
 *   onComplete  — called when flood finishes so parent can swap content
 *   icon        — material icon name to show during flicker (default: 'home')
 *   floodColor  — color of the flood (default: '#ffffff')
 *   iconColor   — color of the centered icon (default: '#1a1a1a')
 */
export default function ScreenTransition({ active, onComplete, icon = 'home', floodColor = '#ffffff', iconColor = '#1a1a1a' }) {
  const [phase, setPhase] = useState(-1);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!active || animatingRef.current) return;
    animatingRef.current = true;

    const timers = [];
    const t = (fn, ms) => { timers.push(setTimeout(fn, ms)); };

    setPhase(0);
    t(() => setPhase(1), 10);
    t(() => setPhase(2), 120);
    t(() => setPhase(3), 280);
    t(() => setPhase(4), 500);
    t(() => {
      setPhase(5);
      if (onComplete) onComplete();
    }, 600);
    t(() => {
      setPhase(-1);
      animatingRef.current = false;
    }, 960);

    return () => {
      timers.forEach(clearTimeout);
      animatingRef.current = false;
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Safety: force cleanup if active goes false but phase stuck
  useEffect(() => {
    if (!active && phase !== -1) {
      const cleanup = setTimeout(() => {
        setPhase(-1);
        animatingRef.current = false;
      }, 400);
      return () => clearTimeout(cleanup);
    }
  }, [active, phase]);

  if (phase === -1) return null;

  // Determine contrasting colors
  const isDark = floodColor !== '#ffffff';
  const flashColor = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)';
  const sonarBorderColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,1)';

  return (
    <>
      <style>{`
        @keyframes ht-flash {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
        .ht-flash-overlay {
          position: fixed; inset: 0; z-index: 99998;
          background: ${flashColor};
          pointer-events: none;
          animation: ht-flash 120ms ease-out forwards;
        }

        @keyframes ht-sonar {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        .ht-sonar-ring {
          position: fixed; bottom: 40px; left: 50%;
          width: 80px; height: 80px; border-radius: 50%;
          border: 2px solid ${sonarBorderColor};
          z-index: 99999; pointer-events: none;
          transform: translate(-50%, -50%) scale(0);
          animation: ht-sonar 300ms cubic-bezier(0, 0, 0.2, 1) forwards;
        }

        @keyframes ht-flood-rise {
          0%   { transform: translateY(100%); }
          70%  { transform: translateY(-3%); }
          85%  { transform: translateY(1%); }
          100% { transform: translateY(0%); }
        }
        .ht-flood {
          position: fixed; inset: 0; z-index: 99997;
          pointer-events: none; transform: translateY(100%);
        }
        .ht-flood.rising {
          animation: ht-flood-rise 480ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .ht-flood-wave {
          position: absolute; top: -30px; left: 0;
          width: 100%; height: 32px;
        }
        @keyframes ht-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .ht-flood-shimmer {
          position: absolute; top: -2px; left: 0;
          width: 100%; height: 4px;
          background: linear-gradient(90deg, transparent, ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)'}, transparent);
          animation: ht-shimmer 600ms ease-in-out;
        }
        .ht-flood-body {
          position: absolute; inset: 0;
          background: ${floodColor};
        }

        @keyframes ht-flicker {
          0%     { opacity: 1; }
          15%    { opacity: 0.6; }
          30%    { opacity: 1; }
          50%    { opacity: 0.4; }
          65%    { opacity: 1; }
          100%   { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
        }
        .ht-center-icon {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 100000; pointer-events: none;
          color: ${iconColor}; font-size: 48px; opacity: 0;
        }
        .ht-center-icon.flickering {
          opacity: 1;
          animation: ht-flicker 220ms steps(1, end) forwards;
          filter: drop-shadow(0 0 14px ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'});
        }

        @keyframes ht-dissolve-out {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        .ht-reveal-mask {
          position: fixed; inset: 0; z-index: 99996;
          background: ${floodColor};
          pointer-events: none;
          animation: ht-dissolve-out 360ms ease-out forwards;
        }
      `}</style>

      {phase === 1 && <div className="ht-flash-overlay" />}

      {(phase === 1 || phase === 2) && <div className="ht-sonar-ring" />}

      {(phase >= 2 && phase <= 4) && (
        <div className={`ht-flood ${phase >= 2 ? 'rising' : ''}`}>
          <svg className="ht-flood-wave" viewBox="0 0 1440 32" preserveAspectRatio="none">
            <path
              d="M0,32 C180,32 180,4 360,8 C540,12 540,28 720,20 C900,12 900,0 1080,4 C1260,8 1260,28 1440,32 L1440,32 L0,32 Z"
              fill={floodColor}
            />
          </svg>
          <div className="ht-flood-shimmer" />
          <div className="ht-flood-body" />
        </div>
      )}

      {(phase === 3 || phase === 4) && (
        <span
          className={`ht-center-icon material-symbols-outlined ${phase >= 3 ? 'flickering' : ''}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      )}

      {phase === 5 && <div className="ht-reveal-mask" />}
    </>
  );
}
