import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileCode, 
  ExternalLink, 
  ShieldAlert, 
  Code2, 
  Layers, 
  CheckCircle2, 
  Loader2,
  Trash2
} from 'lucide-react';

export default function ConversationalQAView({ repoId, repoName, onOpenFileInMonaco }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am **RepoMind**, your intelligent repository assistant. I have performed a complete AST static analysis of **${repoName}**.\n\nYou can ask me anything about the project architecture, feature implementations, cross-module data flows, security quality, or where to implement new features!`,
      references: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
            content: `**Error:** ${data.error || 'Failed to process inquiry.'}`,
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
          content: `**Network Error:** Could not contact RepoMind assistant server. (${err.message})`,
          references: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyCode = (code, key) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const promptSuggestions = [
    'Where can I add my Controller?',
    'Explain the Project Architecture',
    'Explain the Employee module',
    'Explain the Authentication module',
    'Suggest improvements for Employee module',
    'Suggest improvements for Auth module',
    'Where should I implement Redis caching?',
    'Explain the employee registration flow',
    'Are there security vulnerabilities?',
    'Where should I implement JWT authentication?'
  ];

  return (
    <div className="chat-layout">
      {/* Main Chat Stream Card */}
      <div className="glass-card chat-stream-card">
        {/* Chat Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.75)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                RepoMind Senior Architecture Assistant
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Repository Grounded Knowledge Index • {repoName}
              </div>
            </div>
          </div>

          <button
            className="btn-secondary btn-sm"
            onClick={() => setMessages([messages[0]])}
            title="Clear Chat Session"
          >
            <Trash2 size={13} />
            Reset Chat
          </button>
        </div>

        {/* Message Stream */}
        <div className="chat-messages">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}>
                {/* Header inside bubble */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  marginBottom: '0.45rem',
                  fontSize: '0.75rem',
                  color: isUser ? '#e0e7ff' : '#94a3b8',
                  fontWeight: 600
                }}>
                  {isUser ? <User size={13} /> : <Bot size={13} />}
                  <span>{isUser ? 'You' : 'RepoMind Assistant'}</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.7, marginLeft: 'auto' }}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Explicit Wiring Banner if assistant response has wiringInstructions */}
                {!isUser && msg.blueprint && msg.blueprint.wiringInstructions && (
                  <div className="wiring-banner" style={{ marginBottom: '1rem' }}>
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
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#38bdf8', marginBottom: '0.5rem' }}>
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

                {/* Body Content with formatted rendering */}
                <div 
                  style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: renderFormattedMarkdown(msg.content) }}
                />

                {/* Dedicated Boilerplate Code Card if present */}
                {!isUser && msg.blueprint && msg.blueprint.boilerplateCode && (
                  <div className="code-block-card">
                    <div className="code-block-header">
                      <span className="code-block-lang">
                        <Code2 size={13} color="var(--primary)" />
                        DROP-IN BOILERPLATE CODE
                      </span>
                      <button
                        className={`code-copy-btn ${copiedIndex === `code-${idx}` ? 'copied' : ''}`}
                        onClick={() => handleCopyCode(msg.blueprint.boilerplateCode, `code-${idx}`)}
                      >
                        {copiedIndex === `code-${idx}` ? 'Copied to Clipboard!' : 'Copy Code'}
                      </button>
                    </div>
                    <pre className="code-block-body">
                      <code>{msg.blueprint.boilerplateCode}</code>
                    </pre>
                  </div>
                )}

                {/* Verifiable Source Citations Box */}
                {msg.references && msg.references.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: '#a5b4fc', 
                      marginBottom: '0.4rem', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}>
                      VERIFIABLE REPOSITORY SOURCE CITATIONS ({msg.references.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {msg.references.map((ref, rIdx) => (
                        <div key={rIdx} className="citation-box">
                          <div className="citation-header">
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{ref.file}</span>
                            <button
                              className="btn-primary btn-sm"
                              onClick={() => onOpenFileInMonaco(ref.file, ref.lines)}
                              style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}
                            >
                              <ExternalLink size={11} />
                              Open in Monaco
                            </button>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                            <strong>Class:</strong> {ref.class} | <strong>Method:</strong> {ref.method} | <strong>Lines:</strong> {ref.lines}
                          </div>
                          {ref.evidence && (
                            <div style={{
                              background: 'rgba(0,0,0,0.4)',
                              padding: '0.4rem 0.6rem',
                              borderRadius: '4px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              color: '#93c5fd',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {ref.evidence}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Loader2 size={16} className="spin" color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Retrieving repository AST symbols and formulating grounded response...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="chat-input-bar">
          <input
            type="text"
            placeholder="Ask anything (e.g. 'Where can I add my controller?', 'Explain employee module', 'Suggest improvements')..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading || !inputQuery.trim()}>
            <Send size={16} />
            Ask
          </button>
        </form>
      </div>

      {/* Suggested Prompt Sidebar */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
          <Sparkles size={16} color="var(--primary)" />
          <span>Quick Prompts & Runbooks</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Click any prompt to instantly run verified architectural inspection:
        </p>

        <div className="prompt-suggestions">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => handleSend(prompt)}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Markdown formatting helper with styled code blocks and headers
function renderFormattedMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^### (.*$)/gim, '<h3 style="font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:#fff;margin:0.8rem 0 0.35rem;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:0.3rem;">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 style="font-family:var(--font-display);font-size:0.98rem;font-weight:700;color:#a5b4fc;margin:0.6rem 0 0.25rem;">$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong style="color:#fff;">$1</strong>')
    .replace(/`([^`]+)`/gim, '<code style="background:rgba(255,255,255,0.08);color:#93c5fd;padding:0.12rem 0.35rem;border-radius:4px;font-family:var(--font-mono);font-size:0.85em;border:1px solid rgba(255,255,255,0.06);">$1</code>');
}
