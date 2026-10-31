/**
 * Architectural Advisor Engine
 * Answers: "Where should I implement [Feature]?" and "Where can I add my controller?"
 * 
 * Inspects existing repository conventions, package structures, frameworks,
 * and design patterns to output an exact, concrete implementation blueprint.
 */

export function planFeatureImplementation(featureQuery, analysis) {
  const query = featureQuery.toLowerCase();
  const { technologies, components, files } = analysis;

  const isJavaSpring = technologies.frameworks.includes('Spring Boot') || technologies.languages.includes('Java / Maven');
  const isNodeExpress = technologies.frameworks.includes('Express.js') || technologies.frameworks.includes('NestJS');
  const isPython = technologies.frameworks.includes('FastAPI') || technologies.languages.includes('Python');

  // Determine base packages / folder paths from existing code
  let basePackage = 'com.repomind.enterprise';
  let backendSrc = 'backend/src/main/java/com/repomind/enterprise';
  let frontendSrc = 'frontend/src';

  if (isJavaSpring) {
    const javaFile = files.find(f => f.path.endsWith('.java') && f.path.includes('/src/main/java/'));
    if (javaFile) {
      const parts = javaFile.path.split('/src/main/java/')[1].split('/');
      parts.pop(); // remove filename
      const subpackages = new Set(['config', 'controller', 'controllers', 'service', 'services', 'dto', 'dtos', 'entity', 'entities', 'repository', 'repositories', 'model', 'models']);
      if (parts.length > 0 && subpackages.has(parts[parts.length - 1])) {
        parts.pop();
      }
      if (parts.length > 0) {
        basePackage = parts.join('.');
        backendSrc = javaFile.path.substring(0, javaFile.path.indexOf('/src/main/java/')) + '/src/main/java/' + parts.join('/');
      }
    }
  } else if (isNodeExpress) {
    backendSrc = files.some(f => f.path.startsWith('src/')) ? 'src' : 'backend/src';
    frontendSrc = 'client/src';
  } else if (isPython) {
    backendSrc = files.some(f => f.path.startsWith('app/')) ? 'app' : 'src';
    frontendSrc = 'frontend/src';
  }

  // Check if user specifically asks about adding a Controller or where to place code
  if (
    query.includes('controller') ||
    query.includes('where can i add my controller') ||
    query.includes('where to add controller') ||
    query.includes('add a controller') ||
    query.includes('add my controller') ||
    query.includes('where can i add') ||
    query.includes('where do i add') ||
    query.includes('where to place') ||
    query.includes('where should i place') ||
    query.includes('endpoint')
  ) {
    return generateControllerPlacementBlueprint(featureQuery, analysis, backendSrc, frontendSrc, basePackage, isJavaSpring, isNodeExpress, isPython);
  }

  // Handle specific feature blueprints
  if (query.includes('jwt') || query.includes('token') || query.includes('authentication')) {
    return generateJwtBlueprint(analysis, backendSrc, frontendSrc, basePackage, isJavaSpring, isNodeExpress, isPython);
  } else if (query.includes('email') || query.includes('verification') || query.includes('mail')) {
    return generateEmailVerificationBlueprint(analysis, backendSrc, frontendSrc, basePackage, isJavaSpring, isNodeExpress, isPython);
  } else if (query.includes('redis') || query.includes('cache') || query.includes('caching')) {
    return generateRedisCachingBlueprint(analysis, backendSrc, frontendSrc, basePackage, isJavaSpring, isNodeExpress, isPython);
  } else if (query.includes('pagination') || query.includes('page') || query.includes('paging')) {
    return generatePaginationBlueprint(analysis, backendSrc, frontendSrc, basePackage, isJavaSpring, isNodeExpress, isPython);
  } else if (query.includes('admin') || query.includes('dashboard') || query.includes('portal')) {
    return generateAdminDashboardBlueprint(analysis, backendSrc, frontendSrc, basePackage, isJavaSpring, isNodeExpress, isPython);
  } else if (query.includes('payment') || query.includes('stripe') || query.includes('gateway')) {
    return generatePaymentBlueprint(analysis, backendSrc, frontendSrc, basePackage, isJavaSpring, isNodeExpress, isPython);
  }

  // Generic fallback blueprint for any arbitrary feature
  return generateGenericFeatureBlueprint(featureQuery, analysis, backendSrc, frontendSrc, basePackage);
}

/**
 * Specialized Controller Placement & Wiring Blueprint
 * Explicitly tells the user: "It can be done right here in this component by doing this..."
 */
