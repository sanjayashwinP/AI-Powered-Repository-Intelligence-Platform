import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Database, 
  Shield, 
  Terminal, 
  FileText, 
  TestTube, 
  Server, 
  Code2, 
  Boxes, 
  Globe, 
  KeyRound, 
  Sliders, 
  GitFork, 
  ChevronRight, 
  ChevronDown,
  ExternalLink,
  BookOpen,
  Package
} from 'lucide-react';

export default function ProjectOverviewView({ repoOverview, onOpenFileInMonaco }) {
  const [activeLayer, setActiveLayer] = useState('restControllers');

  if (!repoOverview || !repoOverview.analysis) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading complete project analysis...</p>
      </div>
    );
  }

  const { analysis } = repoOverview;
  const { technologies, architecture, components, languageStats } = analysis;

  const totalLines = analysis.totalLines || 1;

  // 15 Architecture Sections
  const layerSections = [
    { id: 'restControllers', label: '3. REST API Controllers', count: components.restControllers.length, icon: Server },
    { id: 'serviceClasses', label: '4. Service Layer Classes', count: components.serviceClasses.length, icon: Cpu },
    { id: 'repositoryDaoClasses', label: '5. Repository & DAO Classes', count: components.repositoryDaoClasses.length, icon: Database },
    { id: 'databaseEntities', label: '6. Database Entities & Models', count: components.databaseEntities.length, icon: Boxes },
    { id: 'dtos', label: '7. DTOs & Validation Schemas', count: components.dtos.length, icon: FileText },
    { id: 'securityConfig', label: '8. Security Configuration', count: components.securityConfig.length, icon: Shield },
    { id: 'authAndAuthz', label: '9. Authentication & Authorization', count: Object.values(components.authAndAuthz).flat().length, icon: KeyRound },
    { id: 'frontendCode', label: '1. Frontend Source Code', count: components.frontendCode.length, icon: Globe },
    { id: 'backendCode', label: '2. Backend Source Code', count: components.backendCode.length, icon: Code2 },
    { id: 'configFiles', label: '10. Configuration Files', count: components.configFiles.length, icon: Sliders },
    { id: 'dbSchemaAndMigrations', label: '11. Database Schema & Migrations', count: components.dbSchemaAndMigrations.length, icon: Database },
    { id: 'dependencies', label: '12. Project Dependencies', count: components.dependencies.length, icon: Package },
    { id: 'tests', label: '13. Unit & Integration Tests', count: components.tests.length, icon: TestTube },
    { id: 'documentation', label: '14. Documentation Files', count: components.documentation.length, icon: BookOpen },
    { id: 'buildAndDeployment', label: '15. Build & Deployment Specs', count: components.buildAndDeployment.length, icon: Terminal }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Architecture Header */}
      <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="brand-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
                {architecture.pattern}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Automatically Detected by RepoMind
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
              {repoOverview.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '1000px', marginTop: '0.4rem', lineHeight: 1.5 }}>
              {architecture.summary}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                {analysis.fileCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>SOURCE FILES</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)' }}>
                {analysis.totalLines.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>LINES OF CODE</div>
            </div>
          </div>
        </div>

        {/* Technology Badges */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Technologies:
          </span>
          {technologies.languages.map(l => (
            <span key={l} style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)'
            }}>
              {l}
            </span>
          ))}
          {technologies.frameworks.map(f => (
            <span key={f} style={{
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid rgba(99, 102, 241, 0.4)'
            }}>
              {f}
            </span>
          ))}
          {technologies.databases.map(d => (
            <span key={d} style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#67e8f9',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid rgba(6, 182, 212, 0.35)'
            }}>
              {d}
            </span>
          ))}
          {technologies.security.map(s => (
            <span key={s} style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#6ee7b7',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.35)'
            }}>
              {s}
            </span>
          ))}
        </div>

        {/* Language Distribution Progress Bar */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(0,0,0,0.4)' }}>
            {Object.entries(languageStats).map(([lang, lines], idx) => {
              const pct = (lines / totalLines) * 100;
              const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];
              return (
                <div 
                  key={lang} 
                  title={`${lang}: ${Math.round(pct)}% (${lines} lines)`}
                  style={{ width: `${pct}%`, background: colors[idx % colors.length] }} 
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {Object.entries(languageStats).map(([lang, lines], idx) => {
              const pct = ((lines / totalLines) * 100).toFixed(1);
              const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];
              return (
                <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[idx % colors.length] }} />
                  <span>{lang}: {pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 15 Architectural Layers Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Layer Selector List */}
        <div className="glass-card" style={{ padding: '0.75rem' }}>
          <div style={{ padding: '0.75rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Complete Project Layers (15 Layers)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {layerSections.map(layer => {
              const Icon = layer.icon;
              const isSelected = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  style={{
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: 'none',
                    borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon size={16} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-dim)' }} />
                    <span>{layer.label}</span>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '10px',
                    background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    fontWeight: 700
                  }}>
                    {layer.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Layer Details Drawer */}
        <div className="glass-card" style={{ minHeight: '500px' }}>
          {renderLayerContent(activeLayer, components, onOpenFileInMonaco)}
        </div>
      </div>
    </div>
  );
}

function renderLayerContent(layerId, components, onOpenInMonaco) {
  switch (layerId) {
    case 'restControllers': {
      const controllers = components.restControllers;
      return (
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            REST API Controllers ({controllers.length})
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Exposed HTTP routes, parameter bindings, request bodies, and handler methods.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {controllers.map(c => (
              <div key={c.file} style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                      {c.className}
                    </span>
                    <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>
                      {c.baseRoute ? `Base: ${c.baseRoute}` : ''}
                    </span>
                  </div>
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => onOpenInMonaco(c.file, 1)}
                  >
                    <ExternalLink size={13} />
                    View in Monaco
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {c.endpoints.map((ep, idx) => {
                    const methodColors = {
                      GET: '#38bdf8',
                      POST: '#34d399',
                      PUT: '#fbbf24',
                      DELETE: '#f87171',
                      PATCH: '#c084fc'
                    };
                    return (
                      <div 
                        key={idx}
                        onClick={() => onOpenInMonaco(c.file, ep.lineNumber)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(255,255,255,0.02)',
                          padding: '0.4rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            fontWeight: 800,
                            color: methodColors[ep.method] || '#fff',
                            width: '50px'
                          }}>
                            {ep.method}
                          </span>
                          <span style={{ color: '#f1f5f9' }}>{ep.path}</span>
                        </div>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                          handler: {ep.handler} (Line {ep.lineNumber})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'serviceClasses': {
      const services = components.serviceClasses;
      return (
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Service Layer Classes ({services.length})
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Encapsulates business operations, transactional consistency, and data orchestration.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {services.map(s => (
              <div key={s.file} style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                      {s.className}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                      {s.type}
                    </div>
                  </div>
                  <button className="btn-secondary btn-sm" onClick={() => onOpenInMonaco(s.file, 1)}>
                    <ExternalLink size={13} />
                  </button>
                </div>

                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                    METHODS ({s.methods.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {s.methods.slice(0, 6).map((m, idx) => (
                      <div 
                        key={idx}
                        onClick={() => onOpenInMonaco(s.file, m.lineNumber)}
                        style={{
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>• {m.name}()</span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>L{m.lineNumber}</span>
                      </div>
                    ))}
                    {s.methods.length > 6 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        +{s.methods.length - 6} more methods...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'databaseEntities': {
      const entities = components.databaseEntities;
      return (
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Database Entities & ORM Models ({entities.length})
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Persistent domain entities with table definitions, column types, and relational foreign keys.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {entities.map(e => (
              <div key={e.file} style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                      {e.className}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                      Table: {e.tableName}
                    </div>
                  </div>
                  <button className="btn-secondary btn-sm" onClick={() => onOpenInMonaco(e.file, 1)}>
                    <ExternalLink size={13} />
                  </button>
                </div>

                {e.relationships && e.relationships.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                      RELATIONSHIPS:
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {e.relationships.map((rel, idx) => (
                        <span key={idx} style={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          color: '#c084fc',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {rel.type} (Line {rel.lineNumber})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    default: {
      const items = Array.isArray(components[layerId]) ? components[layerId] : [];
      return (
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {layerId.replace(/([A-Z])/g, ' $1').toUpperCase()} ({items.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                    {item.name || item.file}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {item.file || item.role || item.description || ''}
                  </div>
                </div>
                {item.file && (
                  <button className="btn-secondary btn-sm" onClick={() => onOpenInMonaco(item.file, 1)}>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
}
