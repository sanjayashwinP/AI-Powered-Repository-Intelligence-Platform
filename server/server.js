import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';
import https from 'https';

import { initializeSampleRepositories } from './services/sampleRepositories.js';
import { analyzeProject } from './services/projectAnalyzer.js';
import { discoverFeatures } from './services/featureDiscovery.js';
import { answerRepositoryQuestion } from './services/qaEngine.js';
import { planFeatureImplementation } from './services/architecturalAdvisor.js';
import { 
  generateImprovementRecommendations, 
  getPatchDetails, 
  applyPatchWithBackup, 
  rollbackLatestBackup 
} from './services/patchEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SAMPLES_DIR = path.join(__dirname, 'samples');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup Multer for ZIP file uploads
const upload = multer({
  dest: path.join(__dirname, 'temp_uploads'),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Cache for in-memory repository metadata and analyses
const repoRegistry = new Map();

// Initialize preloaded sample projects on startup
initializeSampleRepositories(SAMPLES_DIR);

function registerSampleRepositories() {
  const samples = [
    {
      id: 'spring-boot-react-enterprise',
      name: 'Enterprise Management Hub (Spring Boot 3 + React + PostgreSQL)',
      description: 'Full-stack enterprise application with Spring Security, JWT, JPA repositories, Flyway migrations, and React directory.',
      path: path.join(SAMPLES_DIR, 'spring-boot-react-enterprise'),
      isSample: true
    },
    {
      id: 'node-express-prisma-saas',
      name: 'SaaS Subscription Platform (Node.js + Prisma + Stripe)',
      description: 'Multi-tenant subscription backend with Express, Prisma ORM, Stripe billing webhooks, Redis caching, and JWT.',
      path: path.join(SAMPLES_DIR, 'node-express-prisma-saas'),
      isSample: true
    },
    {
      id: 'fastapi-vue-ai-service',
      name: 'AI Analytics Microservice (Python FastAPI + Celery + Vue)',
      description: 'Asynchronous dataset analytics service leveraging FastAPI, Celery background workers, SQLAlchemy, and Alembic.',
      path: path.join(SAMPLES_DIR, 'fastapi-vue-ai-service'),
      isSample: true
    }
  ];

  for (const s of samples) {
    if (fs.existsSync(s.path)) {
      const analysis = analyzeProject(s.path);
      const featureInventory = discoverFeatures(analysis, s.path);
      repoRegistry.set(s.id, {
        ...s,
        analysis,
        featureInventory,
        addedAt: new Date().toISOString()
      });
    }
  }
}

registerSampleRepositories();

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. List all repositories
app.get('/api/repositories', (req, res) => {
  const list = Array.from(repoRegistry.values()).map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isSample: r.isSample,
    addedAt: r.addedAt,
    fileCount: r.analysis.fileCount,
    totalLines: r.analysis.totalLines,
    languages: r.analysis.technologies.languages,
    frameworks: r.analysis.technologies.frameworks,
    featureCount: r.featureInventory.stats.total,
    implementedCount: r.featureInventory.stats.implemented
  }));
  res.json({ repositories: list });
});

// 2. Upload ZIP project folder
app.post('/api/upload/zip', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No ZIP file uploaded.' });
    }

    const repoId = `repo-zip-${Date.now()}`;
    const extractPath = path.join(UPLOADS_DIR, repoId);
    fs.mkdirSync(extractPath, { recursive: true });

    // Extract ZIP
    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(extractPath, true);

    // Clean up temporary uploaded zip file
    fs.unlinkSync(req.file.path);

    // Analyze extracted project
    const analysis = analyzeProject(extractPath);
    const featureInventory = discoverFeatures(analysis, extractPath);

    const repoInfo = {
      id: repoId,
      name: req.body.name || req.file.originalname.replace(/\.[^/.]+$/, ''),
      description: `Uploaded project archive (${analysis.fileCount} files, ${analysis.totalLines.toLocaleString()} lines)`,
      path: extractPath,
      isSample: false,
      analysis,
      featureInventory,
      addedAt: new Date().toISOString()
    };

    repoRegistry.set(repoId, repoInfo);

    res.status(201).json({
      success: true,
      repository: {
        id: repoId,
        name: repoInfo.name,
        fileCount: analysis.fileCount,
        totalLines: analysis.totalLines
      }
    });
  } catch (err) {
    console.error('ZIP upload error:', err);
    res.status(500).json({ error: `Failed to process ZIP archive: ${err.message}` });
  }
});

