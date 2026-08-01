import React from 'react';
import {
  ShieldCheck, Zap, Lock, Terminal, Sparkles, ArrowRight, Search, Eye, Globe, Cpu,
  ChevronDown, Database, Brain, Shield, Layers, Radio, Server, Key, AlertTriangle
} from 'lucide-react';

export default function LandingPage({ setActiveTab, isDark }) {

  const archLayers = [
    { num: '05', title: 'Governance & Compliance', desc: 'Automated policy enforcement and continuous auditing for regulatory standards.', icon: Shield, color: '#00D1FF' },
    { num: '04', title: 'Runtime Security', desc: 'Real-time threat mitigation and container isolation for active workloads.', icon: ShieldCheck, color: '#BC00FF' },
    { num: '03', title: 'AI Agents & Orchestration', desc: 'Autonomous agent swarms executing high-precision security maneuvers.', icon: Brain, color: '#00D1FF' },
    { num: '02', title: 'Vulnerability Models', desc: 'Proprietary LLMs trained on millions of CVEs and zero-day patterns.', icon: Database, color: '#BC00FF' },
    { num: '01', title: 'Enterprise Data', desc: 'Secure ingestion layer for logs, telemetry, and proprietary assets.', icon: Layers, color: '#00D1FF' },
  ];

  const modules = [
    { id: 'csrf', title: 'CSRF Token Exploit', badge: 'Critical', desc: 'Validates cross-site request forgery protection on password change endpoints.', icon: Lock, color: '#00D1FF' },
    { id: 'idor', title: 'IDOR Basket Access', badge: 'High', desc: 'Tests insecure direct object reference on REST basket API endpoints.', icon: Search, color: '#BC00FF' },
    { id: 'admin', title: 'Admin Privilege Leak', badge: 'Critical', desc: 'Discovers exposed admin routes and user enumeration APIs.', icon: Eye, color: '#ff4444' },
    { id: 'captcha', title: 'CAPTCHA Bypass', badge: 'Medium', desc: 'Detects captcha answer exposure and reuse without invalidation.', icon: Zap, color: '#ffbb33' },
    { id: 'feedback', title: 'Bot Spam Engine', badge: 'Medium', desc: 'Tests for missing rate limits on feedback submission endpoints.', icon: Terminal, color: '#00C851' },
    { id: 'language', title: 'Hidden i18n Leak', badge: 'Low', desc: 'Discovers secret Klingon language files via directory enumeration.', icon: Globe, color: '#33b5e5' },
  ];

  return (
    <div className="relative z-10">

      {/* ══════════════ HERO SECTION ══════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-10">
        {/* Background Image & Gradient Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src="https://airia.com/images/enterprise-stack/office.webp"
            alt="Enterprise Security Operations Center Architecture Backdrop"
            className="w-full h-full object-cover opacity-25 mix-blend-luminosity filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/75 to-[#0A0A0A]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#00D1FF]/15 via-transparent to-[#BC00FF]/15 blur-3xl" />
        </div>

        <div className="relative z-10 container max-w-5xl mx-auto px-6 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-panel mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse shadow-[0_0_10px_#00D1FF]" />
            <span className="font-mono-tag text-xs text-[#00D1FF] uppercase tracking-[0.2em] font-bold">System Status: Optimal</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            The Singularity of <br />
            <span className="bg-gradient-to-r from-[#00D1FF] to-[#BC00FF] bg-clip-text text-transparent">
              Autonomous Defense
            </span>
          </h1>

          <p className="text-[#bbc9cf] text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Orchestrating high-fidelity vulnerability intelligence for OWASP environments. Secure your infrastructure with JuiceScanner AI's advanced penetration protocols.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto px-10 py-4 bg-[#00D1FF] text-black rounded-xl font-bold text-lg hover:shadow-[0_0_25px_rgba(0,209,255,0.4)] transition-all cursor-pointer active:scale-95"
            >
              Initialize Scan
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className="w-full sm:w-auto px-10 py-4 glass-panel text-[#e5e2e1] rounded-xl font-bold text-lg hover:bg-white/5 transition-all cursor-pointer"
            >
              View Documentation
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#71717A] animate-bounce">
          <span className="font-mono-tag text-[10px] uppercase tracking-[0.2em]">Keep Scrolling</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ══════════════ SYSTEM ARCHITECTURE — 3D STACK ══════════════ */}
      <section className="relative py-24 overflow-hidden bg-[#0A0A0A]">
        {/* Background Image & Radial Glow */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src="https://airia.com/images/enterprise-stack/office.webp"
            alt="Security Operations Center Architecture"
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#BC00FF]/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[#00D1FF]/10 blur-3xl" />
        </div>

        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">

            {/* Left: 3D Isometric Stack */}
            <div className="stack-perspective relative flex justify-center py-16 lg:py-0">
              <div className="stack-group flex flex-col-reverse items-center">
                {archLayers.map((layer, i) => (
                  <div
                    key={layer.num}
                    className={`stack-layer w-[300px] h-[180px] rounded-2xl glass-panel p-4 flex flex-col items-center justify-center gap-2 cursor-pointer ${i > 0 ? '-mt-12' : ''}`}
                    style={{ zIndex: i + 1, opacity: 0.5 + i * 0.12 }}
                  >
                    <layer.icon className="w-8 h-8" style={{ color: layer.color }} />
                    {i === archLayers.length - 1 && (
                      <div className="flex gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-[#00D1FF] animate-ping" />
                        <span className="w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Architecture Labels */}
            <div className="flex flex-col gap-8">
              <div className="mb-4">
                <span className="font-mono-tag text-xs text-[#BC00FF] tracking-[0.2em] font-bold uppercase block mb-2">System Architecture</span>
                <h2 className="font-heading font-bold text-3xl text-white">The Neural Security Core</h2>
              </div>

              <div className="space-y-5">
                {archLayers.map((layer) => (
                  <div key={layer.num} className="group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="font-mono-tag text-sm text-[#71717A] group-hover:text-[#00D1FF] transition-colors">{layer.num}</span>
                      <h3 className="font-heading text-base font-bold text-[#bbc9cf] group-hover:text-[#00D1FF] transition-colors uppercase tracking-widest">
                        {layer.title}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-[#71717A] text-sm pl-10 border-l border-[#00D1FF]/20 max-h-0 overflow-hidden opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-500">
                      {layer.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════ SHADOW AI EXPOSURE SECTION ══════════════ */}
      <section className="py-24 bg-[#131313] border-t border-[rgba(255,255,255,0.1)] overflow-hidden">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Shadow AI Visualizer */}
            <div className="relative min-h-[450px] flex items-center justify-center">
              {/* Animated rings */}
              <div className="relative w-[300px] h-[300px]">
                <div className="absolute inset-0 rounded-full border border-[#00D1FF]/20 animate-spin" style={{ animationDuration: '12s' }} />
                <div className="absolute inset-4 rounded-full border border-[#BC00FF]/20 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
                <div className="absolute inset-8 rounded-full border border-[#00D1FF]/30 animate-spin" style={{ animationDuration: '6s' }} />
                {/* Core sphere */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00D1FF] to-[#BC00FF] shadow-[0_0_40px_rgba(0,209,255,0.5)] animate-pulse flex items-center justify-center">
                    <Cpu className="w-8 h-8 text-black" />
                  </div>
                </div>
                {/* Floating particles */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white/60"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                      animation: `pulse 2s infinite ${i * 0.3}s`
                    }}
                  />
                ))}
              </div>

              {/* Glassmorphic Stats — overlapping right side */}
              <div className="absolute right-0 lg:-right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-8 min-w-[200px] hover:-translate-x-2 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-[#00D1FF] rounded-full" />
                    <span className="font-heading text-2xl font-bold text-white">42</span>
                  </div>
                  <span className="font-mono-tag text-[10px] uppercase text-[#71717A]">agents found</span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-8 min-w-[200px] hover:-translate-x-2 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-[#BC00FF] rounded-full" />
                    <span className="font-heading text-2xl font-bold text-white">9</span>
                  </div>
                  <span className="font-mono-tag text-[10px] uppercase text-[#71717A]">unmanaged</span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-8 min-w-[200px] hover:-translate-x-2 transition-transform cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-[#a4e6ff] rounded-full" />
                    <span className="font-heading text-2xl font-bold text-white">100%</span>
                  </div>
                  <span className="font-mono-tag text-[10px] uppercase text-[#71717A]">governed</span>
                </div>
              </div>
            </div>

            {/* Right: Shadow AI Content */}
            <div className="space-y-8">
              <div>
                <span className="font-mono-tag text-xs text-[#00D1FF] tracking-[0.2em] font-bold uppercase block mb-4">Internal Discovery</span>
                <h2 className="font-heading font-extrabold text-4xl lg:text-5xl text-white leading-tight mb-6">
                  Expose shadow AI
                </h2>
                <p className="text-[#bbc9cf] text-lg max-w-xl">
                  Find every AI tool, model, agent, and MCP server running across your organization, including the ones nobody approved.
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 glass-panel rounded-lg text-[#00D1FF]">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Universal Visibility</h4>
                    <p className="text-sm text-[#71717A]">Map the entire landscape of model usage from OpenAI to local Llama instances.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 glass-panel rounded-lg text-[#BC00FF]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Instant Compliance</h4>
                    <p className="text-sm text-[#71717A]">Bring unmanaged agents under centralized governance with one-click injection.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-8 py-4 bg-[#00D1FF] text-black rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer group"
              >
                Run Shadow Audit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════ VULNERABILITY MODULES GRID ══════════════ */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="container max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="font-mono-tag text-xs text-[#BC00FF] tracking-[0.2em] uppercase font-bold block mb-2">Vulnerability Modules</span>
              <h2 className="font-heading font-bold text-3xl text-white">
                Active Defense <span className="text-[#00D1FF]">Protocols</span>
              </h2>
            </div>
            <p className="text-[#71717A] max-w-sm text-sm">
              High-fidelity scanning modules targeting the OWASP top 10 within Juice Shop environments.
            </p>
          </div>

          {/* Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => setActiveTab('dashboard')}
                  className="group glass-panel rounded-2xl p-6 space-y-5 hover:border-[#00D1FF]/50 transition-all duration-300 cursor-pointer hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Scan line animation */}
                  <div className="absolute h-[2px] w-full left-0 bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent opacity-0 group-hover:opacity-50 group-hover:animate-pulse top-0" />

                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)]" style={{ color: mod.color }}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span
                      className="text-[10px] font-mono-tag font-bold border px-2.5 py-1 rounded-full"
                      style={{ borderColor: mod.color + '60', color: mod.color }}
                    >
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#00D1FF] transition-colors">{mod.title}</h3>
                    <p className="text-xs text-[#71717A] leading-relaxed mt-2">{mod.desc}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-mono-tag text-[#71717A] group-hover:text-white">
                    <span>Execute Module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section className="py-16 bg-[#131313] border-t border-[rgba(255,255,255,0.1)]">
        <div className="container max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-heading font-extrabold text-3xl text-white">
            Ready to audit your attack surface?
          </h2>
          <p className="text-[#bbc9cf] text-base max-w-xl mx-auto">
            Launch the full security scanner dashboard to execute real-time vulnerability tests against your OWASP Juice Shop instance.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#00D1FF] to-[#BC00FF] text-black font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(0,209,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Open Security Dashboard
          </button>
        </div>
      </section>

    </div>
  );
}
