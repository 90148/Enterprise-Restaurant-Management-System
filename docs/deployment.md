# Deployment Guide

## 1. Local Docker Compose
To run the full stack (PostgreSQL, Backend, Frontend):
```bash
cd docker
docker compose up -d --build
```
- Frontend: `http://localhost:3000`
- Backend REST API: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- PostgreSQL: `localhost:5432`

## 2. Cloud Production Deployment

### Backend (Render / Railway / AWS ECS)
- Provide environment variables:
  - `DB_URL`: `jdbc:postgresql://<managed-pg-host>:5432/<db_name>`
  - `DB_USERNAME`: `<db_user>`
  - `DB_PASSWORD`: `<db_password>`
  - `JWT_SECRET`: `<secure_256_bit_secret>`
  - `SPRING_PROFILES_ACTIVE`: `prod`
  - `CORS_ORIGINS`: `https://your-frontend-domain.com`

### Frontend (Vercel / Netlify / Render Static)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_BASE_URL`: `https://your-backend-domain.com/api`
  - `VITE_WS_URL`: `https://your-backend-domain.com/ws`
