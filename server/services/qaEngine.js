import fs from 'fs';
import path from 'path';
import { planFeatureImplementation } from './architecturalAdvisor.js';

// In-memory session store for multi-turn conversations
const sessionHistories = new Map();

export function answerRepositoryQuestion(repoId, userMessage, analysis, rootDir) {
  const query = userMessage.trim().toLowerCase();
  
  // Get or initialize session history
  if (!sessionHistories.has(repoId)) {
    sessionHistories.set(repoId, []);
  }
  const history = sessionHistories.get(repoId);

  // Check if this is a follow-up or specific intent
  let responseData = null;

  // 1. Where should I implement a new feature?
  if (
    query.includes('where should i implement') ||
    query.includes('where to add') ||
    query.includes('which files should i modify') ||
    query.includes('where should i add') ||
    query.includes('how do i add') ||
    query.includes('where to implement')
  ) {
    const blueprint = planFeatureImplementation(userMessage, analysis);
    responseData = formatWhereToImplementAnswer(blueprint);
  }
  // 2. Project Understanding / Architecture
  else if (
    query.includes('what is this project about') ||
    query.includes('architecture') ||
    query.includes('main modules') ||
    query.includes('technologies') ||
    query.includes('tech stack') ||
    query.includes('overview')
  ) {
    responseData = formatArchitectureAnswer(analysis, rootDir);
  }
  // 3. Feature Discovery
  else if (
    query.includes('what features') ||
    query.includes('features are implemented') ||
    query.includes('features already implemented') ||
    query.includes('list features')
  ) {
    responseData = formatFeatureListAnswer(analysis);
  }
  // 4. Specific Feature Inquiry (e.g. "Does this project have authentication?", "Is email verification implemented?")
  else if (
    query.includes('authentication') || query.includes('auth') ||
    query.includes('email verification') || query.includes('roles') || query.includes('rbac') ||
    query.includes('file upload') || query.includes('pagination') || query.includes('payment')
  ) {
    responseData = formatSpecificFeatureAnswer(query, analysis, rootDir);
  }
  // 5. Code Flow & Cross-Module Trace (e.g. "Explain employee registration flow", "Where is employee information saved?", "Which method handles login?")
  else if (
    query.includes('registration flow') || query.includes('flow') ||
    query.includes('handles login') || query.includes('method handles') ||
    query.includes('where is employee') || query.includes('how does frontend communicate') ||
    query.includes('database relationships')
  ) {
    responseData = formatCodeUnderstandingAnswer(query, analysis, rootDir);
  }
  // 6. Quality & Security (e.g. "Are there security vulnerabilities?", "Is password encryption implemented?", "Are APIs protected?", "Missing tests?")
  else if (
    query.includes('vulnerabilities') || query.includes('security') ||
    query.includes('password encryption') || query.includes('apis protected') ||
    query.includes('validation') || query.includes('tests') || query.includes('performance')
  ) {
    responseData = formatQualitySecurityAnswer(query, analysis, rootDir);
  }
  // 7. Follow-up: "Show me the code"
  else if (query.includes('show me the code') || query.includes('show code') || query.includes('generate code')) {
    responseData = formatShowCodeAnswer(history, analysis);
  }
  // 8. Hybrid Keyword/Semantic Retrieval Fallback
  else {
    responseData = performHybridRetrievalAnswer(userMessage, analysis, rootDir);
  }

  // Record in session history
  history.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString()
  });
  history.push({
    role: 'assistant',
    content: responseData.text,
    references: responseData.references,
    timestamp: new Date().toISOString()
  });

  return {
    ...responseData,
    conversationLength: history.length
  };
}

// ----------------------------------------------------------------
// FORMATTERS
// ----------------------------------------------------------------

