# 🚀 QUICK REFERENCE - OperationHub API

## Application Status: ✅ RUNNING

**Server:** http://localhost:9090
**Database:** H2 (in-memory)
**Status:** All endpoints operational

---

## 📍 REST API Endpoints

| Method | Endpoint | Purpose | Returns |
|--------|----------|---------|---------|
| GET | `/api/v1/getUser` | Test endpoint | `"Hello User"` |
| POST | `/api/v1/login` | Authenticate user | `AuthResponse` (token, role) |
| POST | `/api/v1/register` | Create user | `userModel` (201) |
| GET | `/api/v1/user/{email}` | Get user details | `userModel` or 404 |

---

## 📌 Base URL
```
http://localhost:9090
```

---

## 🔐 Example: Login Flow

### 1. Register a User
```bash
POST /api/v1/register
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123",
  "role": "admin"
}

Response: 201 CREATED
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123",
  "role": "admin"
}
```

### 2. Login
```bash
POST /api/v1/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "uuid-string-1",
  "role": "admin"
}
```

### 3. Get User
```bash
GET /api/v1/user/alice@example.com

Response: 200 OK
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123",
  "role": "admin"
}
```

---

## 🧪 PowerShell Test Examples

### Test 1: Simple GET
```powershell
Invoke-WebRequest -Uri http://localhost:9090/api/v1/getUser -UseBasicParsing
```

### Test 2: Register
```powershell
$body = @{
    name = "Bob"
    email = "bob@test.com"
    password = "test123"
    role = "user"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:9090/api/v1/register `
    -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```

### Test 3: Login
```powershell
$body = @{
    email = "bob@test.com"
    password = "test123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:9090/api/v1/login `
    -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```

---

## 📂 Project Files

```
Main Source Files:
├── userModel.java          (JPA Entity)
├── userRepo.java           (Repository with findByEmail)
├── LoginRequest.java       (DTO)
├── AuthResponse.java       (DTO)
├── userService.java        (Business Logic)
└── userController.java     (REST Endpoints)

Configuration:
├── application.properties
└── pom.xml

Documentation:
├── IMPLEMENTATION_SUMMARY.md
├── API_TEST_GUIDE.md
├── VERIFICATION_COMPLETE.md
└── QUICK_REFERENCE.md (this file)
```

---

## 🛠️ System Commands

### Start Application
```bash
cd C:\Users\CHAMA COMPUTERS\OneDrive\Desktop\OperationHub
java -jar target/OperationHub-0.0.1-SNAPSHOT.jar
```

### Build Project
```bash
.\mvnw clean install -DskipTests
```

### Kill All Java Processes
```powershell
Get-Process java | Stop-Process -Force
```

### Check Port 9090
```powershell
netstat -ano | findstr :9090
```

---

## 🗄️ Database Access

### H2 Console
- URL: http://localhost:9090/h2-console
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (leave empty)

### SQL Queries
```sql
-- View all users
SELECT * FROM users;

-- Find by email
SELECT * FROM users WHERE email = 'alice@example.com';

-- Count users
SELECT COUNT(*) FROM users;
```

---

## ⚠️ HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful login/get |
| 201 | Created | User registered |
| 400 | Bad Request | Email already exists |
| 401 | Unauthorized | Wrong password |
| 404 | Not Found | User doesn't exist |
| 500 | Server Error | Database error |

---

## ✅ Validation Rules

- **Email:** Must be unique and valid format
- **Password:** Any string (not encrypted in demo)
- **Name:** Required, any string
- **Role:** Any string (e.g., admin, user, staff)

---

## 🔄 Workflow

```
User Interaction Flow:

1. User calls /api/v1/register
   ↓ Creates new user in database
   ↓ Returns 201 with user object

2. User calls /api/v1/login
   ↓ Validates email/password
   ↓ Returns token and role

3. User calls /api/v1/user/{email}
   ↓ Queries database
   ↓ Returns user details or 404
```

---

## 📋 Files Modified/Created

### Created Files:
- ✅ LoginRequest.java
- ✅ AuthResponse.java
- ✅ IMPLEMENTATION_SUMMARY.md
- ✅ API_TEST_GUIDE.md
- ✅ VERIFICATION_COMPLETE.md
- ✅ QUICK_REFERENCE.md

### Modified Files:
- ✅ userService.java (complete rewrite)
- ✅ userController.java (added endpoints)
- ✅ application.properties (new config)
- ✅ pom.xml (added compiler plugin)

### Existing Files (No Changes):
- ✅ userModel.java
- ✅ userRepo.java
- ✅ OperationHubApplication.java

---

## 🎯 Key Features

✅ **Authentication System**
- Login with email/password
- Token generation
- User registration

✅ **Data Persistence**
- JPA/Hibernate ORM
- H2 Database
- Automatic schema creation

✅ **API Standards**
- RESTful endpoints
- Proper HTTP methods
- JSON request/response
- Appropriate status codes

✅ **Code Quality**
- Lombok for boilerplate
- Service layer pattern
- Clean separation of concerns
- Spring best practices

---

## 🚦 Troubleshooting

**App won't start?**
→ Kill Java processes: `Get-Process java | Stop-Process -Force`

**Port in use?**
→ Change port in application.properties

**Changes not showing?**
→ Rebuild: `.\mvnw clean install -DskipTests`

**Compilation error?**
→ Check Lombok annotation processor in pom.xml

**Database issue?**
→ Check H2 console at http://localhost:9090/h2-console

---

## 📞 Support

All documentation available in:
- `IMPLEMENTATION_SUMMARY.md` - Complete details
- `API_TEST_GUIDE.md` - Testing instructions
- `VERIFICATION_COMPLETE.md` - Full checklist

---

**Application Version:** 0.0.1-SNAPSHOT
**Status:** ✅ Ready for Development & Testing
**Last Updated:** April 11, 2026

