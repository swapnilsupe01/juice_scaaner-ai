import React, { useState } from 'react';
import {
  Shield, Cpu, Layers, Eye, AlertTriangle, Lock, CheckCircle2, Server, Database,
  Globe, Activity, Key, Radio, Brain, Search, Zap, Terminal, ArrowRight,
  ShieldCheck, Network, Fingerprint, Scan
} from 'lucide-react';

export default function ArchitecturePage({ setActiveTab }) {
  const [activeLayer, setActiveLayer] = useState(3);

  const stackLayers = [
    { id: 1, label: 'Enterprise Data Fabric', icon: Database, color: '#00D1FF', detail: 'Secure ingestion of logs, telemetry, network flows, and proprietary application assets into a unified data lake.' },
    { id: 2, label: 'Vulnerability Models', icon: Brain, color: '#BC00FF', detail: 'Proprietary LLMs trained on millions of CVEs, exploit databases, and zero-day attack pattern recognition.' },
    { id: 3, label: 'AI Agent Orchestrator', icon: Cpu, color: '#00D1FF', detail: 'Autonomous agent swarms executing coordinated, high-precision vulnerability scanning maneuvers across attack surfaces.' },
    { id: 4, label: 'Runtime Shield', icon: ShieldCheck, color: '#BC00FF', detail: 'Real-time threat mitigation engine with container isolation and live request interception for active workloads.' },
    { id: 5, label: 'Governance & Compliance', icon: Shield, color: '#00D1FF', detail: 'Automated policy enforcement, audit trail generation, and continuous compliance monitoring for SOC2/ISO standards.' },
  ];

  const threatVectors = [
    {
      vector: 'CSRF Password Forgery',
      mechanism: 'Cross-site origin state modification via GET request with no anti-CSRF token validation',
      detection: 'Synthetic cross-origin header injection from hostile referer domains',
      status: 'SCANNER ACTIVE',
      severity: 'Critical',
      icon: Lock,
      color: '#ff4444'
    },
    {
      vector: 'IDOR Basket Exposure',
      mechanism: 'Sequential basket ID enumeration bypassing ownership validation on REST endpoints',
      detection: 'Automated basket ID iteration against /rest/basket/* without token claims',
      status: 'SCANNER ACTIVE',
      severity: 'High',
      icon: Search,
      color: '#ffbb33'
    },
    {
      vector: 'Shadow AI Key Leakage',
      mechanism: 'Unmonitored third-party LLM prompts, exposed API keys, and unencrypted payload logs',
      detection: 'Real-time HTTP header pattern matching for Bearer tokens and API key signatures',
      status: 'SHADOW AI MONITOR',
      severity: 'Critical',
      icon: Cpu,
      color: '#BC00FF'
    },
    {
      vector: 'Admin API Exposure',
      mechanism: 'Direct unauthenticated access to /api/Users database table via admin-only endpoints',
      detection: 'Endpoint crawling with privilege level validation and role-based access testing',
      status: 'SCANNER ACTIVE',
      severity: 'Critical',
      icon: Key,
      color: '#ff4444'
    },
    {
      vector: 'CAPTCHA Bypass',
      mechanism: 'Server-side CAPTCHA answer exposed in raw API response JSON body',
      detection: 'CAPTCHA solution harvesting and reuse validation across multiple submissions',
      status: 'SCANNER ACTIVE',
      severity: 'Medium',
      icon: Zap,
      color: '#ffbb33'
    },
    {
      vector: 'Hidden i18n Discovery',
      mechanism: 'Secret Klingon (tlh.json) internationalization file publicly accessible via directory listing',
      detection: 'Asset path enumeration against /assets/i18n/* for undocumented language files',
      status: 'SCANNER ACTIVE',
      severity: 'Low',
      icon: Globe,
      color: '#33b5e5'
    },
  ];

  const activeLayerData = stackLayers.find(l => l.id === activeLayer);

  return (
    <div className="relative z-10">

      {/* ══════════════ HEADER ══════════════ */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#BC00FF]/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#00D1FF]/5 blur-3xl" />
        </div>

        <div className="container max-w-4xl mx-auto px-6 text-center relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs font-mono-tag text-[#BC00FF]">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="uppercase tracking-[0.15em] font-bold">System Topology & Threat Blueprint</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Autonomous Defense <br />
            <span className="bg-gradient-to-r from-[#BC00FF] via-[#ebb2ff] to-[#00D1FF] bg-clip-text text-transparent">
              Architecture & Shadow AI Matrix
            </span>
          </h1>

          <p className="text-[#bbc9cf] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Visual blueprint of the JuiceScanner AI security stack — from enterprise data ingestion through AI agent orchestration to real-time threat governance.
          </p>
        </div>
      </section>

      {/* ══════════════ INTERACTIVE 3D STACK INSPECTOR ══════════════ */}
      <section className="py-20 bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.05)]">
        <div className="container max-w-7xl mx-auto px-6">

          <div className="mb-12">
            <span className="font-mono-tag text-xs text-[#BC00FF] tracking-[0.2em] font-bold uppercase block mb-2">Neural Core Stack</span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">5-Layer Security Architecture</h2>
            <p className="text-[#71717A] text-sm mt-2">Click any layer to inspect its security telemetry and function.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left: Stack Layers (clickable) */}
            <div className="lg:col-span-5 space-y-3">
              {stackLayers.map((layer) => {
                const IconComp = layer.icon;
                const isActive = activeLayer === layer.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setActiveLayer(layer.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                      isActive
                        ? 'glass-panel border-[#00D1FF]/60 shadow-[0_0_20px_rgba(0,209,255,0.15)]'
                        : 'bg-[#131313]/50 border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-[#00D1FF]/10' : 'bg-[#1c1b1b]'}`}
                      style={{ color: isActive ? layer.color : '#71717A' }}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <span className="font-mono-tag text-xs text-[#71717A]">LAYER {String(layer.id).padStart(2, '0')}</span>
                        {isActive && <span className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_6px]" style={{ backgroundColor: layer.color, boxShadow: `0 0 8px ${layer.color}` }} />}
                      </div>
                      <h3 className={`font-heading font-bold text-sm mt-1 transition-colors ${isActive ? 'text-white' : 'text-[#bbc9cf]'}`}>
                        {layer.label}
                      </h3>
                    </div>

                    <span className="font-mono-tag text-[10px] uppercase tracking-wider" style={{ color: isActive ? layer.color : '#3c494e' }}>
                      {isActive ? 'ACTIVE' : 'IDLE'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right: Active Layer Detail Panel */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-8 space-y-6 min-h-[380px]">
              {activeLayerData && (
                <>
                  <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl" style={{ backgroundColor: activeLayerData.color + '15', color: activeLayerData.color }}>
                        <activeLayerData.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-xl text-white">{activeLayerData.label}</h3>
                        <p className="font-mono-tag text-xs text-[#71717A]">Layer {String(activeLayerData.id).padStart(2, '0')} // Neural Security Core</p>
                      </div>
                    </div>
                    <span className="font-mono-tag text-[10px] font-bold px-3 py-1.5 rounded-full border animate-pulse"
                      style={{ borderColor: activeLayerData.color + '60', color: activeLayerData.color }}>
                      OPERATIONAL
                    </span>
                  </div>

                  <p className="text-[#bbc9cf] text-sm leading-relaxed">{activeLayerData.detail}</p>

                  {/* Fake telemetry metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
                      <p className="font-mono-tag text-[10px] text-[#71717A] uppercase">Throughput</p>
                      <p className="font-heading font-bold text-lg" style={{ color: activeLayerData.color }}>
                        {(activeLayerData.id * 1.2 + 2.8).toFixed(1)}k <span className="text-xs text-[#71717A]">req/s</span>
                      </p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
                      <p className="font-mono-tag text-[10px] text-[#71717A] uppercase">Latency</p>
                      <p className="font-heading font-bold text-lg text-white">
                        {(12 - activeLayerData.id * 1.5).toFixed(0)}ms <span className="text-xs text-[#71717A]">avg</span>
                      </p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
                      <p className="font-mono-tag text-[10px] text-[#71717A] uppercase">Uptime</p>
                      <p className="font-heading font-bold text-lg text-emerald-400">
                        99.{97 + activeLayerData.id}% <span className="text-xs text-[#71717A]">SLA</span>
                      </p>
                    </div>
                  </div>

                  {/* Connection flow */}
                  <div className="flex items-center gap-3 pt-2 text-xs font-mono-tag text-[#71717A]">
                    <span className="px-2 py-1 rounded bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)]">Input</span>
                    <span>→</span>
                    <span className="px-2 py-1 rounded border" style={{ borderColor: activeLayerData.color + '40', color: activeLayerData.color }}>{activeLayerData.label}</span>
                    <span>→</span>
                    <span className="px-2 py-1 rounded bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)]">Output</span>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════ THREAT & MITIGATION MATRIX ══════════════ */}
      <section className="py-20 bg-[#131313] border-t border-[rgba(255,255,255,0.05)]">
        <div className="container max-w-7xl mx-auto px-6 space-y-10">

          <div>
            <span className="font-mono-tag text-xs text-[#00D1FF] tracking-[0.2em] font-bold uppercase block mb-2">Threat Intelligence</span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Vulnerability Vector & Mitigation Matrix
            </h2>
            <p className="text-sm text-[#71717A] mt-2">Complete breakdown of enforced defenses against OWASP & Shadow AI exposure vectors.</p>
          </div>

          {/* Threat cards (mobile-friendly alternative to table) */}
          <div className="space-y-4">
            {threatVectors.map((tv, idx) => {
              const TvIcon = tv.icon;
              return (
                <div key={idx} className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#0A0A0A]" style={{ color: tv.color }}>
                        <TvIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-white">{tv.vector}</h4>
                        <p className="font-mono-tag text-[10px] text-[#71717A]">Severity: <span style={{ color: tv.color }} className="font-bold">{tv.severity}</span></p>
                      </div>
                    </div>
                    <span
                      className="self-start font-mono-tag text-[10px] font-bold uppercase px-3 py-1 rounded-full border"
                      style={{
                        borderColor: tv.status.includes('SHADOW') ? '#BC00FF60' : '#00D1FF60',
                        color: tv.status.includes('SHADOW') ? '#BC00FF' : '#00D1FF'
                      }}
                    >
                      {tv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#0A0A0A] rounded-xl p-3 border border-[rgba(255,255,255,0.06)]">
                      <p className="font-mono-tag text-[10px] text-[#71717A] uppercase mb-1">Threat Mechanism</p>
                      <p className="text-[#bbc9cf]">{tv.mechanism}</p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-xl p-3 border border-[rgba(255,255,255,0.06)]">
                      <p className="font-mono-tag text-[10px] text-[#71717A] uppercase mb-1">Detection Strategy</p>
                      <p className="text-[#bbc9cf]">{tv.detection}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="py-16 bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.05)]">
        <div className="container max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Execute Live Vulnerability Scans
          </h2>
          <p className="text-[#bbc9cf] text-sm max-w-xl mx-auto">
            Connect to the FastAPI scanning engine and run real-time CSRF, IDOR, Admin, CAPTCHA, Bot, and i18n tests against your target host.
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