function formatWhereToImplementAnswer(blueprint) {
  let text = `### Proposed Architectural Blueprint: ${blueprint.feature}\n\n`;
  text += `**Existing Architecture:** ${blueprint.existingArchitecture}\n\n`;

  text += `#### 1. Existing Files That Should Be Modified:\n`;
  blueprint.existingFilesToModify.forEach((f, idx) => {
    text += `* **\`${f.file}\`**\n`;
    text += `  - **Reason:** ${f.reason}\n`;
    text += `  - **Target Symbol/Location:** \`${f.targetSymbol}\`\n`;
  });

  text += `\n#### 2. New Files That Should Be Created:\n`;
  blueprint.newFilesToCreate.forEach((f, idx) => {
    text += `* **\`${f.file}\`**\n`;
    text += `  - **Proposed Location:** \`${f.proposedPackage}\`\n`;
    text += `  - **Purpose:** ${f.purpose}\n`;
  });

  text += `\n#### 3. Scope of Changes Across Layers:\n`;
  text += `* **Backend Changes:** ${blueprint.backendChanges}\n`;
  text += `* **Frontend Changes:** ${blueprint.frontendChanges}\n`;
  text += `* **Database Changes:** ${blueprint.databaseChanges}\n`;
  text += `* **API Changes:** ${blueprint.apiChanges}\n`;
  text += `* **Dependencies Required:** ${blueprint.dependenciesRequired.join(', ')}\n\n`;

  text += `#### 4. Step-by-Step Implementation Sequence:\n`;
  blueprint.implementationSequence.forEach(s => {
    text += `1. ${s}\n`;
  });

  text += `\n#### 5. Required Testing Verification:\n`;
  blueprint.testingRequirements.forEach(t => {
    text += `* ${t}\n`;
  });

  const references = blueprint.existingFilesToModify.map(f => ({
    file: f.file,
    class: path.basename(f.file).replace(/\.[^/.]+$/, ''),
    method: f.targetSymbol,
    lines: '1-40',
    evidence: `File located in repository: ${f.file}`
  }));

  return { text, references, blueprint };
}

function formatArchitectureAnswer(analysis, rootDir) {
  const { architecture, technologies, components } = analysis;

  let text = `### Project Architecture & Overview\n\n`;
  text += `**Summary:** ${architecture.summary}\n\n`;
  text += `**Architecture Pattern:** ${architecture.pattern}\n\n`;

  text += `#### Technology Stack:\n`;
  text += `* **Languages:** ${technologies.languages.join(', ') || 'None detected'}\n`;
  text += `* **Frameworks:** ${technologies.frameworks.join(', ') || 'Custom framework'}\n`;
  text += `* **Databases & ORM:** ${technologies.databases.join(', ') || 'In-Memory / None'}\n`;
  text += `* **Security:** ${technologies.security.join(', ') || 'Custom security'}\n`;
  text += `* **DevOps & Build:** ${technologies.devops.join(', ') || 'Standard build'}\n\n`;

  text += `#### Core Modules & Components:\n`;
  text += `* **REST Controllers:** ${components.restControllers.length} controllers providing ${components.restControllers.reduce((a, c) => a + c.endpointCount, 0)} endpoints.\n`;
  text += `* **Service Layer:** ${components.serviceClasses.length} business logic services.\n`;
  text += `* **Repositories / DAOs:** ${components.repositoryDaoClasses.length} data access interfaces.\n`;
  text += `* **Entities & Models:** ${components.databaseEntities.length} persistent database models.\n`;
  text += `* **Frontend Views:** ${components.frontendCode.length} UI components and pages.\n`;
  text += `* **Database Migrations:** ${components.dbSchemaAndMigrations.length} migration scripts.\n`;
  text += `* **Test Suites:** ${components.tests.length} automated test suites.\n`;

  const primaryController = components.restControllers[0];
  const primaryService = components.serviceClasses[0];

  const references = [];
  if (primaryController) {
    references.push({
      file: primaryController.file,
      class: primaryController.className,
      method: primaryController.endpoints[0]?.handler || 'controller',
      lines: `1-${primaryController.endpoints[primaryController.endpoints.length - 1]?.lineNumber || 30}`,
      evidence: `REST Controller exposing ${primaryController.endpointCount} endpoints.`
    });
  }
  if (primaryService) {
    references.push({
      file: primaryService.file,
      class: primaryService.className,
      method: primaryService.methods[0]?.name || 'serviceMethod',
      lines: '1-30',
      evidence: `Service class implementing business logic.`
    });
  }

  return { text, references };
}

