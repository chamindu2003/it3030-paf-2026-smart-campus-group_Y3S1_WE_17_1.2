# OperationHub API Test Guide

## Quick Start - Your Application is Running! 🚀

**Server URL:** `http://localhost:9090`

---

## API Endpoints

### 1. Test Endpoint - GET /api/v1/getUser
**Purpose:** Verify the API is working

**Request:**
```
GET http://localhost:9090/api/v1/getUser
```

**Response:**
```
200 OK
"Hello User"
```

**Test Command (PowerShell):**
```powershell
Invoke-WebRequest -Uri http://localhost:9090/api/v1/getUser -UseBasicParsing
```

---

### 2. Register User - POST /api/v1/register
**Purpose:** Create a new user account

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "admin"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "admin"
}
```

**Test Command (PowerShell):**
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "SecurePassword123"
    role = "admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:9090/api/v1/register `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
```

---

### 3. Login - POST /api/v1/login
**Purpose:** Authenticate user and get token

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "uuid-string-1",
  "role": "admin"
}
```

**Error Response (401 Unauthorized):**
```
Invalid email or password
```

**Test Command (PowerShell):**
```powershell
$body = @{
    email = "john@example.com"
    password = "SecurePassword123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:9090/api/v1/login `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
```

---

### 4. Get User by Email - GET /api/v1/user/{email}
**Purpose:** Retrieve user details by email

**Request:**
```
GET http://localhost:9090/api/v1/user/john@example.com
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "admin"
}
```

**Error Response (404 Not Found):**
```
User not found
```

**Test Command (PowerShell):**
```powershell
Invoke-WebRequest -Uri http://localhost:9090/api/v1/user/john@example.com `
    -UseBasicParsing
```

---

## Complete Test Script (PowerShell)

Save this as `test-api.ps1`:

```powershell
# Test OperationHub API

$BASE_URL = "http://localhost:9090"

Write-Host "=== OperationHub API Tests ===" -ForegroundColor Green
Write-Host ""

# Test 1: Simple GET endpoint
Write-Host "Test 1: Simple GET /api/v1/getUser" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/getUser" -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)"
    Write-Host "✓ Response: $($response.Content)"
} catch {
    Write-Host "✗ Error: $($_)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Register User
Write-Host "Test 2: POST /api/v1/register" -ForegroundColor Yellow
$registerBody = @{
    name = "Alice Smith"
    email = "alice@example.com"
    password = "Password456"
    role = "user"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)"
    Write-Host "✓ Response: $($response.Content)"
} catch {
    Write-Host "✗ Error: $($_)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Login
Write-Host "Test 3: POST /api/v1/login" -ForegroundColor Yellow
$loginBody = @{
    email = "alice@example.com"
    password = "Password456"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)"
    Write-Host "✓ Response: $($response.Content)"
} catch {
    Write-Host "✗ Error: $($_)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get User by Email
Write-Host "Test 4: GET /api/v1/user/{email}" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/user/alice@example.com" `
        -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)"
    Write-Host "✓ Response: $($response.Content)"
} catch {
    Write-Host "✗ Error: $($_)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Tests Complete ===" -ForegroundColor Green
```

**Run the test script:**
```powershell
.\test-api.ps1
```

---

## Database Console

Access H2 Database Console at:
```
http://localhost:9090/h2-console
```

**Credentials:**
- URL: `jdbc:h2:mem:testdb`
- User: `sa`
- Password: (leave empty)

---

## Important Notes

1. **Changes Take Effect Automatically** - Due to DevTools, code changes are automatically reloaded
2. **Data is Temporary** - H2 in-memory database loses all data on restart
3. **Email Must Be Unique** - Registering same email twice will fail
4. **Password Validation** - Login checks exact password match
5. **Error Handling** - Invalid credentials return 401 Unauthorized

---

## Troubleshooting

### Application Won't Start
```powershell
# Kill existing Java processes
Get-Process java | Stop-Process -Force

# Rebuild project
cd C:\Users\CHAMA COMPUTERS\OneDrive\Desktop\OperationHub
.\mvnw clean install -DskipTests

# Run again
java -jar target/OperationHub-0.0.1-SNAPSHOT.jar
```

### Port 9090 Already in Use
Change port in `application.properties`:
```properties
server.port=${SERVER_PORT:8090}
```

### Changes Not Showing in API
```bash
# Rebuild the project
.\mvnw clean install -DskipTests
```

---

**Last Updated:** April 11, 2026
**Status:** ✅ Ready for Testing

