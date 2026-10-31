# 🚀 AttendFlow | Enterprise Attendance Management System
### Zero-Friction "Anti-Gravity" Architecture (Spring Boot 3.x + React Vite + Docker)

![Architecture](https://img.shields.io/badge/Architecture-Monorepo-blue)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.3.4%20(Java%2021)-green)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TailwindCSS-purple)
![Security](https://img.shields.io/badge/Security-Stateless%20JWT%20%2B%20BCrypt%20RBAC-red)
![Containers](https://img.shields.io/badge/Containers-Multi--stage%20Docker%20%2B%20Compose-orange)

An automated, self-contained Attendance Management System engineered for **instant zero-friction spin-up**, seamless role-based workflows, and containerized cloud deployment.

---

## 🎯 Key Features & Capabilities

### 🔐 1. Authentication Architecture
- **Stateless JWT Security**: HMAC-SHA256 encrypted authentication tokens protecting all `/api/**` REST routes.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `ROLE_ADMIN` and `ROLE_STUDENT`.
- **BCrypt Password Hashing**: Zero plain-text credential persistence.
- **Smart Pre-loaded Seed Data**: Auto-populated with sample administrators and students for instant evaluation.

### 🛡️ 2. Admin Command Center
- **Aggregated Real-Time KPI Cards**: Total records, Present count, Absent count, Late count, and Attendance percentage rates.
- **Granular Multi-Param Filter Bar**: Live filtering by Target Date, Enrolled Student, or Attendance Status.
- **Full Attendance CRUD**: Create, inspect, modify (mark Late/Present/Absent with custom remarks), and delete records.
- **Enrolled User Registry**: View registered students and staff with registration dates.

### 🎓 3. Student / User Portal
- **One-Click Daily Attendance Action**: Stamped with system timestamps and automatic punctuality analysis (cutoff at 09:30 AM).
- **Personalized Today Status Badge**: Real-time display of current day's check-in status and remarks.
- **Personal Attendance Metrics**: Dedicated attendance rate (%) and historical logs.

### ⚡ 4. "Anti-Gravity" DevOps & Zero-Friction Setup
- **Embedded H2 Database**: Pre-configured for immediate in-memory volatility (zero local DBMS installation needed).
- **PostgreSQL Profile**: Drop-in profile for enterprise persistence (`SPRING_PROFILES_ACTIVE=postgres`).
- **Multi-Stage Dockerfiles**: High-efficiency, unprivileged images with minimal attack surfaces.
- **Dynamic CORS**: Driven by `CORS_ALLOWED_ORIGINS` to eradicate pre-flight blocks.

---

## 🔑 Demo Seed Accounts (Instant Login)

When the application boots, `DataInitializer` seeds demo accounts and attendance history:

| Role | Username / Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@attendance.com` (or `admin`) | `Admin@123` | Full CRUD & Analytics Command Center |
| **Student** | `alex@attendance.com` (or `alex.morgan`) | `Student@123` | Personal Attendance & 1-Click Check-in |
| **Student** | `jane@attendance.com` (or `jane.doe`) | `Student@123` | Personal Attendance & 1-Click Check-in |
| **Student** | `robert@attendance.com` (or `robert.chen`) | `Student@123` | Personal Attendance & 1-Click Check-in |

---

## 🏗️ Monorepo Structure

```
attendance-system/
├── backend/
│   ├── pom.xml                                   # Spring Boot 3.3.4, Java 21, JJWT, H2, Postgres
│   ├── Dockerfile                                # Multi-stage Maven build -> Temurin JRE Alpine
│   └── src/
│       ├── main/
│       │   ├── java/com/attendance/
│       │   │   ├── AttendanceApplication.java    # Application Entrypoint
│       │   │   ├── config/                       # SecurityConfig, CorsConfig, DataInitializer
│       │   │   ├── controller/                   # AuthController, AttendanceController, UserController
│       │   │   ├── dto/                          # AuthRequest, AuthResponse, AttendanceDTOs, Stats
│       │   │   ├── model/                        # User, Attendance, Role, AttendanceStatus
│       │   │   ├── repository/                   # UserRepository, AttendanceRepository
│       │   │   ├── security/                     # JwtService, JwtAuthFilter, UserDetailsService
│       │   │   └── service/                      # AuthService, AttendanceService
│       │   └── resources/
│       │       ├── application.properties        # Default H2 profile + CORS configuration
│       │       └── application-postgres.properties # Production PostgreSQL profile
├── frontend/
│   ├── package.json                              # React 18, Vite 5, TailwindCSS, Axios, Lucide
│   ├── vite.config.js                            # Dev proxy to eliminate CORS
│   ├── tailwind.config.js                        # Modern Tailwind design system
│   ├── nginx.conf                                # Production reverse proxy + SPA router
│   ├── Dockerfile                                # Multi-stage Node Alpine build -> Nginx Alpine
│   └── src/
│       ├── api/axios.js                          # JWT bearer injector & 401 interceptor
│       ├── context/AuthContext.jsx               # Auth state provider & session persistence
│       ├── components/                           # Navbar, ProtectedRoute, StatCard
│       └── pages/                                # Login, Register, AdminDashboard, UserDashboard
├── docker-compose.yml                            # Unified multi-service orchestration
└── README.md
```

---

## 🚀 Quickstart Guides

### Option A: Instant Spin-up via Docker Compose (Recommended)
From the project root:
```bash
docker compose up --build
```
- **Frontend Portal**: Open [http://localhost:3000](http://localhost:3000) or [http://localhost](http://localhost)
- **Backend API**: Accessible at [http://localhost:8080/api](http://localhost:8080/api)
- **H2 Web Console**: Accessible at [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:attendancedb`)

### Option B: Local Native Development

#### 1. Start Backend:
```bash
cd backend
mvn spring-boot:run
```
*(Runs on `http://localhost:8080`)*

#### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 📡 REST API Specifications

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT token |
| `POST` | `/api/auth/register` | Public | Enrolls new user with BCrypt hashed credentials |
| `GET`  | `/api/auth/me` | Authenticated | Retrieves current authenticated profile |
| `POST` | `/api/attendance/mark` | Authenticated | Stamps daily attendance with system timestamp |
| `GET`  | `/api/attendance/my-history` | Authenticated | Returns logged-in student's historical check-ins |
| `GET`  | `/api/attendance/today` | Authenticated | Returns logged-in student's today check-in |
| `GET`  | `/api/admin/attendance` | Role: ADMIN | Queries attendance with date/user/status filters |
| `GET`  | `/api/admin/attendance/stats` | Role: ADMIN | Computes aggregated attendance KPIs & percentage rates |
| `POST` | `/api/admin/attendance` | Role: ADMIN | Administratively creates an attendance record |
| `PUT`  | `/api/admin/attendance/{id}`| Role: ADMIN | Updates status or remarks on existing record |
| `DELETE`| `/api/admin/attendance/{id}`| Role: ADMIN | Deletes an attendance record |
| `GET`  | `/api/admin/users` | Role: ADMIN | Retrieves directory of all enrolled users |
