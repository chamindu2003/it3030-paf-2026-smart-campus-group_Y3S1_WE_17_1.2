# JWT Integration Example

## How to integrate JWT with your existing userController

### 1. Update userController with JWT Support

Here's how to enhance your existing `userController.java`:

```java
package com.SmartCampus.OperationHub.Controller;

import com.SmartCampus.OperationHub.DTO.LoginRequest;
import com.SmartCampus.OperationHub.DTO.AuthResponse;
import com.SmartCampus.OperationHub.Model.userModel;
import com.SmartCampus.OperationHub.Service.userService;
import com.SmartCampus.OperationHub.Utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping(value = "api/v1")
public class userController {

    @Autowired
    private userService userService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/getUser")
    public ResponseEntity<String> getUser() {
        return ResponseEntity.ok("Hello User");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = userService.login(loginRequest);
            
            // Generate JWT token
            Map<String, Object> claims = new HashMap<>();
            claims.put("role", response.getRole());
            String token = jwtUtil.generateToken(loginRequest.getEmail(), claims);
            
            // Update response with JWT token
            response.setToken(token);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<userModel> register(@RequestBody userModel user) {
        try {
            userModel savedUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<userModel> getUserByEmail(
            @PathVariable String email,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        // Validate JWT token if provided
        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7);
            if (!jwtUtil.validateToken(jwtToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }
        
        Optional<userModel> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/validate-token")
    public ResponseEntity<Map<String, Object>> validateToken(
            @RequestHeader(value = "Authorization") String token) {
        try {
            if (!token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("valid", false, "message", "Invalid token format"));
            }
            
            String jwtToken = token.substring(7);
            boolean isValid = jwtUtil.validateToken(jwtToken);
            
            if (isValid) {
                String username = jwtUtil.extractUsername(jwtToken);
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "username", username
                ));
            } else {
                return ResponseEntity.ok(Map.of("valid", false, "message", "Token expired or invalid"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("valid", false, "message", "Token validation failed"));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, String>> refreshToken(
            @RequestHeader(value = "Authorization") String token) {
        try {
            if (!token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            
            String jwtToken = token.substring(7);
            if (!jwtUtil.validateToken(jwtToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String username = jwtUtil.extractUsername(jwtToken);
            Map<String, Object> claims = new HashMap<>();
            claims.put("refreshed", true);
            
            String newToken = jwtUtil.generateToken(username, claims);
            return ResponseEntity.ok(Map.of("token", newToken));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
```

### 2. Update LoginRequest DTO if needed

Make sure your `LoginRequest` has email and password fields:

```java
package com.SmartCampus.OperationHub.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String password;
}
```

### 3. Update AuthResponse DTO

Ensure `AuthResponse` has a token field:

```java
package com.SmartCampus.OperationHub.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
}
```

## API Usage Examples

### 1. Register User
```bash
POST http://localhost:9090/api/v1/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "USER"
}
```

### 2. Login User
```bash
POST http://localhost:9090/api/v1/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTY0OTY3NTg0MCwiZXhwIjoxNjQ5NzYyMjQwfQ.x7K9z...",
  "role": "USER"
}
```

### 3. Get User with Token Validation
```bash
GET http://localhost:9090/api/v1/user/john.doe@example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTY0OTY3NTg0MCwiZXhwIjoxNjQ5NzYyMjQwfQ.x7K9z...
```

### 4. Validate Token
```bash
GET http://localhost:9090/api/v1/validate-token
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTY0OTY3NTg0MCwiZXhwIjoxNjQ5NzYyMjQwfQ.x7K9z...

Response:
{
  "valid": true,
  "username": "john.doe@example.com"
}
```

### 5. Refresh Token
```bash
POST http://localhost:9090/api/v1/refresh-token
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTY0OTY3NTg0MCwiZXhwIjoxNjQ5NzYyMjQwfQ.x7K9z...

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTY0OTY3NTg3MCwiZXhwIjoxNjQ5NzYyMjcwfQ.y8L0a..."
}
```

## Security Considerations

1. **Always use HTTPS** in production for token transmission
2. **Secure the secret key** - store in environment variables, not in code
3. **Set appropriate token expiration** - shorter times are more secure
4. **Validate tokens** on protected endpoints
5. **Handle token refresh** for long-lived sessions
6. **Implement logout/token revocation** for enhanced security

## Troubleshooting

### Token Validation Fails
- Check if token is properly formatted with "Bearer " prefix
- Verify the secret key matches between generation and validation
- Check if token has expired

### Claims Not Found
- Ensure claims were added during token generation
- Use proper claim getter methods matching the claim type

### Port Already in Use
- The server is configured to run on port 9090
- Kill existing processes or change port in application.properties

