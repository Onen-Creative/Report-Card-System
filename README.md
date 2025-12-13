# School Management & Report Card System

Production-ready system for Ugandan schools (ECCE → S6) with UNEB/NCDC grading.

## Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- MinIO (or S3-compatible storage)

## Quick Start

```bash
# 1. Install MySQL, Redis, and MinIO locally
# PostgreSQL: https://www.postgresql.org/download/
# Redis: https://redis.io/download
# MinIO: https://min.io/download

# 2. Create database
psql -U postgres -c "CREATE DATABASE school_system;"

# 3. Configure backend/.env with your database credentials

# 4. Run migrations
cd backend
go run cmd/api/main.go migrate

# 5. Create admin
go run cmd/api/main.go seed-admin

# 6. Setup standardized subjects
./setup-standard-subjects.sh

# 7. Load sample data (optional)
psql -U postgres -d school_system -f ../seed/sample_data.sql
```

## Access

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080
- **Login**: admin@school.ug / Admin@123

## Stack

- Backend: Go + Gin + GORM + MySQL
- Frontend: React + TypeScript + Vite + Tailwind
- Worker: Node.js + Puppeteer
- Queue: Redis + Asynq
- Storage: S3-compatible

## Features

✅ Multi-section support (ECCE, P1-P7, S1-S6)
✅ **Standardized curriculum subjects** - All schools use the same subjects per level
✅ Role-based access (Admin, Teacher)
✅ Offline-first marks entry
✅ UNEB & NCDC grading engines
✅ PDF report generation
✅ Audit logging
✅ JWT authentication

## Development

```bash
# Terminal 1 - Backend
cd backend
go run cmd/api/main.go

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Terminal 3 - Worker
cd worker
npm install
npm run dev

# Tests
cd backend && go test ./... -v
cd frontend && npm test
```

## Deployment

See `docs/DEPLOYMENT.md` for production deployment guide.

## API Documentation

OpenAPI spec: `docs/openapi.yaml`
