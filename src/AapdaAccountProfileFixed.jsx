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
        <span className="material-symbols-outlined text-white/30 text-base">{icon}</span>
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.3em]">{label}</span>
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
        <div className="font-mono text-sm text-white font-medium tracking-wide px-4 py-3 bg-white/[0.01] border border-white/5 min-h-[2.2rem] flex items-center">
          {displayValue || <span className="text-white/10 italic">NOT_SET</span>}
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
      const payload = { ...editForm, email };
      
      const { error } = await supabase.from('users').upsert([payload], { onConflict: 'email' });
      
      if (error) throw new Error(error.message);
      
      updateFormData(editForm);
      setIsEditing(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      console.error('Profile save error:', err);
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

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade { animation: fadeIn 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }

        select option { background: #111; color: white; }
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

      <main className="pt-28 pb-32 px-4 md:px-6 max-w-3xl mx-auto min-h-screen relative z-20 space-y-8">
        
        {/* Identity Section */}
        <section className="animate-fade">
          <div className="glass-panel p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
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
        <div className="grid grid-cols-1 gap-12 animate-fade [animation-delay:0.1s]">
          
          {/* Group 1: Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="font-mono text-[10px] text-white/40 uppercase tracking-[0.4em] whitespace-nowrap">01 // IDENTITY_MATRICES</h2>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
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
            <div className="flex items-center gap-4">
              <h2 className="font-mono text-[10px] text-white/40 uppercase tracking-[0.4em] whitespace-nowrap">02 // COMMUNICATIONS_RELAY</h2>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
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
            <div className="flex items-center gap-4">
              <h2 className="font-mono text-[10px] text-white/40 uppercase tracking-[0.4em] whitespace-nowrap">03 // GEOSPATIAL_ANCHOR</h2>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
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
            <div className="flex items-center gap-4">
              <h2 className="font-mono text-[10px] text-white/40 uppercase tracking-[0.4em] whitespace-nowrap">04 // LINGUISTIC_PROTOCOLS</h2>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
            </div>
            <div className="space-y-4">
              {/* Preferred Lang */}
              <div className="profile-field group bg-white/[0.02] border border-white/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-white/30 text-base">translate</span>
                  <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.3em]">Preferred Output Language</span>
                  <span className="ml-auto font-mono text-[8px] px-2 py-0.5 border border-white/10 text-white/30 uppercase tracking-[0.2em]">USER_DEFINED</span>
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
                  <span className="material-symbols-outlined text-white/20">shield</span>
                  <div>
                    <div className="font-mono text-[9px] text-white/40 uppercase tracking-[0.3em]">Global English Override</div>
                    <div className="font-mono text-[8px] text-white/20 uppercase tracking-widest mt-1">Priority 0 fail-safe status</div>
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
            <div className="pt-8 pb-12 border-t border-white/5">
              <button 
                onClick={onSignOut}
                className="w-full flex items-center justify-between p-6 border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/5 hover:border-red-500/30 transition-all group"
              >
                <div className="flex items-center gap-4 text-left">
                  <span className="material-symbols-outlined text-red-500/50 group-hover:text-red-500 transition-colors">power_settings_new</span>
                  <div>
                    <div className="font-mono text-[10px] text-red-500/40 uppercase tracking-[0.4em]">SYSTEM_LOGOUT</div>
                    <div className="font-mono text-[8px] text-red-500/20 uppercase tracking-widest mt-1">Disconnect secure terminal session</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-red-500/30 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-20 flex justify-around items-stretch bg-[#050505]/90 backdrop-blur-3xl z-50 border-t border-white/5">
        <button onClick={onAI} className="flex flex-col items-center justify-center text-white/30 w-full h-full transition-all group nav-item-crazy gap-1 hover:text-white">
          <span className="material-symbols-outlined text-3xl transition-transform">psychology</span>
        </button>
        <button onClick={onHome} className="flex flex-col items-center justify-center text-white/30 w-full h-full transition-all group nav-item-crazy gap-1 border-x border-white/5 hover:text-white">
          <span className="material-symbols-outlined text-3xl transition-transform">terminal</span>
        </button>
        <button className="flex flex-col items-center justify-center text-white w-full h-full transition-all group gap-1 nav-item-active">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_filled</span>
        </button>
      </nav>
    </div>
  );
}
