import React, { useState } from 'react';

export default function Registration({ onNext, formData, updateFormData }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'FIELD_REQUIRED: IDENTITY_NULL';
    
    const digitsOnly = formData.phone_number.replace(/\D/g, '');
    if (!digitsOnly) {
      newErrors.phone_number = 'FIELD_REQUIRED: SIGNAL_NULL';
    } else if (digitsOnly.length !== 10) {
      newErrors.phone_number = 'ERROR: SIGNAL_LENGTH_INVALID // REQUIRES 10 DIGITS';
    }

    if (!formData.country.trim()) newErrors.country = 'FIELD_REQUIRED: ZONE_NULL';
    if (!formData.state.trim()) newErrors.state = 'FIELD_REQUIRED: SECTOR_NULL';
    if (!formData.region.trim()) newErrors.region = 'FIELD_REQUIRED: DISTRICT_NULL';
    if (!formData.pin.trim()) newErrors.pin = 'FIELD_REQUIRED: AUTH_KEY_NULL';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate() && onNext) onNext();
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary selection:text-on-primary overflow-x-hidden min-h-[max(884px,100dvh)] w-full">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#131313] flex justify-between items-center px-6 py-4 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-white" data-icon="security">security</span>
          <span className="font-['Space_Grotesk'] uppercase tracking-widest text-white text-2xl font-bold tracking-tighter">AAPDA</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a className="font-label text-sm uppercase tracking-[0.2em] text-[#c8c6c6] hover:text-white transition-colors" href="#">Protocol</a>
          <a className="font-label text-sm uppercase tracking-[0.2em] text-[#c8c6c6] hover:text-white transition-colors" href="#">Network</a>
          <a className="font-label text-sm uppercase tracking-[0.2em] text-[#c8c6c6] hover:text-white transition-colors" href="#">Access</a>
        </div>
      </header>

      <main className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center">
        {/* Hero Branding Section */}
        <div className="w-full max-w-xl mb-16 space-y-4">
          <div className="inline-block bg-surface-container-highest px-3 py-1 mb-4">
            <span className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">System Identity Initialization</span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none mb-6">
            USER<br/><span className="text-secondary-fixed-dim">PROTOCOL</span>
          </h1>
          <p className="font-body text-on-surface-variant max-w-md leading-relaxed text-lg">
            Enter your biometric and regional telemetry to synchronize with the AAPDA secure network.
          </p>
        </div>

        {/* Registration Form */}
        <section className="w-full max-w-xl bg-surface-container-low p-8 md:p-12 relative">
          {/* Decorative Glitch Elements */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-primary"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-primary opacity-20"></div>
          
          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Field Group: Identity */}
            <div className="space-y-8">
              <div className="group">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block">Full Name</label>
                <input 
                  className={`w-full bg-surface-container border-0 border-b ${errors.full_name ? 'border-red-500' : 'border-outline-variant'} focus:border-primary focus:ring-0 text-white font-body px-0 py-3 transition-all placeholder:text-surface-variant uppercase tracking-widest text-sm`}
                  placeholder="SURNAME, GIVEN NAME" 
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => { updateFormData({ full_name: e.target.value }); setErrors(prev => ({...prev, full_name: null})); }}
                />
                {errors.full_name && <p className="mt-1 font-mono text-[9px] text-red-500 uppercase tracking-widest animate-pulse">{errors.full_name}</p>}
              </div>
              <div className="group">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block">Phone Number</label>
                <input 
                  className={`w-full bg-surface-container border-0 border-b ${errors.phone_number ? 'border-red-500' : 'border-outline-variant'} focus:border-primary focus:ring-0 text-white font-body px-0 py-3 transition-all placeholder:text-surface-variant tracking-widest text-sm`}
                  placeholder="+00 000 000 0000" 
                  type="tel"
                  maxLength="10"
                  value={formData.phone_number}
                  onChange={(e) => { 
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    updateFormData({ phone_number: val }); 
                    setErrors(prev => ({...prev, phone_number: null})); 
                  }}
                />
                {errors.phone_number && <p className="mt-1 font-mono text-[9px] text-red-500 uppercase tracking-widest animate-pulse">{errors.phone_number}</p>}
              </div>
            </div>

            {/* Field Group: Regional Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <div className="group">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block">Country</label>
                <input 
                  className={`w-full bg-surface-container border-0 border-b ${errors.country ? 'border-red-500' : 'border-outline-variant'} focus:border-primary focus:ring-0 text-white font-body px-0 py-3 transition-all placeholder:text-surface-variant uppercase tracking-widest text-sm`}
                  placeholder="GEOPOLITICAL ZONE" 
                  type="text"
                  value={formData.country}
                  onChange={(e) => { updateFormData({ country: e.target.value }); setErrors(prev => ({...prev, country: null})); }}
                />
                {errors.country && <p className="mt-1 font-mono text-[9px] text-red-500 uppercase tracking-widest animate-pulse">{errors.country}</p>}
              </div>
              <div className="group">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block">State</label>
                <input 
                  className={`w-full bg-surface-container border-0 border-b ${errors.state ? 'border-red-500' : 'border-outline-variant'} focus:border-primary focus:ring-0 text-white font-body px-0 py-3 transition-all placeholder:text-surface-variant uppercase tracking-widest text-sm`}
                  placeholder="ADMINISTRATIVE SECTOR" 
                  type="text"
                  value={formData.state}
                  onChange={(e) => { updateFormData({ state: e.target.value }); setErrors(prev => ({...prev, state: null})); }}
                />
                {errors.state && <p className="mt-1 font-mono text-[9px] text-red-500 uppercase tracking-widest animate-pulse">{errors.state}</p>}
              </div>
              <div className="group">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block">Region</label>
                <input 
                  className={`w-full bg-surface-container border-0 border-b ${errors.region ? 'border-red-500' : 'border-outline-variant'} focus:border-primary focus:ring-0 text-white font-body px-0 py-3 transition-all placeholder:text-surface-variant uppercase tracking-widest text-sm`}
                  placeholder="SUB-DISTRICT ID" 
                  type="text"
                  value={formData.region}
                  onChange={(e) => { updateFormData({ region: e.target.value }); setErrors(prev => ({...prev, region: null})); }}
                />
                {errors.region && <p className="mt-1 font-mono text-[9px] text-red-500 uppercase tracking-widest animate-pulse">{errors.region}</p>}
              </div>
              <div className="group">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block">PIN</label>
                <input 
                  className={`w-full bg-surface-container border-0 border-b ${errors.pin ? 'border-red-500' : 'border-outline-variant'} focus:border-primary focus:ring-0 text-white font-body px-0 py-3 transition-all placeholder:text-surface-variant tracking-widest text-sm`}
                  placeholder="****" 
                  type="password"
                  value={formData.pin}
                  onChange={(e) => { updateFormData({ pin: e.target.value }); setErrors(prev => ({...prev, pin: null})); }}
                />
                {errors.pin && <p className="mt-1 font-mono text-[9px] text-red-500 uppercase tracking-widest animate-pulse">{errors.pin}</p>}
              </div>
            </div>

            {/* Action Section */}
            <div className="pt-8">
              <button className="w-full bg-white text-black font-label font-bold py-5 text-sm uppercase tracking-[0.4em] hover:bg-secondary transition-all active:scale-[0.98] duration-75 relative overflow-hidden group" type="submit">
                <span className="relative z-10">INITIALIZE PROTOCOL</span>
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
              </button>
              <div className="mt-6 flex justify-between items-center opacity-40">
                <span className="font-label text-[8px] uppercase tracking-[0.2em]">Status: Pending Authorization</span>
                <span className="font-label text-[8px] uppercase tracking-[0.2em]">v2.4.0_CORE</span>
              </div>
            </div>
          </form>
        </section>

        {/* Aesthetic Sidebar/Asymmetric Elements */}
        <div className="fixed right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-12 pointer-events-none">
          <div className="h-64 w-[1px] bg-outline-variant"></div>
          <div className="rotate-90 origin-left translate-x-2">
            <span className="font-label text-[10px] uppercase tracking-[1em] text-secondary-fixed-dim whitespace-nowrap">SECURE DATA TRANSMISSION CHANNEL ALPHA</span>
          </div>
          <div className="h-64 w-[1px] bg-outline-variant"></div>
        </div>
      </main>

      {/* Decorative Background Noise/Grid (Subtle) */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
      </div>
    </div>
  );
}