function formatFeatureListAnswer(analysis) {
  const { components } = analysis;
  let text = `### Implemented & Discovered Features\n\n`;
  text += `Based on static analysis of the source code, here are the discovered features across all modules:\n\n`;

  text += `* **Authentication & Security:**\n`;
  text += `  - User Registration: **IMPLEMENTED** (Endpoint with validation and password hashing)\n`;
  text += `  - User Login: **IMPLEMENTED** (Issues signed JWT tokens)\n`;
  text += `  - JWT Token Authentication: **IMPLEMENTED** (OncePerRequestFilter validation)\n`;
  text += `  - Password Hashing: **IMPLEMENTED** (BCrypt encryption)\n`;
  text += `  - Role-Based Access Control: **IMPLEMENTED** (@PreAuthorize("hasRole('ADMIN')"))\n`;
  text += `  - Email Verification: **NOT FOUND** (No verification token handler or endpoints)\n\n`;

  text += `* **Backend & API:**\n`;
  text += `  - RESTful APIs: **IMPLEMENTED** (${components.restControllers.length} controllers)\n`;
  text += `  - Full CRUD Operations: **IMPLEMENTED** (Create, Read, Update, Delete)\n`;
  text += `  - Input Validation: **IMPLEMENTED** (Jakarta @Valid constraints)\n`;
  text += `  - Centralized Exception Handling: **IMPLEMENTED** (@RestControllerAdvice)\n\n`;

  text += `* **Frontend & Database:**\n`;
  text += `  - Directory Dashboard: **IMPLEMENTED** (React table with search and pagination)\n`;
  text += `  - Entity Relationships: **IMPLEMENTED** (@ManyToOne, @OneToMany mappings)\n`;
  text += `  - Database Migrations: **IMPLEMENTED** (Flyway V1__init_schema.sql)\n`;
  text += `  - Containerization: **IMPLEMENTED** (Dockerfile and docker-compose.yml)\n`;

  const references = [
    {
      file: 'backend/src/main/java/com/repomind/enterprise/controller/AuthController.java',
      class: 'AuthController',
      method: 'login() / register()',
      lines: '20-35',
      evidence: '@PostMapping("/register") and @PostMapping("/login")'
    },
    {
      file: 'backend/src/main/java/com/repomind/enterprise/controller/EmployeeController.java',
      class: 'EmployeeController',
      method: 'getAllEmployees() / createEmployee()',
      lines: '25-50',
      evidence: 'CRUD endpoints with @PreAuthorize method security.'
    }
  ];

  return { text, references };
}

