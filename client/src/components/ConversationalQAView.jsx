import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Terminal, 
  User, 
  FileCode2, 
  ExternalLink, 
  Code2, 
  Loader2,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  Check
} from 'lucide-react';
import { marked } from 'marked';

// Configure marked for clean Github-flavored markdown
marked.setOptions({
  gfm: true,
  breaks: true
});

export default function ConversationalQAView({ repoId, repoName, onOpenFileInMonaco }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Repository **${repoName}** loaded and indexed via static AST analysis.\n\nYou can ask any architectural question about controllers, services, database models, request lifecycles, or where and how to implement new features.`,
      references: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Repository **${repoName}** loaded and indexed via static AST analysis.\n\nYou can ask any architectural question about controllers, services, database models, request lifecycles, or where and how to implement new features.`,
        references: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [repoId, repoName]);

  const handleSend = async (queryToSend) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || loading) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch(`/api/repository/${repoId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.text || data.answer || '',
            references: data.references || data.citations || [],
            blueprint: data.blueprint || (data.wiringInstructions ? { wiringInstructions: data.wiringInstructions, boilerplateCode: data.boilerplateCode } : null),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `**Error:** ${data.error || 'Failed to process repository analysis query.'}`,
            references: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `**Network Error:** Could not contact server. (${err.message})`,
          references: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code, key) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const promptSuggestions = [
    'Explain the existing controller in the project',
    'Where can I add my Controller and feature?',
    'Explain the Project Architecture',
    'Explain the Service & Business Layer',
    'Explain Database Entities & Models',
    'Suggest improvements for Employee module',
    'Explain the Employee module flow',
    'Check Security & Authentication'
  ];

  return (
    <div className="qa-workspace-layout">
      {/* Main Analysis Inspection Panel */}
      <div className="qa-main-panel">
        {/* Panel Header */}
        <div className="qa-panel-header">
          <div className="qa-header-left">
            <div className="qa-header-icon">
              <Terminal size={18} />
            </div>
            <div>
              <div className="qa-header-title">Codebase Intelligence Console</div>
              <div className="qa-header-subtitle">
                AST Static Code Index • <span style={{ color: '#93c5fd' }}>{repoName}</span>
              </div>
            </div>
          </div>

          <button
            className="btn-secondary btn-sm"
            onClick={() => setMessages([messages[0]])}
            title="Reset to fresh inspection session"
          >
            <RotateCcw size={13} />
            <span>Reset History</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="qa-messages-stream">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`qa-message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
                {/* Message Container Card */}
                <div className={`qa-message-card ${isUser ? 'user-card' : 'assistant-card'}`}>
                  {/* Card Header Badge */}
                  <div className="qa-card-meta">
                    <div className="qa-meta-left">
                      {isUser ? (
                        <>
                          <User size={13} />
                          <span>Developer Query</span>
                        </>
                      ) : (
                        <>
                          <FileCode2 size={13} />
                          <span>Architecture Inspection Report</span>
                        </>
                      )}
                    </div>
                    <span className="qa-meta-time">{msg.timestamp}</span>
                  </div>

                  {/* Explicit Wiring Banner if assistant response has wiring instructions */}
                  {!isUser && msg.blueprint && msg.blueprint.wiringInstructions && (
                    <div className="wiring-banner" style={{ marginBottom: '1.25rem' }}>
                      <div className="wiring-header">
                        <span className="wiring-badge">
                          <Sparkles size={12} />
                          EXACT COMPONENT PLACEMENT & WIRING
                        </span>
                        <button
                          className={`code-copy-btn ${copiedIndex === `wiring-${idx}` ? 'copied' : ''}`}
                          onClick={() => handleCopyCode(msg.blueprint.wiringInstructions, `wiring-${idx}`)}
                        >
                          <Code2 size={12} />
                          {copiedIndex === `wiring-${idx}` ? 'Copied Instructions!' : 'Copy Instructions'}
                        </button>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#38bdf8', marginBottom: '0.6rem' }}>
                        It can be done right here in this component by doing this:
                      </div>
                      <div className="wiring-steps">
                        {msg.blueprint.wiringInstructions
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

                  {/* Body Content with full GFM Markdown rendering */}
                  <div 
                    className="qa-markdown-body"
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.content || '') }}
                  />

                  {/* Dedicated Boilerplate Code Card if present */}
                  {!isUser && msg.blueprint && msg.blueprint.boilerplateCode && (
                    <div className="code-block-card" style={{ marginTop: '1.25rem' }}>
                      <div className="code-block-header">
                        <span className="code-block-lang">
                          <Code2 size={13} color="var(--primary)" />
                          DROP-IN BOILERPLATE CODE
                        </span>
                        <button
                          className={`code-copy-btn ${copiedIndex === `code-${idx}` ? 'copied' : ''}`}
                          onClick={() => handleCopyCode(msg.blueprint.boilerplateCode, `code-${idx}`)}
                        >
                          {copiedIndex === `code-${idx}` ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                      <pre className="code-block-body">
                        <code>{msg.blueprint.boilerplateCode}</code>
                      </pre>
                    </div>
                  )}

                  {/* Verifiable Source Citations Box */}
                  {msg.references && msg.references.length > 0 && (
                    <div className="qa-citations-section">
                      <div className="qa-citations-title">
                        <Layers size={13} />
                        <span>VERIFIABLE SOURCE CITATIONS ({msg.references.length})</span>
                      </div>
                      <div className="qa-citations-grid">
                        {msg.references.map((ref, rIdx) => (
                          <div key={rIdx} className="qa-citation-card">
                            <div className="qa-citation-card-header">
                              <span className="qa-citation-file">{ref.file}</span>
                              <button
                                className="btn-primary btn-sm qa-citation-btn"
                                onClick={() => onOpenFileInMonaco(ref.file, ref.lines)}
                              >
                                <ExternalLink size={11} />
                                <span>Inspect in Monaco</span>
                              </button>
                            </div>
                            <div className="qa-citation-meta">
                              <strong>Class:</strong> {ref.class} • <strong>Lines:</strong> {ref.lines}
                            </div>
                            {ref.evidence && (
                              <div className="qa-citation-evidence">
                                {ref.evidence}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="qa-message-row assistant-row">
              <div className="qa-message-card assistant-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem' }}>
                <Loader2 size={16} className="spin" color="var(--primary)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Traversing AST code graph and formulating grounded response...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="qa-input-bar">
          <input
            type="text"
            placeholder="Ask about controllers, services, database models, request flow, or code placement..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading || !inputQuery.trim()}>
            <Send size={15} />
            <span>Run Query</span>
          </button>
        </form>
      </div>

      {/* Suggested Architectural Queries Sidebar */}
      <div className="qa-sidebar">
        <div className="qa-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Verified Queries</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Quick Runbooks</span>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          Click any query to execute architectural inspection:
        </p>

        <div className="qa-suggestions-list">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              className="qa-prompt-chip"
              onClick={() => handleSend(prompt)}
              disabled={loading}
            >
              <Search size={13} style={{ minWidth: 13, opacity: 0.7 }} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
