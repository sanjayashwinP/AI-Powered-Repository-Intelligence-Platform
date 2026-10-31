import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Search, 
  ExternalLink, 
  Code2, 
  Layers, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  FileCode
} from 'lucide-react';

export default function FeatureDiscoveryView({ featureInventory, onOpenFileInMonaco }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFeatures, setExpandedFeatures] = useState(new Set());

  if (!featureInventory || !featureInventory.features) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading feature inventory...</p>
      </div>
    );
  }

  const { stats, features } = featureInventory;

  const toggleExpand = (id) => {
    const next = new Set(expandedFeatures);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFeatures(next);
  };

  const categories = ['ALL', 'Authentication', 'Backend', 'Frontend', 'Database', 'Additional'];
  const statuses = ['ALL', 'IMPLEMENTED', 'PARTIALLY IMPLEMENTED', 'NOT FOUND', 'NEEDS VERIFICATION'];

  const filteredFeatures = features.filter(f => {
    const matchesCat = selectedCategory === 'ALL' || f.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus = selectedStatus === 'ALL' || f.status === selectedStatus;
    const matchesQuery = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.relevantFiles && f.relevantFiles.some(file => file.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesStatus && matchesQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Metrics Banner */}
      <div className="stats-banner">
        {/* Total Features */}
        <div 
          className="stat-card" 
          onClick={() => setSelectedStatus('ALL')}
          style={{ cursor: 'pointer', border: selectedStatus === 'ALL' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)' }}
        >
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-label">Total Discovered</div>
          </div>
        </div>

        {/* Implemented */}
        <div 
          className="stat-card" 
          onClick={() => setSelectedStatus('IMPLEMENTED')}
          style={{ cursor: 'pointer', border: selectedStatus === 'IMPLEMENTED' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)' }}
        >
          <div className="stat-icon" style={{ background: 'var(--status-implemented-bg)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: 'var(--status-implemented-text)' }}>{stats.implemented}</div>
            <div className="stat-label">Implemented</div>
          </div>
        </div>

        {/* Partially Implemented */}
        <div 
          className="stat-card" 
          onClick={() => setSelectedStatus('PARTIALLY IMPLEMENTED')}
          style={{ cursor: 'pointer', border: selectedStatus === 'PARTIALLY IMPLEMENTED' ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)' }}
        >
          <div className="stat-icon" style={{ background: 'var(--status-partial-bg)', color: 'var(--accent-amber)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: 'var(--status-partial-text)' }}>{stats.partiallyImplemented}</div>
            <div className="stat-label">Partially Built</div>
          </div>
        </div>

        {/* Not Found */}
        <div 
          className="stat-card" 
          onClick={() => setSelectedStatus('NOT FOUND')}
          style={{ cursor: 'pointer', border: selectedStatus === 'NOT FOUND' ? '1px solid var(--accent-rose)' : '1px solid var(--border-subtle)' }}
        >
          <div className="stat-icon" style={{ background: 'var(--status-notfound-bg)', color: 'var(--accent-rose)' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: 'var(--status-notfound-text)' }}>{stats.notFound}</div>
            <div className="stat-label">Not Found</div>
          </div>
        </div>

        {/* Needs Verification */}
        <div 
          className="stat-card" 
          onClick={() => setSelectedStatus('NEEDS VERIFICATION')}
          style={{ cursor: 'pointer', border: selectedStatus === 'NEEDS VERIFICATION' ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)' }}
        >
          <div className="stat-icon" style={{ background: 'var(--status-verify-bg)', color: 'var(--accent-purple)' }}>
            <HelpCircle size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: 'var(--status-verify-text)' }}>{stats.needsVerification}</div>
            <div className="stat-label">Verification Req.</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Category Chips */}
          <div className="chip-group">
            {categories.map(cat => (
              <button
                key={cat}
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="search-box" style={{ minWidth: '320px' }}>
            <Search size={16} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search features, classes, or files..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Status Pill Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Status Filter:
          </span>
          {statuses.map(s => {
            const isSelected = selectedStatus === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: isSelected ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                  borderRadius: '16px',
                  padding: '0.2rem 0.65rem',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Card Grid */}
      <div className="feature-grid">
        {filteredFeatures.map(feat => {
          const isExpanded = expandedFeatures.has(feat.id);

          const statusClass = 
            feat.status === 'IMPLEMENTED' ? 'status-implemented' :
            feat.status === 'PARTIALLY IMPLEMENTED' ? 'status-partial' :
            feat.status === 'NOT FOUND' ? 'status-notfound' : 'status-verify';

          const StatusIcon = 
            feat.status === 'IMPLEMENTED' ? CheckCircle2 :
            feat.status === 'PARTIALLY IMPLEMENTED' ? AlertTriangle :
            feat.status === 'NOT FOUND' ? XCircle : HelpCircle;

          return (
            <div key={feat.id} className="feature-card">
              <div className="feature-header">
                <div>
                  <h3 className="feature-title">{feat.name}</h3>
                  <div className="feature-category">{feat.category}</div>
                </div>
                <div className={`status-pill ${statusClass}`}>
                  <StatusIcon size={13} />
                  {feat.status}
                </div>
              </div>

              <p className="feature-desc">{feat.description}</p>

              {/* Evidence Code Box */}
              {feat.supportingEvidence && (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    color: 'var(--text-dim)', 
                    marginBottom: '0.3rem' 
                  }}>
                    <span>VERIFIED SOURCE EVIDENCE:</span>
                    {feat.lineNumbers && feat.lineNumbers !== 'N/A' && (
                      <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                        Lines {feat.lineNumbers}
                      </span>
                    )}
                  </div>
                  <div className="feature-evidence-box">
                    {feat.supportingEvidence}
                  </div>
                </div>
              )}

              {/* Missing Components (for PARTIALLY IMPLEMENTED or NOT FOUND) */}
              {feat.missingComponents && feat.missingComponents.length > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.85rem'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '0.25rem' }}>
                    MISSING IMPLEMENTATION COMPONENTS:
                  </div>
                  <ul style={{ paddingLeft: '1.1rem', fontSize: '0.78rem', color: '#fca5a5' }}>
                    {feat.missingComponents.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Relevant Files & Classes */}
              {feat.relevantFiles && feat.relevantFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                    RELEVANT FILES:
                  </div>
                  {feat.relevantFiles.map((file, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onOpenFileInMonaco(file, feat.lineNumbers)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#93c5fd',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '0.35rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                      title="Open file in Monaco Editor"
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file}
                      </span>
                      <ExternalLink size={12} style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Card Footer with Direct Monaco Button */}
              <div className="feature-footer">
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {feat.relevantClasses?.length > 0 ? feat.relevantClasses.join(', ') : 'Static Rule Grounded'}
                </span>

                {feat.relevantFiles && feat.relevantFiles.length > 0 && (
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => onOpenFileInMonaco(feat.relevantFiles[0], feat.lineNumbers)}
                  >
                    <Code2 size={13} />
                    Open in Monaco
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No features matched the selected filters.</p>
        </div>
      )}
    </div>
  );
}
