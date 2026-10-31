import React from 'react';
import { 
  FolderGit2, 
  UploadCloud, 
  Sparkles, 
  ChevronDown, 
  Layers, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function Navbar({ 
  repositories, 
  selectedRepo, 
  onSelectRepo, 
  onOpenUploadModal 
}) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">
          <FolderGit2 size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="brand-title">RepoMind</span>
            <span className="brand-badge">v2.4</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Repository Intelligence & Architecture Platform
          </div>
        </div>
      </div>

      <div className="nav-controls">
        {/* Repository Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <select 
            value={selectedRepo?.id || ''} 
            onChange={(e) => {
              const repo = repositories.find(r => r.id === e.target.value);
              if (repo) onSelectRepo(repo);
            }}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              padding: '0.55rem 2.2rem 0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              cursor: 'pointer',
              appearance: 'none',
              maxWidth: '360px',
              textOverflow: 'ellipsis',
              outline: 'none'
            }}
          >
            {repositories.map(r => (
              <option key={r.id} value={r.id}>
                {r.isSample ? `★ [Sample] ${r.name}` : `📁 ${r.name}`}
              </option>
            ))}
          </select>
          <ChevronDown 
            size={16} 
            style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              pointerEvents: 'none',
              color: 'var(--text-muted)'
            }} 
          />
        </div>

        {/* Upload Repository CTA */}
        <button className="btn-primary" onClick={onOpenUploadModal}>
          <UploadCloud size={17} />
          Upload / Import Project
        </button>

        {/* Real-time AST Engine Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.45rem 0.85rem', 
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#34d399'
        }}>
          <div className="pulse-indicator" />
          <span>AST Index Active</span>
        </div>
      </div>
    </header>
  );
}
