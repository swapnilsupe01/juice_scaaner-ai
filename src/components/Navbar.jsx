import React, { useState, useEffect } from 'react';
import { Shield, Sun, Moon, Cpu, Layers, LayoutDashboard, Play, Activity } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isDark, 
  setIsDark, 
  targetUrl, 
  setTargetUrl,
  onQuickScan 
}) {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [ollamaOnline, setOllamaOnline] = useState(false);

  useEffect(() => {
    fetch('/api/system/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'online') {
          setBackendStatus('online');
          if (data.ollama && data.ollama.online) {
            setOllamaOnline(true);
          } else {
            setOllamaOnline(false);
          }
        } else {
          setBackendStatus('offline');
        }
      })
      .catch(() => {
        setBackendStatus('offline');
        setOllamaOnline(false);
      });
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-[#ffffff1a] px-4 lg:px-8 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D1FF] to-[#BC00FF] p-[2px] shadow-[0_0_15px_rgba(0,209,255,0.4)]">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00D1FF]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg tracking-tight text-[#e5e2e1] dark:text-[#e5e2e1]">
                JUICE<span className="text-[#00D1FF]">SCANNER</span>
              </span>
              <span className="bg-[#BC00FF]/20 text-[#BC00FF] border border-[#BC00FF]/40 text-[10px] font-mono-tag font-bold px-2 py-0.5 rounded-full">
                AI v2.4
              </span>
            </div>
            <p className="text-xs text-[#71717A] font-mono-tag hidden sm:block">
              Multi-Theme 3D Vulnerability Engine
            </p>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center bg-[#131313]/80 border border-[#ffffff15] p-1 rounded-xl shadow-inner text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'landing'
                ? 'bg-gradient-to-r from-[#00D1FF] to-[#0099ff] text-black font-semibold shadow-[0_0_12px_rgba(0,209,255,0.4)]'
                : 'text-[#bbc9cf] hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Landing 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'architecture'
                ? 'bg-gradient-to-r from-[#BC00FF] to-[#9333ea] text-white font-semibold shadow-[0_0_12px_rgba(188,0,255,0.4)]'
                : 'text-[#bbc9cf] hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Shadow AI Stack</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-[#00D1FF] to-[#BC00FF] text-black font-bold shadow-[0_0_15px_rgba(0,209,255,0.3)]'
                : 'text-[#bbc9cf] hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Right Actions: Target Input, Theme Switcher & Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1b1b] border border-[#3c494e] text-xs font-mono-tag">
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'online'
                  ? 'bg-[#00D1FF] animate-pulse shadow-[0_0_8px_#00D1FF]'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-[#bbc9cf]">
              FastAPI: {backendStatus === 'online' ? 'Active' : 'Standby'}
            </span>
            <span className="text-[#71717A]">|</span>
            <span className={ollamaOnline ? "text-emerald-400 font-bold" : "text-[#71717A]"}>
              Ollama: {ollamaOnline ? 'Llama 3.2 🟢' : 'Offline 🔴'}
            </span>
          </div>

          {/* Quick Scan Action */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              if (onQuickScan) onQuickScan();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D1FF] via-[#38bdf8] to-[#BC00FF] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,209,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Launch Audit</span>
          </button>

        </div>

      </div>
    </header>
  );
}
