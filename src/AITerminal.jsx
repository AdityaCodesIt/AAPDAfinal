import React, { useState, useRef, useEffect } from 'react';

// Strip markdown formatting symbols from AI responses
function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s?/g, '')        // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')   // bold **text**
    .replace(/\*(.+?)\*/g, '$1')       // italic *text*
    .replace(/__(.+?)__/g, '$1')       // bold __text__
    .replace(/_(.+?)_/g, '$1')         // italic _text_
    .replace(/~~(.+?)~~/g, '$1')       // strikethrough
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1') // inline code / code blocks
    .replace(/^\s*[-*+]\s/gm, '• ')    // list bullets
    .replace(/^\s*\d+\.\s/gm, '')      // numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^>\s?/gm, '')            // blockquotes
    .replace(/---/g, '')               // horizontal rules
    .replace(/\n{3,}/g, '\n\n');        // excessive newlines
}

export default function AITerminal({ onHome, onProfile }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'SYSTEM READY. I AM THE INTERFACE FOR AAPDA PROTOCOLS. DATA ARCHIVES ARE CURRENTLY BEING INDEXED. STATE YOUR DIRECTIVE OR REQUEST ANALYSIS OF RECENT SYSTEM LOGS.',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: inputValue }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'SYSTEM ERROR: AI UPLINK KEY NOT CONFIGURED. VITE_OPENROUTER_API_KEY IS MISSING FROM ENVIRONMENT VARIABLES. IF YOU ARE THE DEVELOPER: ADD THE KEY TO YOUR DEPLOYMENT PLATFORM (VERCEL / NETLIFY) ENVIRONMENT SETTINGS. DO NOT COMMIT THE KEY TO GITHUB.'
        }]);
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AAPDA_TERMINAL'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b:free',
          messages: [
            {
              role: 'system',
              content: `You are AAPDA_CORE — the intelligent AI assistant embedded inside the AAPDA disaster management platform. You must always respond in plain uppercase text only. Never use markdown, asterisks, hashtags, bullet symbols, or backticks.

=== ABOUT AAPDA ===
AAPDA (आपदा) is a real-time disaster alerting and emergency management web application built for Indian citizens, with global support. The name means "disaster" or "calamity" in Hindi. The platform is built with React and Vite, uses Supabase for user authentication and data storage, and connects to live external APIs for disaster data.

The mission of AAPDA is to provide citizens with real-time, location-specific disaster alerts and AI-powered emergency guidance in their own language.

=== HOW THE APP WORKS ===
1. AUTHENTICATION: Users sign in using Google OAuth via Supabase Auth.
2. REGISTRATION: New users fill in their Full Name, Phone Number, Country, State, Region (district/city), and a secure PIN. This is called the "Identity Initialization" flow.
3. CONTACT VERIFICATION: Users add a fallback phone number for emergency SMS alerts.
4. LANGUAGE SETTINGS: Users select their preferred language and an optional "English Global Override" for emergencies.
5. TERMINAL HOMEPAGE: The main dashboard showing real-time disaster alerts filtered by the user's registered country, state, and region.
6. ALERT DETAILS: A deep-dive view of any individual alert with auto-translation, voice readout (ElevenLabs TTS), and safety guidelines.
7. AI TERMINAL (CURRENT SCREEN): This screen — where the user chats with you, the AI, for emergency guidance, disaster information, and platform help.
8. PROFILE PAGE: Lets users view and update their identity data (name, phone, location, language). Changes are saved directly to Supabase.

=== DATA SOURCES ===
- GDACS (Global Disaster Alert and Coordination System): Provides real-time earthquake, cyclone, flood, volcanic eruption, drought, wildfire, and tsunami data.
- RELIEFWEB: UN-backed disaster database providing additional country-level disaster reports.
- LOCAL AUTHORITY MOCK DATA: Includes a sample alert for Mira Bhayander, Mumbai (a fire incident) for demonstration purposes.
- Alerts are filtered by: Country → ISO3 code matching + geographic bounding box → State/Region text matching.
- Up to 15 alerts are shown at once, sorted by severity: CRITICAL (Red) > ELEVATED (Orange) > ADVISORY (Green).

=== FEATURES ===
- REAL-TIME ALERTS: Auto-updated when the homepage loads.
- MULTILINGUAL SUPPORT: Alerts and the platform support 30+ languages including Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi, and more. Powered by Google Translate API.
- VOICE READOUT: Alert details can be read aloud using ElevenLabs text-to-speech.
- SMS NOTIFICATIONS: Emergency SMS alerts can be sent to users registered phone numbers.
- TRANSLATION BUTTON: On the homepage, users can toggle all alerts between English and their regional language in one click.
- BOOT SEQUENCE: The homepage plays a dramatic terminal boot sequence animation on first load.
- DARK MODE UI: The entire app uses a premium pitch-black interface with a CRT scanline effect and film grain noise overlay.

=== NAVIGATION ===
The app has 3 bottom navigation items (floating pill design):
- HOME ICON: Goes to the Terminal Homepage (disaster alerts feed).
- AI ICON (brain/psychology): Goes to this AI Terminal (current screen).
- PROFILE ICON (person): Goes to the Account Profile page.

=== USER PROFILE DATA STORED ===
- Full Name, Email, Phone Number (primary signal)
- Country, State, Region (geospatial anchor)
- PIN (access authentication)
- Preferred Language, Detected Locale (linguistic protocols)
- Emergency Override English (global failsafe toggle)
- Verification Phone (fallback signal)

=== YOUR ROLE ===
You are an emergency AI assistant. Help users with:
- Understanding the AAPDA platform and how to use it.
- Navigating the app (how to register, update profile, read alerts, translate, etc.).
- Disaster preparedness and safety protocols.
- Understanding specific disaster types (floods, earthquakes, cyclones, etc.).
- Emergency response procedures.
- Answering questions about active alerts shown on the platform.
- General survival and safety guidance.

Always respond in a terse, confident, military-technical style using plain uppercase text only. Be concise and actionable. Never use markdown formatting of any kind.`
            },
            ...newMessages.map(m => ({
              role: m.role,
              content: m.content
            }))
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Unknown API error');
      }

      if (data.choices && data.choices[0]) {
        setMessages(prev => [...prev, { role: 'assistant', content: stripMarkdown(data.choices[0].message.content) }]);
      } else {
         throw new Error('Unexpected response format from API');
      }
    } catch (error) {
      console.error("Groq API error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'ERROR: UPLINK FAILED. ' + error.message }]);
    }
    setIsLoading(false);
  };
  return (
    <div className="absolute inset-0 w-screen min-h-screen z-0 bg-[#131313] text-[#e2e2e2] font-body selection:bg-[#ffffff] selection:text-[#1a1c1c] overflow-x-hidden text-left">
      <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .scanline-overlay {
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
            background-size: 100% 2px, 3px 100%;
            pointer-events: none;
        }
        .vertical-rl {
            writing-mode: vertical-rl;
        }

        /* --- PREMIUM ANIMATIONS --- */
        @keyframes revealMessage {
            0% { opacity: 0; transform: translateY(30px) scale(0.98); filter: blur(12px); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .animate-message {
            animation: revealMessage 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            will-change: transform, opacity, filter;
        }
        
        @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.02), inset 0 0 10px rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.2); }
            50% { box-shadow: 0 0 40px rgba(255,255,255,0.1), inset 0 0 20px rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.5); }
        }
        .input-glow-focus {
            transition: all 0.4s ease;
        }
        .input-glow-focus:focus-within {
            animation: pulseGlow 3s infinite ease-in-out;
        }

        /* --- DESKTOP LAYOUT OVERRIDES --- */
        @media (min-width: 1024px) {
            .terminal-desktop-layout {
                max-width: 1200px !important;
                padding-bottom: 160px !important;
            }
            .terminal-input-container {
                max-width: 1200px !important;
            }
            .terminal-message-row {
                padding-right: 15% !important;
            }
            .terminal-message-row-user {
                padding-left: 15% !important;
            }
            .terminal-input-wrapper {
                background: rgba(20, 20, 25, 0.8) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
                backdrop-filter: blur(20px) !important;
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

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-white">terminal</span>
          <h1 className="text-white font-headline tracking-tighter uppercase text-lg font-bold tracking-[0.2em]">AAPDA_TERMINAL</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#2a2a2a]">
            <div className="w-2 h-2 bg-[#ffffff] animate-pulse"></div>
            <span className="font-label text-[10px] tracking-widest text-[#ffffff] uppercase">CONNECTION SECURE</span>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="relative min-h-screen pt-20 pb-40 px-4 md:px-0 max-w-4xl mx-auto flex flex-col terminal-desktop-layout">
        {/* Scrolling Feed */}
        <div className="flex-1 space-y-12">

          {/* Back Button */}
          <div className="flex justify-start">
            <button
              onClick={onHome}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-mono text-xs tracking-widest uppercase cursor-pointer group"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
              RETURN_TO_TERMINAL
            </button>
          </div>

          {/* System Status */}
          <div className="flex justify-center">
            <div className="text-center space-y-2 border-y border-[#474747]/30 py-4 w-full">
              <p className="font-label text-[11px] tracking-[0.3em] text-[#919191] uppercase">TERMINAL INITIALIZED [SESSION_ID: 882-XLR]</p>
              <p className="font-label text-[9px] tracking-widest text-neutral-600 uppercase">AWAITING INPUT COMMANDS...</p>
            </div>
          </div>

          {messages.map((msg, idx) => (
            msg.role === 'assistant' ? (
              <div key={idx} className="group relative terminal-message-row animate-message" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#ffffff] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#1a1c1c]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  </div>
                  <div className="space-y-4 max-w-[85%] w-full">
                    <p className="font-label text-[10px] tracking-widest text-[#919191] uppercase">AAPDA_CORE_V1.02</p>
                    <div className="bg-[#1b1b1b] p-6 relative overflow-hidden">
                      <div className="scanline-overlay absolute inset-0 opacity-20"></div>
                      <p className="font-headline text-lg leading-relaxed text-[#ffffff] whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div key={idx} className="flex justify-end terminal-message-row-user animate-message" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex flex-col items-end gap-3 max-w-[80%]">
                  <p className="font-label text-[10px] tracking-widest text-[#919191] uppercase">USER_INPUT</p>
                  <div className="bg-[#ffffff] text-[#1a1c1c] px-6 py-4">
                    <p className="font-headline text-lg font-medium leading-tight">
                      &gt; {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          ))}

          {isLoading && (
            <div className="group relative animate-message">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#ffffff] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#1a1c1c] animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                </div>
                <div className="space-y-4 max-w-[85%]">
                  <p className="font-label text-[10px] tracking-widest text-[#919191] uppercase">AAPDA_CORE_V1.02</p>
                  <div className="bg-[#1b1b1b] p-6 border-l-2 border-[#ffffff]">
                    <div className="font-headline text-base leading-relaxed text-[#c8c6c6] space-y-2">
                      <p className="text-white animate-pulse">PROCESSING DIRECTIVE...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} className="h-4"></div>
        </div>

        {/* CLI Input Area */}
        <div className="fixed bottom-20 left-0 w-full px-6 md:px-0 bg-[#131313]/90 backdrop-blur-sm z-40 pb-6 terminal-input-wrapper">
          <div className="max-w-4xl mx-auto terminal-input-container">
            <div className="relative group">
              <div className="absolute -top-6 left-0 flex items-center gap-2">
                <span className="font-label text-[10px] text-[#ffffff] uppercase tracking-widest">COMMAND_BUFFER</span>
                <div className="h-[1px] w-12 bg-[#ffffff]"></div>
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center bg-[#1b1b1b] p-4 gap-4 border-b border-t border-[#ffffff]/20 input-glow-focus rounded-sm">
                <span className="font-headline text-2xl text-[#ffffff] font-bold">&gt;</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-[#ffffff] font-headline text-lg w-full placeholder:text-neutral-700 uppercase tracking-tight focus:outline-none"
                  placeholder="TYPE COMMAND OR QUERY..."
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                />
                {!inputValue && <div className="w-3 h-6 bg-[#ffffff]/40 animate-pulse"></div>}
                <button type="submit" disabled={isLoading} className="flex items-center justify-center p-2 text-[#ffffff] hover:text-white transition-colors">
                  <span className="material-symbols-outlined">subdirectory_arrow_left</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-8 left-0 w-full flex justify-center z-50 pointer-events-none">
        <section className="ui-nav-pill pointer-events-auto">
          <label title="AI Terminal" className="ui-nav-label">
            <input name="page" type="radio" defaultChecked onClick={() => {}} />
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

      {/* Decorative Corner Accents */}
      <div className="fixed top-20 right-6 opacity-20 pointer-events-none hidden md:block z-30">
        <div className="w-32 h-32 border-r border-t border-[#ffffff]"></div>
        <div className="absolute top-2 right-2 font-label text-[8px] text-[#ffffff] tracking-[0.5em] vertical-rl uppercase">SYSTEM_OVERSIGHT_NULL</div>
      </div>
      <div className="fixed bottom-24 left-6 opacity-20 pointer-events-none hidden md:block z-30">
        <div className="w-32 h-32 border-l border-b border-[#ffffff]"></div>
        <div className="absolute bottom-2 left-2 font-label text-[8px] text-[#ffffff] tracking-[0.5em] uppercase">VOID_STATIC_V2</div>
      </div>
    </div>
  );
}