function generateControllerPlacementBlueprint(query, analysis, backendSrc, frontendSrc, basePkg, isJava, isNode, isPy) {
  // Extract resource name if mentioned (e.g. "PaymentController", "OrderController", "NotificationController")
  const words = query.split(/[\s,]+/);
  let resourceName = '';
  for (const w of words) {
    const clean = w.replace(/[^a-zA-Z]/g, '');
    if (clean.toLowerCase().endsWith('controller') && clean.length > 'controller'.length) {
      resourceName = clean.replace(/controller/i, '');
      resourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
      break;
    } else if (['payment', 'order', 'task', 'notification', 'report', 'audit', 'customer', 'item', 'user', 'subscription', 'billing', 'analytics', 'employee', 'department'].includes(clean.toLowerCase())) {
      resourceName = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
      break;
    }
  }

  if (!resourceName || resourceName.length < 2) {
    resourceName = 'CustomFeature';
  }

  const resourceLower = resourceName.toLowerCase();
  const controllerClass = `${resourceName}Controller`;

  if (isJava) {
    return {
      feature: `Adding ${controllerClass} & Wiring into Architecture`,
      existingArchitecture: 'Spring Boot 3 Tiered Architecture (Controller -> Service -> Repository -> JPA Entity).',
      wiringInstructions: `It can be done right here in this component by doing this:\n1. Place your new controller class in the dedicated controller directory: \`${backendSrc}/controller/${controllerClass}.java\`.\n2. Wire its security permissions in \`${backendSrc}/config/SecurityConfig.java\` inside the \`securityFilterChain\` bean by adding: \`.requestMatchers("/api/v1/${resourceLower}/**").authenticated()\`. \n3. Inject the corresponding business service \`${resourceName}Service\` into the controller using Lombok \`@RequiredArgsConstructor\` or constructor injection.\n4. Connect client-side communication in \`${frontendSrc}/services/api.js\` by exporting a new \`${resourceLower}Api\` object with HTTP methods.\n5. If this resource requires database persistence, map the entity in \`${backendSrc}/entity/${resourceName}.java\` and add Flyway migration in \`backend/src/main/resources/db/migration\`.`,
      existingFilesToModify: [
        {
          file: `${backendSrc}/config/SecurityConfig.java`,
          reason: `Wire the new /${resourceLower} endpoint into Spring Security filter chain to configure whether it is public (permitAll) or authenticated (hasRole).`,
          targetSymbol: 'securityFilterChain(HttpSecurity http)'
        },
        {
          file: `${frontendSrc}/services/api.js`,
          reason: `Register API client methods to call /${resourceLower} endpoints with automatic JWT token attachment.`,
          targetSymbol: 'export const api'
        }
      ],
      newFilesToCreate: [
        {
          file: `[NEW FILE] ${backendSrc}/controller/${controllerClass}.java`,
          purpose: `REST controller handling HTTP GET, POST, PUT, DELETE for ${resourceName} resources.`,
          proposedPackage: `${basePkg}.controller`
        },
        {
          file: `[NEW FILE] ${backendSrc}/service/${resourceName}Service.java`,
          purpose: `Service interface defining core business methods for ${resourceName}.`,
          proposedPackage: `${basePkg}.service`
        },
        {
          file: `[NEW FILE] ${backendSrc}/dto/${resourceName}RequestDTO.java`,
          purpose: `Request payload validation schema annotated with @NotBlank and Jakarta constraints.`,
          proposedPackage: `${basePkg}.dto`
        }
      ],
      boilerplateCode: `package ${basePkg}.controller;\n\nimport ${basePkg}.dto.${resourceName}RequestDTO;\nimport ${basePkg}.service.${resourceName}Service;\nimport jakarta.validation.Valid;\nimport lombok.RequiredArgsConstructor;\nimport org.springframework.http.HttpStatus;\nimport org.springframework.http.ResponseEntity;\nimport org.springframework.security.access.prepost.PreAuthorize;\nimport org.springframework.web.bind.annotation.*;\nimport java.util.List;\n\n@RestController\n@RequestMapping("/api/v1/${resourceLower}")\n@RequiredArgsConstructor\n@CrossOrigin(origins = "*")\npublic class ${controllerClass} {\n\n    private final ${resourceName}Service ${resourceLower}Service;\n\n    @GetMapping\n    public ResponseEntity<List<Object>> getAll() {\n        return ResponseEntity.ok(${resourceLower}Service.getAll());\n    }\n\n    @GetMapping("/{id}")\n    public ResponseEntity<Object> getById(@PathVariable Long id) {\n        return ResponseEntity.ok(${resourceLower}Service.getById(id));\n    }\n\n    @PostMapping\n    @PreAuthorize("hasRole('ADMIN')")\n    public ResponseEntity<Object> create(@Valid @RequestBody ${resourceName}RequestDTO dto) {\n        return new ResponseEntity<>(${resourceLower}Service.create(dto), HttpStatus.CREATED);\n    }\n\n    @DeleteMapping("/{id}")\n    @PreAuthorize("hasRole('ADMIN')")\n    public ResponseEntity<Void> delete(@PathVariable Long id) {\n        ${resourceLower}Service.delete(id);\n        return ResponseEntity.noContent().build();\n    }\n}`,
      backendChanges: `Add ${controllerClass} annotated with @RestController and @RequestMapping("/api/v1/${resourceLower}"). Inject ${resourceName}Service via constructor injection.`,
      frontendChanges: `In ${frontendSrc}/services/api.js, add: export const ${resourceLower}Api = { getAll: () => api.get('/${resourceLower}'), getById: (id) => api.get(\`/\${resourceLower}/\${id}\`), create: (data) => api.post('/${resourceLower}', data) };`,
      databaseChanges: `If ${resourceName} requires persistent state, create entity @Entity @Table(name = "${resourceLower}s") and add Flyway migration V2__create_${resourceLower}s.sql.`,
      apiChanges: `Exposes GET /api/v1/${resourceLower}, GET /api/v1/${resourceLower}/{id}, POST /api/v1/${resourceLower}, and DELETE /api/v1/${resourceLower}/{id}.`,
      dependenciesRequired: ['Spring Boot Starter Web (already in pom.xml)', 'Spring Boot Starter Validation (already in pom.xml)'],
      implementationSequence: [
        `Step 1: Create [NEW FILE] ${backendSrc}/dto/${resourceName}RequestDTO.java with Jakarta validation annotations.`,
        `Step 2: Create [NEW FILE] ${backendSrc}/service/${resourceName}Service.java defining business logic interface.`,
        `Step 3: Create [NEW FILE] ${backendSrc}/controller/${controllerClass}.java with REST mappings and security rules.`,
        `Step 4: In ${backendSrc}/config/SecurityConfig.java, add .requestMatchers("/api/v1/${resourceLower}/**").authenticated().`,
        `Step 5: In ${frontendSrc}/services/api.js, export the ${resourceLower}Api client functions.`
      ],
      testingRequirements: [
        `Controller WebMvcTest: Verify GET /api/v1/${resourceLower} returns 200 OK and POST returns 201 Created.`,
        `Security test: Verify unauthenticated requests to POST /api/v1/${resourceLower} return 401 or 403.`
      ]
    };
  }

  if (isPy) {
    return {
      feature: `Adding ${resourceName} Router & Wiring into FastAPI App`,
      existingArchitecture: 'FastAPI Microservice Architecture (APIRouter -> Service -> SQLAlchemy Model / Celery Task).',
      wiringInstructions: `It can be done right here in this component by doing this:\n1. Place your new router in: \`${backendSrc}/routers/${resourceLower}.py\`.\n2. Wire it into \`${backendSrc}/main.py\` by doing: \`from routers.${resourceLower} import router as ${resourceLower}_router\` and \`app.include_router(${resourceLower}_router, prefix="/api/v1/${resourceLower}", tags=["${resourceName}"])\`.\n3. Secure endpoints by injecting: \`current_user: User = Depends(get_current_active_user)\`.\n4. Call your business logic in \`${backendSrc}/services/${resourceLower}_service.py\` or database session \`db: Session = Depends(get_db)\`.`,
      existingFilesToModify: [
        {
          file: `${backendSrc}/main.py`,
          reason: `Mount the ${resourceLower} APIRouter into the FastAPI application instance.`,
          targetSymbol: 'app.include_router()'
        }
      ],
      newFilesToCreate: [
        {
          file: `[NEW FILE] ${backendSrc}/routers/${resourceLower}.py`,
          purpose: `FastAPI APIRouter defining HTTP endpoints for ${resourceName}.`,
          proposedPackage: 'routers'
        },
        {
          file: `[NEW FILE] ${backendSrc}/schemas/${resourceLower}.py`,
          purpose: `Pydantic BaseModel request and response schemas.`,
          proposedPackage: 'schemas'
        }
      ],
      boilerplateCode: `from fastapi import APIRouter, Depends, HTTPException, status\nfrom typing import List\nfrom pydantic import BaseModel\n\nrouter = APIRouter()\n\nclass ${resourceName}Create(BaseModel):\n    title: str\n    description: str = ""\n\nclass ${resourceName}Response(BaseModel):\n    id: int\n    title: str\n\n@router.get("/", response_model=List[${resourceName}Response])\ndef get_all():\n    return [{"id": 1, "title": "Sample ${resourceName}"}]\n\n@router.post("/", response_model=${resourceName}Response, status_code=status.HTTP_201_CREATED)\ndef create(payload: ${resourceName}Create):\n    return {"id": 1, "title": payload.title}\n`,
      backendChanges: `Add router module with Pydantic validation schemas. Include router in main.py.`,
      frontendChanges: `Connect API calls using Axios or fetch from frontend UI.`,
      databaseChanges: `Add SQLAlchemy model in models/${resourceLower}.py if table is needed.`,
      apiChanges: `Exposes GET /api/v1/${resourceLower} and POST /api/v1/${resourceLower}.`,
      dependenciesRequired: ['fastapi', 'pydantic'],
      implementationSequence: [
        `Step 1: Create [NEW FILE] ${backendSrc}/schemas/${resourceLower}.py with Pydantic models.`,
        `Step 2: Create [NEW FILE] ${backendSrc}/routers/${resourceLower}.py.`,
        `Step 3: In ${backendSrc}/main.py, add app.include_router(${resourceLower}_router, prefix="/api/v1/${resourceLower}", tags=["${resourceName}"]).`,
        `Step 4: Verify interactive Swagger docs at http://localhost:8000/docs.`
      ],
      testingRequirements: [`pytest test_api.py verifying GET and POST response status.`]
    };
  }

  // Node / Express / TypeScript
  return {
    feature: `Adding ${controllerClass} & Wiring into Express App`,
    existingArchitecture: 'Express.js MVC Architecture (Router -> Controller -> Service -> Prisma ORM).',
    wiringInstructions: `It can be done right here in this component by doing this:\n1. Create your controller router in: \`${backendSrc}/controllers/${resourceLower}.controller.ts\`.\n2. Wire it into \`${backendSrc}/server.ts\` by doing: \`import { ${resourceLower}Router } from './controllers/${resourceLower}.controller';\` and \`app.use('/api/v1/${resourceLower}', ${resourceLower}Router);\`. \n3. Protect the endpoints by doing: adding \`authenticateJwt\` middleware to the router routes.\n4. Call your database queries via Prisma: \`await prisma.${resourceLower}.findMany()\`.`,
    existingFilesToModify: [
      {
        file: `${backendSrc}/server.ts`,
        reason: `Register the new ${resourceLower}Router into Express middleware chain.`,
        targetSymbol: 'app.use()'
      }
    ],
    newFilesToCreate: [
      {
        file: `[NEW FILE] ${backendSrc}/controllers/${resourceLower}.controller.ts`,
        purpose: `Router handling HTTP endpoints for ${resourceName}.`,
        proposedPackage: 'controllers'
      }
    ],
    boilerplateCode: `import { Router, Response } from 'express';\nimport { authenticateJwt, AuthenticatedRequest } from '../middlewares/auth.middleware';\n\nconst router = Router();\n\n// GET all\nrouter.get('/', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {\n  return res.json({ success: true, message: '${resourceName} data retrieved for tenant ' + req.tenantId });\n});\n\n// POST create\nrouter.post('/', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {\n  const payload = req.body;\n  return res.status(201).json({ success: true, message: '${resourceName} created successfully', data: payload });\n});\n\nexport const ${resourceLower}Router = router;`,
    backendChanges: `Mount ${resourceLower}Router in server.ts under /api/v1/${resourceLower}.`,
    frontendChanges: `Invoke /api/v1/${resourceLower} using client HTTP library.`,
    databaseChanges: `Add model in prisma/schema.prisma if persistence is needed.`,
    apiChanges: `Exposes GET /api/v1/${resourceLower} and POST /api/v1/${resourceLower}.`,
    dependenciesRequired: ['express', 'zod'],
    implementationSequence: [
      `Step 1: Create [NEW FILE] ${backendSrc}/controllers/${resourceLower}.controller.ts.`,
      `Step 2: In ${backendSrc}/server.ts, import ${resourceLower}Router and add app.use('/api/v1/${resourceLower}', ${resourceLower}Router).`,
      `Step 3: Test endpoints with Postman or Jest.`
    ],
    testingRequirements: [`Jest integration test checking 200 OK and 201 Created responses.`]
  };
}

