/**
 * Architectural Advisor Engine
 * Answers: "Where should I implement [Feature]?"
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
      if (parts.length > 0) {
        backendSrc = javaFile.path.substring(0, javaFile.path.indexOf(parts[parts.length - 1])) + parts[parts.length - 1];
        basePackage = parts.join('.');
      }
    }
  } else if (isNodeExpress) {
    backendSrc = files.some(f => f.path.startsWith('src/')) ? 'src' : 'backend/src';
    frontendSrc = 'client/src';
  } else if (isPython) {
    backendSrc = files.some(f => f.path.startsWith('app/')) ? 'app' : 'src';
    frontendSrc = 'frontend/src';
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

function generateJwtBlueprint(analysis, backendSrc, frontendSrc, basePkg, isJava, isNode, isPy) {
  if (isJava) {
    return {
      feature: 'JWT Authentication and Stateless Security',
      existingArchitecture: 'Spring Boot 3.x Tiered Architecture with Spring Security Filter Chain and JPA persistence.',
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
    existingFilesToModify: [
      {
        file: `${backendSrc}/controller/EmployeeController.java`,
        reason: `Modify controller or register dedicated endpoint for ${featureName}.`,
        targetSymbol: 'controller mapping'
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
