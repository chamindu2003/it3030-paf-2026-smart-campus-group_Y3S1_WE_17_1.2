# Complete Setup & Troubleshooting Guide

## 🎯 Current Status

✅ **Backend (Spring Boot)**
- JWT authentication implemented and tested
- User management system ready
- Database configured (H2 in-memory)
- All APIs compiled successfully
- Build: SUCCESS

❌ **Frontend (React)**
- npm start command missing (will fix below)
- Ready for development

❌ **Common Issues Addressed**
- Port conflicts
- ClassNotFoundException
- Missing npm script

---

## 🚨 Common Issues & Solutions

### Issue 1: Port Already in Use (Port 8081/9090)

**Error Message:**
```
Web server failed to start. Port 8081 was already in use.
Web server failed to start. Port 9090 was already in use.
```

**Solution 1: Kill Existing Process**
```powershell
# Find what's using port 9090
netstat -ano | findstr :9090

# Output example: TCP    0.0.0.0:9090   0.0.0.0:0    LISTENING    12345
# Kill the process (replace 12345 with your PID)
taskkill /PID 12345 /F

# Verify it's gone
netstat -ano | findstr :9090
```

**Solution 2: Change Server Port**
Edit `src/main/resources/application.properties`:
```properties
server.port=8085
```

**Solution 3: Use Different Port in Command**
```bash
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.port=8085"
```

---

### Issue 2: npm start Missing Script

**Error Message:**
```
npm error Missing script: "start"
```

**Solution:**

1. Navigate to frontend folder:
```bash
cd smart-campus-frontend
```

2. Edit `package.json` and add scripts section:
```json
{
  "name": "smart-campus-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version"]
  }
}
```

3. Install dependencies:
```bash
npm install
```

4. Start the application:
```bash
npm start
```

---

### Issue 3: target/ and out/ Folders

**Question:** Do we need these folders?

**Answer:** NO - These are generated build artifacts.

**What to do:**
- Add to `.gitignore`:
```
target/
out/
*.class
*.jar
*.war
node_modules/
dist/
build/
```

**Safe to delete?** YES
- `target/` - Maven build output, regenerated on `mvn compile`
- `out/` - IDE compilation output, regenerated when rebuilding

---

### Issue 4: ClassNotFoundException

**Error Message:**
```
Error: Could not find or load main class com.SmartCampus.OperationHub.OperationHubApplication
```

**Solution:**

1. Clean and compile:
```bash
.\mvnw.cmd clean compile
```

2. Check that the class exists:
```bash
Get-ChildItem -Path "src/main/java/com/SmartCampus/OperationHub" -Filter "*Application.java"
```

3. If file is missing, create it:
```bash
# File should exist at:
# src/main/java/com/SmartCampus/OperationHub/OperationHubApplication.java
```

---

### Issue 5: Dependency Not Found (ModelMapper)

**Error Message:**
```
Dependency 'org.modelmapper:modelmapper:3.2.6' not found
```

**Solution:** Already fixed in pom.xml
- ModelMapper dependency is already configured
- Run: `.\mvnw.cmd clean compile` to download

---

## 🚀 Full Setup Process (Fresh Start)

### Step 1: Clean Everything
```bash
cd "C:\Users\CHAMA COMPUTERS\OneDrive\Desktop\OperationHub"

# Remove build artifacts
Remove-Item -Recurse -Force target
Remove-Item -Recurse -Force out
Remove-Item -Recurse -Force node_modules
```

### Step 2: Build Backend
```bash
# Compile the backend
.\mvnw.cmd clean compile

# Run tests
.\mvnw.cmd test

# Build JAR
.\mvnw.cmd package -DskipTests
```

### Step 3: Start Backend
```bash
# Option A: Using Maven
.\mvnw.cmd spring-boot:run

# Option B: Using Java (after package)
java -jar target/OperationHub-0.0.1-SNAPSHOT.jar

# Option C: Using IntelliJ IDE
# Right-click OperationHubApplication.java and select "Run"
```

### Step 4: Configure & Test Backend
```bash
# Test user registration
curl -X POST http://localhost:9090/api/v1/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "USER"
  }'

# Test login
curl -X POST http://localhost:9090/api/v1/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Step 5: Setup Frontend
```bash
cd smart-campus-frontend

# Install dependencies
npm install

