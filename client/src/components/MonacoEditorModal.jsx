import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  X, 
  FileCode, 
  FolderTree, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Loader2
} from 'lucide-react';

export default function MonacoEditorModal({ 
  isOpen, 
  onClose, 
  repoId, 
  filePath, 
  targetLine, 
  files = [] 
}) {
  const [activeFile, setActiveFile] = useState(filePath);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    if (filePath) {
      setActiveFile(filePath);
    }
  }, [filePath]);

  useEffect(() => {
    if (isOpen && activeFile && repoId) {
      loadFile(activeFile);
    }
  }, [isOpen, activeFile, repoId]);

  const loadFile = async (path) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/repository/${repoId}/file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (res.ok) {
        setFileData(data);
      } else {
        setFileData({
          path,
          name: path.split('/').pop(),
          content: `// Error loading file: ${data.error}`,
          totalLines: 1,
          language: 'plaintext'
        });
      }
    } catch (err) {
      setFileData({
        path,
        name: path.split('/').pop(),
        content: `// Network error: ${err.message}`,
        totalLines: 1,
        language: 'plaintext'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    if (targetLine) {
      jumpToLine(targetLine);
    }
  };

  const jumpToLine = (line) => {
    if (!editorRef.current) return;
    const lineNum = typeof line === 'string' ? parseInt(line.split('-')[0], 10) : line;
    if (!isNaN(lineNum) && lineNum > 0) {
      editorRef.current.revealLineInCenter(lineNum);
      editorRef.current.setPosition({ lineNumber: lineNum, column: 1 });
      
      // Highlight target line with decoration
      editorRef.current.createDecorationsCollection([
        {
          range: {
            startLineNumber: lineNum,
            startColumn: 1,
            endLineNumber: lineNum,
            endColumn: 1000
          },
          options: {
            isWholeLine: true,
            className: 'monaco-line-highlight'
          }
        }
      ]);
    }
  };

  useEffect(() => {
    if (editorRef.current && targetLine) {
      jumpToLine(targetLine);
    }
  }, [targetLine, fileData]);

  const handleCopyCode = () => {
    if (fileData?.content) {
      navigator.clipboard.writeText(fileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  const filteredFiles = files.filter(f => 
    f.path.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '1400px', height: '88vh' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '0.85rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileCode size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                {fileData?.path || activeFile}
              </span>
              {targetLine && (
                <span style={{ 
                  marginLeft: '0.75rem', 
                  fontSize: '0.75rem', 
                  background: 'rgba(99, 102, 241, 0.25)', 
                  color: '#a5b4fc', 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '4px',
                  fontWeight: 600 
                }}>
                  Line {targetLine}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="btn-secondary btn-sm" 
              onClick={handleCopyCode}
              title="Copy file contents"
            >
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button 
              onClick={onClose} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body: Sidebar + Monaco Editor */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100% - 55px)' }}>
          {/* File Explorer Sidebar */}
          <div style={{ 
            background: 'rgba(10, 14, 23, 0.95)', 
            borderRight: '1px solid var(--border-subtle)', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <input
                type="text"
                placeholder="Search repository files..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.8rem',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {filteredFiles.map(f => {
                const isSelected = f.path === activeFile;
                return (
                  <div
                    key={f.path}
                    onClick={() => setActiveFile(f.path)}
                    style={{
                      padding: '0.35rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={f.path}
                  >
                    <FileCode size={14} style={{ flexShrink: 0, color: isSelected ? 'var(--primary)' : 'var(--text-dim)' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.path}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monaco Editor Pane */}
          <div style={{ position: 'relative', height: '100%', background: '#1e1e1e' }}>
            {loading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.7)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#fff'
              }}>
                <Loader2 size={24} className="spin" />
                <span>Loading source code...</span>
              </div>
            )}

            <Editor
              height="100%"
              language={fileData?.language || 'plaintext'}
              theme="vs-dark"
              value={fileData?.content || ''}
              onMount={handleEditorDidMount}
              options={{
                readOnly: true,
                minimap: { enabled: true },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                renderLineHighlight: 'all',
                automaticLayout: true,
                glyphMargin: false,
                folding: true
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
