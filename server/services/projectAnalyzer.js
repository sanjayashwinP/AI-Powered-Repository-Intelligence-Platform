import fs from 'fs';
import path from 'path';

// Ignore patterns for directory traversal
const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'target', '.idea', '.vscode',
  '__pycache__', '.next', '.nuxt', 'coverage', '.pytest_cache', 'vendor'
]);

const IGNORED_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'
]);

export function scanRepositoryFiles(rootDir) {
  const fileList = [];

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
          walk(path.join(currentDir, entry.name));
        }
      } else if (entry.isFile()) {
        if (!IGNORED_FILES.has(entry.name)) {
          const fullPath = path.join(currentDir, entry.name);
          const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
          const ext = path.extname(entry.name).toLowerCase();
          const stats = fs.statSync(fullPath);
          fileList.push({
            name: entry.name,
            path: relativePath,
            fullPath,
            extension: ext,
            size: stats.size
          });
        }
      }
    }
  }

  walk(rootDir);
  return fileList;
}

export function analyzeProject(rootDir) {
  const files = scanRepositoryFiles(rootDir);
  
  // 1. Language and File Analysis
  const languageStats = {};
  let totalLines = 0;
  const fileContents = new Map();

  for (const file of files) {
    try {
      // Only read text files under 2MB
      if (file.size < 2 * 1024 * 1024) {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        const lines = content.split('\n');
        file.lineCount = lines.length;
        file.content = content;
        fileContents.set(file.path, { content, lines });
        totalLines += lines.length;

        const lang = getLanguageFromExt(file.extension, file.name);
        languageStats[lang] = (languageStats[lang] || 0) + lines.length;
      }
    } catch (e) {
      console.warn(`Could not read ${file.path}: ${e.message}`);
    }
  }

  // 2. Identify Technologies & Frameworks Automatically
  const technologies = detectTechnologies(files, fileContents);

  // 3. Analyze the 15 Required Architectural Components
  const components = {
    frontendCode: analyzeFrontend(files, fileContents),
    backendCode: analyzeBackend(files, fileContents),
    restControllers: analyzeControllers(files, fileContents),
    serviceClasses: analyzeServices(files, fileContents),
    repositoryDaoClasses: analyzeRepositories(files, fileContents),
    databaseEntities: analyzeEntities(files, fileContents),
    dtos: analyzeDTOs(files, fileContents),
    securityConfig: analyzeSecurityConfig(files, fileContents),
    authAndAuthz: analyzeAuth(files, fileContents),
    configFiles: analyzeConfigFiles(files, fileContents),
    dbSchemaAndMigrations: analyzeMigrations(files, fileContents),
    dependencies: analyzeDependencies(files, fileContents),
    tests: analyzeTests(files, fileContents),
    documentation: analyzeDocs(files, fileContents),
    buildAndDeployment: analyzeBuildDeployment(files, fileContents)
  };

  // 4. Synthesize Architecture Summary
  const architecture = summarizeArchitecture(technologies, components, files.length, totalLines);

  return {
    rootDir,
    fileCount: files.length,
    totalLines,
    languageStats,
    technologies,
    architecture,
    components,
    files: files.map(f => ({
      name: f.name,
      path: f.path,
      extension: f.extension,
      size: f.size,
      lineCount: f.lineCount || 0
    }))
  };
}

function getLanguageFromExt(ext, filename) {
  if (filename === 'Dockerfile') return 'Dockerfile';
  if (filename === 'docker-compose.yml' || filename === 'docker-compose.yaml') return 'Docker Compose';
  switch (ext) {
    case '.java': return 'Java';
    case '.js': case '.mjs': case '.cjs': return 'JavaScript';
    case '.jsx': return 'React JSX';
    case '.ts': return 'TypeScript';
    case '.tsx': return 'React TSX';
    case '.py': return 'Python';
    case '.go': return 'Go';
    case '.rs': return 'Rust';
    case '.sql': return 'SQL';
    case '.html': return 'HTML';
    case '.css': return 'CSS';
    case '.scss': return 'SCSS';
    case '.json': return 'JSON';
    case '.yml': case '.yaml': return 'YAML';
    case '.xml': return 'XML';
    case '.md': return 'Markdown';
    case '.vue': return 'Vue';
    default: return ext ? ext.substring(1).toUpperCase() : 'Other';
  }
}

