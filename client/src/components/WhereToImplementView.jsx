import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  FileEdit, 
  FilePlus, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Code2, 
  Search,
  Sparkles,
  Loader2,
  Download
} from 'lucide-react';

export default function WhereToImplementView({ repoId, onOpenFileInMonaco }) {
  const [featureQuery, setFeatureQuery] = useState('JWT Authentication');
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [copiedCode, setCopiedCode] = useState(false);

  const quickFeatures = [
    'Where can I add my Controller?',
    'Payment Controller',
    'Notification Controller',
    'JWT Authentication',
    'Email Verification',
    'Redis Caching',
    'Server-Side Pagination',
    'Stripe Payment Gateway'
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadBlueprint = () => {
    if (!blueprint) return;
    let md = `# Architecture Roadmap: ${blueprint.feature}\n\n`;
    md += `## Existing Architecture Context\n${blueprint.existingArchitecture}\n\n`;
    if (blueprint.wiringInstructions) {
      md += `## Wiring Guide\n${blueprint.wiringInstructions}\n\n`;
    }
    if (blueprint.existingFiles && blueprint.existingFiles.length) {
      md += `## Existing Files to Modify\n`;
      blueprint.existingFiles.forEach(f => {
        md += `- **${f.file}**: ${f.reason} (Target: \`${f.targetSymbol || 'N/A'}\`)\n`;
      });
      md += `\n`;
    }
    if (blueprint.newFiles && blueprint.newFiles.length) {
      md += `## New Files to Create\n`;
      blueprint.newFiles.forEach(f => {
        md += `### [NEW FILE] ${f.file} (${f.tier || ''})\n- Purpose: ${f.purpose}\n`;
        if (f.boilerplateCode) {
          md += `\`\`\`${f.language || ''}\n${f.boilerplateCode}\n\`\`\`\n`;
        }
      });
      md += `\n`;
    }
    if (blueprint.implementationSequence && blueprint.implementationSequence.length) {
      md += `## Step-by-Step Implementation Sequence\n`;
      blueprint.implementationSequence.forEach((s, idx) => {
        md += `${idx + 1}. **${s.step}**: ${s.details}\n`;
      });
      md += `\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-${blueprint.feature.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGeneratePlan = async (query) => {
    const feature = query || featureQuery;
    if (!feature || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/repository/${repoId}/plan-feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature })
      });
      const data = await res.json();
      if (res.ok) {
        setBlueprint(data.blueprint);
      } else {
        setError(data.error || 'Failed to generate implementation blueprint.');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Feature Selector */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Compass size={20} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
              Where Should I Implement a New Feature or Controller?
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Inspects existing package hierarchies, conventions, and design tiers to formulate an exact architectural roadmap.
            </p>
          </div>
        </div>

        {/* Quick Feature Chips */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Popular Queries:
          </span>
          {quickFeatures.map(feat => (
            <button
              key={feat}
              className={`chip ${featureQuery === feat ? 'active' : ''}`}
              onClick={() => {
                setFeatureQuery(feat);
                handleGeneratePlan(feat);
              }}
            >
              {feat}
            </button>
          ))}
        </div>

        {/* Custom Feature Query Input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleGeneratePlan(); }}
          style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}
        >
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={18} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="e.g. 'Where can I add my controller?', 'Add Payment Controller', 'Redis Caching'..."
              value={featureQuery}
              onChange={e => setFeatureQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !featureQuery.trim()}>
            {loading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            Generate Implementation Blueprint
          </button>
        </form>
      </div>

      {error && (
        <div className="glass-card" style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)', padding: '1rem' }}>
          {error}
        </div>
      )}

      {/* Blueprint Display */}
      {blueprint && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Blueprint Title & Architecture */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="brand-badge">
                  ARCHITECTURE ROADMAP
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Target Feature: <strong style={{ color: '#fff' }}>{blueprint.feature}</strong>
                </span>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                <strong>Existing Architecture Context:</strong> {blueprint.existingArchitecture}
              </div>
            </div>
            <button
              className="btn-secondary btn-sm"
              onClick={handleDownloadBlueprint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              title="Download Roadmap as Markdown"
            >
              <Download size={13} />
              <span>Export Blueprint (.md)</span>
            </button>
          </div>

          {/* Explicit Wiring Instructions Banner ("It can be done right here in this component by doing this:") */}
          {blueprint.wiringInstructions && (
            <div className="wiring-banner">
              <div className="wiring-header">
                <span className="wiring-badge">
                  <Sparkles size={12} />
                  EXACT PLACEMENT & WIRING INSTRUCTIONS
                </span>
                <button
                  className={`code-copy-btn ${copiedCode ? 'copied' : ''}`}
                  onClick={() => handleCopy(blueprint.wiringInstructions)}
                >
                  <Code2 size={12} />
                  {copiedCode ? 'Copied Instructions!' : 'Copy Instructions'}
                </button>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#38bdf8', marginBottom: '0.65rem' }}>
                It can be done right here in this component by doing this:
              </div>
              <div className="wiring-steps">
                {blueprint.wiringInstructions
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
            </div>
          )}

          {/* Ready-to-Drop Boilerplate Code Card */}
          {blueprint.boilerplateCode && (
            <div className="code-block-card">
              <div className="code-block-header">
                <span className="code-block-lang">
                  <Code2 size={13} color="var(--primary)" />
                  READY-TO-DROP BOILERPLATE IMPLEMENTATION
                </span>
                <button
                  className={`code-copy-btn ${copiedCode ? 'copied' : ''}`}
                  onClick={() => handleCopy(blueprint.boilerplateCode)}
                >
                  {copiedCode ? 'Copied to Clipboard!' : 'Copy Boilerplate Code'}
                </button>
              </div>
              <pre className="code-block-body">
                <code>{blueprint.boilerplateCode}</code>
              </pre>
            </div>
          )}

          {/* Side by Side: Existing Files to Modify vs New Files to Create */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Existing Files to Modify */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FileEdit size={18} color="var(--accent-amber)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  Existing Files That Should Be Modified ({blueprint.existingFilesToModify.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {blueprint.existingFilesToModify.map((f, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#fde68a' }}>
                        {f.file}
                      </span>
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => onOpenFileInMonaco(f.file, 1)}
                        style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem' }}
                      >
                        <ExternalLink size={11} />
                        View
                      </button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>Why Modify:</strong> {f.reason}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      <strong>Target Symbol:</strong> <code>{f.targetSymbol}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Files to Create */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FilePlus size={18} color="var(--accent-emerald)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  New Files That Should Be Created ({blueprint.newFilesToCreate.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {blueprint.newFilesToCreate.map((f, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{
                        background: 'var(--accent-emerald)',
                        color: '#000',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px'
                      }}>
                        NEW FILE
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#86efac' }}>
                        {f.file.replace('[NEW FILE] ', '')}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>Purpose:</strong> {f.purpose}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      <strong>Proposed Package:</strong> <code>{f.proposedPackage}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scope of Changes Across Layers */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Scope of Changes Across Layers
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                  BACKEND CHANGES
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{blueprint.backendChanges}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.25rem' }}>
                  FRONTEND CHANGES
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{blueprint.frontendChanges}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.25rem' }}>
                  DATABASE CHANGES
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{blueprint.databaseChanges}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '0.25rem' }}>
                  DEPENDENCIES REQUIRED
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{blueprint.dependenciesRequired.join(', ')}</div>
              </div>
            </div>
          </div>

          {/* Implementation Sequence & Testing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div className="glass-card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.85rem' }}>
                Implementation Sequence
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {blueprint.implementationSequence.map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    fontSize: '0.85rem',
                    color: '#e2e8f0',
                    lineHeight: 1.45
                  }}>
                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.85rem' }}>
                Required Verification Tests
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {blueprint.testingRequirements.map((test, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.82rem',
                    color: '#94a3b8'
                  }}>
                    {test}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
