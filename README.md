# RepoMind: AI-Powered Repository Intelligence & Feature Discovery Platform

An advanced intelligent software repository understanding and feature discovery platform. RepoMind analyzes entire codebases across multiple languages and frameworks to provide static AST inspection, multi-layered architectural understanding, automated feature classification, hybrid conversational code Q&A, and safe Monaco Diff patch suggestions.

![RepoMind Architecture](https://img.shields.io/badge/Architecture-Modular%20Tiered-indigo?style=for-the-badge)
![Supported Stacks](https://img.shields.io/badge/Stacks-Java%20%7C%20TypeScript%20%7C%20Python%20%7C%20Go%20%7C%20SQL-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

---

## 🌟 Key Capabilities

### 1. Complete Project Understanding (15 Architectural Layers)
Automatically detects languages and frameworks (Spring Boot, React, Node.js, Express, NestJS, Python FastAPI, SQLAlchemy, Prisma, Celery, Docker, Flyway, etc.) without making rigid framework assumptions. Analyzes 15 distinct architectural layers:
- **Frontend Source Code**: Components, pages, hooks, state management, routing.
- **Backend Source Code**: Application entry points, configuration, server bootstrapping.
- **REST API Controllers**: Endpoints, HTTP methods, path parameter mapping, line citations.
- **Service Layer**: Business logic services, transactional boundaries, service interfaces.
- **Repository & DAO Classes**: Data access objects, custom `@Query` definitions.
- **Database Entities & Models**: Tables, columns, foreign keys, relationships (`@OneToMany`, `@ManyToOne`).
- **DTOs & Validation Schemas**: Request/response contracts with Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`) and Zod schemas.
- **Security Configuration**: Filter chains, CORS, CSRF, guards, role definitions.
- **Authentication & Authorization**: Registration, login, JWT token issuance, BCrypt password hashing, RBAC (`@PreAuthorize`).
- **Configuration Files**: Properties, YAML, `.env`, Docker Compose files.
- **Database Schema & Migrations**: Version-controlled Flyway SQL migrations, Prisma migrations, Alembic.
- **Project Dependencies**: Dependencies parsed from `pom.xml`, `package.json`, `requirements.txt`.
- **Unit & Integration Tests**: Test suites (JUnit 5, Mockito, Jest, PyTest).
- **Documentation**: Swagger/OpenAPI specs, architecture guides, README files.
- **Build & Deployment Specs**: Multi-stage Dockerfiles, Docker Compose, CI/CD pipelines.

### 2. Automatic Feature Discovery & 4-Status Classification
Scans actual source code implementation rather than relying solely on filenames or documentation:
- **`IMPLEMENTED`**: Strong source code evidence verifies both declaration and execution logic.
- **`PARTIALLY IMPLEMENTED`**: Components exist, but functionality cannot be verified (e.g. entity without service logic or client form without backend endpoint).
- **`NOT FOUND`**: No supporting implementation was found within the analyzed repository.
- **`NEEDS VERIFICATION`**: Static code hints at feature existence, but runtime behavior requires confirmation.

Each discovered feature includes:
- Feature name, category, and implementation status
- Verifiable code evidence excerpt
- Relevant files, classes, methods, and line ranges
- Missing components (for partially implemented or not found features)
- **"Open in Monaco"** button that jumps directly to the source code and highlights the cited line.

### 3. Natural-Language Conversational Assistant & Hybrid QA
- ChatGPT-style multi-turn chat interface with session memory.
- Hybrid retrieval index combining BM25 keyword matching, AST code symbols, and architecture knowledge graph.
- Every grounded answer provides verifiable references in strict schema format:
  ```
  File: backend/src/main/java/com/repomind/enterprise/controller/AuthController.java
  Class: AuthController
  Method: login()
  Lines: 28–33
  Evidence: public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) ...
  ```
- Answers cross-module questions, traces data flows (e.g., employee registration flow from client to PostgreSQL), and provides technical explanations.

### 4. "Where Should I Implement a New Feature?" Engine
A specialized architectural advisor that inspects existing directory conventions, package names, and design tiers:
- Synthesizes a structured architectural blueprint for requested features (JWT, Redis caching, Email verification, Pagination, Admin dashboard, Payment gateway, etc.):
  1. Existing architecture context
  2. Existing files to modify (with reasons and target symbols)
  3. New files to create (clearly labeled `[NEW FILE]` with exact proposed package paths matching project conventions)
  4. Changes categorized across Backend, Frontend, Database, API, and Dependencies
  5. Step-by-step implementation sequence
  6. Required verification tests

### 5. Intelligent Recommendations & Safe Patch Studio
- Prioritized improvement dossier (Critical, High, Medium, Low) across Security, Performance, Clean Code, and Testing.
- Full 12-point attribute report per recommendation: title, current implementation, problem, why necessary, exact file, class/method, line numbers, changes, implementation approach, related files, tests required, priority.
- Monaco Diff Studio displaying side-by-side / unified diffs comparing original repository code with proposed improvements.
- **Safe Patch Application**: Automatically archives a timestamped backup snapshot in `.repomind_backups/` before modifying code.
- **1-Click Rollback**: Instantly restores previous backup snapshot with full file validation.

### 6. Flexible Repository Ingestion & Preloaded Sample Projects
- **Upload Options**:
  - ZIP Project Folder (drag-and-drop / file picker with automatic extraction)
  - GitHub Repository URL (public repository clone / download)
  - Local Directory Folder (path scan)
- **Preloaded Multi-Stack Real-World Projects**:
  1. `Enterprise Management Hub` (Spring Boot 3 + React + PostgreSQL + Flyway + Spring Security + JWT)
  2. `SaaS Subscription Platform` (Node.js + Express + Prisma + Stripe + Redis + Jest)
  3. `AI Analytics Microservice` (Python FastAPI + Celery + SQLAlchemy + Alembic + PyTest)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/sanjayashwinP/AI-Powered-Repository-Intelligence-Platform.git
cd AI-Powered-Repository-Intelligence-Platform

# Install root & backend dependencies
npm install

# Install client dependencies
npm install --prefix client --legacy-peer-deps
```

### Running the Application
```bash
# Start both Backend API (port 5000) and Frontend Dev Server (port 3000) concurrently:
npm run dev

# Or build the frontend bundle and run the unified server:
npm run build
npm start
```

Visit **`http://localhost:3000`** (or **`http://localhost:5000`**) in your web browser.

---

## 📁 Repository Structure

```
├── client/                     # Vite + React Frontend SPA
│   ├── index.html              # HTML entry point with Google Fonts
│   ├── src/
│   │   ├── App.jsx             # Main application orchestrator
│   │   ├── index.css           # Modern dark glassmorphism design system
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── ProjectOverviewView.jsx    # 15 Architectural Layers Inspector
│   │       ├── FeatureDiscoveryView.jsx   # Feature Inventory Dashboard
│   │       ├── ConversationalQAView.jsx   # ChatGPT-Style QA Assistant
│   │       ├── WhereToImplementView.jsx   # Implementation Planner Blueprint
│   │       ├── RecommendationsView.jsx    # 12-Point Dossier & Monaco Diff Studio
│   │       ├── MonacoEditorModal.jsx      # Embedded Monaco Code Inspector
│   │       └── UploadModal.jsx            # Multi-Source Upload Modal
├── server/                     # Express Backend Server & AST Analysis Engine
│   ├── server.js               # REST API endpoints & static serving
│   ├── services/
│   │   ├── projectAnalyzer.js         # Multi-language AST & tech detection
│   │   ├── featureDiscovery.js        # Feature discovery & 4-status classifier
│   │   ├── qaEngine.js                # Conversational QA & hybrid retrieval
│   │   ├── architecturalAdvisor.js    # Where-to-implement planner
│   │   ├── patchEngine.js             # Patch diff, safe backup, and rollback
│   │   └── sampleRepositories.js      # Preloaded multi-stack project seeds
│   └── samples/                # Embedded real-world repositories (Spring Boot, Node.js, FastAPI)
└── package.json                # Root orchestration & scripts
```

---

## 📄 License
This project is licensed under the MIT License.
