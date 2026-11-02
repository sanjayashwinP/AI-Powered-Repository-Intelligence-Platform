import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UploadModal from './components/UploadModal';
import GuideModal from './components/GuideModal';
import MonacoEditorModal from './components/MonacoEditorModal';
import ProjectOverviewView from './components/ProjectOverviewView';
import FeatureDiscoveryView from './components/FeatureDiscoveryView';
import ConversationalQAView from './components/ConversationalQAView';
import WhereToImplementView from './components/WhereToImplementView';
import RecommendationsView from './components/RecommendationsView';
import ModuleRunbookView from './components/ModuleRunbookView';

import { 
  Layers, 
  Search, 
  MessageSquare, 
  Compass, 
  Wrench, 
  FileCode,
  Loader2,
  Cpu,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function App() {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoOverview, setRepoOverview] = useState(null);
  const [featureInventory, setFeatureInventory] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Multi-Theme State (Aurora Emerald default)
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('repomind-theme') || 'aurora';
  });

  const [monacoModal, setMonacoModal] = useState({
    isOpen: false,
    filePath: '',
    targetLine: null
  });
  const [loading, setLoading] = useState(true);

  // Sync theme to root DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('repomind-theme', currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    showToast(`Switched theme to ${newTheme.toUpperCase()}`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch repositories on startup
  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async (selectId = null) => {
    setLoading(true);
    try {
      const res = await fetch('/api/repositories');
      const data = await res.json();
      const repos = data.repositories || [];
      setRepositories(repos);

      if (repos.length > 0) {
        const toSelect = selectId 
          ? repos.find(r => r.id === selectId) || repos[0]
          : selectedRepo 
            ? repos.find(r => r.id === selectedRepo.id) || repos[0]
            : repos[0];
        setSelectedRepo(toSelect);
        loadRepoDetails(toSelect.id);
      }
    } catch (err) {
      console.error('Failed to load repositories', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRepoDetails = async (repoId) => {
    try {
      const [ovRes, featRes] = await Promise.all([
        fetch(`/api/repository/${repoId}/overview`),
        fetch(`/api/repository/${repoId}/features`)
      ]);
      const ovData = await ovRes.json();
      const featData = await featRes.json();

      if (ovRes.ok) setRepoOverview(ovData);
      if (featRes.ok) setFeatureInventory(featData.featureInventory);
    } catch (err) {
      console.error('Failed to load repository details', err);
    }
  };

  const handleSelectRepo = (repo) => {
    setSelectedRepo(repo);
    loadRepoDetails(repo.id);
    showToast(`Loaded repository: ${repo.name}`);
  };

  const handleRepoUploaded = (newRepoId) => {
    fetchRepositories(newRepoId);
    showToast('Repository analyzed and loaded successfully!');
  };

  const handleDeleteRepo = async (repoId, repoName) => {
    if (!window.confirm(`Are you sure you want to remove "${repoName}"?`)) return;

    try {
      const res = await fetch(`/api/repository/${repoId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Repository removed');
        fetchRepositories();
      } else {
        alert(data.error || 'Failed to remove repository');
      }
    } catch (err) {
      alert(`Error removing repository: ${err.message}`);
    }
  };

  const openFileInMonaco = (filePath, targetLine = 1) => {
    setMonacoModal({
      isOpen: true,
      filePath,
      targetLine
    });
  };

  const closeMonacoModal = () => {
    setMonacoModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        repositories={repositories}
        selectedRepo={selectedRepo}
        onSelectRepo={handleSelectRepo}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        onDeleteRepo={handleDeleteRepo}
      />

      {/* Main Navigation Tabs Header */}
      <nav className="main-nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Layers size={17} />
          Architecture Overview
        </button>

        <button
          className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          <Search size={17} />
          Feature Explorer
          {featureInventory && (
            <span className="tab-badge">
              {featureInventory.stats.implemented}/{featureInventory.stats.total}
            </span>
          )}
        </button>

        <button
          className={`tab-btn ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          <Cpu size={17} />
          Deep Dives & Runbooks
        </button>

        <button
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={17} />
          Codebase Intelligence Q&A
        </button>

        <button
          className={`tab-btn ${activeTab === 'where-to-implement' ? 'active' : ''}`}
          onClick={() => setActiveTab('where-to-implement')}
        >
          <Compass size={17} />
          Where to Implement
        </button>

        <button
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <Wrench size={17} />
          Code Health & Patches
        </button>
      </nav>

      {/* Main Body Content */}
      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
            <Loader2 size={36} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Analyzing software project AST structures...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <ProjectOverviewView
                repoOverview={repoOverview}
                onOpenFileInMonaco={openFileInMonaco}
              />
            )}

            {activeTab === 'features' && (
              <FeatureDiscoveryView
                featureInventory={featureInventory}
                onOpenFileInMonaco={openFileInMonaco}
              />
            )}

            {activeTab === 'modules' && selectedRepo && (
              <ModuleRunbookView
                repoId={selectedRepo.id}
                repoOverview={repoOverview}
                onOpenFileInMonaco={openFileInMonaco}
                onSwitchToChat={() => setActiveTab('chat')}
                onSwitchToWhereToImplement={() => setActiveTab('where-to-implement')}
              />
            )}

            {activeTab === 'chat' && selectedRepo && (
              <ConversationalQAView
                repoId={selectedRepo.id}
                repoName={selectedRepo.name}
                onOpenFileInMonaco={openFileInMonaco}
              />
            )}

            {activeTab === 'where-to-implement' && selectedRepo && (
              <WhereToImplementView
                repoId={selectedRepo.id}
                onOpenFileInMonaco={openFileInMonaco}
              />
            )}

            {activeTab === 'recommendations' && selectedRepo && (
              <RecommendationsView
                repoId={selectedRepo.id}
                onOpenFileInMonaco={openFileInMonaco}
              />
            )}
          </>
        )}
      </main>

      {/* Global Monaco Editor & Code Inspector Modal */}
      <MonacoEditorModal
        isOpen={monacoModal.isOpen}
        onClose={closeMonacoModal}
        repoId={selectedRepo?.id}
        filePath={monacoModal.filePath}
        targetLine={monacoModal.targetLine}
        files={repoOverview?.analysis?.files || []}
      />

      {/* Repository Upload / Import Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onRepoUploaded={handleRepoUploaded}
        repositories={repositories}
        onSelectRepo={handleSelectRepo}
        onDeleteRepo={handleDeleteRepo}
      />

      {/* Platform Capabilities & Guide Walkthrough Modal */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-banner">
          <CheckCircle2 size={18} style={{ color: 'var(--primary)' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
