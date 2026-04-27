# it3030-paf-2026-smart-campus-group_WE_17_1.2

# OperationHub

OperationHub is a Smart Campus management platform with:

- Spring Boot backend
- React frontend
- Modules for facilities, bookings, authentication, and ticket management

## Project Structure

- src/main/java: Spring Boot backend source
- src/main/resources: backend configuration and static resources
- src/test/java: backend tests
- smart-campus-frontend/src: React frontend source
- data: app data files
- uploads: uploaded files

## Prerequisites

- Java 17 or newer
- Maven 3.8 or newer
- Node.js 18 or newer
- npm 9 or newer

## Setup

1. Clone the repository
2. Configure backend properties in src/main/resources/application.properties
3. Install frontend dependencies

Frontend install command:
    cd smart-campus-frontend
    npm install

## Run the Application

Run backend (from project root):
    mvnw spring-boot:run

Run frontend (from smart-campus-frontend):
    npm start

Default local URLs:

- Backend: http://localhost:8080
- Frontend: http://localhost:3000

## Build

Backend build (project root):
    mvnw clean package

Frontend production build (smart-campus-frontend):
    npm run build

## Testing

Backend tests (project root):
    mvnw test

Frontend tests (smart-campus-frontend):
    npm test

## Main Features

- User authentication and role-based access
- Facility listing and details
- Booking request and approval flow
- Ticket creation, assignment, and tracking
- Admin and user dashboards

## Tech Stack

- Backend: Spring Boot, Maven
- Frontend: React, JavaScript, CSS
- API: REST
- Auth: Token-based authentication flow

## Notes

- Current frontend template README is at [smart-campus-frontend/README.md](smart-campus-frontend/README.md).
- You can keep a separate frontend-specific README there and use this root README for full-project setup.