# Start development server
npm start
```

---

## 📝 Important Files to Check/Update

### 1. JWT Configuration
**File:** `src/main/resources/application.properties`

**Current:**
```properties
jwt.secret=mySecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongChangeThisToSomethingSecure12345
jwt.expiration=86400000
```

**Action Required:** Change `jwt.secret` before production!

### 2. Database Configuration
**File:** `src/main/resources/application.properties`

**Current (H2 - Development):**
```properties
spring.datasource.url=jdbc:h2:mem:testdb
```

**For Production (MySQL):**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/operationhub
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

### 3. Frontend Package Configuration
**File:** `smart-campus-frontend/package.json`

**Action:** Add npm scripts (already provided in Issue 2 solution)

---

## ✅ Verification Checklist

### Backend
- [ ] `.\mvnw.cmd clean compile` succeeds
- [ ] No errors in compilation
- [ ] All dependencies downloaded
- [ ] Can run `.\mvnw.cmd spring-boot:run`
- [ ] Application starts on port 9090
- [ ] Can access `http://localhost:9090/api/v1/getUser`

### Frontend
- [ ] `package.json` has start script
- [ ] `npm install` completes without errors
- [ ] `npm start` launches React app on port 3000
- [ ] Can see React development interface

### JWT Implementation
- [ ] `JwtUtil.java` compiles successfully
- [ ] `JwtAuthenticationFilter.java` registered
- [ ] Can generate tokens via login endpoint
- [ ] Can validate tokens
- [ ] Protected endpoints require valid token

---

## 🔒 Security Checklist for Production

- [ ] **Change JWT Secret**
  ```bash
  # Generate new secret
  [Convert]::ToBase64String((1..32 | % {[byte](Get-Random -Max 256)}))
  ```

- [ ] **Use HTTPS**
  - Configure SSL/TLS certificate
  - Force HTTPS redirect

- [ ] **Database Security**
  - Don't use H2 in production
  - Use MySQL or PostgreSQL
  - Strong database credentials

- [ ] **Environment Variables**
  - `JWT_SECRET` - Set via environment
  - `DB_URL` - Database connection URL
  - `DB_USER` - Database username
  - `DB_PASS` - Database password

- [ ] **API Security**
  - Validate all inputs
  - Implement rate limiting
  - Add request logging
  - Set CORS policies properly

- [ ] **Monitoring**
  - Setup logging
  - Monitor error rates
  - Track token usage

---

## 🧪 Testing the Complete Flow

### Test 1: User Registration
```bash
POST http://localhost:9090/api/v1/register
```

### Test 2: User Login (Get Token)
```bash
POST http://localhost:9090/api/v1/login
```

### Test 3: Access Protected Endpoint with Token
```bash
GET http://localhost:9090/api/v1/user/{email}
Authorization: Bearer {token_from_test2}
```

### Test 4: Validate Token
```bash
GET http://localhost:9090/api/v1/validate-token
Authorization: Bearer {token_from_test2}
```

---

## 📚 Documentation Files in Your Project

1. **JWT_IMPLEMENTATION_SUMMARY.md** - What was implemented
2. **JWT_UTILITY_GUIDE.md** - Detailed JWT usage guide
3. **JWT_INTEGRATION_EXAMPLE.md** - Code examples for integration
4. **QUICK_START_GUIDE.md** - Quick reference for common tasks
5. **This File** - Complete troubleshooting guide

---

## 🔧 Useful Commands Reference

```bash
# Backend
.\mvnw.cmd clean              # Clean build
.\mvnw.cmd compile            # Compile only
.\mvnw.cmd test               # Run tests
.\mvnw.cmd package            # Build JAR
.\mvnw.cmd spring-boot:run    # Run application
.\mvnw.cmd dependency:tree    # Show dependencies

# Frontend
npm install                   # Install dependencies
npm start                     # Start dev server (port 3000)
npm run build                 # Build for production
npm test                      # Run tests

# Project Management
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push                      # Push to remote

# Process Management
netstat -ano | findstr :9090  # Find process on port 9090
taskkill /PID 12345 /F        # Kill process
Get-Process                   # List running processes
```

---

## 🆘 Still Having Issues?

1. **Check the error message** - It usually tells you exactly what's wrong
2. **Check the logs** - Look in `target/logs/` or console output
3. **Review the relevant documentation file** mentioned above
4. **Clean and rebuild** - Often fixes mysterious issues
   ```bash
   .\mvnw.cmd clean compile
   ```
5. **Restart your IDE/Terminal** - Sometimes helps with environment issues

---

## 📊 Project Statistics

- **Backend Language:** Java 17+
- **Framework:** Spring Boot 4.0.5
- **Build Tool:** Maven
- **Frontend:** React
- **Database:** H2 (dev), MySQL/PostgreSQL (prod)
- **Authentication:** JWT (JJWT 0.12.3)
- **Total Classes:** 9+ (expanding)
- **Build Status:** ✅ SUCCESS

---

**Last Updated:** 2026-04-11
**All Issues Addressed:** ✅
**Ready for Development:** ✅

