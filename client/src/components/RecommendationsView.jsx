import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  ShieldAlert, 
  TrendingUp, 
  TestTube, 
  Layers, 
  ExternalLink, 
  Code2, 
  Copy, 
  Check, 
  GitPullRequest, 
  Undo2, 
  CheckCircle2, 
  AlertCircle,
  FileDiff,
  Loader2,
  Download
} from 'lucide-react';
import { DiffEditor } from '@monaco-editor/react';

export default function RecommendationsView({ repoId, onOpenFileInMonaco }) {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRec, setSelectedRec] = useState(null);
  const [patchData, setPatchData] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [patchLoading, setPatchLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [repoId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/repository/${repoId}/recommendations`);
      const data = await res.json();
      if (res.ok) {
        setRecommendations(data.recommendations || []);
        if (data.recommendations?.length > 0) {
          selectRecommendation(data.recommendations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectRecommendation = async (rec) => {
    setSelectedRec(rec);
    setPatchLoading(true);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/repository/${repoId}/patch?recId=${rec.id}`);
      const data = await res.json();
      if (res.ok) {
        setPatchData(data.patch);
      } else {
        setPatchData(null);
      }
    } catch (err) {
      setPatchData(null);
    } finally {
      setPatchLoading(false);
    }
  };

  const handleApplyPatch = async () => {
    if (!patchData || !selectedRec) return;
    if (!window.confirm(`Are you sure you want to apply the proposed patch to ${patchData.filePath}? A timestamped backup will be created automatically before making changes.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/repository/${repoId}/apply-patch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relPath: patchData.filePath,
          newContent: patchData.proposedCode
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ type: 'success', text: data.message });
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const handleRollback = async () => {
    if (!patchData) return;
    if (!window.confirm(`Revert ${patchData.filePath} to its previous backup state?`)) return;

    try {
      const res = await fetch(`/api/repository/${repoId}/rollback-patch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relPath: patchData.filePath })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ type: 'success', text: data.message });
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const handleDownloadPatch = () => {
    if (!patchData || !selectedRec) return;
    const patchContent = `# RepoMind Safe Patch\n# Target: ${patchData.filePath}\n# Title: [${selectedRec.priority}] ${selectedRec.title}\n# Created: ${new Date().toISOString()}\n\n${patchData.diffUnified || patchData.proposedCode}`;
    const blob = new Blob([patchContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedRec.id}-patch.diff`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRecs = recommendations.filter(r => 
    priorityFilter === 'ALL' || r.priority.toUpperCase() === priorityFilter.toUpperCase()
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Left Column: Recommendations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Recommendations ({recommendations.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Static AST Verified
            </span>
          </div>

          {/* Priority Filter */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(p => (
              <button
                key={p}
                className={`chip ${priorityFilter === p ? 'active' : ''}`}
                onClick={() => setPriorityFilter(p)}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* List of Recommendation Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 'calc(100vh - 270px)', overflowY: 'auto' }}>
          {filteredRecs.map(rec => {
            const isSelected = selectedRec?.id === rec.id;
            const priorityColors = {
              Critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' },
              High: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' },
              Medium: { bg: 'rgba(99, 102, 241, 0.15)', text: '#a5b4fc', border: 'rgba(99, 102, 241, 0.4)' },
              Low: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' }
            };
            const pStyle = priorityColors[rec.priority] || priorityColors.Medium;

            return (
              <div
                key={rec.id}
                onClick={() => selectRecommendation(rec)}
                style={{
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{
                    background: pStyle.bg,
                    color: pStyle.text,
                    border: `1px solid ${pStyle.border}`,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {rec.priority}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {rec.category}
                  </span>
                </div>

                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>
                  {rec.title}
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.45rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {rec.filePath} (Line {rec.relevantLines})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Complete 12-Point Dossier & Monaco Diff Studio */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {selectedRec ? (
          <>
            {/* 12-Point Analysis Dossier Card */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      RECOMMENDATION DOSSIER
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Category: {selectedRec.category} • Priority: {selectedRec.priority}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: '0.4rem' }}>
                    {selectedRec.title}
                  </h2>
                </div>

                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => onOpenFileInMonaco(selectedRec.filePath, selectedRec.relevantLines)}
                >
                  <ExternalLink size={13} />
                  View Original File in Monaco
                </button>
              </div>

              {/* 12 Attributes Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                    2. CURRENT IMPLEMENTATION:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{selectedRec.currentImplementation}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '0.2rem' }}>
                    3. IDENTIFIED PROBLEM / LIMITATION:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#fca5a5' }}>{selectedRec.identifiedProblem}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.2rem' }}>
                    4. WHY NECESSARY:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#86efac' }}>{selectedRec.whyNecessary}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>
                    8. WHAT CHANGES SHOULD BE MADE:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{selectedRec.whatChangesShouldBeMade}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.2rem' }}>
                    9. SUGGESTED APPROACH:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{selectedRec.suggestedApproach}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                    11. TESTS REQUIRED AFTER MODIFICATION:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{selectedRec.testsRequired}</div>
                </div>
              </div>
            </div>

            {/* Monaco Diff Studio & Patch View */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileDiff size={20} color="var(--primary)" />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                    Code Improvement & Unified Diff Studio
                  </h3>
                </div>

                {patchData && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(patchData.proposedCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                      {copied ? 'Copied' : 'Copy Proposed Code'}
                    </button>

                    <button 
                      className="btn-secondary btn-sm"
                      onClick={handleRollback}
                      title="Rollback to previous backup state"
                    >
                      <Undo2 size={13} />
                      Rollback
                    </button>

                    <button 
                      className="btn-secondary btn-sm"
                      onClick={handleDownloadPatch}
                      title="Download proposed diff as .patch file for git apply"
                    >
                      <Download size={13} />
                      Download .patch
                    </button>

                    <button 
                      className="btn-primary btn-sm"
                      onClick={handleApplyPatch}
                    >
                      <GitPullRequest size={13} />
                      Apply Patch Safely (with Backup)
                    </button>
                  </div>
                )}
              </div>

              {actionMsg && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  background: actionMsg.type === 'success' ? 'var(--status-implemented-bg)' : 'var(--status-notfound-bg)',
                  border: actionMsg.type === 'success' ? '1px solid var(--status-implemented-border)' : '1px solid var(--status-notfound-border)',
                  color: actionMsg.type === 'success' ? 'var(--status-implemented-text)' : 'var(--status-notfound-text)'
                }}>
                  {actionMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{actionMsg.text}</span>
                </div>
              )}

              {/* Diff Editor */}
              {patchLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                  <p>Synthesizing unified patch...</p>
                </div>
              ) : patchData ? (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <strong>Target File:</strong> <code>{patchData.filePath}</code> • {patchData.explanation}
                  </div>

                  <div style={{ height: '360px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <DiffEditor
                      height="100%"
                      original={patchData.originalCode}
                      modified={patchData.proposedCode}
                      language={patchData.filePath.endsWith('.yml') ? 'yaml' : patchData.filePath.endsWith('.sql') ? 'sql' : 'java'}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', Consolas, monospace",
                        renderSideBySide: true,
                        automaticLayout: true
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  Select a recommendation to inspect its proposed patch and unified diff.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select an improvement recommendation from the left pane to view its full dossier and proposed diff patch.
          </div>
        )}
      </div>
    </div>
  );
}
