import React, { useState } from 'react';

export default function ContactVerification({ onVerify, formData, updateFormData }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'FIELD_REQUIRED: NODE_ADDRESS_NULL';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'ERROR: INVALID_NODE_FORMAT // USE: USER@DOMAIN.EXT';
    }

    // Phone validation (10 digits)
    const digitsOnly = formData.verification_phone.replace(/\D/g, '');
    if (!digitsOnly) {
      newErrors.verification_phone = 'FIELD_REQUIRED: SIGNAL_NULL';
    } else if (digitsOnly.length !== 10) {
      newErrors.verification_phone = 'ERROR: SIGNAL_LENGTH_INVALID // REQUIRES 10 DIGITS';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = () => {
    if (validate() && onVerify) onVerify();
  };

  return (
    <div className="bg-[#131313] text-on-background font-body selection:bg-primary selection:text-on-primary min-h-[max(884px,100dvh)] w-full">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-zinc-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-white" data-icon="security">security</span>
          <span className="font-['Space_Grotesk'] tracking-[-0.05em] uppercase text-2xl font-black tracking-tighter text-white">AAPDA</span>
        </div>
        <button className="text-white hover:bg-zinc-800 transition-colors duration-100 p-2">
          <span className="material-symbols-outlined" data-icon="terminal">terminal</span>
        </button>
      </header>

      <main className="min-h-screen pt-24 pb-32 px-6 max-w-md mx-auto flex flex-col justify-center">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="inline-block bg-primary text-on-primary px-2 py-1 font-label text-[10px] tracking-[0.2em] uppercase mb-4">
            Identity Layer 02
          </div>
          <h1 className="font-headline text-5xl font-bold leading-tight tracking-[-0.05em] text-white mb-2">
            VERIFY<br />CONTACT
          </h1>
          <p className="text-secondary font-body text-sm leading-relaxed max-w-[280px]">
            Establish a secure link between your physical presence and digital node.
          </p>
        </section>

        {/* Form Section */}
        <div className="space-y-8">
          {/* Email Input */}
          <div className="group">
            <label className="block font-label text-[10px] tracking-widest text-secondary uppercase mb-2">
              Email Address
            </label>
            <div className="relative">
              <input 
                className={`w-full bg-surface-container-low border-none focus:ring-0 focus:border-b focus:border-primary text-white py-4 px-0 font-headline text-lg transition-all border-b ${errors.email ? 'border-red-500' : 'border-outline-variant/30'} placeholder:text-[#5e5e5e] placeholder:uppercase placeholder:text-xs placeholder:tracking-[0.1em]`}
                placeholder="USER@NODE.TERMINAL" 
                type="email"
                value={formData.email}
                onChange={(e) => { updateFormData({ email: e.target.value }); setErrors(prev => ({...prev, email: null})); }}
              />
              <div className="absolute right-0 bottom-4 opacity-20 group-focus-within:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-xs" data-icon="alternate_email">alternate_email</span>
              </div>
            </div>
            {errors.email && <p className="mt-1 font-mono text-[9px] text-red-500 uppercase tracking-widest animate-pulse">{errors.email}</p>}
          </div>

          {/* Phone Input */}
          <div className="group">
            <label className="block font-label text-[10px] tracking-widest text-secondary uppercase mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input 
                className={`w-full bg-surface-container-low border-none focus:ring-0 focus:border-b focus:border-primary text-white py-4 px-0 font-headline text-lg transition-all border-b ${errors.verification_phone ? 'border-red-500' : 'border-outline-variant/30'} placeholder:text-[#5e5e5e] placeholder:uppercase placeholder:text-xs placeholder:tracking-[0.1em]`}
                placeholder="+00 000 000 000" 
                type="tel"
                maxLength="10"
                value={formData.verification_phone}
                onChange={(e) => { 
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  updateFormData({ verification_phone: val }); 
                  setErrors(prev => ({...prev, verification_phone: null})); 
                }}
              />
              <div className="absolute right-0 bottom-4 opacity-20 group-focus-within:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-xs" data-icon="dialpad">dialpad</span>
              </div>
            </div>
            {errors.verification_phone && <p className="mt-1 font-mono text-[9px] text-red-500 uppercase tracking-widest animate-pulse">{errors.verification_phone}</p>}
          </div>
        </div>

        {/* Visual Element */}
        <div className="mt-16 relative h-48 w-full bg-surface-container-low overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10 mix-blend-overlay" 
            data-alt="Monochrome macro shot of circuit board patterns with high contrast lighting and sharp industrial details" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrmq_Gv0fiZGmDzpUM6b1WX1xrUmhfbgcSycoOFt7TqcGaQ2C409bU00xoAJJwlBWxxmhcSm1szwZoFLStWvSm3Z5dEBAOA6u7b4HAmrrkvkBdn3cztjpuuz7A76LWRuAQyRFpeWDXupLcGWemYUZvEMnHrkzm1tnCa2MO3aKqyWCtnmX5VPLnKeiQD3ExNnvLdA3zn_JspxVD_RHSla_sUygw7OZ5osQhyGsv0b-SpqUpwGxKlnFtJ205N8PUQp3Ue7xFabi81w40')", backgroundSize: "cover", backgroundPosition: "center" }}
          >
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-4 border border-outline-variant/20">
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 border-t border-l border-primary"></div>
              <span className="font-label text-[8px] text-tertiary-fixed tracking-[0.3em]">ENCRYPTION_ACTIVE</span>
            </div>
            <div className="space-y-1">
              <div className="h-[1px] w-full bg-primary/20"></div>
              <div className="h-[1px] w-2/3 bg-primary/40"></div>
              <div className="h-[1px] w-1/2 bg-primary/10"></div>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-label text-[8px] text-tertiary-fixed tracking-[0.3em]">SYS_VER_4.0.1</span>
              <div className="w-8 h-8 border-b border-r border-primary"></div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="mt-12">
          <button 
            onClick={handleVerify}
            className="w-full bg-white text-black py-5 font-label font-bold text-sm tracking-[0.2em] uppercase glitch-hover transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Verify Identity
            <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
          </button>
          <p className="mt-6 text-center font-label text-[9px] tracking-widest text-outline uppercase opacity-50">
            Data persistence is subject to protocols.
          </p>
        </div>
      </main>

      {/* Background Noise/Texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100]" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA3Zs7uv7VG3Trt-n2te0GtrJYbTHipIYYDdtQBuY4tbiDFCB6FwwHfyy1sAQmMmrqvvPn33igdSrq1o-9WAT5IiQUdQLuHzJciagYS_nwVDCaeunH24JD5oVHNdqY--ePnitjngzQ238ZINoe2oE5goTbT3hMrqBtBQmFyRC6MqfXyzIO8IQr1OVX_BSp3eCy2nlLNC6tNYC1_rRUj0hwDiMFwjXTpCD5cKLpbPGZWrFmIZlC_U51850gySFLu7q67fo614sT9owd_')" }}
      ></div>
    </div>
  );
}