// 3. Import GitHub repository from URL
app.post('/api/upload/github', async (req, res) => {
  const { repoUrl, name } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: 'GitHub repository URL is required.' });
  }

  try {
    // Parse github URL (e.g. https://github.com/owner/repo)
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid GitHub URL format. Expected: https://github.com/owner/repository' });
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');
    const repoId = `github-${owner}-${repo}-${Date.now()}`;
    const targetDir = path.join(UPLOADS_DIR, repoId);
    fs.mkdirSync(targetDir, { recursive: true });

    // Download repository zipball from GitHub (trying main, then master)
    const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/main`;
    const tempZipPath = path.join(targetDir, 'archive.zip');

    await downloadFile(zipUrl, tempZipPath);

    const zip = new AdmZip(tempZipPath);
    zip.extractAllTo(targetDir, true);
    fs.unlinkSync(tempZipPath);

    // Locate unzipped folder inside targetDir
    let effectiveDir = targetDir;
    const subEntries = fs.readdirSync(targetDir, { withFileTypes: true });
    if (subEntries.length === 1 && subEntries[0].isDirectory()) {
      effectiveDir = path.join(targetDir, subEntries[0].name);
    }

    const analysis = analyzeProject(effectiveDir);
    const featureInventory = discoverFeatures(analysis, effectiveDir);

    const repoInfo = {
      id: repoId,
      name: name || `${owner}/${repo}`,
      description: `Cloned GitHub repository (${analysis.fileCount} files, ${analysis.totalLines.toLocaleString()} lines)`,
      path: effectiveDir,
      isSample: false,
      analysis,
      featureInventory,
      addedAt: new Date().toISOString()
    };

    repoRegistry.set(repoId, repoInfo);

    res.status(201).json({
      success: true,
      repository: {
        id: repoId,
        name: repoInfo.name,
        fileCount: analysis.fileCount,
        totalLines: analysis.totalLines
      }
    });
  } catch (err) {
    console.error('GitHub import error:', err);
    res.status(500).json({ error: `Failed to download and inspect GitHub repository: ${err.message}` });
  }
});

// Helper: Download file via HTTPS redirect following
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Server responded with status code ${response.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
      file.on('error', (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
    }).on('error', reject);
  });
}

// 4. Import supported local repository folder
app.post('/api/upload/local', (req, res) => {
  const { localPath, name } = req.body;
  if (!localPath || !fs.existsSync(localPath)) {
    return res.status(400).json({ error: 'Specified local folder does not exist.' });
  }

  try {
    const repoId = `local-${Date.now()}`;
    const analysis = analyzeProject(localPath);
    const featureInventory = discoverFeatures(analysis, localPath);

    const repoInfo = {
      id: repoId,
      name: name || path.basename(localPath),
      description: `Imported local repository (${analysis.fileCount} files, ${analysis.totalLines.toLocaleString()} lines)`,
      path: localPath,
      isSample: false,
      analysis,
      featureInventory,
      addedAt: new Date().toISOString()
    };

    repoRegistry.set(repoId, repoInfo);

    res.status(201).json({
      success: true,
      repository: {
        id: repoId,
        name: repoInfo.name,
        fileCount: analysis.fileCount,
        totalLines: analysis.totalLines
      }
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to inspect local directory: ${err.message}` });
  }
});

// 5. Complete Project Understanding Overview (Section A)
app.get('/api/repository/:id/overview', (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  res.json({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    isSample: repo.isSample,
    analysis: repo.analysis
  });
});

// 6. Automatic Feature Discovery Inventory (Section B & C & E)
app.get('/api/repository/:id/features', (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  res.json({
    id: repo.id,
    name: repo.name,
    featureInventory: repo.featureInventory
  });
});

