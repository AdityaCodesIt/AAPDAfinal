import React, { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient.js';

const LANG_OPTIONS = [
  { code: 'hi', label: 'Hindi' }, { code: 'mr', label: 'Marathi' },
  { code: 'bn', label: 'Bengali' }, { code: 'te', label: 'Telugu' },
  { code: 'ta', label: 'Tamil' }, { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' }, { code: 'ml', label: 'Malayalam' },
  { code: 'pa', label: 'Punjabi' }, { code: 'or', label: 'Odia' },
  { code: 'as', label: 'Assamese' }, { code: 'ur', label: 'Urdu' },
  { code: 'en', label: 'English' },
];

function Field({ label, icon, value, editable = false, editValue, onChange, placeholder, type = 'text', locked = false, badge }) {
  const isPassword = type === 'password';
  const displayValue = (isPassword && value) ? '••••••' : value;

  return (
    <div className={`profile-field group transition-all duration-300 ${locked ? 'opacity-80' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-white/50 text-base group-hover:text-white transition-colors">{icon}</span>
        <span className="font-mono text-xs text-white/50 uppercase tracking-[0.1em] group-hover:text-white transition-colors font-medium">{label}</span>
        {locked && (
          <span className="ml-auto flex items-center gap-1 font-mono text-[8px] text-white/20 border border-white/10 px-1.5 py-0.5 uppercase tracking-widest bg-white/5">
            <span className="material-symbols-outlined text-[10px]">lock</span> LOCKED
          </span>
        )}
        {badge && <span className="ml-auto font-mono text-[8px] px-1.5 py-0.5 uppercase tracking-widest border" style={{ color: badge.color, borderColor: badge.color + '40' }}>{badge.text}</span>}
      </div>
      {editable && !locked ? (
        <input
          type={type}
          value={editValue ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || label}
          className="w-full bg-white/5 border border-white/10 focus:border-white/30 focus:bg-white/10 text-white font-mono text-sm px-4 py-3 outline-none transition-all placeholder:text-white/10 rounded-none"
        />
      ) : (
        <div className="font-sans text-lg text-white font-semibold tracking-wide px-4 py-3 bg-white/5 border border-white/10 min-h-[3rem] flex items-center group-hover:bg-white/10 group-hover:border-white/30 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all overflow-hidden rounded-sm">
          <span className="truncate w-full block">{displayValue || <span className="text-white/30 italic font-normal">NOT_SET</span>}</span>
        </div>
      )}
    </div>
  );
}

export default function AapdaAccountProfileFixed({ onHome, onAI, onSignOut, formData, authUser, updateFormData }) {
  const canvasRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error'

  // Noise canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let id;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();
    function noise() {
      const idata = ctx.createImageData(canvas.width, canvas.height);
      const buf = new Uint32Array(idata.data.buffer);
      for (let i = 0; i < buf.length; i++) {
        if (Math.random() < 0.05) buf[i] = Math.random() < 0.5 ? 0xffffffff : 0xff000000;
      }
      ctx.putImageData(idata, 0, 0);
      id = requestAnimationFrame(noise);
    }
    noise();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(id); };
  }, []);

  const startEditing = () => {
    setEditForm({ ...formData });
    setIsEditing(true);
    setSaveStatus(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
    setSaveStatus(null);
  };

  const set = (field) => (val) => setEditForm(prev => ({ ...prev, [field]: val }));

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const email = formData.email || authUser?.email;
      if (!email) throw new Error('Email identifier missing.');
      
      const payload = {
        ...editForm,
        email,
        auth_id: authUser?.id || null,
      };

      console.log('Saving profile to Supabase:', JSON.stringify(payload, null, 2));

      const upsertPromise = supabase
        .from('users')
        .upsert([payload], { onConflict: 'email' })
        .select();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database request timed out')), 10000)
      );

      const { data, error } = await Promise.race([upsertPromise, timeoutPromise]);

      if (error) {
        console.error('Supabase upsert error:', error);
        throw new Error(error.message);
      }

      console.log('Profile saved successfully:', data);
      updateFormData(editForm);
      setIsEditing(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      console.error('Profile save error:', err.message);
    }
    setIsSaving(false);
  };

  const userInitial = (formData?.full_name || authUser?.email || 'U')[0].toUpperCase();
  const ef = editForm;

  return (
    <div className="bg-[#050505] text-[#e2e2e2] font-body overflow-x-hidden min-h-screen w-screen text-left absolute inset-0 z-0">
      <style>{`
        #noise-canvas { position: fixed; top:0; left:0; width:100%; height:100%; z-index:-2; opacity:0.04; pointer-events:none; }
        .crt-overlay { position:fixed; inset:0; pointer-events:none; z-index:999; background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%), linear-gradient(90deg, rgba(255,0,0,0.02), rgba(0,255,0,0.01), rgba(0,0,255,0.02)); background-size:100% 3px, 3px 100%; opacity:0.1; }
        .scanline { width:100%; height:100px; z-index:9999; background:linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%); position:fixed; pointer-events:none; animation:scanline 12s linear infinite; }
        @keyframes scanline { 0%{top:-100px} 100%{top:100%} }

        .glass-panel { background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
        .profile-field { transition: all 0.3s ease; }
        
        .avatar-glow { box-shadow: 0 0 30px rgba(255,255,255,0.05); }

        .nav-item-crazy:hover span { text-shadow: 0 0 10px rgba(255,255,255,0.5); transform: translateY(-2px); }
        .nav-item-active { background: rgba(255,255,255,0.05); box-shadow: inset 0 -2px 0 white; }

        @keyframes revealProfile {
            0% { opacity: 0; transform: translateY(30px) scale(0.98); filter: blur(10px); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .animate-fade { 
            animation: revealProfile 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
            will-change: transform, opacity, filter; 
            opacity: 0; 
        }
        .glow-text { text-shadow: 0 0 15px rgba(255,255,255,0.6); }

        select option { background: #111; color: white; }

        /* --- DESKTOP LAYOUT OVERRIDES --- */
        @media (min-width: 1024px) {
            .profile-desktop-layout {
                max-width: 1400px !important;
                display: grid !important;
                grid-template-columns: 380px 1fr !important;
                gap: 64px !important;
                align-items: start !important;
                padding-left: 64px !important;
                padding-right: 64px !important;
                padding-bottom: 120px !important;
            }
            .profile-identity-section {
                position: sticky !important;
                top: 112px !important;
            }
            .profile-form-sections {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 48px !important;
            }
            .profile-signout-section {
                grid-column: 1 / -1 !important;
                border-top: none !important;
            }
            .glass-panel {
                flex-direction: column !important;
                align-items: center !important;
                text-align: center !important;
            }
            .glass-panel .flex-1 {
                text-align: center !important;
            }
            .glass-panel .justify-start {
                justify-content: center !important;
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
      `}</style>

      <canvas id="noise-canvas" ref={canvasRef}></canvas>
      <div className="crt-overlay"></div>
      <div className="scanline"></div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onHome} className="p-2 hover:bg-white/5 rounded-full transition-colors mr-1">
            <span className="material-symbols-outlined text-white/50 text-xl">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter font-headline leading-none">AAPDA</span>
            <span className="font-mono text-[8px] text-white/30 uppercase tracking-[0.2em] mt-1">CORE_IDENTITY_NODE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <div className="font-mono text-[9px] text-green-400 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 bg-green-400/5 border border-green-400/20 animate-fade">
              <span className="material-symbols-outlined text-xs">done</span> SYNC_COMPLETE
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="font-mono text-[9px] text-red-400 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 bg-red-400/5 border border-red-400/20 animate-fade">
              <span className="material-symbols-outlined text-xs">error</span> UPLINK_ERROR
            </div>
          )}

          {!isEditing ? (
            <button onClick={startEditing} className="bg-white text-black font-mono text-[10px] font-black uppercase tracking-widest px-5 py-2.5 hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span className="material-symbols-outlined text-sm">edit</span>
              MODIFY_DATA
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={cancelEditing} disabled={isSaving} className="text-white/40 hover:text-white font-mono text-[10px] uppercase tracking-widest px-4 py-2 transition-all">
                ABORT
              </button>
              <button onClick={handleSave} disabled={isSaving} className="bg-white text-black font-mono text-[10px] font-black uppercase tracking-widest px-5 py-2.5 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {isSaving ? <span className="material-symbols-outlined text-sm animate-spin">sync</span> : <span className="material-symbols-outlined text-sm">cloud_upload</span>}
                {isSaving ? 'UPLOADING...' : 'COMMIT_CHANGES'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="pt-28 pb-32 px-4 md:px-6 max-w-3xl mx-auto min-h-screen relative z-20 space-y-8 profile-desktop-layout">
        
        {/* Identity Section */}
        <section className="animate-fade profile-identity-section">
          <div className="glass-panel p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden bg-white/5 border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            {/* Big Avatar */}
            <div className="shrink-0">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-headline font-black text-4xl text-white avatar-glow relative">
                {userInitial}
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-[#050505] rounded-full"></div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="font-mono text-[9px] text-white/20 uppercase tracking-[0.4em] mb-2">NETWORK_OPERATOR_VERIFIED</div>
              <h1 className="font-headline font-black text-4xl md:text-5xl text-white uppercase tracking-tighter leading-tight mb-2 truncate">
                {formData?.full_name || 'ANONYMOUS_USER'}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-white/50">
                   <span className="material-symbols-outlined text-xs">verified</span> SECURE_UPLINK
                </div>
                <div className="text-[10px] font-mono text-white/30 tracking-wider">ID: {authUser?.id?.slice(0, 8) || 'NONE'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Sections */}
        <div className="grid grid-cols-1 gap-12 animate-fade [animation-delay:0.1s] profile-form-sections">
          
          {/* Group 1: Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-3">
              <h2 className="font-headline text-sm md:text-base text-white/90 font-bold uppercase tracking-widest whitespace-nowrap glow-text">01 // IDENTITY_MATRICES</h2>
              <div className="h-[2px] w-full bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Legal Identity" icon="person"
                value={formData?.full_name}
                editable={isEditing} editValue={ef.full_name} onChange={set('full_name')}
                placeholder="FULL_NAME"
              />
              <Field
                label="Network Address" icon="alternate_email"
                value={formData?.email || authUser?.email}
                locked={true}
              />
            </div>
          </div>

          {/* Group 2: Comms */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-3">
              <h2 className="font-headline text-sm md:text-base text-white/90 font-bold uppercase tracking-widest whitespace-nowrap glow-text">02 // COMMUNICATIONS_RELAY</h2>
              <div className="h-[2px] w-full bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Primary Signal" icon="sensors"
                value={formData?.phone_number}
                editable={isEditing} editValue={ef.phone_number} onChange={set('phone_number')}
                placeholder="PHONE_NUM" type="tel"
              />
              <Field
                label="Fallback Signal" icon="ring_volume"
                value={formData?.verification_phone}
                editable={isEditing} editValue={ef.verification_phone} onChange={set('verification_phone')}
                placeholder="EMERGENCY_NUM" type="tel"
              />
            </div>
          </div>

          {/* Group 3: Geolocation */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-3">
              <h2 className="font-headline text-sm md:text-base text-white/90 font-bold uppercase tracking-widest whitespace-nowrap glow-text">03 // GEOSPATIAL_ANCHOR</h2>
              <div className="h-[2px] w-full bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Geopolitical Zone" icon="public"
                value={formData?.country}
                editable={isEditing} editValue={ef.country} onChange={set('country')}
                placeholder="COUNTRY"
              />
              <Field
                label="Administrative Sector" icon="account_balance"
                value={formData?.state}
                editable={isEditing} editValue={ef.state} onChange={set('state')}
                placeholder="STATE"
              />
              <Field
                label="Sub-District Node" icon="location_on"
                value={formData?.region}
                editable={isEditing} editValue={ef.region} onChange={set('region')}
                placeholder="REGION/CITY"
              />
              <Field
                label="Access Pin" icon="key"
                value={formData?.pin}
                editable={isEditing} editValue={ef.pin} onChange={set('pin')}
                placeholder="SECURE_PIN" type="password"
              />
            </div>
          </div>

          {/* Group 4: Language */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-3">
              <h2 className="font-headline text-sm md:text-base text-white/90 font-bold uppercase tracking-widest whitespace-nowrap glow-text">04 // LINGUISTIC_PROTOCOLS</h2>
              <div className="h-[2px] w-full bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            <div className="space-y-4">
              {/* Preferred Lang */}
              <div className="profile-field group bg-white/[0.02] border border-white/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-white/50 text-base drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">translate</span>
                  <span className="font-mono text-[10px] text-white/60 uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Preferred Output Language</span>
                  <span className="ml-auto font-mono text-[8px] px-2 py-0.5 border border-white/20 text-white/50 uppercase tracking-[0.2em]">USER_DEFINED</span>
                </div>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={ef.preferred_language || ''}
                      onChange={e => set('preferred_language')(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white font-mono text-sm px-4 py-3 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select Protocol...</option>
                      {LANG_OPTIONS.map(l => (
                        <option key={l.code} value={l.label + ' (' + l.code.toUpperCase() + ')'}>{l.label}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">expand_more</span>
                  </div>
                ) : (
                  <div className="font-mono text-sm text-white font-medium bg-white/[0.01] border border-white/5 px-4 py-3">
                    {formData?.preferred_language || 'NOT_CONFIGURED'}
                  </div>
                )}
              </div>

              {/* Auto Detected - LOCKED */}
              <Field
                label="Detected Environment Locale" icon="radar"
                value={formData?.detected_locale}
                locked={true}
                badge={{ text: 'GEOSPATIAL_AUTO', color: '#666' }}
              />

              {/* Toggle Override */}
              <div className="profile-field bg-white/[0.02] border border-white/5 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white/50 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">shield</span>
                  <div>
                    <div className="font-mono text-[10px] text-white/60 uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Global English Override</div>
                    <div className="font-mono text-[8px] text-white/40 uppercase tracking-widest mt-1">Priority 0 fail-safe status</div>
                  </div>
                </div>
                {isEditing ? (
                  <button
                    onClick={() => set('emergency_override_english')(!ef.emergency_override_english)}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${ef.emergency_override_english ? 'bg-white' : 'bg-white/10 border border-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${ef.emergency_override_english ? 'left-7 bg-black' : 'left-1 bg-white/30'}`}></div>
                  </button>
                ) : (
                  <div className={`font-mono text-[10px] px-3 py-1 border ${formData?.emergency_override_english ? 'text-white border-white bg-white/10' : 'text-white/20 border-white/10'}`}>
                    {formData?.emergency_override_english ? 'ENABLED' : 'DISABLED'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sign Out Section */}
          {!isEditing && (
            <div className="pt-8 pb-12 border-t border-white/5 profile-signout-section">
              <button 
                onClick={onSignOut}
                className="w-full flex items-center justify-between p-6 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all group"
              >
                <div className="flex items-center gap-4 text-left">
                  <span className="material-symbols-outlined text-red-500 group-hover:scale-110 transition-transform">power_settings_new</span>
                  <div>
                    <div className="font-mono text-xs text-red-500 uppercase tracking-[0.3em] font-bold">SYSTEM_LOGOUT</div>
                    <div className="font-mono text-[10px] text-red-400/80 uppercase tracking-widest mt-1">Disconnect secure terminal session</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-red-500 group-hover:translate-x-2 transition-transform">chevron_right</span>
              </button>
            </div>
          )}
        </div>
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
            <span className="material-symbols-outlined text-3xl">home</span>
          </label>
          <label title="Profile" className="ui-nav-label">
            <input name="page" type="radio" defaultChecked onClick={() => {}} />
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </label>
        </section>
      </div>
    </div>
  );
}