function generateJwtBlueprint(analysis, backendSrc, frontendSrc, basePkg, isJava, isNode, isPy) {
  if (isJava) {
    return {
      feature: 'JWT Authentication and Stateless Security',
      existingArchitecture: 'Spring Boot 3.x Tiered Architecture with Spring Security Filter Chain and JPA persistence.',
      wiringInstructions: `It can be done right here in this component by doing this:\n1. Open \`${backendSrc}/config/SecurityConfig.java\` and configure \`.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))\`.\n2. Add the JWT filter by doing: \`.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)\`.\n3. Create \`JwtService.java\` in \`${basePkg}.config\` to handle signing HMAC-SHA256 tokens.\n4. In \`AuthService.java\`, inject \`JwtService\` and return the token upon successful \`login()\` and \`register()\`.\n5. On the frontend, in \`${frontendSrc}/services/api.js\`, attach \`Authorization: Bearer <token>\` inside the Axios interceptor.`,
      existingFilesToModify: [
        {
          file: `${backendSrc}/config/SecurityConfig.java`,
          reason: 'Must disable session cookies, enable Stateless session creation policy, and add JwtAuthenticationFilter before UsernamePasswordAuthenticationFilter.',
          targetSymbol: 'securityFilterChain(HttpSecurity http)'
        },
        {
          file: 'backend/pom.xml',
          reason: 'Add io.jsonwebtoken (jjwt-api, jjwt-impl, jjwt-jackson) or spring-boot-starter-oauth2-resource-server dependencies.',
          targetSymbol: '<dependencies>'
        },
        {
          file: 'backend/src/main/resources/application.yml',
          reason: 'Add app.jwt.secret and app.jwt.expiration-ms configuration properties.',
          targetSymbol: 'app.jwt'
        },
        {
          file: `${frontendSrc}/services/api.js`,
          reason: 'Add Axios request interceptor attaching Authorization: Bearer <token> from localStorage.',
          targetSymbol: 'api.interceptors.request.use()'
        }
      ],
      newFilesToCreate: [
        {
          file: `[NEW FILE] ${backendSrc}/config/JwtService.java`,
          purpose: 'Utility service handling HMAC-SHA256 token generation, expiration checking, and Claims parsing.',
          proposedPackage: `${basePkg}.config`
        },
        {
          file: `[NEW FILE] ${backendSrc}/config/JwtAuthenticationFilter.java`,
          purpose: 'OncePerRequestFilter intercepting HTTP requests, extracting Bearer header, and setting SecurityContextHolder.',
          proposedPackage: `${basePkg}.config`
        },
        {
          file: `[NEW FILE] ${backendSrc}/dto/AuthResponseDTO.java`,
          purpose: 'Response payload returning token, type (Bearer), username, and assigned user roles.',
          proposedPackage: `${basePkg}.dto`
        }
      ],
      backendChanges: 'Configure SecurityFilterChain bean with .sessionManagement(stateless) and register JwtAuthenticationFilter in Spring IoC.',
      frontendChanges: 'Save received JWT token in localStorage or secure httpOnly cookie upon successful login; attach Bearer token in Axios request headers.',
      databaseChanges: 'Ensure User entity has unique username/email and role column with standard prefix (e.g. ROLE_USER, ROLE_ADMIN).',
      apiChanges: 'Expose POST /api/v1/auth/login and POST /api/v1/auth/register returning AuthResponseDTO.',
      dependenciesRequired: ['io.jsonwebtoken:jjwt-api:0.12.3', 'io.jsonwebtoken:jjwt-impl:0.12.3', 'io.jsonwebtoken:jjwt-jackson:0.12.3'],
      implementationSequence: [
        'Step 1: Add JJWT dependencies in backend/pom.xml.',
        'Step 2: Define app.jwt.secret in application.yml.',
        'Step 3: Create [NEW FILE] JwtService.java to sign and validate tokens.',
        'Step 4: Create [NEW FILE] JwtAuthenticationFilter.java extending OncePerRequestFilter.',
        'Step 5: Modify SecurityConfig.java to wire JwtAuthenticationFilter and configure stateless session policy.',
        'Step 6: Update AuthService.java and AuthController.java to return AuthResponseDTO with generated token.',
        'Step 7: Update frontend api.js Axios interceptor and Login.jsx form submission.'
      ],
      testingRequirements: [
        'Unit test: JwtServiceTest verifying token generation, claim extraction, and expiration validation.',
        'Integration test: Security integration test asserting that unauthenticated requests to protected endpoints return 401/403, and valid tokens return 200 OK.'
      ]
    };
  }

  return {
    feature: 'JWT Authentication',
    existingArchitecture: 'Modular Client-Server Architecture.',
    wiringInstructions: `It can be done right here in this component by doing this:\n1. In \`${backendSrc}/server.ts\`, register \`authRouter\`.\n2. In \`${backendSrc}/middlewares/auth.middleware.ts\`, add token validation with \`jwt.verify(token, secret)\`.\n3. Wrap protected routes with \`authenticateJwt\`.`,
    existingFilesToModify: [
      { file: `${backendSrc}/server.ts`, reason: 'Register auth router and authentication middleware.', targetSymbol: 'app.use()' },
      { file: 'package.json', reason: 'Add jsonwebtoken and bcryptjs dependencies.', targetSymbol: 'dependencies' }
    ],
    newFilesToCreate: [
      { file: `[NEW FILE] ${backendSrc}/middlewares/auth.middleware.ts`, purpose: 'Verify Bearer token on protected routes.', proposedPackage: 'middlewares' },
      { file: `[NEW FILE] ${backendSrc}/controllers/auth.controller.ts`, purpose: 'Handle /login and /register requests.', proposedPackage: 'controllers' }
    ],
    backendChanges: 'Add token generation in auth service and verification middleware.',
    frontendChanges: 'Store token in localStorage and inject in API request headers.',
    databaseChanges: 'Store passwordHash in User table.',
    apiChanges: 'POST /api/v1/auth/login and POST /api/v1/auth/register',
    dependenciesRequired: ['jsonwebtoken', 'bcryptjs', '@types/jsonwebtoken'],
    implementationSequence: [
      'Step 1: Install jsonwebtoken and bcryptjs.',
      'Step 2: Create auth middleware for Express.',
      'Step 3: Add login/register endpoints.',
      'Step 4: Wire authorization headers on frontend.'
    ],
    testingRequirements: ['Unit test for auth controller with valid/invalid tokens.']
  };
}

