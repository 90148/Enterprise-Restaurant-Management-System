# Testing Guide

## 1. Backend Testing
Backend tests utilize JUnit 5, Spring Boot Test, and MockMvc:
```bash
cd backend
mvn clean test
```
All unit tests, security filter verifications, and controller slice tests run in isolation with in-memory database support.

## 2. Frontend Build & Type Validation
Frontend TypeScript strict checking and production bundling:
```bash
cd frontend
npm run build
```
Validates zero type errors and bundles optimized CSS and JS assets.