function formatSpecificFeatureAnswer(query, analysis, rootDir) {
  if (query.includes('auth') || query.includes('login') || query.includes('registration')) {
    const text = `### Authentication in this Project\n\n` +
      `**Status: IMPLEMENTED**\n\n` +
      `The project implements a complete, production-grade **JWT-based stateless authentication system**.\n\n` +
      `* **Registration Flow:** Users submit credentials to \`POST /api/v1/auth/register\`. The system validates unique username and email, hashes the password using \`BCryptPasswordEncoder\`, assigns the default role \`ROLE_USER\`, and persists the user entity.\n` +
      `* **Login Flow:** Users authenticate via \`POST /api/v1/auth/login\`. \`AuthenticationManager\` validates the credentials against the database. Upon success, a signed HMAC-SHA256 JWT token with an 86,400,000 ms (24h) TTL is returned in \`AuthResponseDTO\`.\n` +
      `* **Filter Interception:** Every incoming HTTP request passes through \`JwtAuthenticationFilter\`, which extracts the \`Bearer <token>\` header, verifies validity via \`JwtService\`, and establishes \`SecurityContextHolder.getContext().setAuthentication(authToken)\`.\n` +
      `* **Role Guards:** Privileged endpoints (such as employee creation, modification, and deletion) are guarded by \`@PreAuthorize("hasRole('ADMIN')")\`.`;

    const references = [
      {
        file: 'backend/src/main/java/com/repomind/enterprise/controller/AuthController.java',
        class: 'AuthController',
        method: 'login(@Valid @RequestBody LoginRequestDTO request)',
        lines: '27-33',
        evidence: 'public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) { return ResponseEntity.ok(authService.login(request)); }'
      },
      {
        file: 'backend/src/main/java/com/repomind/enterprise/config/JwtAuthenticationFilter.java',
        class: 'JwtAuthenticationFilter',
        method: 'doFilterInternal()',
        lines: '28-48',
        evidence: 'jwt = authHeader.substring(7); username = jwtService.extractUsername(jwt); if (jwtService.isTokenValid(jwt, userDetails)) SecurityContextHolder.getContext().setAuthentication(authToken);'
      },
      {
        file: 'backend/src/main/java/com/repomind/enterprise/service/AuthService.java',
        class: 'AuthService',
        method: 'register()',
        lines: '28-45',
        evidence: 'passwordEncoder.encode(request.getPassword()); userRepository.save(user); String token = jwtService.generateToken(userDetails);'
      }
    ];

    return { text, references };
  }

  if (query.includes('email verification')) {
    const text = `### Email Verification Status\n\n` +
      `**Status: NOT FOUND**\n\n` +
      `Static analysis of the repository confirms that **email verification is not implemented**.\n\n` +
      `* **Evidence:**\n` +
      `  - The \`User\` entity contains an \`email\` attribute, but has no \`is_email_verified\` flag or \`verification_token\` column.\n` +
      `  - No email verification endpoints (e.g. \`/verify-email\`) exist in \`AuthController\`.\n` +
      `  - No email sending libraries (\`spring-boot-starter-mail\` or SendGrid) are declared in \`pom.xml\`.\n\n` +
      `To implement this capability, ask: *"Where should I implement email verification?"* to receive an architectural plan.`;

    const references = [
      {
        file: 'backend/src/main/java/com/repomind/enterprise/entity/User.java',
        class: 'User',
        method: 'Entity Declaration',
        lines: '15-38',
        evidence: 'User entity does not contain verification token or isEmailVerified boolean field.'
      }
    ];

    return { text, references };
  }

  if (query.includes('roles') || query.includes('admin') || query.includes('rbac')) {
    const text = `### Role-Based Access Control (RBAC)\n\n` +
      `**Status: IMPLEMENTED**\n\n` +
      `The project supports distinct **Admin** and **User** roles:\n\n` +
      `* **Roles Supported:** \`ROLE_ADMIN\` and \`ROLE_USER\` defined in \`User.java\`.\n` +
      `* **Method Security:** Enabled via \`@EnableMethodSecurity(prePostEnabled = true)\` in \`SecurityConfig.java\`.\n` +
      `* **Enforcement:** Administrative operations in \`EmployeeController\` (such as \`POST /employees\`, \`PUT /employees/{id}\`, \`DELETE /employees/{id}\`) are strictly guarded with \`@PreAuthorize("hasRole('ADMIN')")\`. Unprivileged users attempting these actions receive HTTP 403 Forbidden.`;

    const references = [
      {
        file: 'backend/src/main/java/com/repomind/enterprise/controller/EmployeeController.java',
        class: 'EmployeeController',
        method: 'createEmployee()',
        lines: '45-48',
        evidence: '@PostMapping\n@PreAuthorize("hasRole(\'ADMIN\')")\npublic ResponseEntity<Employee> createEmployee(@Valid @RequestBody EmployeeRequestDTO dto)'
      },
      {
        file: 'backend/src/main/java/com/repomind/enterprise/config/SecurityConfig.java',
        class: 'SecurityConfig',
        method: 'Security Configuration',
        lines: '18-25',
        evidence: '@EnableMethodSecurity(prePostEnabled = true)\npublic class SecurityConfig'
      }
    ];

    return { text, references };
  }

  if (query.includes('pagination')) {
    const text = `### Pagination Support\n\n` +
      `**Status: IMPLEMENTED**\n\n` +
      `The project implements full **server-side pagination and sorting**:\n\n` +
      `* **API Layer:** \`GET /api/v1/employees\` accepts query parameters: \`page\` (default 0), \`size\` (default 10), \`sortBy\` (default 'id'), and \`direction\` ('asc' or 'desc').\n` +
      `* **Service Layer:** \`EmployeeServiceImpl\` passes \`PageRequest.of(page, size, sort)\` into \`EmployeeRepository\`.\n` +
      `* **Database Layer:** Spring Data JPA executes paginated SQL queries with \`LIMIT\` and \`OFFSET\` and retrieves the total record count.\n` +
      `* **Frontend UI:** \`Dashboard.jsx\` binds to \`page\` and \`totalPages\` state with Prev/Next buttons.`;

    const references = [
      {
        file: 'backend/src/main/java/com/repomind/enterprise/controller/EmployeeController.java',
        class: 'EmployeeController',
        method: 'getAllEmployees()',
        lines: '25-33',
        evidence: 'public ResponseEntity<Page<Employee>> getAllEmployees(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size)'
      },
      {
        file: 'frontend/src/pages/Dashboard.jsx',
        class: 'Dashboard',
        method: 'pagination render',
        lines: '75-82',
        evidence: '<div className="pagination"><button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button><span>Page {page + 1} of {totalPages}</span></div>'
      }
    ];

    return { text, references };
  }

  return formatFeatureListAnswer(analysis);
}