function generateEmailVerificationBlueprint(analysis, backendSrc, frontendSrc, basePkg, isJava, isNode, isPy) {
  return {
    feature: 'User Email Verification Workflow',
    existingArchitecture: isJava ? 'Spring Boot Tiered Architecture with JPA & Mail' : 'Express/FastAPI Service',
    wiringInstructions: `It can be done right here in this component by doing this:\n1. In \`User.java\`, add \`isEmailVerified\` and \`verificationToken\` attributes.\n2. In \`AuthService.java\`, right after creating the user, generate a token and call \`EmailService.sendVerificationEmail(user, token)\`.\n3. In \`AuthController.java\`, add endpoint: \`@GetMapping("/verify-email")\`.\n4. On the frontend, in \`App.jsx\`, create a route for \`/verify-email\` pointing to \`VerifyEmail.jsx\`.`,
    existingFilesToModify: [
      {
        file: isJava ? `${backendSrc}/entity/User.java` : `${backendSrc}/models/User.ts`,
        reason: 'Add isEmailVerified (boolean, default false) and verificationToken (String) fields with timestamp.',
        targetSymbol: 'User entity class'
      },
      {
        file: isJava ? `${backendSrc}/service/AuthService.java` : `${backendSrc}/services/auth.service.ts`,
        reason: 'After registering user, generate unique UUID verification token and invoke EmailService.sendVerificationEmail().',
        targetSymbol: 'register()'
      },
      {
        file: isJava ? `${backendSrc}/controller/AuthController.java` : `${backendSrc}/controllers/auth.controller.ts`,
        reason: 'Expose GET /auth/verify-email?token={token} endpoint to validate token and mark email as verified.',
        targetSymbol: 'verifyEmail()'
      },
      {
        file: isJava ? 'backend/src/main/resources/db/migration/V2__add_email_verification.sql' : 'prisma/schema.prisma',
        reason: 'Add schema migration altering users table to add is_email_verified and verification_token columns.',
        targetSymbol: 'ALTER TABLE users'
      }
    ],
    newFilesToCreate: [
      {
        file: `[NEW FILE] ${backendSrc}/service/EmailService.java`,
        purpose: 'Dispatches HTML verification emails containing activation link.',
        proposedPackage: `${basePkg}.service`
      },
      {
        file: `[NEW FILE] ${frontendSrc}/pages/VerifyEmail.jsx`,
        purpose: 'Frontend landing page reading token from URL params and calling verification API.',
        proposedPackage: 'pages'
      }
    ],
    backendChanges: 'Inject JavaMailSender or SendGrid SDK, create HTML email template, handle token expiration checks (e.g. 24 hour TTL).',
    frontendChanges: 'Add route /verify-email in React Router; display success confirmation message with link to login.',
    databaseChanges: 'Add columns is_email_verified BOOLEAN DEFAULT FALSE, verification_token VARCHAR(255), token_expiry TIMESTAMP to users table.',
    apiChanges: 'GET /api/v1/auth/verify-email?token=... and POST /api/v1/auth/resend-verification',
    dependenciesRequired: isJava ? ['org.springframework.boot:spring-boot-starter-mail'] : ['nodemailer', '@types/nodemailer'],
    implementationSequence: [
      'Step 1: Run database migration V2 adding is_email_verified and verification_token.',
      'Step 2: Add spring-boot-starter-mail dependency and SMTP host in application.yml.',
      'Step 3: Create [NEW FILE] EmailService.java with sendVerificationEmail(User user, String token).',
      'Step 4: Update AuthService.register() to generate token and dispatch email.',
      'Step 5: Add verifyEmail() endpoint in AuthController.',
      'Step 6: Create [NEW FILE] VerifyEmail.jsx in frontend and register route in App.jsx.'
    ],
    testingRequirements: [
      'Unit test: EmailServiceTest with Mock JavaMailSender.',
      'Integration test: Assert User cannot login until email is verified (if enforced) and token expires properly.'
    ]
  };
}

