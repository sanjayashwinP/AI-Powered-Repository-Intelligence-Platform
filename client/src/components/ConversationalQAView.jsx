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
            content: data.text,
            references: data.references || [],
            blueprint: data.blueprint,
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

  const promptSuggestions = [
    'What is this project about?',
    'Does this project have authentication?',
    'Explain the employee registration flow.',
    'Where should I implement JWT authentication?',
    'Are there security vulnerabilities?',
    'Where should I add Redis caching?',
    'Explain the database relationships.',
    'Show me the code.'
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
                RepoMind Conversational Assistant
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

                {/* Body Content with simple markdown rendering */}
                <div 
                  style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: renderFormattedMarkdown(msg.content) }}
                />

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
            placeholder="Ask anything about this repository (e.g. 'Where should I implement JWT?', 'Explain registration flow')..."
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
          <span>Suggested Questions</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Click any prompt to instantly query the repository knowledge index:
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

// Simple Markdown formatting helper for bold, code, and lists
function renderFormattedMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^### (.*$)/gim, '<h3 style="font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:#fff;margin:0.6rem 0 0.3rem;">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 style="font-family:var(--font-display);font-size:0.98rem;font-weight:700;color:#a5b4fc;margin:0.5rem 0 0.2rem;">$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong style="color:#fff;">$1</strong>')
    .replace(/`([^`]+)`/gim, '<code style="background:rgba(255,255,255,0.08);color:#93c5fd;padding:0.1rem 0.3rem;border-radius:4px;font-family:var(--font-mono);font-size:0.85em;">$1</code>');
}
