import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FolderArchive, 
  GitBranch, 
  FolderSearch, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Layers,
  Trash2
} from 'lucide-react';

export default function UploadModal({ 
  isOpen, 
  onClose, 
  onRepoUploaded, 
  repositories, 
  onSelectRepo,
  onDeleteRepo
}) {
  const [activeTab, setActiveTab] = useState('zip');
  const [zipFile, setZipFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [repoName, setRepoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleZipUpload = async (e) => {
    e.preventDefault();
    if (!zipFile) {
      setError('Please select a project ZIP archive.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('file', zipFile);
    if (repoName) formData.append('name', repoName);

    try {
      const res = await fetch('/api/upload/zip', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process ZIP archive');

      setSuccessMsg(`Project successfully uploaded! Analyzed ${data.repository.fileCount} files.`);
      setTimeout(() => {
        onRepoUploaded(data.repository.id);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubImport = async (e) => {
    e.preventDefault();
    if (!githubUrl) {
      setError('Please enter a valid GitHub repository URL.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/upload/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: githubUrl, name: repoName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import GitHub repository');

      setSuccessMsg(`GitHub repository imported and analyzed successfully!`);
      setTimeout(() => {
        onRepoUploaded(data.repository.id);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalImport = async (e) => {
    e.preventDefault();
    if (!localPath) {
      setError('Please provide an absolute local directory path.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/upload/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localPath, name: repoName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to inspect local directory');

      setSuccessMsg(`Local project scanned and analyzed!`);
      setTimeout(() => {
        onRepoUploaded(data.repository.id);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 15px var(--primary-glow)'
            }}>
              <Upload size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
                Upload or Import Repository
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                RepoMind will automatically perform complete AST analysis, feature discovery, and symbol indexing.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-subtle)', 
          background: 'rgba(0,0,0,0.2)',
          padding: '0 1.5rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'zip', label: 'ZIP Archive', icon: FolderArchive },
            { id: 'github', label: 'GitHub URL', icon: GitBranch },
            { id: 'local', label: 'Local Folder', icon: FolderSearch },
            { id: 'samples', label: 'Sample Projects', icon: Sparkles },
            { id: 'manage', label: `All Repositories (${repositories.length})`, icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); setSuccessMsg(''); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  padding: '0.85rem 1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              background: 'var(--status-notfound-bg)',
              border: '1px solid var(--status-notfound-border)',
              color: 'var(--status-notfound-text)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'var(--status-implemented-bg)',
              border: '1px solid var(--status-implemented-border)',
              color: 'var(--status-implemented-text)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: ZIP Archive Upload */}
          {activeTab === 'zip' && (
            <form onSubmit={handleZipUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Project Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MyEnterprisePortal"
                  value={repoName}
                  onChange={e => setRepoName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Select Project ZIP Archive (.zip)
                </label>
                <div style={{
                  border: '2px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => document.getElementById('zip-file-input').click()}
                >
                  <FolderArchive size={42} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>
                    {zipFile ? zipFile.name : 'Click to select project ZIP folder'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Supports multi-language codebases (Java, TypeScript, Python, Go, etc.)
                  </p>
                  <input
                    id="zip-file-input"
                    type="file"
                    accept=".zip"
                    style={{ display: 'none' }}
                    onChange={e => setZipFile(e.target.files[0])}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || !zipFile}
                style={{ justifyContent: 'center', padding: '0.85rem' }}
              >
                {loading ? <><Loader2 size={18} className="spin" /> Extracting & Analyzing Repository...</> : 'Extract & Analyze Project'}
              </button>
            </form>
          )}

          {/* TAB 2: GitHub Repository URL */}
          {activeTab === 'github' && (
            <form onSubmit={handleGithubImport} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/spring-projects/spring-petclinic"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Custom Alias (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PetClinic Backend"
                  value={repoName}
                  onChange={e => setRepoName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                fontSize: '0.82rem',
                color: '#a5b4fc'
              }}>
                RepoMind securely clones or downloads the public repository archive, traverses all files, and indexes every architectural layer.
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || !githubUrl}
                style={{ justifyContent: 'center', padding: '0.85rem' }}
              >
                {loading ? <><Loader2 size={18} className="spin" /> Downloading & Analyzing GitHub Repo...</> : 'Import & Analyze from GitHub'}
              </button>
            </form>
          )}

          {/* TAB 3: Local Directory Folder */}
          {activeTab === 'local' && (
            <form onSubmit={handleLocalImport} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Local Project Folder Path
                </label>
                <input
                  type="text"
                  placeholder="C:\Projects\MyEnterpriseApp"
                  value={localPath}
                  onChange={e => setLocalPath(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || !localPath}
                style={{ justifyContent: 'center', padding: '0.85rem' }}
              >
                {loading ? <><Loader2 size={18} className="spin" /> Scanning Local Directory...</> : 'Scan & Analyze Local Folder'}
              </button>
            </form>
          )}

          {/* TAB 4: Preloaded Sample Projects */}
          {activeTab === 'samples' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Test RepoMind immediately with rich preloaded real-world multi-technology software projects:
              </p>

              {repositories.filter(r => r.isSample).map(sample => (
                <div 
                  key={sample.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                      {sample.name}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {sample.description}
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {sample.frameworks.map(f => (
                        <span key={f} style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#a5b4fc',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '10px'
                        }}>
                          {f}
                        </span>
                      ))}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', alignSelf: 'center', marginLeft: '0.5rem' }}>
                        {sample.fileCount} files • {sample.totalLines.toLocaleString()} lines
                      </span>
                    </div>
                  </div>

                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      onSelectRepo(sample);
                      onClose();
                    }}
                  >
                    Select Repository
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: All Repositories & Management */}
          {activeTab === 'manage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Active repositories loaded in RepoMind ({repositories.length}):
              </p>

              {repositories.map(repo => (
                <div 
                  key={repo.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {repo.name}
                      </h4>
                      <span className="brand-badge" style={{ fontSize: '0.65rem' }}>
                        {repo.isSample ? 'Sample Seed' : 'Custom Upload'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {repo.fileCount} source files • {repo.totalLines?.toLocaleString() || 0} lines • {repo.languages?.join(', ')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      className="btn-secondary btn-sm"
                      onClick={() => {
                        onSelectRepo(repo);
                        onClose();
                      }}
                    >
                      Select
                    </button>
                    {!repo.isSample && onDeleteRepo && (
                      <button 
                        onClick={() => onDeleteRepo(repo.id, repo.name)}
                        style={{
                          background: 'rgba(244, 63, 94, 0.12)',
                          border: '1px solid rgba(244, 63, 94, 0.35)',
                          color: '#fb7185',
                          padding: '0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete this uploaded project"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
