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

  // Auto-restore previously uploaded repositories in uploads directory
  if (fs.existsSync(UPLOADS_DIR)) {
    const uploadEntries = fs.readdirSync(UPLOADS_DIR, { withFileTypes: true });
    for (const entry of uploadEntries) {
      if (entry.isDirectory()) {
        const uploadPath = path.join(UPLOADS_DIR, entry.name);
        try {
          const analysis = analyzeProject(uploadPath);
          const featureInventory = discoverFeatures(analysis, uploadPath);
          let name = entry.name;
          if (entry.name.startsWith('github-')) {
            const parts = entry.name.replace('github-', '').split('-');
            parts.pop(); // remove timestamp
            const rawName = parts.join('-');
            const firstDash = rawName.indexOf('-');
            name = firstDash > 0 ? `${rawName.substring(0, firstDash)}/${rawName.substring(firstDash + 1)}` : rawName;
          }
          repoRegistry.set(entry.name, {
            id: entry.name,
            name,
            description: `Imported repository (${analysis.fileCount} files, ${analysis.totalLines.toLocaleString()} lines)`,
            path: uploadPath,
            isSample: false,
            analysis,
            featureInventory,
            addedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn(`Could not restore upload ${entry.name}:`, e.message);
        }
      }
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
const handleQaChat = (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  const message = req.body.message || req.body.question;
  if (!message) return res.status(400).json({ error: 'Message or question body cannot be empty.' });

  try {
    const answer = answerRepositoryQuestion(repo.id, message, repo.analysis, repo.path);
    res.json({
      success: true,
      ...answer
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to formulate answer: ${err.message}` });
  }
};
app.post('/api/repository/:id/chat', handleQaChat);
app.post('/api/repository/:id/qa', handleQaChat);

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

// 14. Module Deep-Dive Runbooks & Improvement Studio (Section I & J)
app.get('/api/repository/:id/module-runbooks', (req, res) => {
  const repo = repoRegistry.get(req.params.id);
  if (!repo) return res.status(404).json({ error: 'Repository not found.' });

  const { components, technologies } = repo.analysis;
  const isJava = technologies.frameworks.includes('Spring Boot') || technologies.languages.includes('Java / Maven');

  const modules = [];

  // 1. Employee Management Module (if present)
  const empCtrl = (components.restControllers || []).find(c => c && (c.className || c.name || c.file || '').toLowerCase().includes('employee'));
  if (empCtrl) {
    modules.push({
      id: 'employee',
      name: 'Employee Management',
      badge: 'CORE DOMAIN',
      color: '#6366f1',
      responsibility: 'Encapsulates the end-to-end personnel lifecycle, salary compensation tracking, department assignments, and paginated directory queries with admin mutation guards.',
      layers: {
        controller: {
          file: empCtrl.file,
          className: empCtrl.className || 'EmployeeController',
          endpointCount: empCtrl.endpointCount || 0,
          endpoints: empCtrl.endpoints || []
        },
        dto: {
          file: (components.dtos || []).find(d => d && (d.name || d.className || d.file || '').toLowerCase().includes('employee'))?.file || 'backend/src/main/java/com/repomind/enterprise/dto/EmployeeRequestDTO.java',
          className: 'EmployeeRequestDTO',
          validations: ['@NotBlank firstName', '@NotBlank lastName', '@Email @NotBlank email', '@Positive @NotNull salary']
        },
        service: {
          file: (components.serviceClasses || []).find(s => s && (s.className || s.file || '').toLowerCase().includes('employee'))?.file || 'backend/src/main/java/com/repomind/enterprise/service/EmployeeServiceImpl.java',
          className: 'EmployeeServiceImpl',
          methods: ['getAllEmployees(Pageable)', 'getEmployeeById(Long)', 'create(EmployeeRequestDTO)', 'update(Long, EmployeeRequestDTO)', 'delete(Long)']
        },
        repository: {
          file: (components.repositoryDaoClasses || []).find(r => r && (r.className || r.file || '').toLowerCase().includes('employee'))?.file || 'backend/src/main/java/com/repomind/enterprise/repository/EmployeeRepository.java',
          className: 'EmployeeRepository',
          methods: ['findAll(Pageable)', 'findByDepartmentId(Long)', 'findByEmail(String)']
        },
        entity: {
          file: (components.databaseEntities || []).find(e => e && (e.className || e.entityName || e.file || '').toLowerCase().includes('employee'))?.file || 'backend/src/main/java/com/repomind/enterprise/entity/Employee.java',
          entityName: 'Employee',
          table: 'employees',
          relationships: ['@ManyToOne(fetch = FetchType.LAZY) Department department']
        },
        frontend: {
          file: (components.frontendCode || []).find(f => f && (f.file || '').includes('Dashboard'))?.file || 'frontend/src/pages/Dashboard.jsx',
          componentName: 'Dashboard',
          features: ['Server-side pagination table', 'Dynamic search keyword filter', 'Modal create/edit dialogs', 'Delete confirmation modal']
        }
      },
      requestFlow: [
        '1. User enters employee information in frontend/src/pages/Dashboard.jsx and clicks Submit.',
        '2. Axios client in frontend/src/services/api.js fires POST /api/v1/employees attaching Bearer JWT.',
        '3. JwtAuthenticationFilter verifies token signature, loads user authorities, and sets SecurityContextHolder.',
        '4. EmployeeController.createEmployee() receives @Valid @RequestBody EmployeeRequestDTO dto.',
        '5. Method security @PreAuthorize("hasRole(\'ADMIN\')") validates administrative clearance.',
        '6. EmployeeServiceImpl.create() verifies email uniqueness, links Department entity, and invokes repository.',
        '7. EmployeeRepository persists row into PostgreSQL table employees via Spring Data JPA.',
        '8. Controller returns HTTP 201 CREATED with JSON entity; React client updates DOM without full page refresh.'
      ],
      securityRules: [
        'GET endpoints accessible to authenticated users (ROLE_USER, ROLE_ADMIN).',
        'POST, PUT, DELETE endpoints strictly restricted to ROLE_ADMIN via @PreAuthorize.',
        'Mandatory Jakarta Bean Validation on incoming DTOs preventing malformed or negative compensation values.'
      ],
      wiringGuide: `It can be done right here in this component by doing this:\n1. Place your new controller class in the dedicated controller directory: \`backend/src/main/java/com/repomind/enterprise/controller/EmployeeController.java\`.\n2. Wire its security permissions in \`SecurityConfig.java\` inside \`securityFilterChain\` bean: \`.requestMatchers("/api/v1/employees/**").authenticated()\`.\n3. Inject the corresponding business service \`EmployeeService\` using Lombok \`@RequiredArgsConstructor\`.\n4. Connect client-side communication in \`frontend/src/services/api.js\` by exporting \`employeeApi\`.`,
      boilerplateCode: `package com.repomind.enterprise.controller;\n\nimport com.repomind.enterprise.dto.EmployeeRequestDTO;\nimport com.repomind.enterprise.entity.Employee;\nimport com.repomind.enterprise.service.EmployeeService;\nimport jakarta.validation.Valid;\nimport lombok.RequiredArgsConstructor;\nimport org.springframework.data.domain.Page;\nimport org.springframework.data.domain.PageRequest;\nimport org.springframework.http.HttpStatus;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.security.access.prepost.PreAuthorize;\nimport org.springframework.web.bind.annotation.*;\n\n@RestController\n@RequestMapping("/api/v1/employees")\n@RequiredArgsConstructor\n@CrossOrigin(origins = "*")\npublic class EmployeeController {\n\n    private final EmployeeService employeeService;\n\n    @GetMapping\n    public ResponseEntity<Page<Employee>> getAllEmployees(\n            @RequestParam(defaultValue = "0") int page,\n            @RequestParam(defaultValue = "10") int size) {\n        return ResponseEntity.ok(employeeService.getAllEmployees(PageRequest.of(page, size)));\n    }\n\n    @PostMapping\n    @PreAuthorize("hasRole('ADMIN')")\n    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody EmployeeRequestDTO dto) {\n        return new ResponseEntity<>(employeeService.create(dto), HttpStatus.CREATED);\n    }\n}`,
      improvements: [
        {
          title: 'Performance: Redis Second-Level Read Cache',
          type: 'PERFORMANCE',
          badge: 'HIGH IMPACT',
          description: 'Decorate getEmployeeById() with @Cacheable(value = "employees", key = "#id") to eliminate repetitive database queries, reducing query response times by up to 90%.',
          code: `@Cacheable(value = "employees", key = "#id")\npublic Employee getEmployeeById(Long id) {\n    return employeeRepository.findById(id)\n        .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));\n}`
        },
        {
          title: 'Performance: Composite Database Index for Salary Ordering',
          type: 'PERFORMANCE',
          badge: 'DATABASE',
          description: 'Add composite index on (department_id, salary DESC) in Flyway migration V2 to avoid full table scans during departmental compensation audits.',
          code: `CREATE INDEX idx_emp_dept_salary ON employees (department_id, salary DESC);`
        },
        {
          title: 'Compliance: Automated JPA Audit Logging',
          type: 'ARCHITECTURE',
          badge: 'COMPLIANCE',
          description: 'Enable Spring JPA Auditing (@EnableJpaAuditing) and add @CreatedDate, @LastModifiedDate, and @CreatedBy to track all personnel compensation modifications.',
          code: `@EntityListeners(AuditingEntityListener.class)\npublic class Employee {\n    @CreatedDate\n    private Instant createdAt;\n    @LastModifiedDate\n    private Instant updatedAt;\n}`
        },
        {
          title: 'Quality: MockMvc Controller Slice Tests',
          type: 'TESTING',
          badge: 'AUTOMATION',
          description: 'Add WebMvcTest test cases asserting that validation constraints reject negative salaries or invalid email formats with HTTP 400 Bad Request.',
          code: `@WebMvcTest(EmployeeController.class)\nclass EmployeeControllerTest {\n    @Autowired private MockMvc mockMvc;\n    // Verify 400 on malformed email\n}`
        }
      ]
    });
  }

  // 2. Authentication & Security Module
  const authCtrl = (components.restControllers || []).find(c => c && (c.className || c.file || '').toLowerCase().includes('auth'));
  if (authCtrl) {
    modules.push({
      id: 'auth',
      name: 'Authentication & Security',
      badge: 'SECURITY',
      color: '#10b981',
      responsibility: 'Manages user registration, credential authentication, stateless JWT signing with HMAC-SHA256, BCrypt password hashing, and role-based access control.',
      layers: {
        controller: {
          file: authCtrl.file,
          className: authCtrl.className || 'AuthController',
          endpointCount: authCtrl.endpointCount || 0,
          endpoints: authCtrl.endpoints || []
        },
        dto: {
          file: (components.dtos || []).find(d => d && ((d.name || d.className || d.file || '').toLowerCase().includes('login') || (d.name || d.className || d.file || '').toLowerCase().includes('auth')))?.file || 'backend/src/main/java/com/repomind/enterprise/dto/LoginRequestDTO.java',
          className: 'LoginRequestDTO / AuthResponseDTO',
          validations: ['@NotBlank username', '@NotBlank @Size(min=6) password']
        },
        service: {
          file: (components.serviceClasses || []).find(s => s && (s.className || s.file || '').toLowerCase().includes('auth'))?.file || 'backend/src/main/java/com/repomind/enterprise/service/AuthService.java',
          className: 'AuthService',
          methods: ['login(LoginRequestDTO)', 'register(RegisterRequestDTO)', 'generateToken(UserDetails)']
        },
        repository: {
          file: (components.repositoryDaoClasses || []).find(r => r && (r.className || r.file || '').toLowerCase().includes('user'))?.file || 'backend/src/main/java/com/repomind/enterprise/repository/UserRepository.java',
          className: 'UserRepository',
          methods: ['findByUsername(String)', 'existsByUsername(String)', 'existsByEmail(String)']
        },
        entity: {
          file: (components.databaseEntities || []).find(e => e && (e.className || e.entityName || e.file || '').toLowerCase().includes('user'))?.file || 'backend/src/main/java/com/repomind/enterprise/entity/User.java',
          entityName: 'User',
          table: 'users',
          relationships: ['UserDetails implementation, Authorities granted by role']
        },
        frontend: {
          file: (components.frontendCode || []).find(f => f && (f.file || '').includes('Login'))?.file || 'frontend/src/pages/Login.jsx',
          componentName: 'Login',
          features: ['Credentials form submission', 'JWT token storage in localStorage', 'Redirection to dashboard']
        }
      },
      requestFlow: [
        '1. User enters username and password in frontend/src/pages/Login.jsx.',
        '2. Axios client invokes authApi.login() dispatching POST /api/v1/auth/login.',
        '3. SecurityConfig allows public access via .requestMatchers("/auth/**").permitAll().',
        '4. AuthController.login() calls AuthService.login().',
        '5. AuthenticationManager validates credentials against BCrypt hash in PostgreSQL users table.',
        '6. JwtService.generateToken() mints signed HMAC-SHA256 token containing username and roles.',
        '7. Client stores token in localStorage and attaches Authorization: Bearer header on future requests.'
      ],
      securityRules: [
        'Public access permitted exclusively for /api/v1/auth/login and /register.',
        'All other endpoints require valid signature and non-expired timestamp checked by JwtAuthenticationFilter.',
        'Passwords hashed with BCrypt (strength 10) before persistence; plaintext passwords never logged or stored.'
      ],
      wiringGuide: `It can be done right here in this component by doing this:\n1. Configure session management to stateless in: \`backend/src/main/java/com/repomind/enterprise/config/SecurityConfig.java\`.\n2. Add the JWT filter by doing: \`.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)\`.\n3. Create \`JwtService.java\` in \`config\` package to handle HMAC-SHA256 signing.\n4. In \`AuthService.java\`, inject \`JwtService\` and return signed token upon successful login.`,
      boilerplateCode: `package com.repomind.enterprise.controller;\n\nimport com.repomind.enterprise.dto.AuthResponseDTO;\nimport com.repomind.enterprise.dto.LoginRequestDTO;\nimport com.repomind.enterprise.dto.RegisterRequestDTO;\nimport com.repomind.enterprise.service.AuthService;\nimport jakarta.validation.Valid;\nimport lombok.RequiredArgsConstructor;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\n\n@RestController\n@RequestMapping("/api/v1/auth")\n@RequiredArgsConstructor\n@CrossOrigin(origins = "*")\npublic class AuthController {\n\n    private final AuthService authService;\n\n    @PostMapping("/login")\n    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {\n        return ResponseEntity.ok(authService.login(request));\n    }\n\n    @PostMapping("/register")\n    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {\n        return ResponseEntity.ok(authService.register(request));\n    }\n}`,
      improvements: [
        {
          title: 'Security: IP Rate Limiting on Login & Registration',
          type: 'SECURITY',
          badge: 'CRITICAL',
          description: 'Introduce Bucket4j or Redis token bucket filter to limit 5 authentication attempts per IP per minute, mitigating brute-force credential attacks.',
          code: `// Rate Limiter Filter\nif (!bucket.tryConsume(1)) {\n    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());\n    return;\n}`
        },
        {
          title: 'Security: Environment Secret Externalization',
          type: 'SECURITY',
          badge: 'CONFIDENTIALITY',
          description: 'Extract hardcoded JWT secret from application.yml into ${JWT_SECRET_KEY} environment variable to prevent secret leakage in source repositories.',
          code: `app:\n  jwt:\n    secret: \${JWT_SECRET_KEY}\n    expiration-ms: 86400000`
        },
        {
          title: 'Architecture: Refresh Token Rotation with Redis',
          type: 'ARCHITECTURE',
          badge: 'STATELESS',
          description: 'Issue short-lived access tokens (15m) alongside persistent refresh tokens (7d) stored in Redis with revocation capability on logout.',
          code: `public TokenPair refreshToken(String refreshToken) {\n    // Validate in Redis and rotate\n}`
        }
      ]
    });
  }

  // 3. Department & Organization Module
  const deptCtrl = (components.restControllers || []).find(c => c && (c.className || c.file || '').toLowerCase().includes('department'));
  if (deptCtrl) {
    modules.push({
      id: 'department',
      name: 'Department Directory',
      badge: 'ORGANIZATION',
      color: '#06b6d4',
      responsibility: 'Manages organizational business units, department hierarchies, and parent-child entity mappings with employee personnel.',
      layers: {
        controller: {
          file: deptCtrl.file,
          className: deptCtrl.className || 'DepartmentController',
          endpointCount: deptCtrl.endpointCount || 0,
          endpoints: deptCtrl.endpoints || []
        },
        dto: {
          file: (components.dtos || []).find(d => d && (d.name || d.className || d.file || '').toLowerCase().includes('department'))?.file || 'backend/src/main/java/com/repomind/enterprise/dto/DepartmentRequestDTO.java',
          className: 'DepartmentRequestDTO',
          validations: ['@NotBlank name', '@NotBlank code']
        },
        service: {
          file: (components.serviceClasses || []).find(s => s && (s.className || s.file || '').toLowerCase().includes('department'))?.file || 'backend/src/main/java/com/repomind/enterprise/service/DepartmentService.java',
          className: 'DepartmentService',
          methods: ['getAllDepartments()', 'getDepartmentById(Long)', 'create(DepartmentRequestDTO)']
        },
        repository: {
          file: (components.repositoryDaoClasses || []).find(r => r && (r.className || r.file || '').toLowerCase().includes('department'))?.file || 'backend/src/main/java/com/repomind/enterprise/repository/DepartmentRepository.java',
          className: 'DepartmentRepository',
          methods: ['findAll()', 'findByCode(String)']
        },
        entity: {
          file: (components.databaseEntities || []).find(e => e && (e.className || e.entityName || e.file || '').toLowerCase().includes('department'))?.file || 'backend/src/main/java/com/repomind/enterprise/entity/Department.java',
          entityName: 'Department',
          table: 'departments',
          relationships: ['@OneToMany(mappedBy = "department", fetch = FetchType.LAZY) List<Employee> employees']
        },
        frontend: {
          file: (components.frontendCode || []).find(f => f && (f.file || '').includes('Dashboard'))?.file || 'frontend/src/pages/Dashboard.jsx',
          componentName: 'Dashboard',
          features: ['Department filter dropdown', 'Department assignment selector in employee modal']
        }
      },
      requestFlow: [
        '1. Dashboard loads department list on initial render to populate select dropdowns.',
        '2. Axios sends GET /api/v1/departments with Authorization Bearer token.',
        '3. DepartmentController invokes DepartmentService.getAllDepartments().',
        '4. DepartmentRepository fetches rows from departments table.',
        '5. Returned list binds to React state and options are populated.'
      ],
      securityRules: [
        'Read operations available to authenticated users.',
        'Department creations restricted to ROLE_ADMIN.'
      ],
      wiringGuide: `It can be done right here in this component by doing this:\n1. Place your new controller in: \`backend/src/main/java/com/repomind/enterprise/controller/DepartmentController.java\`.\n2. In \`SecurityConfig.java\`, add authorization matchers: \`.requestMatchers("/api/v1/departments/**").authenticated()\`.\n3. Inject \`DepartmentService\` into the controller constructor.`,
      boilerplateCode: `package com.repomind.enterprise.controller;\n\nimport com.repomind.enterprise.entity.Department;\nimport com.repomind.enterprise.service.DepartmentService;\nimport lombok.RequiredArgsConstructor;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\n\n@RestController\n@RequestMapping("/api/v1/departments")\n@RequiredArgsConstructor\n@CrossOrigin(origins = "*")\npublic class DepartmentController {\n    private final DepartmentService departmentService;\n\n    @GetMapping\n    public ResponseEntity<List<Department>> getAll() {\n        return ResponseEntity.ok(departmentService.getAllDepartments());\n    }\n}`,
      improvements: [
        {
          title: 'Optimization: Second-Level Cache for Departments',
          type: 'PERFORMANCE',
          badge: 'READ-HEAVY',
          description: 'Because department metadata changes rarely, cache the department list in memory with @Cacheable(value = "departments") to avoid redundant database reads.',
          code: `@Cacheable(value = "departments")\npublic List<Department> getAllDepartments() {\n    return departmentRepository.findAll();\n}`
        }
      ]
    });
  }

  // 4. Node SaaS Subscription / Tenant Module (if present)
  const subCtrl = (components.restControllers || []).find(c => c && ((c.file || '').includes('subscription') || (c.file || '').includes('tenant')));
  if (subCtrl) {
    modules.push({
      id: 'subscription',
      name: 'Subscription & Billing',
      badge: 'SAAS BILLING',
      color: '#f59e0b',
      responsibility: 'Multi-tenant subscription tiers, Stripe customer checkout session creation, webhook lifecycle synchronization, and invoice tracking.',
      layers: {
        controller: {
          file: subCtrl.file,
          className: path.basename(subCtrl.file),
          endpointCount: subCtrl.endpointCount,
          endpoints: subCtrl.endpoints
        },
        dto: {
          file: 'src/schemas/subscription.schema.ts',
          className: 'CreateCheckoutSchema',
          validations: ['zod validation for planId and billingCycle']
        },
        service: {
          file: 'src/services/subscription.service.ts',
          className: 'SubscriptionService',
          methods: ['createCheckoutSession()', 'handleWebhook()', 'getTenantSubscription()']
        },
        repository: {
          file: 'src/repositories/subscription.repo.ts',
          className: 'Prisma Client',
          methods: ['prisma.subscription.findUnique()', 'prisma.subscription.upsert()']
        },
        entity: {
          file: 'prisma/schema.prisma',
          entityName: 'Subscription / Tenant',
          table: 'subscriptions',
          relationships: ['Tenant hasMany Subscriptions, Subscription hasMany Invoices']
        },
        frontend: {
          file: 'client/src/components/SubscriptionDashboard.jsx',
          componentName: 'SubscriptionDashboard',
          features: ['Tier selection cards', 'Upgrade/Downgrade button', 'Invoice history table']
        }
      },
      requestFlow: [
        '1. Tenant administrator clicks Upgrade Plan in SubscriptionDashboard.jsx.',
        '2. Client sends POST /api/v1/subscriptions/checkout-session with JWT.',
        '3. Express subscription router invokes Stripe SDK to create checkout session.',
        '4. Stripe returns hosted checkout URL; client is redirected.',
        '5. Upon payment completion, Stripe dispatches invoice.payment_succeeded to /api/v1/webhooks/stripe.',
        '6. Webhook handler updates tenant plan tier in Prisma database.'
      ],
      securityRules: [
        'Webhooks require raw body signature validation using Stripe.webhooks.constructEvent().',
        'Checkout endpoints require tenant ownership verification in JWT claims.'
      ],
      wiringGuide: `It can be done right here in this component by doing this:\n1. Place your new controller in: \`src/controllers/subscription.controller.ts\`.\n2. In \`server.ts\`, register: \`app.use('/api/v1/subscriptions', subscriptionRouter)\`.\n3. Wrap routes with \`authenticateJwt\` middleware.\n4. Call Stripe SDK and Prisma client in \`subscription.service.ts\`.`,
      boilerplateCode: `import { Router, Response } from 'express';\nimport { authenticateJwt, AuthenticatedRequest } from '../middlewares/auth.middleware';\n\nconst router = Router();\nrouter.get('/status', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {\n  return res.json({ status: 'ACTIVE', tenantId: req.tenantId });\n});\nexport const subscriptionRouter = router;`,
      improvements: [
        {
          title: 'Resilience: Stripe Webhook Idempotency',
          type: 'RESILIENCE',
          badge: 'FINANCIAL',
          description: 'Store processed Stripe event IDs in Redis or database to prevent duplicate plan activations or double billing on webhook retries.',
          code: `const processed = await redis.set(\`webhook:\${event.id}\`, '1', 'EX', 86400, 'NX');\nif (!processed) return res.status(200).send('Already processed');`
        }
      ]
    });
  }

  res.json({
    repositoryId: repo.id,
    totalModules: modules.length,
    modules
  });
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