function generateRedisCachingBlueprint(analysis, backendSrc, frontendSrc, basePkg, isJava, isNode, isPy) {
  return {
    feature: 'Redis In-Memory Caching Integration',
    existingArchitecture: 'Layered Service Tier with high-read database queries.',
    wiringInstructions: `It can be done right here in this component by doing this:\n1. In \`EnterpriseApplication.java\`, add \`@EnableCaching\`.\n2. In \`EmployeeServiceImpl.java\`, decorate \`getEmployeeById(Long id)\` by doing: \`@Cacheable(value = "employees", key = "#id")\`.\n3. In mutation methods (\`updateEmployee\`, \`deleteEmployee\`), add: \`@CacheEvict(value = "employees", key = "#id")\` to keep cache synchronized.\n4. Create \`RedisConfig.java\` in \`${basePkg}.config\` to customize 3600-second TTL.`,
    existingFilesToModify: [
      {
        file: isJava ? 'backend/pom.xml' : 'package.json',
        reason: 'Add Redis client library (spring-boot-starter-data-redis or ioredis).',
        targetSymbol: '<dependencies>'
      },
      {
        file: isJava ? 'backend/src/main/resources/application.yml' : '.env',
        reason: 'Define spring.data.redis.host and port connection properties.',
        targetSymbol: 'redis config'
      },
      {
        file: isJava ? `${backendSrc}/service/EmployeeServiceImpl.java` : `${backendSrc}/services/employee.service.ts`,
        reason: 'Decorate getEmployeeById() with @Cacheable(value = "employees", key = "#id") and update/delete with @CacheEvict.',
        targetSymbol: 'getEmployeeById()'
      },
      {
        file: 'docker-compose.yml',
        reason: 'Add redis:alpine service on port 6379 with persistent volume.',
        targetSymbol: 'services.redis'
      }
    ],
    newFilesToCreate: [
      {
        file: `[NEW FILE] ${backendSrc}/config/RedisConfig.java`,
        purpose: 'Configures RedisCacheManager with JSON serialization and customized TTL expiration durations.',
        proposedPackage: `${basePkg}.config`
      }
    ],
    backendChanges: 'Enable caching on main application with @EnableCaching; serialize entities with Jackson2JsonRedisSerializer to avoid binary serialization issues.',
    frontendChanges: 'No frontend UI changes required; response latency will drop by 80-95% on cached entities.',
    databaseChanges: 'No schema alterations required; Redis acts as transparent read-through cache.',
    apiChanges: 'Transparent performance optimization; HTTP responses will return identical JSON payloads with significantly reduced latency.',
    dependenciesRequired: isJava ? ['org.springframework.boot:spring-boot-starter-data-redis'] : ['ioredis'],
    implementationSequence: [
      'Step 1: Add Redis container in docker-compose.yml.',
      'Step 2: Add Redis starter dependency in pom.xml.',
      'Step 3: Create [NEW FILE] RedisConfig.java configuring RedisCacheManager with 1-hour default TTL.',
      'Step 4: Annotate EnterpriseApplication with @EnableCaching.',
      'Step 5: Decorate EmployeeServiceImpl read methods with @Cacheable and mutation methods with @CacheEvict.'
    ],
    testingRequirements: [
      'Integration test: Call getEmployeeById() twice; verify employeeRepository.findById() is executed only once due to cache hit.'
    ]
  };
}

