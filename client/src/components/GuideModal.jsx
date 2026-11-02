import React from 'react';
import { 
  X, 
  Layers, 
  Search, 
  Cpu, 
  MessageSquare, 
  Compass, 
  Wrench, 
  UploadCloud, 
  ShieldCheck, 
  Terminal, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  GitBranch,
  Rocket
} from 'lucide-react';

export default function GuideModal({ isOpen, onClose, onSelectTab }) {
  if (!isOpen) return null;

  const capabilities = [
    {
      tab: 'overview',
      icon: Layers,
      title: '15 Architectural Layers Inspector',
      badge: 'Static AST Engine',
      description: 'Scans the codebase across 15 distinct architectural tiers without making rigid framework assumptions. Inspect REST controllers, services, repositories, JPA/Prisma entities, validation DTOs, security chains, migrations, and CI/CD specs.'
    },
    {
      tab: 'features',
      icon: Search,
      title: 'Automatic Feature Discovery (4 Statuses)',
      badge: 'Code Verification',
      description: 'Classifies features into IMPLEMENTED, PARTIALLY IMPLEMENTED, NOT FOUND, and NEEDS VERIFICATION based on concrete source code evidence. Jump directly to source lines in Monaco with 1 click.'
    },
    {
      tab: 'modules',
      icon: Cpu,
      title: 'Deep Dives & Module Runbooks',
      badge: 'End-to-End Trace',
      description: 'Traces request journeys end-to-end (Client UI → Controller → Service → Repository → DB Table) with step-by-step wiring instructions, production security rules, and resilience improvements.'
    },
    {
      tab: 'chat',
      icon: MessageSquare,
      title: 'Conversational Intelligence Q&A',
      badge: 'Hybrid Retrieval',
      description: 'ChatGPT-style architectural assistant answering cross-module questions, data flow queries, and structural explanations with grounded, verifiable file and line citations.'
    },
    {
      tab: 'where-to-implement',
      icon: Compass,
      title: 'Where Should I Implement? Engine',
      badge: 'Architectural Advisor',
      description: 'Synthesizes step-by-step implementation blueprints for new features. Identifies existing files to modify and proposes new files with exact package conventions and starter boilerplate.'
    },
    {
      tab: 'recommendations',
      icon: Wrench,
      title: 'Code Health & Safe Patch Studio',
      badge: 'Monaco Diff & Rollback',
      description: 'Prioritized 12-point improvement reports across Security, Performance, and Clean Code. Inspect side-by-side Monaco Diffs, apply patches with automatic timestamped backups, and rollback with 1 click.'
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '960px', maxHeight: '90vh' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 15px var(--primary-glow)'
            }}>
              <Rocket size={22} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                RepoMind User Guide & Platform Capabilities
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Mastering AI-Powered Repository Intelligence, Architectural Discovery, and Safe Patching
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '6px'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Start Tip Box */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-badge-bg), rgba(255, 255, 255, 0.02))',
            border: '1px solid var(--primary-badge-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.2rem 1.4rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <Sparkles size={24} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.3rem' }}>
                Quick Start: 3 Preloaded Real-World Projects Ready to Explore
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                RepoMind comes preloaded with real-world stacks: <strong>Spring Boot 3 + React (Enterprise Hub)</strong>, <strong>Node.js + Prisma + Stripe (SaaS Platform)</strong>, and <strong>FastAPI + Celery + SQLAlchemy (AI Service)</strong>. You can switch projects using the dropdown in the top navbar, or click <strong>Upload / Import Project</strong> to inspect your own ZIP archives or GitHub repos.
              </p>
            </div>
          </div>

          {/* Grid of Core Capabilities */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.85rem' }}>
              6 Core Intelligence Modules
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1rem' }}>
              {capabilities.map((c) => {
                const Icon = c.icon;
                return (
                  <div 
                    key={c.tab}
                    className="tier-card"
                    style={{ 
                      padding: '1.1rem',
                      cursor: onSelectTab ? 'pointer' : 'default',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)'
                    }}
                    onClick={() => {
                      if (onSelectTab) {
                        onSelectTab(c.tab);
                        onClose();
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'var(--primary-badge-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)'
                        }}>
                          <Icon size={18} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                          {c.title}
                        </span>
                      </div>
                      <span className="brand-badge" style={{ fontSize: '0.68rem' }}>
                        {c.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {c.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deployment & Production Section */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <Terminal size={18} style={{ color: 'var(--secondary)' }} />
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                Instant Production Deployment
              </h4>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              RepoMind includes full turn-key deployment configurations:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff', marginBottom: '0.2rem' }}>
                  🐳 Docker & Docker Compose
                </div>
                <code style={{ fontSize: '0.74rem', color: 'var(--secondary)' }}>docker compose up --build -d</code>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff', marginBottom: '0.2rem' }}>
                  ☁️ Free Render Cloud Deployment
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Using root <code>render.yaml</code> blueprint</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff', marginBottom: '0.2rem' }}>
                  🚀 Railway / VPS Deploy
                </div>
                <code style={{ fontSize: '0.74rem', color: 'var(--secondary)' }}>npm run build && npm start</code>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-surface)'
        }}>
          <button className="btn-primary" onClick={onClose}>
            Got it, Let's Explore!
          </button>
        </div>
      </div>
    </div>
  );
}
