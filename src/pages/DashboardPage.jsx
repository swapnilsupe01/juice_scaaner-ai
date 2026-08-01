import React, { useState } from 'react';
import { 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Lock, 
  Search, 
  Eye, 
  Zap, 
  Globe, 
  Database,
  Check,
  Sparkles,
  Cpu
} from 'lucide-react';

export default function DashboardPage({ targetUrl, setTargetUrl }) {
  const [email, setEmail] = useState('admin@juice-sh.op');
  const [password, setPassword] = useState('admin123');
  const [selectedProfile, setSelectedProfile] = useState('juiceshop');
  const [dockerLaunching, setDockerLaunching] = useState(false);
  const [dockerStatusMsg, setDockerStatusMsg] = useState('');

  const targetProfiles = {
    juiceshop: { url: 'http://localhost:3000', email: 'admin@juice-sh.op', password: 'admin123' },
    bwapp: { url: 'http://localhost:8080', email: 'bee', password: 'bug' },
    dvwa: { url: 'http://localhost:8081', email: 'admin', password: 'password' },
    mutillidae: { url: 'http://localhost:8082', email: 'admin', password: 'admin' }
  };

  const handleProfileSelect = (profileId) => {
    setSelectedProfile(profileId);
    const prof = targetProfiles[profileId];
    if (prof) {
      setTargetUrl(prof.url);
      setEmail(prof.email);
      setPassword(prof.password);
    }
  };

  const autoLaunchDockerContainer = async () => {
    setDockerLaunching(true);
    setDockerStatusMsg('');
    try {
      const res = await fetch('/api/docker/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_id: selectedProfile })
      });
      const data = await res.json();
      setDockerStatusMsg(data.message || 'Docker container launched successfully!');
    } catch (err) {
      setDockerStatusMsg(`Docker launch failed: ${err.message}`);
    } finally {
      setDockerLaunching(false);
    }
  };
  
  const [activeScan, setActiveScan] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [ollamaModel, setOllamaModel] = useState('qwen2.5:0.5b');
  const [ollamaStatus, setOllamaStatus] = useState('unknown'); // 'unknown' | 'online' | 'offline'
  const [ollamaChecking, setOllamaChecking] = useState(false);

  const OLLAMA_MODELS = [
    { value: 'qwen2.5:0.5b', label: '🚀 Qwen 2.5 (0.5B - Ultra Fast)' },
    { value: 'llama3.2:1b', label: '🦙 Llama 3.2 (1B - Fast)' },
    { value: 'llama3.2:latest', label: '🦙 Llama 3.2 (3B - Slow/Heavy)' },
    { value: 'nomic-embed-text:latest', label: '📊 Nomic Embed Text' },
  ];

  const checkOllamaStatus = async () => {
    setOllamaChecking(true);
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      if (data.ollama && data.ollama.online) {
        setOllamaStatus('online');
      } else {
        setOllamaStatus('offline');
      }
    } catch {
      setOllamaStatus('offline');
    } finally {
      setOllamaChecking(false);
    }
  };

  const runAiAnalysis = async () => {
    if (!scanResults) return;
    setAiLoading(true);
    setAiReport(null);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_results: scanResults, model: ollamaModel })
      });
      const data = await res.json();
      setAiReport(data);
      if (data.status === 'success') setOllamaStatus('online');
      if (data.status === 'offline') setOllamaStatus('offline');
    } catch (err) {
      setAiReport({ status: 'error', message: err.message || 'Ollama API call failed' });
    } finally {
      setAiLoading(false);
    }
  };

  // Individual Module Scan Execution
  const runSingleScan = async (endpoint, name) => {
    setActiveScan(name);
    setErrorMsg('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetUrl, email, password })
      });
      const data = await res.json();
      setScanResults(data);
      setScanHistory((prev) => [{ name, data, time: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) {
      setErrorMsg(`Scan error: ${err.message || 'Connection failed'}`);
    } finally {
      setActiveScan(null);
    }
  };

  // Full Batch Audit Execution
  const runFullAudit = async () => {
    setActiveScan('Full Audit');
    setErrorMsg('');
    try {
      const res = await fetch('/scan/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetUrl, email, password })
      });
      const data = await res.json();
      setScanResults(data);
      setScanHistory((prev) => [{ name: 'Full Batch Audit', data, time: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) {
      setErrorMsg(`Full Audit error: ${err.message || 'Connection failed'}`);
    } finally {
      setActiveScan(null);
    }
  };

  const modules = [
    { id: 'csrf', name: 'CSRF Token Check', endpoint: '/scan/csrf', icon: Lock, color: 'text-[#00D1FF]' },
    { id: 'basket', name: 'IDOR Basket Isolation', endpoint: '/scan/basket', icon: Search, color: 'text-[#BC00FF]' },
    { id: 'admin', name: 'Admin Section Leak', endpoint: '/scan/admin', icon: Eye, color: 'text-red-400' },
    { id: 'captcha', name: 'CAPTCHA Logic Bypass', endpoint: '/scan/captcha', icon: Zap, color: 'text-amber-400' },
    { id: 'feedback', name: 'Bot Spam Anti-Automation', endpoint: '/scan/feedback', icon: Terminal, color: 'text-emerald-400' },
    { id: 'language', name: 'Hidden Klingon i18n', endpoint: '/scan/language', icon: Globe, color: 'text-cyan-400' },
    { id: 'bwapp', name: 'bWAPP Security Suite', endpoint: '/scan/bwapp', icon: Database, color: 'text-purple-400' },
    { id: 'dvwa', name: 'DVWA Audit Suite', endpoint: '/scan/dvwa', icon: ShieldAlert, color: 'text-rose-400' },
    { id: 'webgoat', name: 'OWASP WebGoat Inspector', endpoint: '/scan/webgoat', icon: Cpu, color: 'text-indigo-400' },
  ];

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-10">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#ffffff15] pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white tracking-tight flex items-center gap-3">
            <span>Security Scanner Dashboard</span>
            <span className="bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/40 text-xs font-mono-tag px-2.5 py-0.5 rounded-full">
              LIVE ENGINE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#bbc9cf] font-mono-tag">
            Execute real vulnerability audits against OWASP Juice Shop or your target host.
          </p>
        </div>

        <button
          onClick={runFullAudit}
          disabled={activeScan !== null}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00D1FF] via-[#0099ff] to-[#BC00FF] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,209,255,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          {activeScan === 'Full Audit' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Auditing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-black" />
              <span>Run Full Security Audit</span>
            </>
          )}
        </button>
      </div>

      {/* TARGET CONFIGURATION CARD & DOCKER AUTO LAUNCHER */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ffffff15] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#00D1FF]" />
            <h2 className="font-heading font-bold text-sm text-white">Target Profile & Docker Auto-Launcher</h2>
          </div>

          {/* Docker Auto-Launch Trigger */}
          <button
            onClick={autoLaunchDockerContainer}
            disabled={dockerLaunching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1c1b1b] hover:bg-[#00D1FF] hover:text-black border border-[#ffffff20] text-xs font-mono-tag font-bold text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            {dockerLaunching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Launching in Docker...</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-[#00D1FF]" />
                <span>Auto-Launch in Docker</span>
              </>
            )}
          </button>
        </div>

        {dockerStatusMsg && (
          <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#00D1FF]/30 text-xs font-mono-tag text-[#00D1FF] flex items-center justify-between">
            <span>{dockerStatusMsg}</span>
            <button onClick={() => setDockerStatusMsg('')} className="hover:text-white">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-tag text-xs">
          
          {/* Target Profile Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[#bbc9cf] font-bold">Preset Target Profile</label>
            <select
              value={selectedProfile}
              onChange={(e) => handleProfileSelect(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#ffffff20] focus:border-[#00D1FF] rounded-xl px-3 py-2.5 text-white outline-none cursor-pointer"
            >
              <option value="juiceshop">🛒 OWASP Juice Shop (Port 3000)</option>
              <option value="bwapp">🐝 bWAPP Buggy Web App (Port 8080)</option>
              <option value="dvwa">🛡️ DVWA Web App (Port 8081)</option>
              <option value="webgoat">🐐 OWASP WebGoat (Port 8082)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#bbc9cf]">Target Host URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="http://localhost:3000"
              className="w-full bg-[#0A0A0A] border border-[#ffffff20] focus:border-[#00D1FF] rounded-xl px-3 py-2.5 text-white outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#bbc9cf]">Target Email / User</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@juice-sh.op"
              className="w-full bg-[#0A0A0A] border border-[#ffffff20] focus:border-[#00D1FF] rounded-xl px-3 py-2.5 text-white outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#bbc9cf]">Target Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              className="w-full bg-[#0A0A0A] border border-[#ffffff20] focus:border-[#00D1FF] rounded-xl px-3 py-2.5 text-white outline-none transition-colors"
            />
          </div>

        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono-tag flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="hover:text-white">Dismiss</button>
        </div>
      )}

      {/* SCANNING MODULES SUITE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const IconComp = mod.icon;
          const isScanningThis = activeScan === mod.name;

          return (
            <div
              key={mod.id}
              className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#ffffff30] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-[#1c1b1b] ${mod.color}`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono-tag text-[#71717A]">READY</span>
              </div>

              <div>
                <h3 className="font-heading font-bold text-sm text-white">{mod.name}</h3>
                <p className="text-[11px] text-[#bbc9cf] font-mono-tag">Endpoint: {mod.endpoint}</p>
              </div>

              <button
                onClick={() => runSingleScan(mod.endpoint, mod.name)}
                disabled={activeScan !== null}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#1c1b1b] hover:bg-[#00D1FF] hover:text-black border border-[#ffffff15] text-xs font-mono-tag font-bold text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                {isScanningThis ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Test Module</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* SCAN RESULTS DISPLAY & DIAGNOSTIC CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Detailed Results Output */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#ffffff15] pb-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00D1FF]" />
              <span>Audit Diagnostic Output</span>
            </h3>
            {scanResults && (
              <span className="text-xs font-mono-tag text-[#bbc9cf]">
                Timestamp: {scanResults.timestamp || 'Just now'}
              </span>
            )}
          </div>

          {!scanResults ? (
            <div className="py-16 text-center space-y-3">
              <Terminal className="w-10 h-10 text-[#71717A] mx-auto opacity-50" />
              <p className="text-sm text-[#71717A] font-mono-tag">
                No active scan performed yet. Click "Run Full Security Audit" or test individual modules above.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Overall Vulnerability Status Header & AI Button */}
              <div
                className={`p-4 rounded-xl border font-mono-tag flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  scanResults.vulnerable || scanResults.total_vulnerabilities > 0
                    ? 'bg-red-500/10 border-red-500/40 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {scanResults.vulnerable || scanResults.total_vulnerabilities > 0 ? (
                    <ShieldAlert className="w-6 h-6 shrink-0 text-red-400" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-400" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {scanResults.vulnerable || scanResults.total_vulnerabilities > 0
                        ? 'VULNERABILITY DETECTED'
                        : 'SYSTEM PASSED ALL AUDIT CHECKS'}
                    </h4>
                    <p className="text-xs opacity-80">Target Host: {scanResults.target}</p>
                  </div>
                </div>

                <button
                  onClick={runAiAnalysis}
                  disabled={aiLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#BC00FF] to-[#00D1FF] text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(188,0,255,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Llama 3.2 Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>Analyze with Llama 3.2</span>
                    </>
                  )}
                </button>
              </div>

              {/* Llama 3.2 AI Analysis Response Card */}
              {aiReport && (
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#BC00FF]/40 space-y-3 font-mono-tag text-xs">
                  <div className="flex items-center justify-between border-b border-[#BC00FF]/20 pb-2">
                    <div className="flex items-center gap-2 text-[#BC00FF] font-bold">
                      <Cpu className="w-4 h-4" />
                      <span>Local AI Insights ({aiReport.model || 'llama3.2:latest'})</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      OLLAMA ACTIVE
                    </span>
                  </div>

                  {aiReport.status === 'success' ? (
                    <div className="text-[#e5e2e1] space-y-2 leading-relaxed whitespace-pre-wrap">
                      {aiReport.analysis}
                    </div>
                  ) : (
                    <div className="text-amber-400 space-y-1">
                      <p className="font-bold">Ollama Status: {aiReport.message}</p>
                      <p className="text-[11px] text-[#71717A]">
                        Run <code className="bg-[#1c1b1b] px-1 py-0.5 rounded text-[#00D1FF]">ollama run llama3.2</code> in your terminal to start Ollama's local LLM server on port 11434.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Test Results List */}
              {scanResults.results && (
                <div className="space-y-3 font-mono-tag text-xs">
                  <h4 className="text-[#bbc9cf] font-bold uppercase tracking-wider">Test Findings Breakdown:</h4>
                  {scanResults.results.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#ffffff15] flex items-start gap-3"
                    >
                      {item.status === 'vulnerable' ? (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      ) : item.status === 'pass' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{item.test}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              item.status === 'vulnerable'
                                ? 'bg-red-500/20 text-red-400'
                                : item.status === 'pass'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[#bbc9cf] text-[11px] leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Batch Audit Scans Object view */}
              {scanResults.scans && (
                <div className="space-y-4 font-mono-tag text-xs">
                  <h4 className="text-[#bbc9cf] font-bold uppercase tracking-wider">Batch Audit Suite Scans:</h4>
                  {Object.entries(scanResults.scans).map(([key, val]) => (
                    <div key={key} className="p-4 rounded-xl bg-[#0A0A0A] border border-[#ffffff15] space-y-2">
                      <div className="flex items-center justify-between border-b border-[#ffffff10] pb-2">
                        <span className="font-bold uppercase text-[#00D1FF]">{key} Scan Suite</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            val.vulnerable ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {val.vulnerable ? 'VULNERABLE' : 'SECURE'}
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        {val.results && val.results.map((r, rIdx) => (
                          <div key={rIdx} className="text-[#bbc9cf] flex items-center gap-2">
                            <span>• {r.test}:</span>
                            <span className={r.status === 'vulnerable' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                              {r.detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Right: History Log */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-white border-b border-[#ffffff15] pb-3">
              Scan Execution Log History
            </h3>

            {scanHistory.length === 0 ? (
              <p className="text-xs text-[#71717A] font-mono-tag">No history logged in this session.</p>
            ) : (
              <div className="space-y-2.5 font-mono-tag text-xs max-h-96 overflow-y-auto">
                {scanHistory.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setScanResults(item.data)}
                    className="p-3 rounded-xl bg-[#0A0A0A] border border-[#ffffff15] hover:border-[#00D1FF]/40 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{item.name}</span>
                      <span className="text-[10px] text-[#71717A]">{item.time}</span>
                    </div>
                    <p className="text-[10px] text-[#bbc9cf]">
                      Result:{' '}
                      <span
                        className={
                          item.data.vulnerable || item.data.total_vulnerabilities > 0
                            ? 'text-red-400 font-bold'
                            : 'text-emerald-400 font-bold'
                        }
                      >
                        {item.data.vulnerable || item.data.total_vulnerabilities > 0
                          ? 'Vulnerable'
                          : 'Passed'}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