// 7. Get File Content for Monaco Editor (Section I & E & H)
app.get('/api/repository/:id/file', (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  const relPath = req.query.path;
  if (!relPath) return res.status(400).json({ error: 'Query parameter ?path= is required.' });

  const fullPath = path.join(repo.path, relPath);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: `File not found: ${relPath}` });
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    const ext = path.extname(relPath).toLowerCase();
    
    // Map to Monaco Language ID
    const monacoLang = 
      ext === '.java' ? 'java' :
      ext === '.js' || ext === '.jsx' ? 'javascript' :
      ext === '.ts' || ext === '.tsx' ? 'typescript' :
      ext === '.py' ? 'python' :
      ext === '.sql' ? 'sql' :
      ext === '.json' ? 'json' :
      ext === '.yml' || ext === '.yaml' ? 'yaml' :
      ext === '.xml' ? 'xml' :
      ext === '.html' ? 'html' :
      ext === '.css' ? 'css' :
      ext === '.md' ? 'markdown' :
      ext === '.dockerfile' || path.basename(relPath) === 'Dockerfile' ? 'dockerfile' : 'plaintext';

    res.json({
      path: relPath,
      name: path.basename(relPath),
      content,
      totalLines: lines.length,
      language: monacoLang
    });
  } catch (err) {
    res.status(500).json({ error: `Error reading file: ${err.message}` });
  }
});

// 8. Conversational Repository Assistant & Hybrid QA (Section D, I, J, K)
app.post('/api/repository/:id/chat', (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message body cannot be empty.' });

  try {
    const answer = answerRepositoryQuestion(repo.id, message, repo.analysis, repo.path);
    res.json({
      success: true,
      ...answer
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to formulate answer: ${err.message}` });
  }
});

// 9. Where Should I Implement a New Feature? (Section G)
app.post('/api/repository/:id/plan-feature', (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  const { feature } = req.body;
  if (!feature) return res.status(400).json({ error: 'Feature name or description is required.' });

  try {
    const blueprint = planFeatureImplementation(feature, repo.analysis);
    res.json({
      success: true,
      blueprint
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to plan implementation: ${err.message}` });
  }
});

// 10. Intelligent Improvement Recommendations (Section F)
app.get('/api/repository/:id/recommendations', (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  try {
    const recommendations = generateImprovementRecommendations(repo.analysis, repo.path);
    res.json({
      repositoryId: repo.id,
      totalRecommendations: recommendations.length,
      recommendations
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to generate recommendations: ${err.message}` });
  }
});

// 11. Code Improvement & Patch Suggestion Details (Section H)
app.get('/api/repository/:id/patch', (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  const recId = req.query.recId;
  if (!recId) return res.status(400).json({ error: 'Query parameter ?recId= is required.' });

  const patch = getPatchDetails(recId, repo.analysis, repo.path);
  if (!patch) {
    return res.status(404).json({ error: 'No patch available for this recommendation.' });
  }

  res.json({ patch });
});

// 12. Safe Patch Application with Automatic Backup (Section H)
app.post('/api/repository/:id/apply-patch', (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  const { relPath, newContent } = req.body;
  if (!relPath || newContent === undefined) {
    return res.status(400).json({ error: 'relPath and newContent are required.' });
  }

  try {
    const result = applyPatchWithBackup(repo.path, relPath, newContent);
    
    // Re-run analysis on modified repository
    repo.analysis = analyzeProject(repo.path);
    repo.featureInventory = discoverFeatures(repo.analysis, repo.path);

    res.json({
      success: true,
      message: `Patch successfully applied to ${relPath}. Original code safely archived in backup snapshot.`,
      result
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to apply patch: ${err.message}` });
  }
});

// 13. Rollback Latest Patch (Section H)
app.post('/api/repository/:id/rollback-patch', (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  const { relPath } = req.body;
  if (!relPath) return res.status(400).json({ error: 'relPath is required.' });

  try {
    const result = rollbackLatestBackup(repo.path, relPath);
    
    // Re-run analysis on restored repository
    repo.analysis = analyzeProject(repo.path);
    repo.featureInventory = discoverFeatures(repo.analysis, repo.path);

    res.json({
      success: true,
      message: `Successfully rolled back ${relPath} to backup snapshot ${result.fromSnapshot}.`,
      result
    });
  } catch (err) {
    res.status(500).json({ error: `Rollback failed: ${err.message}` });
  }
});

// Serve built client frontend
const clientDist = path.join(ROOT_DIR, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`RepoMind Backend API running on http://localhost:${PORT}`);
  console.log(`Preloaded ${repoRegistry.size} sample repositories.`);
});
