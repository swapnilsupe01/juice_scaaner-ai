import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ThreeCanvas from './components/ThreeCanvas';
import LandingPage from './pages/LandingPage';
import ArchitecturePage from './pages/ArchitecturePage';
import DashboardPage from './pages/DashboardPage';
import { Shield, GitBranch, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isDark, setIsDark] = useState(true);
  const [targetUrl, setTargetUrl] = useState('http://localhost:3000');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  return (
    <div className={`min-h-screen relative flex flex-col justify-between ${isDark ? 'bg-[#0A0A0A] text-[#e5e2e1]' : 'bg-[#f5f7fa] text-[#0f172a]'}`}>
      
      {/* Three.js 3D Background */}
      <ThreeCanvas isDark={isDark} />

      {/* Main Container */}
      <div className="relative z-10 flex-grow">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          setIsDark={setIsDark}
          targetUrl={targetUrl}
          setTargetUrl={setTargetUrl}
        />

        <main className="pb-24">
          {activeTab === 'landing' && (
            <LandingPage setActiveTab={setActiveTab} isDark={isDark} />
          )}

          {activeTab === 'architecture' && (
            <ArchitecturePage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage targetUrl={targetUrl} setTargetUrl={setTargetUrl} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-[#ffffff15] py-4 px-4 text-center text-xs text-[#71717A] font-mono-tag">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00D1FF]" />
            <span className="text-[#bbc9cf] font-bold">JuiceScanner AI</span>
            <span>— Real-Time Cybersecurity Orchestration Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[#bbc9cf]">
            <span>Vulnerability Engine v2.4</span>
            <span>•</span>
            <span className="text-[#00D1FF]">OWASP Juice Shop Ready</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
