# RepoMind Platform — Complete Production Deployment Guide 🚀

RepoMind is architected as an **autonomous single-service full-stack platform**. In production, the Express backend serves the high-performance compiled React frontend Single-Page Application (`client/dist`) as well as all REST API endpoints, AST analysis engines, and health-check telemetry.

---

## 🌟 Table of Contents
1. [Prerequisites & Verification](#-prerequisites--verification)
2. [Option 1: Free 1-Click Cloud Deployment on Render (Recommended)](#-option-1-free-cloud-deployment-on-render-recommended)
3. [Option 2: 1-Click Deployment on Railway](#-option-2-deployment-on-railway)
4. [Option 3: Containerized Deployment with Docker & Docker Compose](#-option-3-containerized-deployment-docker--docker-compose)
5. [Option 4: Traditional Linux VPS / AWS EC2 / DigitalOcean Droplet (PM2 + Nginx)](#-option-4-linux-vps-aws-ec2-digitalocean-with-pm2--nginx)
6. [System Health Check & Telemetry Endpoint](#-system-health-check--telemetry)
7. [Environment Variables Reference](#-environment-variables-reference)

---

## 📋 Prerequisites & Verification

Before deploying, test building the unified production bundle locally:

```bash
# 1. Install dependencies
npm install

# 2. Build the production bundle (creates client/dist)
npm run build

# 3. Start unified production server
npm start
```
Visit **`http://localhost:5000`** in your browser to verify that the app loads and preloads sample projects.

---

## ☁️ Option 1: Free Cloud Deployment on Render (Recommended)

Render offers free tier hosting for Node.js web services with automatic HTTPS/SSL and Git-based CI/CD.

### Method A: Using Render Blueprint (`render.yaml`) — Automated 1-Click
1. Push your code to a GitHub repository:
   ```bash
   git add .
   git commit -m "feat: production deployment & multi-theme UI"
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **Blueprints** → **New Blueprint Instance**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` in the root:
   - **Service Name**: `repomind-platform`
   - **Environment**: Node
   - **Build Command**: `npm install --prefix client --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Click **Apply**. Within ~2 minutes, your live URL will be active (e.g. `https://repomind-platform.onrender.com`).

### Method B: Manual Web Service on Render
If you prefer setting up manually without blueprints:
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm install --prefix client --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Advanced**, add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
5. Click **Deploy Web Service**.

---

## 🚂 Option 2: Deployment on Railway

Railway supports instant Git deployments and Dockerfiles:

1. Log in to [Railway.app](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select this repository.
4. Railway will automatically detect the root `Dockerfile` and build the container image.
5. In **Settings** → **Networking**, click **Generate Domain** to get a public URL (e.g. `https://repomind-production.up.railway.app`).

---

## 🐳 Option 3: Containerized Deployment (Docker & Docker Compose)

RepoMind includes an optimized multi-stage `Dockerfile` and `docker-compose.yml` for self-hosted instances, cloud VMs, and on-premise servers.

### 1-Command Startup with Docker Compose
```bash
# Build and run the container in the background
docker compose up -d --build

# Inspect running container and healthcheck
docker compose ps

# View real-time logs
docker compose logs -f
```

The container automatically maps port `5000:5000` and creates a persistent Docker volume `repomind_uploads` for storing user-uploaded projects across container updates.

### Manual Docker Build & Run
```bash
# Build production image
docker build -t repomind:latest .

# Run container with healthcheck
docker run -d \
  --name repomind_platform \
  -p 5000:5000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  repomind:latest
```

---

## 🖥️ Option 4: Linux VPS (AWS EC2 / DigitalOcean) with PM2 & Nginx

If deploying directly on an Ubuntu/Debian server:

### 1. Install Node.js 20+ & PM2
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### 2. Clone Repository & Build Bundle
```bash
cd /var/www
git clone https://github.com/sanjayashwinP/AI-Powered-Repository-Intelligence-Platform.git repomind
cd repomind

# Install dependencies and build frontend SPA
npm install
npm install --prefix client --legacy-peer-deps
npm run build
```

### 3. Start with PM2
```bash
# Start background daemon with 2 cluster instances
pm2 start server/server.js --name "repomind" -i max --env NODE_ENV=production

# Save PM2 process list to resurrect on reboot
pm2 save
pm2 startup
```

### 4. Configure Nginx Reverse Proxy & SSL
Create `/etc/nginx/sites-available/repomind`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable the site and obtain a free Let's Encrypt SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/repomind /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🩺 System Health Check & Telemetry

RepoMind includes an automated health endpoint:

```
GET /api/health
```

### Sample Response:
```json
{
  "status": "healthy",
  "service": "RepoMind Intelligence Platform",
  "version": "2.4.0",
  "uptimeSeconds": 3600,
  "timestamp": "2026-11-02T11:23:32.312Z",
  "repositoriesLoaded": 5,
  "memoryUsageMB": {
    "rss": 73,
    "heapTotal": 21,
    "heapUsed": 13
  },
  "environment": "production"
}
```

You can point tools like [UptimeRobot](https://uptimerobot.com/), [BetterStack](https://betterstack.com/), Kubernetes Liveness probes, or AWS ALB health checks to `/api/health`.

---

## ⚙️ Environment Variables Reference

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which the Express server and frontend SPA are served. Cloud platforms like Render & Railway provide this automatically via `$PORT`. |
| `NODE_ENV` | `development` | Set to `production` in live environments to optimize caching and error handling. |

---

## 🎯 Verification Checklist

- [x] Preloaded sample projects load immediately on homepage.
- [x] Uploading ZIP folder analyzes project AST in memory.
- [x] Monaco code viewer opens and cites exact lines.
- [x] Theme Switcher toggles between **Aurora Emerald**, **Nebula Violet**, **Tokyo Sunset**, **Nordic Frost**, and **Titanium Gold**.
- [x] Export Dossier (.md and JSON) generates full architectural specifications.
- [x] `/api/health` returns status `200 OK` with JSON telemetry.