function generatePaginationBlueprint(analysis, backendSrc, frontendSrc, basePkg, isJava, isNode, isPy) {
  return {
    feature: 'Server-Side Pagination & Sorting',
    existingArchitecture: 'Controller-Service-Repository Tier with REST responses.',
    wiringInstructions: `It can be done right here in this component by doing this:\n1. In \`EmployeeController.java\`, accept \`@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size\`.\n2. In \`EmployeeService.java\`, change return type to \`Page<Employee>\`.\n3. In \`Dashboard.jsx\`, connect the pagination state \`page\` and \`totalPages\` to Prev/Next buttons.`,
    existingFilesToModify: [
      {
        file: isJava ? `${backendSrc}/repository/EmployeeRepository.java` : `${backendSrc}/repositories/employee.repo.ts`,
        reason: 'Ensure repository extends PagingAndSortingRepository or JpaRepository.',
        targetSymbol: 'JpaRepository<Employee, Long>'
      },
      {
        file: isJava ? `${backendSrc}/service/EmployeeService.java` : `${backendSrc}/services/employee.service.ts`,
        reason: 'Change return type of getAllEmployees from List<Employee> to Page<Employee> accepting Pageable parameter.',
        targetSymbol: 'getAllEmployees()'
      },
      {
        file: isJava ? `${backendSrc}/controller/EmployeeController.java` : `${backendSrc}/controllers/employee.controller.ts`,
        reason: 'Accept @RequestParam page (default 0), size (default 10), sortBy (default id), direction (default asc).',
        targetSymbol: 'getAllEmployees()'
      },
      {
        file: `${frontendSrc}/pages/Dashboard.jsx`,
        reason: 'Add page state, totalPages state, and pagination navigation bar with Prev/Next and Page X of Y indicators.',
        targetSymbol: 'Dashboard component render'
      }
    ],
    newFilesToCreate: [
      {
        file: `[NEW FILE] ${frontendSrc}/components/Pagination.jsx`,
        purpose: 'Reusable pagination bar widget with page size selector and jump-to-page buttons.',
        proposedPackage: 'components'
      }
    ],
    backendChanges: 'Use Spring Data PageRequest.of(page, size, Sort.by(sortBy)) to fetch sliced data and total count in single query.',
    frontendChanges: 'Render pagination controls under employee table; fetch data on page change.',
    databaseChanges: 'No schema alterations; leverages SQL LIMIT and OFFSET behind the scenes.',
    apiChanges: 'GET /api/v1/employees?page=0&size=10&sortBy=salary&direction=desc returning Page<Employee> metadata.',
    dependenciesRequired: ['Spring Data JPA (already present)'],
    implementationSequence: [
      'Step 1: Update EmployeeService interface to accept Pageable.',
      'Step 2: Update EmployeeServiceImpl to call employeeRepository.findAll(pageable).',
      'Step 3: Update EmployeeController to expose query parameters.',
      'Step 4: Create [NEW FILE] Pagination.jsx in frontend.',
      'Step 5: Integrate Pagination component in Dashboard.jsx.'
    ],
    testingRequirements: [
      'Unit test: Verify that requesting page 1 with size 5 returns correct slice and total count.'
    ]
  };
}