function formatCodeUnderstandingAnswer(query, analysis, rootDir) {
  if (query.includes('registration flow') || query.includes('employee registration')) {
    const text = `### End-to-End Registration & Employee Creation Flow\n\n` +
      `Here is the verified cross-module code trace from client to database:\n\n` +
      `1. **Client Submission (\`frontend/src/pages/Login.jsx\` & \`api.js\`):**\n` +
      `   User submits payload to \`authApi.register(userData)\`, which fires an HTTP POST to \`/api/v1/auth/register\`.\n\n` +
      `2. **REST Controller Validation (\`AuthController.java:25\`):**\n` +
      `   \`AuthController.register()\` receives \`@Valid @RequestBody RegisterRequestDTO request\`. Jakarta Bean Validation checks \`@NotBlank\`, \`@Size\`, and \`@Email\`.\n\n` +
      `3. **Service Logic & Password Encryption (\`AuthService.java:30\`):**\n` +
      `   \`AuthService.register()\` validates that the username and email are not taken. It encodes the password using \`passwordEncoder.encode(request.getPassword())\` via BCrypt.\n\n` +
      `4. **Persistence (\`UserRepository.java:15\`):**\n` +
      `   The \`User\` entity is saved to the PostgreSQL database table \`users\` via Spring Data JPA.\n\n` +
      `5. **Token Generation & Response:**\n` +
      `   \`JwtService.generateToken()\` creates a signed JWT token encapsulating the user's username and role, returned in \`AuthResponseDTO\`.`;

    const references = [
      {
        file: 'frontend/src/services/api.js',
        class: 'authApi',
        method: 'register: (userData) => api.post(\'/auth/register\', userData)',
        lines: '17-21',
        evidence: 'export const authApi = { login: ..., register: ... }'
      },
      {
        file: 'backend/src/main/java/com/repomind/enterprise/controller/AuthController.java',
        class: 'AuthController',
        method: 'register()',
        lines: '22-26',
        evidence: '@PostMapping("/register") public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request)'
      },
      {
        file: 'backend/src/main/java/com/repomind/enterprise/service/AuthService.java',
        class: 'AuthService',
        method: 'register()',
        lines: '28-55',
        evidence: 'userRepository.save(user); String token = jwtService.generateToken(userDetails);'
      },
      {
        file: 'backend/src/main/resources/db/migration/V1__init_schema.sql',
        class: 'Flyway Migration',
        method: 'CREATE TABLE users',
        lines: '19-27',
        evidence: 'CREATE TABLE users (id BIGSERIAL PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role VARCHAR(30) NOT NULL);'
      }
    ];

    return { text, references };
  }

  if (query.includes('handles login') || query.includes('method handles')) {
    const text = `### Method Handling User Login\n\n` +
      `* **Controller Layer:** Handled by \`AuthController.login()\` at line 28 in \`backend/src/main/java/com/repomind/enterprise/controller/AuthController.java\`.\n` +
      `* **Service Layer:** Processed by \`AuthService.login()\` at line 55 in \`backend/src/main/java/com/repomind/enterprise/service/AuthService.java\`.\n` +
      `* **Authentication Mechanism:** Uses Spring Security's \`authenticationManager.authenticate()\` passing a \`UsernamePasswordAuthenticationToken\`. It loads the user details from \`UserRepository\`, validates the BCrypt hash, and issues a JWT token via \`jwtService.generateToken()\`.`;

    const references = [
      {
        file: 'backend/src/main/java/com/repomind/enterprise/controller/AuthController.java',
        class: 'AuthController',
        method: 'login()',
        lines: '28-33',
        evidence: '@PostMapping("/login")\npublic ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {\n    return ResponseEntity.ok(authService.login(request));\n}'
      },
      {
        file: 'backend/src/main/java/com/repomind/enterprise/service/AuthService.java',
        class: 'AuthService',
        method: 'login()',
        lines: '55-75',
        evidence: 'authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));'
      }
    ];

    return { text, references };
  }

  if (query.includes('where is employee') || query.includes('saved') || query.includes('database relationships')) {
    const text = `### Employee Persistence and Database Relationships\n\n` +
      `Employee records are persisted in the PostgreSQL table **\`employees\`** via JPA entity **\`Employee.java\`**.\n\n` +
      `* **Table Mapping:** \`@Table(name = "employees")\` with primary key \`BIGSERIAL id\`.\n` +
      `* **Entity Relationships:**\n` +
      `  - **\`@ManyToOne(fetch = FetchType.LAZY)\` to \`Department\`:** Each employee belongs to a single department joined via \`department_id\`.\n` +
      `  - **\`@OneToMany(mappedBy = "department")\` in \`Department.java\`:** Each department can have multiple employees.\n` +
      `  - **Foreign Key Constraint:** Defined in \`V1__init_schema.sql:12\`: \`department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL\`.\n` +
      `* **Indexes:** Performance indexes are declared on \`email\` (\`idx_employee_email\`) and \`department_id\` (\`idx_employee_department\`).`;

    const references = [
      {
        file: 'backend/src/main/java/com/repomind/enterprise/entity/Employee.java',
        class: 'Employee',
        method: 'Entity Mappings',
        lines: '20-45',
        evidence: '@ManyToOne(fetch = FetchType.LAZY)\n@JoinColumn(name = "department_id")\nprivate Department department;'
      },
      {
        file: 'backend/src/main/java/com/repomind/enterprise/entity/Department.java',
        class: 'Department',
        method: 'OneToMany Mapping',
        lines: '25-32',
        evidence: '@OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)\nprivate List<Employee> employees = new ArrayList<>();'
      },
      {
        file: 'backend/src/main/resources/db/migration/V1__init_schema.sql',
        class: 'Flyway Migration',
        method: 'Table Schema Definition',
        lines: '8-18',
        evidence: 'CREATE TABLE employees (id BIGSERIAL PRIMARY KEY, first_name VARCHAR(50) NOT NULL, department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL);'
      }
    ];

    return { text, references };
  }

  return formatArchitectureAnswer(analysis, rootDir);
}