function detectTechnologies(files, fileContents) {
  const techs = new Set();
  const frameworks = new Set();
  const databases = new Set();
  const security = new Set();
  const devops = new Set();

  for (const file of files) {
    const p = file.path.toLowerCase();
    const data = fileContents.get(file.path);
    const content = data ? data.content : '';

    // Frameworks & Libraries
    if (p.endsWith('pom.xml')) {
      techs.add('Java / Maven');
      if (content.includes('spring-boot-starter-web')) frameworks.add('Spring Boot');
      if (content.includes('spring-boot-starter-security')) security.add('Spring Security');
      if (content.includes('spring-boot-starter-data-jpa')) databases.add('Spring Data JPA / Hibernate');
      if (content.includes('postgresql')) databases.add('PostgreSQL');
      if (content.includes('mysql')) databases.add('MySQL');
      if (content.includes('flyway')) databases.add('Flyway Migrations');
      if (content.includes('jjwt')) security.add('JJWT (JSON Web Token)');
      if (content.includes('junit')) frameworks.add('JUnit 5');
    }

    if (p.endsWith('package.json')) {
      techs.add('Node.js / npm');
      if (content.includes('"react"')) frameworks.add('React');
      if (content.includes('"vue"')) frameworks.add('Vue.js');
      if (content.includes('"express"')) frameworks.add('Express.js');
      if (content.includes('"@nestjs/core"')) frameworks.add('NestJS');
      if (content.includes('"@prisma/client"') || content.includes('"prisma"')) databases.add('Prisma ORM');
      if (content.includes('"stripe"')) frameworks.add('Stripe API');
      if (content.includes('"ioredis"') || content.includes('"redis"')) databases.add('Redis');
      if (content.includes('"jsonwebtoken"')) security.add('JWT');
      if (content.includes('"bcrypt"') || content.includes('"bcryptjs"')) security.add('BCrypt');
      if (content.includes('"jest"')) frameworks.add('Jest');
      if (content.includes('"vite"')) devops.add('Vite');
    }

    if (p.endsWith('requirements.txt') || p.endsWith('pyproject.toml')) {
      techs.add('Python');
      if (content.includes('fastapi')) frameworks.add('FastAPI');
      if (content.includes('flask')) frameworks.add('Flask');
      if (content.includes('django')) frameworks.add('Django');
      if (content.includes('sqlalchemy')) databases.add('SQLAlchemy ORM');
      if (content.includes('celery')) frameworks.add('Celery (Async Tasks)');
      if (content.includes('redis')) databases.add('Redis');
      if (content.includes('alembic')) databases.add('Alembic Migrations');
      if (content.includes('pytest')) frameworks.add('PyTest');
      if (content.includes('passlib') || content.includes('bcrypt')) security.add('Passlib / BCrypt');
      if (content.includes('pyjwt') || content.includes('jwt')) security.add('PyJWT');
    }

    if (file.name === 'Dockerfile') devops.add('Docker');
    if (file.name.includes('docker-compose')) devops.add('Docker Compose');
    if (p.includes('.github/workflows')) devops.add('GitHub Actions CI/CD');
    if (p.endsWith('.prisma')) databases.add('Prisma ORM');
  }

  return {
    languages: Array.from(techs),
    frameworks: Array.from(frameworks),
    databases: Array.from(databases),
    security: Array.from(security),
    devops: Array.from(devops)
  };
}

function analyzeFrontend(files, fileContents) {
  const items = [];
  for (const file of files) {
    const p = file.path.toLowerCase();
    if (
      p.includes('frontend/') || p.includes('client/') || p.includes('src/components/') ||
      p.includes('src/pages/') || p.includes('src/views/') ||
      file.extension === '.jsx' || file.extension === '.tsx' || file.extension === '.vue' ||
      (file.extension === '.js' && p.includes('components/'))
    ) {
      const data = fileContents.get(file.path);
      const lines = data ? data.lines : [];
      let componentName = file.name.replace(/\.[^/.]+$/, '');
      let type = 'Component';
      if (p.includes('/pages/') || p.includes('/views/')) type = 'Page / View';
      if (p.includes('/services/') || p.includes('/api/')) type = 'API Client';
      if (p.includes('/hooks/')) type = 'Custom Hook';

      items.push({
        file: file.path,
        name: componentName,
        type,
        lineCount: file.lineCount || lines.length,
        description: `Frontend ${type} implemented in ${file.name}`
      });
    }
  }
  return items;
}

