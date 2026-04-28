# Smart Campus Operations Hub

*IT3030 – Programming Applications and Frameworks | Semester 1, 2026*
*Group: Y3S1_WE_17*

A full-stack web platform for managing university facility bookings, maintenance ticketing, and campus operations. Built with a *Spring Boot REST API* backend and a *React* frontend.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
- [Frontend Setup (React)](#frontend-setup-react)
- [Environment Variables](#environment-variables)
- [API Endpoints Reference](#api-endpoints-reference)
- [Roles & Access Control](#roles--access-control)
- [Key Features](#key-features)
- [Testing](#testing)
- [Team Contribution](#team-contribution)

---

## Project Overview

The Smart Campus Operations Hub is a production-inspired web system that provides:

- *Facilities & Assets Catalogue* – Browse, search, and manage bookable resources (lecture halls, labs, meeting rooms, equipment)
- *Booking Management* – Request, approve/reject, and cancel bookings with conflict detection
- *Maintenance & Incident Ticketing* – Report faults, attach evidence images, track resolution
- *Notifications* – Real-time in-app notifications for booking and ticket events
- *Authentication & Authorization* – JWT-based auth with Google OAuth 2.0 sign-in and role-based access control

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 4.0.5 | REST API framework |
| Spring Security | - | Authentication & authorization |
| Spring Data JPA | - | ORM / database layer |
| MySQL | 8+ | Primary database |
| jjwt | 0.12.3 | JWT token generation & validation |
| Lombok | - | Boilerplate reduction |
| ModelMapper | 3.2.6 | DTO mapping |
| Spring Validation | - | Input validation |
| Maven | - | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| React Router DOM | 7 | Client-side routing |
| Axios | 1.15 | HTTP client |
| @react-oauth/google | 0.12.1 | Google OAuth 2.0 sign-in |
| react-datepicker | 9.1.0 | Date/time picker for bookings |
| React Context API | - | Auth state management |

---

## Project Structure


it3030-paf-2026-smart-campus-group_Y3S1_WE_17/
│
├── src/                                      # Spring Boot backend source
│   ├── main/
│   │   ├── java/com/SmartCampus/OperationHub/
│   │   │   ├── Config/                       # Security, CORS, Data Initializer
│   │   │   ├── Controller/                   # REST controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── UserController.java
│   │   │   │   ├── FacilityController.java
│   │   │   │   ├── BookingController.java
│   │   │   │   ├── TicketController.java
│   │   │   │   ├── CommentController.java
│   │   │   │   └── NotificationController.java
│   │   │   ├── DTO/                          # Data Transfer Objects
│   │   │   ├── Enums/                        # FacilityStatus, FacilityType, NotificationType
│   │   │   ├── Event/                        # NotificationEvent, NotificationEventListener
│   │   │   ├── Model/                        # JPA Entities
│   │   │   │   ├── UserModel.java
│   │   │   │   ├── Facility.java
│   │   │   │   ├── Booking.java
│   │   │   │   ├── Ticket.java
│   │   │   │   ├── Comment.java
│   │   │   │   └── Notification.java
│   │   │   ├── Repository/                   # Spring Data JPA repositories
│   │   │   ├── Service/                      # Business logic
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── BookingService.java
│   │   │   │   ├── FacilityService.java / FacilityServiceImpl.java
│   │   │   │   ├── TicketService.java
│   │   │   │   ├── CommentService.java
│   │   │   │   ├── NotificationService.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── OAuth2Service.java
│   │   │   │   └── FileStorageService.java
│   │   │   └── Utils/                        # JWT filters, Google token verifier
│   │   └── resources/
│   │       └── application.properties
│   └── test/                                 # Unit tests (JwtUtilTest, ApplicationTests)
│
├── smart-campus-frontend/                    # React frontend
│   ├── public/
│   └── src/
│       ├── api/                              # Axios services
│       │   ├── axiosInstance.js              # Base Axios config + JWT interceptor
│       │   ├── authService.js
│       │   ├── apiService.js
│       │   ├── bookingService.js
│       │   └── userService.js
│       ├── components/                       # Reusable UI components
│       │   ├── AddFacilityModal.jsx
│       │   ├── EditFacilityModal.jsx
│       │   ├── BookingRequestForm.jsx
│       │   ├── NotificationPanel.jsx
│       │   ├── GoogleSignInButton.jsx
│       │   ├── TicketForm.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── AdminPortalSidebar.jsx
│       │   └── UserPortalSidebar.jsx
│       ├── context/
│       │   └── AuthContext.js               # Global auth state (JWT + user)
│       ├── hooks/
│       │   └── useAuth.js
│       ├── pages/                           # Full page views
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── SignUpPage.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── UserDashboard.jsx
│       │   ├── FacilitiesList.jsx
│       │   ├── FacilitiesPage.jsx
│       │   ├── FacilityDetail.jsx
│       │   ├── BookingRequestPage.jsx
│       │   ├── UserBookingsPage.jsx
│       │   ├── AdminBookingPage.jsx
│       │   ├── TicketList.jsx
│       │   ├── TicketDetail.jsx
│       │   └── TechnicianTasks.jsx
│       └── styles/                          # Component-level CSS
│
├── uploads/                                 # Uploaded ticket attachments (auto-created)
├── pom.xml
└── README.md


---

## Prerequisites

Make sure the following are installed before running the project:

- *Java 17* – [Download](https://www.oracle.com/java/technologies/downloads/#java17)
- *Maven 3.8+* – [Download](https://maven.apache.org/download.cgi)
- *MySQL 8+* – [Download](https://dev.mysql.com/downloads/)
- *Node.js 18+* and *npm* – [Download](https://nodejs.org/)
- A *Google OAuth 2.0 Client ID* – [Google Cloud Console](https://console.cloud.google.com/)

---

## Backend Setup (Spring Boot)

### 1. Create the MySQL Database

sql
CREATE DATABASE operationhub;


### 2. Configure Database Credentials

Open src/main/resources/application.properties and update the credentials if needed:

properties
spring.datasource.url=jdbc:mysql://localhost:3306/operationhub
spring.datasource.username=root
spring.datasource.password=admin


> Tables are auto-created/updated on first run via spring.jpa.hibernate.ddl-auto=update.

### 3. Configure Google OAuth (optional for local testing)

Set your Google Client ID and Secret in application.properties, or as environment variables:

bash
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret


### 4. Build and Run

bash
# From the project root
./mvnw clean install
./mvnw spring-boot:run


Or on Windows:

cmd
mvnw.cmd clean install
mvnw.cmd spring-boot:run


The API will start at: *http://localhost:8081*

---

## Frontend Setup (React)

### 1. Navigate to the frontend directory

bash
cd smart-campus-frontend


### 2. Install dependencies

bash
npm install


### 3. Configure Environment Variables

Create or update smart-campus-frontend/.env:

env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
REACT_APP_API_BASE_URL=http://localhost:8081
REACT_APP_ENV=development


### 4. Start the development server

bash
npm start


The app will open at: *http://localhost:3000*

---

## Environment Variables

### Backend (application.properties)

| Property | Default | Description |
|---|---|---|
| server.port | 8081 | Backend server port |
| spring.datasource.url | jdbc:mysql://localhost:3306/operationhub | MySQL connection URL |
| spring.datasource.username | root | MySQL username |
| spring.datasource.password | admin | MySQL password |
| jwt.secret | (set in properties) | JWT signing secret (min 256-bit) |
| jwt.expiration | 86400000 | JWT expiry in ms (24 hours) |
| GOOGLE_CLIENT_ID | (env var) | Google OAuth2 Client ID |
| GOOGLE_CLIENT_SECRET | (env var) | Google OAuth2 Client Secret |
| file.upload-dir | uploads/ | Directory for ticket attachments |

### Frontend (.env)

| Variable | Description |
|---|---|
| REACT_APP_GOOGLE_CLIENT_ID | Google OAuth2 Client ID |
| REACT_APP_API_BASE_URL | Backend base URL |

---

## API Endpoints Reference

> *Base URL:* http://localhost:8081
> All protected endpoints require Authorization: Bearer <token> header.

### Authentication — /api/auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Login with email & password |
| POST | /api/auth/oauth2/login | Public | OAuth2 token login |
| POST | /api/auth/google/login | Public | Google ID token login |

### Users — /api/v1

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/v1/register | Public | Register a new user |
| POST | /api/v1/login | Public | Login (alternative endpoint) |
| GET | /api/v1/getUser | USER, ADMIN | Get currently authenticated user |
| GET | /api/v1/users | ADMIN | Get all users |
| GET | /api/v1/user/{email} | ADMIN | Get user by email |
| PUT | /api/v1/user/{email} | ADMIN | Update user by email |
| DELETE | /api/v1/user/{email} | ADMIN | Delete user by email |

### Facilities — /api/facilities

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/facilities | USER, ADMIN | List all facilities (supports filtering) |
| GET | /api/facilities/{id} | USER, ADMIN | Get facility by ID |
| POST | /api/facilities | ADMIN | Create a new facility |
| PUT | /api/facilities/{id} | ADMIN | Update facility details |
| PATCH | /api/facilities/{id}/status | ADMIN | Update facility status (ACTIVE/OUT_OF_SERVICE) |
| DELETE | /api/facilities/{id} | ADMIN | Delete a facility |

### Bookings — /api/v1/bookings

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/v1/bookings | USER, ADMIN | Create a booking request |
| GET | /api/v1/bookings | USER | Get current user's bookings |
| GET | /api/v1/bookings/all | ADMIN | Get all bookings |
| GET | /api/v1/bookings/admin | ADMIN | Get bookings with admin filters |
| PUT | /api/v1/bookings/{id}/status | ADMIN | Approve or reject a booking |
| PUT | /api/v1/bookings/{id}/cancel | USER, ADMIN | Cancel an approved booking |

### Tickets — /api/tickets

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/tickets | USER, ADMIN | Create a new incident ticket |
| GET | /api/tickets | ADMIN | Get all tickets |
| GET | /api/tickets/{id} | USER, ADMIN | Get ticket by ID |
| GET | /api/tickets/user/{userId} | USER | Get tickets created by a user |
| GET | /api/tickets/assigned/{assigneeId} | TECHNICIAN, ADMIN | Get tickets assigned to a technician |
| PUT | /api/tickets/{id}/status | ADMIN, TECHNICIAN | Update ticket status |
| PUT | /api/tickets/{id}/assign | ADMIN | Assign ticket to a technician |
| POST | /api/tickets/{id}/upload | USER, ADMIN | Upload image attachments (max 3) |
| DELETE | /api/tickets/{id} | ADMIN | Delete a ticket |

### Comments — /api/tickets/{ticketId}/comments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/tickets/{ticketId}/comments | USER, ADMIN, TECHNICIAN | Add a comment to a ticket |
| GET | /api/tickets/{ticketId}/comments | USER, ADMIN, TECHNICIAN | Get all comments for a ticket |

### Notifications — /api/v1/notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/notifications | USER, ADMIN | Get all notifications for current user |
| GET | /api/v1/notifications/unread-count | USER, ADMIN | Get count of unread notifications |
| PATCH | /api/v1/notifications/{id}/read | USER, ADMIN | Mark a notification as read |
| PATCH | /api/v1/notifications/read-all | USER, ADMIN | Mark all notifications as read |
| DELETE | /api/v1/notifications/{id} | USER, ADMIN | Delete a notification |
| POST | /api/v1/notifications/events/ticket-status | Internal | Trigger ticket status notification |
| POST | /api/v1/notifications/events/ticket-comment | Internal | Trigger ticket comment notification |

---

## Roles & Access Control

| Role | Description |
|---|---|
| USER | Standard user — can browse facilities, create bookings, file tickets, and view their own data |
| ADMIN | Full access — can approve/reject bookings, manage facilities and users, oversee all tickets |
| TECHNICIAN | Can view assigned tickets, update ticket status, and add resolution notes |

- Frontend routes are protected via ProtectedRoute and role-based redirects
- Backend endpoints are secured with Spring Security and JWT filter chain

---

## Key Features

### Module A – Facilities & Assets Catalogue
- Manage lecture halls, labs, meeting rooms, and equipment
- Metadata: type, capacity, location, availability, status (ACTIVE / OUT_OF_SERVICE)
- Search and filter by type, capacity, and location

### Module B – Booking Management
- Booking workflow: PENDING → APPROVED / REJECTED → CANCELLED
- Conflict detection prevents double-booking of the same resource
- Admin review panel with approve/reject + reason
- Users see only their own bookings; admins see all

### Module C – Maintenance & Incident Ticketing
- Create tickets with category, description, priority, and contact details
- Upload up to 3 image attachments per ticket (max 10 MB each)
- Ticket workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED (or REJECTED)
- Technician assignment and resolution notes
- Comment threads on tickets with ownership rules

### Module D – Notifications
- In-app notification panel accessible from the UI
- Triggered on: booking approval/rejection, ticket status changes, new comments
- Unread count badge, mark as read, mark all as read, delete

### Module E – Authentication & Authorization
- Standard email/password registration and login with JWT
- Google OAuth 2.0 sign-in via @react-oauth/google
- JWT stored in localStorage with automatic header injection via Axios interceptor
- Role-based route protection on both frontend and backend

---

## Testing

### Unit Tests (Backend)
bash
./mvnw test


Test classes located at:
- src/test/java/com/SmartCampus/OperationHub/Utils/JwtUtilTest.java — JWT generation and validation tests
- src/test/java/com/SmartCampus/OperationHub/OperationHubApplicationTests.java — Spring context load test

### Frontend Tests
bash
cd smart-campus-frontend
npm test


---

## Team Contribution

| Member | Modules Implemented |
|---|---|
| Member 1 | Module A – Facilities & Assets Catalogue (FacilityController, FacilityService, FacilityServiceImpl, FacilitiesList, FacilitiesPage, FacilityDetail, AddFacilityModal, EditFacilityModal) |
| Member 2 | Module B – Booking Management (BookingController, BookingService, BookingRequestForm, UserBookingsPage, AdminBookingPage, BookingRequestPage) |
| Member 3 | Module C – Maintenance & Incident Ticketing (TicketController, TicketService, CommentController, CommentService, FileStorageService, TicketForm, TicketList, TicketDetail, TechnicianTasks) |
| Member 4 | Module D & E – Notifications + Auth (AuthController, UserController, NotificationController, NotificationService, OAuth2Service, SecurityConfig, JwtUtil, GoogleTokenVerifier, AuthContext, NotificationPanel, GoogleSignInButton) |

> Each member's commits are traceable in the GitHub repository history.

---

## GitHub Actions

A CI workflow is configured to automatically build and test the backend on every push:


.github/workflows/
└── ci.yml   # Maven build + test


---

## Notes

- Do *not* commit node_modules/, target/, or the uploads/ folder to the repository
- The uploads/ directory is created automatically at runtime for ticket attachments
- Change the jwt.secret in application.properties to a strong secret before any deployment
- Replace placeholder Google OAuth credentials with real credentials from [Google Cloud Console](https://console.cloud.google.com/)