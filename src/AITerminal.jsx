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
        throw new Error('API key is missing. Please set VITE_OPENROUTER_API_KEY in your .env file.');
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
              content: 'You are AAPDA_CORE, a disaster management AI terminal. You speak in a terse, military/technical style using uppercase. You help users with disaster preparedness, emergency protocols, and safety information. Keep responses concise and actionable. IMPORTANT: Do NOT use any markdown formatting in your responses. No hashtags, no asterisks, no bullet symbols, no backticks. Use plain uppercase text only.'
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
        .glitch-text {
            text-shadow: 1px 0px 0px #ffb4ab, -1px 0px 0px #ffffff;
        }
        .vertical-rl {
            writing-mode: vertical-rl;
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
      <main className="relative min-h-screen pt-20 pb-40 px-4 md:px-0 max-w-4xl mx-auto flex flex-col">
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
              <div key={idx} className="group relative">
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
              <div key={idx} className="flex justify-end">
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
            <div className="group relative">
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
        <div className="fixed bottom-20 left-0 w-full px-6 md:px-0 bg-[#131313]/90 backdrop-blur-sm z-40 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -top-6 left-0 flex items-center gap-2">
                <span className="font-label text-[10px] text-[#ffffff] uppercase tracking-widest">COMMAND_BUFFER</span>
                <div className="h-[1px] w-12 bg-[#ffffff]"></div>
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center bg-[#1b1b1b] p-4 gap-4 border-b border-[#ffffff]">
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

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 pb-4 bg-neutral-950 border-t border-neutral-800/20 z-50">
        <button className="flex flex-col items-center justify-center text-white scale-110 active:translate-y-0.5 transition-transform">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
        </button>
        <button onClick={onHome} className="flex flex-col items-center justify-center text-neutral-600 hover:text-neutral-200 active:translate-y-0.5 transition-transform">
          <span className="material-symbols-outlined text-3xl">home</span>
        </button>
        <button onClick={onProfile} className="flex flex-col items-center justify-center text-neutral-600 hover:text-neutral-200 active:translate-y-0.5 transition-transform">
          <span className="material-symbols-outlined text-3xl">person</span>
        </button>
      </nav>

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