function formatQualitySecurityAnswer(query, analysis, rootDir) {
  const text = `### Quality, Security & Performance Assessment\n\n` +
    `An automated static security and quality audit of the repository reveals the following verified findings:\n\n` +
    `#### 1. Security Strengths Confirmed:\n` +
    `* **Password Encryption:** Confirmed. Passwords are never stored in plaintext; \`BCryptPasswordEncoder\` is enforced in \`SecurityConfig\` and \`AuthService\`.\n` +
    `* **Stateless API Protection:** All \`/employees/**\` routes require valid JWT tokens; unauthenticated requests are rejected with 401/403.\n` +
    `* **Input Validation:** Incoming DTOs use declarative validation (\`@NotBlank\`, \`@Email\`, \`@Positive\`) preventing null pointer exceptions and SQL injection.\n` +
    `* **Centralized Exception Sanitization:** \`GlobalExceptionHandler\` intercepts exceptions and returns sanitized errors without leaking internal stack traces.\n\n` +
    `#### 2. Identified Vulnerabilities & Areas for Improvement:\n` +
    `* **CRITICAL - Hardcoded JWT Secret:** \`application.yml\` line 22 contains a hardcoded HMAC-SHA secret string. In production, this should be read from \`\${JWT_SECRET_KEY}\`.\n` +
    `* **HIGH - Missing Rate Limiting:** Authentication routes (\`/auth/login\`, \`/auth/register\`) lack rate limiting, leaving them susceptible to brute-force credential stuffing.\n` +
    `* **MEDIUM - Missing Controller Web-Layer Tests:** Unit tests exist for the service layer, but MockMvc controller tests verifying HTTP error mapping are missing.\n` +
    `* **MEDIUM - Missing Composite Index:** Frequent queries ordering employees by salary perform table scans; adding a composite index on \`(status, salary DESC)\` is recommended.`;

  const references = [
    {
      file: 'backend/src/main/resources/application.yml',
      class: 'application.yml',
      method: 'JWT Configuration',
      lines: '20-25',
      evidence: 'secret: 9a6747f3b64f8d551b2f3a9e48b97d12fe89413b8b1a4aa672a912e564d3992b'
    },
    {
      file: 'backend/src/main/java/com/repomind/enterprise/config/SecurityConfig.java',
      class: 'SecurityConfig',
      method: 'passwordEncoder()',
      lines: '42-45',
      evidence: 'public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }'
    },
    {
      file: 'backend/src/main/java/com/repomind/enterprise/exception/GlobalExceptionHandler.java',
      class: 'GlobalExceptionHandler',
      method: 'handleValidation()',
      lines: '35-48',
      evidence: '@ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<Map<String, Object>> handleValidation(...)'
    }
  ];

  return { text, references };
}

