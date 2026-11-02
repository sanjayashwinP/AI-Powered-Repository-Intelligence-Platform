import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderGit2, 
  UploadCloud, 
  ChevronDown, 
  Palette, 
  HelpCircle, 
  Check, 
  Trash2,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  repositories, 
  selectedRepo, 
  onSelectRepo, 
  onOpenUploadModal,
  onOpenGuideModal,
  currentTheme,
  onThemeChange,
  onDeleteRepo
}) {
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  const themes = [
    {
      id: 'aurora',
      name: 'Aurora Emerald',
      tag: 'Cyber Matrix (Default)',
      gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
      primary: '#10b981'
    },
    {
      id: 'nebula',
      name: 'Nebula Violet',
      tag: 'Deep Cosmic Orchid',
      gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
      primary: '#a855f7'
    },
    {
      id: 'sunset',
      name: 'Tokyo Sunset',
      tag: 'Solar Flare Amber',
      gradient: 'linear-gradient(135deg, #f97316, #fbbf24)',
      primary: '#f97316'
    },
    {
      id: 'frost',
      name: 'Nordic Frost',
      tag: 'Glacial Arctic Cyan',
      gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)',
      primary: '#0284c7'
    },
    {
      id: 'titanium',
      name: 'Titanium Gold',
      tag: 'Stealth Champagne',
      gradient: 'linear-gradient(135deg, #eab308, #f59e0b)',
      primary: '#eab308'
    }
  ];

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setThemePopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeThemeObj = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">
          <FolderGit2 size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="brand-title">RepoMind</span>
            <span className="brand-badge">v2.4 Pro</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Repository Intelligence & Architecture Platform
          </div>
        </div>
      </div>

      <div className="nav-controls">
        {/* Repository Selector Dropdown with Delete for Custom Uploads */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <select 
              value={selectedRepo?.id || ''} 
              onChange={(e) => {
                const repo = repositories.find(r => r.id === e.target.value);
                if (repo) onSelectRepo(repo);
              }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-main)',
                padding: '0.55rem 2.2rem 0.55rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
                appearance: 'none',
                maxWidth: '320px',
                textOverflow: 'ellipsis',
                outline: 'none',
                transition: 'border-color 0.2s ease'
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

          {/* Delete Button for Non-Sample Custom Uploaded Repositories */}
          {selectedRepo && !selectedRepo.isSample && onDeleteRepo && (
            <button
              onClick={() => onDeleteRepo(selectedRepo.id, selectedRepo.name)}
              title="Delete this uploaded repository"
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#fb7185',
                padding: '0.55rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Upload Repository CTA */}
        <button className="btn-primary" onClick={onOpenUploadModal}>
          <UploadCloud size={17} />
          Upload / Import Project
        </button>

        {/* Theme Switcher Button & Dropdown */}
        <div style={{ position: 'relative' }} ref={popoverRef}>
          <button 
            className="btn-secondary" 
            onClick={() => setThemePopoverOpen(!themePopoverOpen)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.55rem 0.9rem',
              fontSize: '0.82rem'
            }}
            title="Change UI Color Palette and Theme"
          >
            <span 
              className="theme-swatch" 
              style={{ background: activeThemeObj.gradient }} 
            />
            <span style={{ fontWeight: 600 }}>Theme</span>
            <ChevronDown size={14} style={{ opacity: 0.7 }} />
          </button>

          {/* Theme Dropdown Popover */}
          {themePopoverOpen && (
            <div className="theme-popover">
              <div style={{ 
                padding: '0.4rem 0.6rem 0.6rem', 
                borderBottom: '1px solid var(--border-subtle)', 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Select Color Theme
              </div>
              {themes.map(t => {
                const isSelected = t.id === currentTheme;
                return (
                  <button
                    key={t.id}
                    className={`theme-option ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      onThemeChange(t.id);
                      setThemePopoverOpen(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span 
                        className="theme-swatch" 
                        style={{ background: t.gradient }} 
                      />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.tag}</div>
                      </div>
                    </div>
                    {isSelected && <Check size={16} style={{ color: 'var(--primary)' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Platform Tour & Help Guide CTA */}
        <button 
          className="btn-secondary"
          onClick={onOpenGuideModal}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem' }}
          title="Platform capabilities and guide"
        >
          <HelpCircle size={16} />
          <span>Guide</span>
        </button>

        {/* Real-time AST Engine Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.45rem 0.85rem', 
          background: 'var(--primary-badge-bg)',
          border: '1px solid var(--primary-badge-border)',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--primary-badge-text)'
        }}>
          <div className="pulse-indicator" />
          <span>AST Active</span>
        </div>
      </div>
    </header>
  );
}