function generateAdminDashboardBlueprint(analysis, backendSrc, frontendSrc, basePkg, isJava, isNode, isPy) {
  return {
    feature: 'Admin Analytics & Management Dashboard',
    existingArchitecture: 'Role-guarded backend endpoints with decoupled React frontend.',
    wiringInstructions: `It can be done right here in this component by doing this:\n1. In \`AdminController.java\`, expose \`GET /api/v1/admin/stats\` guarded with \`@PreAuthorize("hasRole('ADMIN')")\`.\n2. In \`EmployeeRepository.java\`, add aggregate metrics: \`@Query("SELECT COUNT(e) FROM Employee e")\`.\n3. In frontend \`App.jsx\`, add a guarded route \`<ProtectedRoute role="ROLE_ADMIN"><AdminDashboard /></ProtectedRoute>\`.`,
    existingFilesToModify: [
      {
        file: isJava ? `${backendSrc}/controller/EmployeeController.java` : `${backendSrc}/controllers/employee.controller.ts`,
        reason: 'Ensure administrative CRUD actions have @PreAuthorize("hasRole(\'ADMIN\')").',
        targetSymbol: '@PreAuthorize'
      },
      {
        file: `${frontendSrc}/services/api.js`,
        reason: 'Add admin-specific endpoints (metrics, user roles management, audit logs).',
        targetSymbol: 'adminApi'
      },
      {
        file: `${frontendSrc}/App.jsx`,
        reason: 'Add ProtectedRoute guarding /admin routes based on user_role in localStorage.',
        targetSymbol: 'App routing'
      }
    ],
    newFilesToCreate: [
      {
        file: `[NEW FILE] ${backendSrc}/controller/AdminController.java`,
        purpose: 'Exposes aggregate system statistics: total headcount, payroll breakdown by department, recent hires.',
        proposedPackage: `${basePkg}.controller`
      },
      {
        file: `[NEW FILE] ${backendSrc}/dto/AdminStatsDTO.java`,
        purpose: 'Structured metrics payload for admin charts and summary widgets.',
        proposedPackage: `${basePkg}.dto`
      },
      {
        file: `[NEW FILE] ${frontendSrc}/pages/AdminDashboard.jsx`,
        purpose: 'Administrative UI displaying KPI metric cards, department salary chart, and user role management table.',
        proposedPackage: 'pages'
      }
    ],
    backendChanges: 'Add aggregate query methods in EmployeeRepository (e.g. SUM(salary), COUNT(id) GROUP BY department) and expose via AdminController.',
    frontendChanges: 'Create AdminDashboard page with role-guarded access; show warning banner for non-admin attempts.',
    databaseChanges: 'No schema alterations needed; leverages existing users and employees tables.',
    apiChanges: 'GET /api/v1/admin/stats returning { totalEmployees, totalPayroll, departmentBreakdown, userCounts }',
    dependenciesRequired: ['Chart.js or Lucide icons for UI widgets'],
    implementationSequence: [
      'Step 1: Create [NEW FILE] AdminStatsDTO.java.',
      'Step 2: Add aggregate queries in EmployeeRepository.java.',
      'Step 3: Create [NEW FILE] AdminController.java annotated with @PreAuthorize("hasRole(\'ADMIN\')").',
      'Step 4: Create [NEW FILE] AdminDashboard.jsx in frontend/src/pages.',
      'Step 5: Configure protected route in App.jsx.'
    ],
    testingRequirements: [
      'Security test: Verify that non-admin users receive 403 Forbidden when requesting /admin/stats.'
    ]
  };
}