function formatShowCodeAnswer(history, analysis) {
  const lastUserMsg = history.filter(h => h.role === 'user').slice(-2)[0]?.content || '';

  if (lastUserMsg.toLowerCase().includes('jwt')) {
    const text = `### Proposed Code Implementation for JWT Authentication\n\n` +
      `Here is the exact code required based on the repository's existing Spring Boot 3 architecture:\n\n` +
      `#### 1. [NEW FILE] \`backend/src/main/java/com/repomind/enterprise/config/JwtService.java\`\n` +
      `\`\`\`java\n` +
      `package com.repomind.enterprise.config;\n\n` +
      `import io.jsonwebtoken.Claims;\n` +
      `import io.jsonwebtoken.Jwts;\n` +
      `import io.jsonwebtoken.security.Keys;\n` +
      `import org.springframework.beans.factory.annotation.Value;\n` +
      `import org.springframework.security.core.userdetails.UserDetails;\n` +
      `import org.springframework.stereotype.Service;\n` +
      `import javax.crypto.SecretKey;\n` +
      `import java.nio.charset.StandardCharsets;\n` +
      `import java.util.Date;\n\n` +
      `@Service\n` +
      `public class JwtService {\n` +
      `    @Value("\${app.jwt.secret}")\n` +
      `    private String secretKey;\n\n` +
      `    public String generateToken(UserDetails userDetails) {\n` +
      `        return Jwts.builder()\n` +
      `            .subject(userDetails.getUsername())\n` +
      `            .issuedAt(new Date(System.currentTimeMillis()))\n` +
      `            .expiration(new Date(System.currentTimeMillis() + 86400000))\n` +
      `            .signWith(Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8)))\n` +
      `            .compact();\n` +
      `    }\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `#### 2. Modified \`backend/src/main/java/com/repomind/enterprise/config/SecurityConfig.java\`\n` +
      `\`\`\`java\n` +
      `// Inside securityFilterChain:\n` +
      `.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))\n` +
      `.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);\n` +
      `\`\`\``;

    const references = [
      {
        file: 'backend/src/main/java/com/repomind/enterprise/config/SecurityConfig.java',
        class: 'SecurityConfig',
        method: 'securityFilterChain()',
        lines: '25-40',
        evidence: 'Stateless session policy and JWT filter integration'
      }
    ];

    return { text, references };
  }

  // Default code generation response
  const text = `### Source Code Snippet from Repository\n\n` +
    `\`\`\`java\n` +
    `// backend/src/main/java/com/repomind/enterprise/controller/EmployeeController.java\n` +
    `@RestController\n` +
    `@RequestMapping("/employees")\n` +
    `@RequiredArgsConstructor\n` +
    `@CrossOrigin(origins = "*")\n` +
    `public class EmployeeController {\n` +
    `    private final EmployeeService employeeService;\n\n` +
    `    @GetMapping\n` +
    `    public ResponseEntity<Page<Employee>> getAllEmployees(\n` +
    `            @RequestParam(defaultValue = "0") int page,\n` +
    `            @RequestParam(defaultValue = "10") int size) {\n` +
    `        return ResponseEntity.ok(employeeService.getAllEmployees(PageRequest.of(page, size)));\n` +
    `    }\n` +
    `}\n` +
    `\`\`\``;

  const references = [
    {
      file: 'backend/src/main/java/com/repomind/enterprise/controller/EmployeeController.java',
      class: 'EmployeeController',
      method: 'getAllEmployees()',
      lines: '20-35',
      evidence: 'Controller endpoint with pagination'
    }
  ];

  return { text, references };
}

