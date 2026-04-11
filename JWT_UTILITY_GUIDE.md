# JWT Utility Documentation

## Overview
The `JwtUtil` class is a Spring Boot utility component that handles JWT (JSON Web Token) generation, validation, and claims extraction. It uses the JJWT library for secure token management.

## Features
- **Token Generation**: Create JWT tokens with custom claims
- **Token Validation**: Verify token integrity and expiration
- **Claims Extraction**: Extract specific claims or username from tokens
- **Configurable Expiration**: Customize token expiration time via application.properties
- **Secret Key Management**: Securely manage JWT signing keys

## Configuration

### 1. Application Properties
Add the following to `src/main/resources/application.properties`:

```properties
# JWT Configuration
jwt.secret=mySecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongChangeThisToSomethingSecure12345
jwt.expiration=86400000
```

**Important**: 
- `jwt.secret` must be at least 256 bits (32 characters)
- `jwt.expiration` is in milliseconds (86400000 = 24 hours)
- Change the secret key to a secure random value in production

## Usage Examples

### 1. Generate a Token

```java
@Autowired
private JwtUtil jwtUtil;

// Generate token for a user
String token = jwtUtil.generateToken("john.doe@example.com");
```

### 2. Generate Token with Custom Claims

```java
Map<String, Object> claims = new HashMap<>();
claims.put("role", "ADMIN");
claims.put("department", "IT");

String token = jwtUtil.generateToken("john.doe@example.com", claims);
```

### 3. Extract Username from Token

```java
String username = jwtUtil.extractUsername(token);
System.out.println("Username: " + username);
```

### 4. Extract Custom Claims

```java
String role = jwtUtil.extractClaim(token, claims -> 
    claims.get("role", String.class)
);
```

### 5. Validate Token

```java
// Validate with username comparison
boolean isValid = jwtUtil.validateToken(token, "john.doe@example.com");

// Validate without username comparison
boolean isValid = jwtUtil.validateToken(token);
```

### 6. Check Token Expiration

```java
Date expiration = jwtUtil.extractExpiration(token);
System.out.println("Token expires at: " + expiration);
```

## Integration with Controller

Example usage in a Spring Boot controller:

```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Authenticate user (implement your authentication logic)
        
        // Generate token
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "USER");
        String token = jwtUtil.generateToken(request.getEmail(), claims);
        
        return ResponseEntity.ok(new AuthResponse(token, "USER"));
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(
            @RequestParam String token,
            @RequestParam String username) {
        
        boolean isValid = jwtUtil.validateToken(token, username);
        return ResponseEntity.ok(new ValidationResponse(isValid));
    }
}
```

## Implementation in Service Layer

```java
@Service
public class AuthService {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    public AuthResponse authenticateUser(LoginRequest request) {
        // Validate credentials
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate token with user details
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole());
        
        String token = jwtUtil.generateToken(user.getEmail(), claims);
        
        return new AuthResponse(token, user.getRole());
    }
}
```

## Security Best Practices

1. **Secret Key**: 
   - Use a cryptographically secure random key
   - Keep it confidential and rotate periodically
   - Never commit it to version control

2. **Token Expiration**:
   - Set appropriate expiration times (short-lived tokens are more secure)
   - Implement token refresh mechanisms for long sessions

3. **HTTPS Only**:
   - Always transmit tokens over HTTPS
   - Store tokens securely on the client side

4. **Token Storage**:
   - Store tokens in HTTP-only cookies when possible
   - Avoid storing in localStorage for sensitive applications

## Methods Reference

| Method | Description | Parameters | Return |
|--------|-------------|-----------|--------|
| `generateToken(username)` | Generate simple JWT token | `String username` | `String` |
| `generateToken(username, claims)` | Generate token with claims | `String username, Map<String,Object> claims` | `String` |
| `extractUsername(token)` | Extract username from token | `String token` | `String` |
| `extractClaim(token, resolver)` | Extract specific claim | `String token, Function<Claims,T> resolver` | `T` |
| `extractExpiration(token)` | Get token expiration date | `String token` | `Date` |
| `validateToken(token, username)` | Validate token with username | `String token, String username` | `Boolean` |
| `validateToken(token)` | Validate token structure | `String token` | `Boolean` |
| `getJwtExpirationInMs()` | Get configured expiration time | None | `Long` |

## Error Handling

The JwtUtil class handles errors gracefully. If any operation fails, it returns appropriate values:
- `validateToken()` returns `false` on any error
- `extractClaim()` throws exceptions for invalid tokens
- Implement try-catch blocks when using extraction methods

## Dependencies

This implementation requires:
- `io.jsonwebtoken:jjwt-api:0.12.3`
- `io.jsonwebtoken:jjwt-impl:0.12.3`
- `io.jsonwebtoken:jjwt-jackson:0.12.3`

## Next Steps

1. Update the `jwt.secret` in application.properties to a secure random value
2. Integrate JwtUtil with your authentication filter/interceptor
3. Implement token validation in protected endpoints
4. Add refresh token mechanism for better security
5. Consider implementing token revocation/blacklisting