function generatePaymentBlueprint(analysis, backendSrc, frontendSrc, basePkg, isJava, isNode, isPy) {
  return {
    feature: 'Stripe Payment Gateway Integration',
    existingArchitecture: 'REST Service with asynchronous webhook notification handler.',
    wiringInstructions: `It can be done right here in this component by doing this:\n1. In \`PaymentController.java\`, expose \`POST /api/v1/payments/create-checkout-session\`.\n2. In \`SecurityConfig.java\`, mark \`/payments/webhook\` as \`permitAll()\` and disable CSRF on it.\n3. In \`PaymentService.java\`, initialize \`Stripe.apiKey\` and construct webhook events.\n4. In frontend, wire the Checkout button to redirect to Stripe Session URL.`,
    existingFilesToModify: [
      {
        file: isJava ? 'backend/pom.xml' : 'package.json',
        reason: 'Add official stripe-java (or stripe Node.js SDK) dependency.',
        targetSymbol: 'dependencies'
      },
      {
        file: isJava ? 'backend/src/main/resources/application.yml' : '.env',
        reason: 'Add stripe.api.key and stripe.webhook.secret.',
        targetSymbol: 'stripe config'
      },
      {
        file: isJava ? 'backend/src/main/resources/db/migration/V3__add_payment_records.sql' : 'prisma/schema.prisma',
        reason: 'Create payments table tracking transaction ID, amount, currency, and payment status.',
        targetSymbol: 'CREATE TABLE payments'
      }
    ],
    newFilesToCreate: [
      {
        file: `[NEW FILE] ${backendSrc}/controller/PaymentController.java`,
        purpose: 'Creates Stripe Checkout sessions and listens for Stripe webhook events.',
        proposedPackage: `${basePkg}.controller`
      },
      {
        file: `[NEW FILE] ${backendSrc}/service/PaymentService.java`,
        purpose: 'Interacts with Stripe API and persists payment state upon invoice.payment_succeeded.',
        proposedPackage: `${basePkg}.service`
      },
      {
        file: `[NEW FILE] ${backendSrc}/entity/PaymentRecord.java`,
        purpose: 'ORM entity representing completed transactions.',
        proposedPackage: `${basePkg}.entity`
      }
    ],
    backendChanges: 'Configure Stripe.apiKey; implement raw body webhook signature verification with Webhook.constructEvent().',
    frontendChanges: 'Add Checkout button redirecting user to Stripe Hosted Checkout URL.',
    databaseChanges: 'Create table payments (id BIGSERIAL, stripe_payment_id VARCHAR(100), amount NUMERIC(12,2), status VARCHAR(30)).',
    apiChanges: 'POST /api/v1/payments/create-checkout-session and POST /api/v1/payments/webhook',
    dependenciesRequired: isJava ? ['com.stripe:stripe-java:24.12.0'] : ['stripe'],
    implementationSequence: [
      'Step 1: Add stripe dependency in pom.xml.',
      'Step 2: Add Stripe API key in application.yml.',
      'Step 3: Create [NEW FILE] PaymentRecord.java entity and migration script.',
      'Step 4: Create [NEW FILE] PaymentService.java managing Checkout sessions.',
      'Step 5: Create [NEW FILE] PaymentController.java handling checkout request and webhook callbacks.',
      'Step 6: Expose /payments/webhook as permitAll in SecurityConfig without CSRF.'
    ],
    testingRequirements: [
      'Webhook test: Simulate Stripe CLI webhook event and verify payment record is marked as SUCCEEDED.'
    ]
  };
}

function generateGenericFeatureBlueprint(featureName, analysis, backendSrc, frontendSrc, basePkg) {
  const sanitized = featureName.replace(/[^a-zA-Z0-9]/g, '');
  return {
    feature: featureName,
    existingArchitecture: 'Layered Modular Architecture.',
    wiringInstructions: `It can be done right here in this component by doing this:\n1. Create [NEW FILE] \`${backendSrc}/controller/${sanitized}Controller.java\`.\n2. In \`SecurityConfig.java\`, add authorization matchers for \`/${sanitized.toLowerCase()}/**\`.\n3. Encapsulate business logic in \`${backendSrc}/service/${sanitized}Service.java\`.\n4. Wire client communication in \`${frontendSrc}/services/api.js\`.`,
    existingFilesToModify: [
      {
        file: `${backendSrc}/config/SecurityConfig.java`,
        reason: `Authorize routes for ${featureName}.`,
        targetSymbol: 'securityFilterChain()'
      },
      {
        file: `${frontendSrc}/services/api.js`,
        reason: `Add API client method to invoke ${featureName} backend operations.`,
        targetSymbol: 'api methods'
      }
    ],
    newFilesToCreate: [
      {
        file: `[NEW FILE] ${backendSrc}/service/${sanitized}Service.java`,
        purpose: `Encapsulate core business logic for ${featureName}.`,
        proposedPackage: `${basePkg}.service`
      },
      {
        file: `[NEW FILE] ${backendSrc}/controller/${sanitized}Controller.java`,
        purpose: `Expose REST endpoints for ${featureName}.`,
        proposedPackage: `${basePkg}.controller`
      },
      {
        file: `[NEW FILE] ${frontendSrc}/components/${sanitized}.jsx`,
        purpose: `UI component for user interaction with ${featureName}.`,
        proposedPackage: 'components'
      }
    ],
    backendChanges: `Implement service layer routines, request validation, and persistence for ${featureName}.`,
    frontendChanges: `Create responsive UI widget with form inputs and state binding.`,
    databaseChanges: `Add required entity attributes or dedicated table if ${featureName} requires persistent state.`,
    apiChanges: `Expose REST endpoints under /api/v1/${sanitized.toLowerCase()}.`,
    dependenciesRequired: ['Standard framework libraries'],
    implementationSequence: [
      `Step 1: Define domain models or DTOs for ${featureName}.`,
      `Step 2: Create [NEW FILE] ${sanitized}Service.java.`,
      `Step 3: Expose endpoints in [NEW FILE] ${sanitized}Controller.java.`,
      `Step 4: Wire frontend client in api.js and build [NEW FILE] ${sanitized}.jsx component.`
    ],
    testingRequirements: [
      `Unit tests covering ${sanitized}Service edge cases and endpoint response codes.`
    ]
  };
}