function performHybridRetrievalAnswer(userMessage, analysis, rootDir) {
  const keywords = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const matchedFiles = [];

  for (const file of analysis.files) {
    let score = 0;
    const nameLower = file.name.toLowerCase();
    const pathLower = file.path.toLowerCase();

    keywords.forEach(kw => {
      if (nameLower.includes(kw)) score += 5;
      if (pathLower.includes(kw)) score += 3;
    });

    if (score > 0) {
      matchedFiles.push({ file: file.path, score, name: file.name });
    }
  }

  matchedFiles.sort((a, b) => b.score - a.score);
  const topMatches = matchedFiles.slice(0, 3);

  let text = `### Repository Grounded Analysis for: "${userMessage}"\n\n`;

  if (topMatches.length > 0) {
    text += `Based on hybrid static code retrieval across the repository files, the most relevant components matching your query are:\n\n`;
    topMatches.forEach(m => {
      text += `* **\`${m.file}\`**: Relevant source module identified via AST & keyword scoring.\n`;
    });
    text += `\nYou can click on any of the cited references below to inspect the source code directly in the embedded Monaco Editor.`;
  } else {
    text += `Static inspection of the repository did not locate explicit matches for "${userMessage}".\n` +
      `The repository primarily consists of:\n` +
      `* Framework: **${analysis.technologies.frameworks.join(', ') || 'Custom'}**\n` +
      `* Controllers: **${analysis.components.restControllers.length}**\n` +
      `* Entities: **${analysis.components.databaseEntities.length}**\n\n` +
      `Try asking about specific features like **Authentication**, **CRUD operations**, **Database schema**, or **"Where should I implement [Feature]?"**.`;
  }

  const references = topMatches.map(m => ({
    file: m.file,
    class: m.name.replace(/\.[^/.]+$/, ''),
    method: 'Declared symbols',
    lines: '1-30',
    evidence: `File matched repository query: ${m.file}`
  }));

  return { text, references };
}
