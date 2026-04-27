# Architecture Overview

## Core Flow

```text
Student action
  -> React frontend
  -> Express API
  -> validation + auth middleware
  -> service layer
  -> Prisma/PostgreSQL
  -> response returned to frontend
```

## Backend Design

The backend uses a layered architecture:

- `routes`: endpoint definitions
- `controllers`: request orchestration
- `services`: business logic
- `repositories`: Prisma data access
- `middleware`: auth, RBAC, validation, error handling
- `modules/ai`: deterministic symptom triage engine

## Security Design

- bcrypt hashing for stored passwords
- JWT access and refresh token flow
- refresh token persistence with token hashing
- role-based access control for student, doctor, admin
- encrypted sensitive note and health-profile fields
- audit log entries for core workflow actions
- rate limiting on auth and AI endpoints

## AI Engine Design

The triage engine is deterministic and explainable:

- symptom normalization and alias cleanup
- red-flag emergency detection
- rule-based condition matching
- weighted risk scoring
- similarity fallback for incomplete matches
- explanation output describing why the result was reached

## Role Responsibilities

- `Student`: self-register, assess symptoms, request appointments, raise emergencies, view records
- `Doctor`: review queue, acknowledge emergencies, add clinical notes
- `Admin`: provision staff accounts, monitor platform activity, oversee clinic operations
