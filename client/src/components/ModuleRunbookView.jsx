import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Code2, 
  FileCode, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Compass, 
  MessageSquare, 
  Copy, 
  Check, 
  ChevronRight, 
  CheckCircle2, 
  Loader2,
  Cpu,
  Database,
  Terminal,
  Zap
} from 'lucide-react';

export default function ModuleRunbookView({ repoId, repoOverview, onOpenFileInMonaco, onSwitchToChat, onSwitchToWhereToImplement }) {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    fetchModuleRunbooks();
  }, [repoId]);

  const fetchModuleRunbooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/repository/${repoId}/module-runbooks`);
      const data = await res.json();
      if (res.ok && data.modules && data.modules.length > 0) {
        setModules(data.modules);
        setSelectedModule(data.modules[0]);
      } else {
        setModules([]);
        setSelectedModule(null);
      }
    } catch (err) {
      console.error('Failed to load module runbooks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code, key) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        <Loader2 size={36} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Synthesizing module runbooks and architectural flowcharts...</p>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Layers size={36} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '0.5rem' }}>
          No Isolated Modules Detected
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
          This repository may be a micro-utility or flat structure without tiered controllers. You can use the Project Overview or Conversational QA tabs to query symbols.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* View Header */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Cpu size={20} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
              Architectural Deep Dives & Execution Flowcharts
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Explore the multi-tier architecture, request-to-database execution lifecycles, and senior-engineer improvements for every module.
            </p>
          </div>
        </div>

        {/* Module Pill Selector */}
        <div className="module-pill-selector" style={{ marginTop: '1.25rem' }}>
          {modules.map(mod => (
            <button
              key={mod.id}
              className={`module-selector-btn ${selectedModule?.id === mod.id ? 'active' : ''}`}
              onClick={() => setSelectedModule(mod)}
            >
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: mod.color || 'var(--primary)'
              }} />
              <span>{mod.name}</span>
              <span style={{
                fontSize: '0.68rem',
                opacity: 0.8,
                background: 'rgba(255,255,255,0.08)',
                padding: '0.1rem 0.35rem',
                borderRadius: '3px'
              }}>
                {mod.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedModule && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Module Summary Banner */}
          <div className="glass-card" style={{ borderLeft: `5px solid ${selectedModule.color || 'var(--primary)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="brand-badge" style={{ background: 'rgba(255,255,255,0.08)', color: selectedModule.color || '#38bdf8' }}>
                    {selectedModule.badge}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                    {selectedModule.name} Module
                  </h3>
                </div>
                <p style={{ marginTop: '0.65rem', fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.55, maxWidth: '900px' }}>
                  {selectedModule.responsibility}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => onSwitchToWhereToImplement(`Add a controller to ${selectedModule.name}`)}
                >
                  <Compass size={14} />
                  Where to Add Controller
                </button>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onSwitchToChat(`Explain the ${selectedModule.name} module in detail`)}
                >
                  <MessageSquare size={14} />
                  Ask in Chat
                </button>
              </div>
            </div>
          </div>

          {/* 6-Layer Architecture Stack Grid */}
          <div className="glass-card">
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Multi-Tier Component Map (Click file to open in Monaco)
            </h4>

            <div className="tier-stack-grid">
              {/* 1. Controller Layer */}
              <div className="tier-card" style={{ borderTop: '3px solid #6366f1' }}>
                <div className="tier-label">
                  <span style={{ color: '#a5b4fc' }}>1. Controller / API Layer</span>
                  <span style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.68rem', color: '#fff' }}>
                    {selectedModule.layers.controller.endpointCount} Endpoints
                  </span>
                </div>
                <div className="tier-filename">{selectedModule.layers.controller.file}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Class: <strong>{selectedModule.layers.controller.className}</strong>
                </div>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onOpenFileInMonaco(selectedModule.layers.controller.file, 1)}
                  style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                >
                  <ExternalLink size={11} /> Open in Monaco
                </button>
              </div>

              {/* 2. DTO / Validation Layer */}
              <div className="tier-card" style={{ borderTop: '3px solid #8b5cf6' }}>
                <div className="tier-label">
                  <span style={{ color: '#c084fc' }}>2. DTO / Schema Layer</span>
                  <span style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.68rem', color: '#fff' }}>
                    Validation
                  </span>
                </div>
                <div className="tier-filename">{selectedModule.layers.dto.file}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Class: <strong>{selectedModule.layers.dto.className}</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  {selectedModule.layers.dto.validations?.slice(0, 2).join(', ')}
                </div>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onOpenFileInMonaco(selectedModule.layers.dto.file, 1)}
                  style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                >
                  <ExternalLink size={11} /> Open in Monaco
                </button>
              </div>

              {/* 3. Business Service Layer */}
              <div className="tier-card" style={{ borderTop: '3px solid #06b6d4' }}>
                <div className="tier-label">
                  <span style={{ color: '#67e8f9' }}>3. Business Service Layer</span>
                  <span style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.68rem', color: '#fff' }}>
                    Domain
                  </span>
                </div>
                <div className="tier-filename">{selectedModule.layers.service.file}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Class: <strong>{selectedModule.layers.service.className}</strong>
                </div>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onOpenFileInMonaco(selectedModule.layers.service.file, 1)}
                  style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                >
                  <ExternalLink size={11} /> Open in Monaco
                </button>
              </div>

              {/* 4. Repository / DAO Layer */}
              <div className="tier-card" style={{ borderTop: '3px solid #10b981' }}>
                <div className="tier-label">
                  <span style={{ color: '#6ee7b7' }}>4. Repository / DAO</span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.68rem', color: '#fff' }}>
                    Data Access
                  </span>
                </div>
                <div className="tier-filename">{selectedModule.layers.repository.file}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Interface: <strong>{selectedModule.layers.repository.className}</strong>
                </div>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onOpenFileInMonaco(selectedModule.layers.repository.file, 1)}
                  style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                >
                  <ExternalLink size={11} /> Open in Monaco
                </button>
              </div>

              {/* 5. Database Entity Layer */}
              <div className="tier-card" style={{ borderTop: '3px solid #f59e0b' }}>
                <div className="tier-label">
                  <span style={{ color: '#fde68a' }}>5. Entity / Schema</span>
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.68rem', color: '#fff' }}>
                    Table: {selectedModule.layers.entity.table}
                  </span>
                </div>
                <div className="tier-filename">{selectedModule.layers.entity.file}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Entity: <strong>{selectedModule.layers.entity.entityName}</strong>
                </div>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onOpenFileInMonaco(selectedModule.layers.entity.file, 1)}
                  style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                >
                  <ExternalLink size={11} /> Open in Monaco
                </button>
              </div>

              {/* 6. Frontend UI Component Layer */}
              <div className="tier-card" style={{ borderTop: '3px solid #ec4899' }}>
                <div className="tier-label">
                  <span style={{ color: '#f472b6' }}>6. Frontend Client UI</span>
                  <span style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '0.1rem 0.35rem', borderRadius: '3px', fontSize: '0.68rem', color: '#fff' }}>
                    React / SPA
                  </span>
                </div>
                <div className="tier-filename">{selectedModule.layers.frontend.file}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Component: <strong>{selectedModule.layers.frontend.componentName}</strong>
                </div>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onOpenFileInMonaco(selectedModule.layers.frontend.file, 1)}
                  style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                >
                  <ExternalLink size={11} /> Open in Monaco
                </button>
              </div>
            </div>
          </div>

          {/* End-to-End Request Execution Trace */}
          <div className="glass-card">
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              End-to-End Request Execution Trace (Browser Click to Database Row)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {selectedModule.requestFlow.map((step, idx) => (
                <div key={idx} className="flow-step-node">
                  <span style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: selectedModule.color || 'var(--primary)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ lineHeight: 1.45 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wiring Blueprint & Drop-in Boilerplate */}
          {selectedModule.wiringGuide && (
            <div className="wiring-banner">
              <div className="wiring-header">
                <span className="wiring-badge">
                  <Sparkles size={12} />
                  WHERE CAN I ADD A CONTROLLER TO THIS MODULE?
                </span>
                <button
                  className={`code-copy-btn ${copiedKey === `wire-${selectedModule.id}` ? 'copied' : ''}`}
                  onClick={() => handleCopyCode(selectedModule.wiringGuide, `wire-${selectedModule.id}`)}
                >
                  <Code2 size={12} />
                  {copiedKey === `wire-${selectedModule.id}` ? 'Copied Instructions!' : 'Copy Instructions'}
                </button>
              </div>

              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#38bdf8', marginBottom: '0.65rem' }}>
                It can be done right here in this component by doing this:
              </div>

              <div className="wiring-steps">
                {selectedModule.wiringGuide
                  .replace('It can be done right here in this component by doing this:\n', '')
                  .split('\n')
                  .filter(l => l.trim().length > 0)
                  .map((stepText, sIdx) => (
                    <div key={sIdx} className="wiring-step-item">
                      <span className="wiring-step-num">{sIdx + 1}</span>
                      <span style={{ whiteSpace: 'pre-wrap' }}>
                        {stepText.replace(/^[0-9]+\.\s*/, '')}
                      </span>
                    </div>
                  ))}
              </div>

              {selectedModule.boilerplateCode && (
                <div className="code-block-card" style={{ marginTop: '1.25rem' }}>
                  <div className="code-block-header">
                    <span className="code-block-lang">
                      <Code2 size={13} color="var(--primary)" />
                      DROP-IN BOILERPLATE CODE
                    </span>
                    <button
                      className={`code-copy-btn ${copiedKey === `code-${selectedModule.id}` ? 'copied' : ''}`}
                      onClick={() => handleCopyCode(selectedModule.boilerplateCode, `code-${selectedModule.id}`)}
                    >
                      {copiedKey === `code-${selectedModule.id}` ? 'Copied to Clipboard!' : 'Copy Boilerplate Code'}
                    </button>
                  </div>
                  <pre className="code-block-body">
                    <code>{selectedModule.boilerplateCode}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Senior Engineer Improvement Roadmap */}
          {selectedModule.improvements && selectedModule.improvements.length > 0 && (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Zap size={18} color="var(--accent-amber)" />
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                  Senior Engineer Improvement Roadmap for {selectedModule.name}
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {selectedModule.improvements.map((imp, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.15rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '3px',
                          background: imp.type === 'SECURITY' ? 'rgba(239, 68, 68, 0.2)' :
                                      imp.type === 'PERFORMANCE' ? 'rgba(16, 185, 129, 0.2)' :
                                      imp.type === 'TESTING' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                          color: imp.type === 'SECURITY' ? '#f87171' :
                                 imp.type === 'PERFORMANCE' ? '#34d399' :
                                 imp.type === 'TESTING' ? '#c084fc' : '#a5b4fc',
                          textTransform: 'uppercase'
                        }}>
                          {imp.type}
                        </span>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{imp.title}</strong>
                      </div>

                      <button
                        className={`code-copy-btn ${copiedKey === `imp-${idx}` ? 'copied' : ''}`}
                        onClick={() => handleCopyCode(imp.code, `imp-${idx}`)}
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                      >
                        {copiedKey === `imp-${idx}` ? 'Copied Code!' : 'Copy Code Snippet'}
                      </button>
                    </div>

                    <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {imp.description}
                    </p>

                    {imp.code && (
                      <pre style={{
                        background: '#090d16',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.75rem 1rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        color: '#93c5fd',
                        overflowX: 'auto',
                        margin: 0
                      }}>
                        <code>{imp.code}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
