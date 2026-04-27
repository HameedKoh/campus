# API Contract

Base URL: `/api`

## Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

## Users

- `GET /users/me`

## Admin

- `POST /admin/users`

## Assessments

- `POST /assessments`
- `GET /assessments/me`
- `GET /assessments/:id`

## Appointments

- `POST /appointments`
- `GET /appointments/me`
- `GET /appointments`
- `PATCH /appointments/:id/status`
- `PATCH /appointments/:id/assign`

## Emergencies

- `POST /emergencies`
- `GET /emergencies`
- `PATCH /emergencies/:id/acknowledge`
- `PATCH /emergencies/:id/resolve`

## Records

- `GET /records/me`
- `GET /records/:studentId`
- `POST /records/:studentId/entries`

## Dashboard

- `GET /dashboard/summary`