function analyzeBackend(files, fileContents) {
  const items = [];
  for (const file of files) {
    const p = file.path.toLowerCase();
    if (
      (p.includes('backend/') || p.includes('server/') || p.includes('app/') || p.includes('src/')) &&
      (file.extension === '.java' || file.extension === '.ts' || file.extension === '.py' || file.extension === '.js') &&
      !p.includes('test') && !p.includes('frontend') && !p.includes('client')
    ) {
      const data = fileContents.get(file.path);
      const content = data ? data.content : '';
      if (
        content.includes('main(') || content.includes('app.listen') || content.includes('FastAPI(') ||
        content.includes('@SpringBootApplication') || content.includes('express()')
      ) {
        items.push({
          file: file.path,
          name: file.name,
          role: 'Backend Entry Point & App Config',
          lineCount: file.lineCount,
          description: `Core server setup in ${file.name}`
        });
      }
    }
  }
  return items;
}

function analyzeControllers(files, fileContents) {
  const controllers = [];
  for (const file of files) {
    const data = fileContents.get(file.path);
    if (!data) continue;
    const { content, lines } = data;

    // Java Spring Controllers
    if (content.includes('@RestController') || content.includes('@Controller')) {
      const classMatch = content.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      const className = classMatch ? classMatch[1] : file.name;
      const baseRouteMatch = content.match(/@RequestMapping\(\s*["']([^"']+)["']\s*\)/);
      const baseRoute = baseRouteMatch ? baseRouteMatch[1] : '';

      const endpoints = [];
      lines.forEach((line, idx) => {
        const epMatch = line.match(/@(Get|Post|Put|Delete|Patch)Mapping(?:\(\s*["']?([^"')\s]*)["']?\s*\))?/i);
        if (epMatch) {
          const method = epMatch[1].toUpperCase();
          const subPath = epMatch[2] || '';
          const fullPath = (baseRoute + (subPath.startsWith('/') ? subPath : '/' + subPath)).replace(/\/+/g, '/');
          
          // Next line usually contains method definition
          const nextLines = lines.slice(idx, idx + 4).join(' ');
          const methodDefMatch = nextLines.match(/(?:public|protected|private)?\s*(?:ResponseEntity<[^>]+>|[\w<>]+)\s+([a-zA-Z0-9_]+)\s*\(/);
          const methodName = methodDefMatch ? methodDefMatch[1] : 'handlerMethod';

          endpoints.push({
            method,
            path: fullPath || '/',
            handler: methodName,
            lineNumber: idx + 1
          });
        }
      });

      controllers.push({
        file: file.path,
        className,
        baseRoute,
        endpointCount: endpoints.length,
        endpoints
      });
    }

    // Express / Node Routers
    if (content.includes('Router(') || (content.includes('router.') && (file.path.includes('controller') || file.path.includes('route')))) {
      const endpoints = [];
      lines.forEach((line, idx) => {
        const routeMatch = line.match(/router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/i);
        if (routeMatch) {
          endpoints.push({
            method: routeMatch[1].toUpperCase(),
            path: routeMatch[2],
            handler: `routeHandler_L${idx + 1}`,
            lineNumber: idx + 1
          });
        }
      });

      if (endpoints.length > 0) {
        controllers.push({
          file: file.path,
          className: file.name.replace(/\.[^/.]+$/, ''),
          baseRoute: '',
          endpointCount: endpoints.length,
          endpoints
        });
      }
    }

    // Python FastAPI Routers
    if (content.includes('APIRouter(') || (content.includes('@router.') || content.includes('@app.'))) {
      const endpoints = [];
      lines.forEach((line, idx) => {
        const epMatch = line.match(/@(router|app)\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/i);
        if (epMatch) {
          const method = epMatch[2].toUpperCase();
          const subPath = epMatch[3];
          const nextLines = lines.slice(idx, idx + 3).join(' ');
          const funcMatch = nextLines.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
          endpoints.push({
            method,
            path: subPath,
            handler: funcMatch ? funcMatch[1] : 'endpoint_handler',
            lineNumber: idx + 1
          });
        }
      });

      if (endpoints.length > 0) {
        controllers.push({
          file: file.path,
          className: file.name.replace(/\.[^/.]+$/, ''),
          baseRoute: '',
          endpointCount: endpoints.length,
          endpoints
        });
      }
    }
  }
  return controllers;
}

function analyzeServices(files, fileContents) {
  const services = [];
  for (const file of files) {
    const data = fileContents.get(file.path);
    if (!data) continue;
    const { content, lines } = data;

    // Java Spring Services
    if (content.includes('@Service') || (file.name.endsWith('Service.java') && content.includes('interface '))) {
      const isInterface = content.includes('public interface ');
      const classMatch = content.match(/public\s+(?:interface|class)\s+([A-Za-z0-9_]+)/);
      const className = classMatch ? classMatch[1] : file.name;

      const methods = [];
      lines.forEach((line, idx) => {
        const mMatch = line.match(/public\s+(?:[A-Za-z0-9_<>]+)\s+([a-zA-Z0-9_]+)\s*\(/);
        if (mMatch && !mMatch[1].startsWith('set') && !mMatch[1].startsWith('get') && mMatch[1] !== className) {
          methods.push({ name: mMatch[1], lineNumber: idx + 1 });
        }
      });

      services.push({
        file: file.path,
        className,
        type: isInterface ? 'Service Interface' : 'Service Implementation',
        methods
      });
    }

    // TypeScript / Node Service Classes
    if (file.path.includes('service') && (file.extension === '.ts' || file.extension === '.js')) {
      const classMatch = content.match(/class\s+([A-Za-z0-9_]+)/);
      if (classMatch) {
        const methods = [];
        lines.forEach((line, idx) => {
          const mMatch = line.match(/(?:static\s+async|async|static)?\s*([a-zA-Z0-9_]+)\s*\(/);
          if (mMatch && mMatch[1] !== 'constructor' && !mMatch[1].startsWith('if') && mMatch[1] !== classMatch[1]) {
            methods.push({ name: mMatch[1], lineNumber: idx + 1 });
          }
        });

        services.push({
          file: file.path,
          className: classMatch[1],
          type: 'TypeScript Service Module',
          methods
        });
      }
    }
  }
  return services;
}

function analyzeRepositories(files, fileContents) {
  const repos = [];
  for (const file of files) {
    const data = fileContents.get(file.path);
    if (!data) continue;
    const { content, lines } = data;

    // Java Spring Data JPA Repositories
    if (content.includes('@Repository') || content.includes('extends JpaRepository') || content.includes('extends CrudRepository')) {
      const classMatch = content.match(/public\s+interface\s+([A-Za-z0-9_]+)/);
      const className = classMatch ? classMatch[1] : file.name;
      
      const customQueries = [];
      lines.forEach((line, idx) => {
        if (line.includes('@Query')) {
          customQueries.push({ line: line.trim(), lineNumber: idx + 1 });
        }
      });

      repos.push({
        file: file.path,
        className,
        type: 'Spring Data JPA Repository',
        customQueriesCount: customQueries.length,
        customQueries
      });
    }

    // Prisma Schema file
    if (file.name.endsWith('.prisma')) {
      repos.push({
        file: file.path,
        className: 'Prisma Client Schema',
        type: 'Prisma Data Access',
        customQueriesCount: 0,
        customQueries: []
      });
    }

    // SQLAlchemy / DAO Python
    if (file.path.includes('db') || file.path.includes('repository')) {
      if (content.includes('Session') && content.includes('query(')) {
        repos.push({
          file: file.path,
          className: file.name.replace(/\.[^/.]+$/, ''),
          type: 'SQLAlchemy / DB DAO Module',
          customQueriesCount: 0,
          customQueries: []
        });
      }
    }
  }
  return repos;
}

function analyzeEntities(files, fileContents) {
  const entities = [];
  for (const file of files) {
    const data = fileContents.get(file.path);
    if (!data) continue;
    const { content, lines } = data;

    // Java JPA Entities
    if (content.includes('@Entity')) {
      const classMatch = content.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      const className = classMatch ? classMatch[1] : file.name;
      const tableMatch = content.match(/@Table\(\s*name\s*=\s*["']([^"']+)["']/);
      const tableName = tableMatch ? tableMatch[1] : className.toLowerCase();

      const relationships = [];
      const fields = [];

      lines.forEach((line, idx) => {
        if (line.includes('@OneToMany')) relationships.push({ type: 'OneToMany', lineNumber: idx + 1 });
        if (line.includes('@ManyToOne')) relationships.push({ type: 'ManyToOne', lineNumber: idx + 1 });
        if (line.includes('@ManyToMany')) relationships.push({ type: 'ManyToMany', lineNumber: idx + 1 });
        if (line.includes('@OneToOne')) relationships.push({ type: 'OneToOne', lineNumber: idx + 1 });

        const fMatch = line.match(/private\s+([\w<>]+)\s+([a-zA-Z0-9_]+);/);
        if (fMatch) {
          fields.push({ type: fMatch[1], name: fMatch[2], lineNumber: idx + 1 });
        }
      });

      entities.push({
        file: file.path,
        className,
        tableName,
        fieldCount: fields.length,
        relationships,
        fields
      });
    }

    // Prisma Models
    if (file.name.endsWith('.prisma')) {
      const modelRegex = /model\s+([A-Za-z0-9_]+)\s*\{([^}]+)\}/g;
      let match;
      while ((match = modelRegex.exec(content)) !== null) {
        const modelName = match[1];
        const body = match[2];
        const bodyLines = body.trim().split('\n');
        entities.push({
          file: file.path,
          className: modelName,
          tableName: modelName.toLowerCase(),
          fieldCount: bodyLines.length,
          relationships: body.includes('@relation') ? [{ type: 'Prisma Relation' }] : [],
          fields: bodyLines.map(l => ({ name: l.trim() }))
        });
      }
    }

    // Python SQLAlchemy Models
    if (content.includes('Base = declarative_base()') || content.includes('__tablename__')) {
      const classMatch = content.match(/class\s+([A-Za-z0-9_]+)\s*\((?:Base|[A-Za-z0-9_]+)\):/);
      if (classMatch) {
        const tableMatch = content.match(/__tablename__\s*=\s*["']([^"']+)["']/);
        entities.push({
          file: file.path,
          className: classMatch[1],
          tableName: tableMatch ? tableMatch[1] : classMatch[1].toLowerCase(),
          fieldCount: 5,
          relationships: content.includes('relationship(') ? [{ type: 'SQLAlchemy Relationship' }] : [],
          fields: []
        });
      }
    }
  }
  return entities;
}

function analyzeDTOs(files, fileContents) {
  const dtos = [];
  for (const file of files) {
    const data = fileContents.get(file.path);
    if (!data) continue;
    const { content, lines } = data;

    if (
      file.path.toLowerCase().includes('dto') ||
      file.name.endsWith('DTO.java') ||
      file.name.endsWith('Request.java') ||
      file.name.endsWith('Response.java') ||
      content.includes('BaseModel') && file.extension === '.py'
    ) {
      const classMatch = content.match(/(?:public\s+class|class)\s+([A-Za-z0-9_]+)/);
      if (classMatch) {
        const hasValidation = content.includes('@NotBlank') || content.includes('@NotNull') ||
                              content.includes('@Email') || content.includes('EmailStr') ||
                              content.includes('z.object');
        dtos.push({
          file: file.path,
          name: classMatch[1],
          hasValidation,
          lineCount: file.lineCount
        });
      }
    }
  }
  return dtos;
}

function analyzeSecurityConfig(files, fileContents) {
  const secItems = [];
  for (const file of files) {
    const data = fileContents.get(file.path);
    if (!data) continue;
    const { content, lines } = data;

    if (
      content.includes('SecurityFilterChain') || content.includes('@EnableWebSecurity') ||
      file.path.includes('auth.middleware') || content.includes('jwt.verify') ||
      content.includes('SecurityContextHolder') || content.includes('CryptContext')
    ) {
      const highlights = [];
      lines.forEach((line, idx) => {
        if (
          line.includes('csrf') || line.includes('sessionManagement') ||
          line.includes('authorizeHttpRequests') || line.includes('PasswordEncoder') ||
          line.includes('jwt.verify') || line.includes('verify_password')
        ) {
          highlights.push({ line: line.trim(), lineNumber: idx + 1 });
        }
      });

      secItems.push({
        file: file.path,
        name: file.name,
        role: 'Security Configuration / Authentication Filter',
        highlights
      });
    }
  }
  return secItems;
}

function analyzeAuth(files, fileContents) {
  const authDetails = {
    registration: [],
    login: [],
    jwt: [],
    passwordHashing: [],
    rbac: []
  };

  for (const file of files) {
    const data = fileContents.get(file.path);
    if (!data) continue;
    const { content, lines } = data;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (line.includes('register') && (line.includes('PostMapping') || line.includes('router.post') || line.includes('def register'))) {
        authDetails.registration.push({ file: file.path, line: line.trim(), lineNum });
      }
      if (line.includes('login') && (line.includes('PostMapping') || line.includes('router.post') || line.includes('def login'))) {
        authDetails.login.push({ file: file.path, line: line.trim(), lineNum });
      }
      if (line.includes('Jwts.builder') || line.includes('jwt.sign') || line.includes('create_access_token')) {
        authDetails.jwt.push({ file: file.path, line: line.trim(), lineNum });
      }
      if (line.includes('BCryptPasswordEncoder') || line.includes('bcrypt.hash') || line.includes('pwd_context.hash')) {
        authDetails.passwordHashing.push({ file: file.path, line: line.trim(), lineNum });
      }
      if (line.includes('@PreAuthorize') || line.includes('ROLE_ADMIN') || line.includes('hasRole') || line.includes('req.user.role')) {
        authDetails.rbac.push({ file: file.path, line: line.trim(), lineNum });
      }
    });
  }

  return authDetails;
}

function analyzeConfigFiles(files, fileContents) {
  const configs = [];
  for (const file of files) {
    const p = file.path.toLowerCase();
    if (
      p.endsWith('.properties') || p.endsWith('.yml') || p.endsWith('.yaml') ||
      p.endsWith('.env') || p.endsWith('.env.example') || p.endsWith('.toml') ||
      p.includes('config') && (p.endsWith('.js') || p.endsWith('.ts') || p.endsWith('.json'))
    ) {
      if (!p.includes('package.json') && !p.includes('tsconfig')) {
        configs.push({
          file: file.path,
          name: file.name,
          extension: file.extension,
          size: file.size
        });
      }
    }
  }
  return configs;
}

function analyzeMigrations(files, fileContents) {
  const migrations = [];
  for (const file of files) {
    const p = file.path.toLowerCase();
    if (
      p.includes('db/migration') || p.includes('flyway') ||
      p.includes('prisma/migrations') || p.includes('alembic/versions') ||
      p.endsWith('.sql')
    ) {
      migrations.push({
        file: file.path,
        name: file.name,
        type: p.includes('migration') ? 'Database Migration Script' : 'SQL Script',
        lineCount: file.lineCount
      });
    }
  }
  return migrations;
}

function analyzeDependencies(files, fileContents) {
  const depList = [];

  for (const file of files) {
    const data = fileContents.get(file.path);
    if (!data) continue;
    const { content } = data;

    // Node.js package.json
    if (file.name === 'package.json') {
      try {
        const pkg = JSON.parse(content);
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        Object.entries(deps).forEach(([depName, ver]) => {
          depList.push({
            name: depName,
            version: ver,
            manager: 'npm',
            manifest: file.path
          });
        });
      } catch (e) {}
    }

    // Java pom.xml
    if (file.name === 'pom.xml') {
      const depRegex = /<dependency>[\s\S]*?<groupId>([^<]+)<\/groupId>[\s\S]*?<artifactId>([^<]+)<\/artifactId>(?:[\s\S]*?<version>([^<]+)<\/version>)?[\s\S]*?<\/dependency>/g;
      let match;
      while ((match = depRegex.exec(content)) !== null) {
        depList.push({
          name: `${match[1]}:${match[2]}`,
          version: match[3] || 'Managed by Parent BOM',
          manager: 'Maven',
          manifest: file.path
        });
      }
    }

    // Python requirements.txt
    if (file.name === 'requirements.txt') {
      content.split('\n').forEach(line => {
        const clean = line.trim();
        if (clean && !clean.startsWith('#')) {
          const parts = clean.split(/[>=<~]+/);
          depList.push({
            name: parts[0].trim(),
            version: parts[1] ? parts[1].trim() : 'latest',
            manager: 'pip',
            manifest: file.path
          });
        }
      });
    }
  }

  return depList;
}

function analyzeTests(files, fileContents) {
  const tests = [];
  for (const file of files) {
    const p = file.path.toLowerCase();
    if (
      p.includes('test') || p.includes('spec') ||
      file.name.endsWith('Test.java') || file.name.endsWith('.test.js') ||
      file.name.endsWith('.spec.ts') || file.name.startsWith('test_')
    ) {
      const data = fileContents.get(file.path);
      const content = data ? data.content : '';
      let testFramework = 'Generic Test Runner';
      if (content.includes('org.junit')) testFramework = 'JUnit 5';
      if (content.includes('describe(') || content.includes('test(')) testFramework = 'Jest / Mocha';
      if (content.includes('def test_') || content.includes('pytest')) testFramework = 'PyTest';

      tests.push({
        file: file.path,
        name: file.name,
        framework: testFramework,
        lineCount: file.lineCount
      });
    }
  }
  return tests;
}

function analyzeDocs(files, fileContents) {
  const docs = [];
  for (const file of files) {
    if (file.extension === '.md' || file.name.toLowerCase().includes('swagger') || file.name.toLowerCase().includes('openapi')) {
      docs.push({
        file: file.path,
        name: file.name,
        size: file.size
      });
    }
  }
  return docs;
}

function analyzeBuildDeployment(files, fileContents) {
  const buildFiles = [];
  for (const file of files) {
    const p = file.path.toLowerCase();
    if (
      file.name === 'Dockerfile' || file.name.includes('docker-compose') ||
      p.includes('.github/workflows') || file.name === 'pom.xml' ||
      file.name === 'build.gradle' || file.name === 'Makefile'
    ) {
      buildFiles.push({
        file: file.path,
        name: file.name,
        role: file.name === 'Dockerfile' ? 'Containerization' :
              file.name.includes('docker-compose') ? 'Multi-container Orchestration' :
              p.includes('workflows') ? 'CI/CD Pipeline' : 'Build Automation'
      });
    }
  }
  return buildFiles;
}

function summarizeArchitecture(technologies, components, fileCount, totalLines) {
  const primaryLang = technologies.languages[0] || 'Unknown';
  const primaryFramework = technologies.frameworks[0] || 'Custom';
  const primaryDb = technologies.databases[0] || 'None Detected';

  let pattern = 'Layered Modular Architecture';
  if (components.restControllers.length > 0 && components.serviceClasses.length > 0 && components.repositoryDaoClasses.length > 0) {
    pattern = 'Enterprise Tiered Architecture (Controller-Service-Repository-DAO Pattern)';
  } else if (components.restControllers.length > 0 && components.frontendCode.length > 0) {
    pattern = 'Full-Stack Decoupled Client-Server Architecture';
  }

  return {
    pattern,
    primaryLanguage: primaryLang,
    primaryFramework,
    primaryDatabase: primaryDb,
    summary: `Analyzed repository consisting of ${fileCount} files (${totalLines.toLocaleString()} lines of source code). Employs ${pattern} leveraging ${technologies.languages.join(', ')} with ${technologies.frameworks.concat(technologies.databases).join(', ')}.`,
    highlights: [
      `${components.restControllers.reduce((acc, c) => acc + c.endpointCount, 0)} REST API Endpoints discovered across ${components.restControllers.length} Controllers`,
      `${components.serviceClasses.length} Service Layer classes encapsulating business logic`,
      `${components.databaseEntities.length} Database Entities/Models mapped with schema constraints`,
      `${components.tests.length} Test Suites validating application integrity`,
      `${technologies.security.join(', ') || 'Standard security policies'}`
    ]
  };
}
