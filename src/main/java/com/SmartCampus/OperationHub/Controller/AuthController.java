package com.smartcampus.operationhub.controller;

import com.smartcampus.operationhub.dto.AuthResponse;
import com.smartcampus.operationhub.dto.LoginRequest;
import com.smartcampus.operationhub.dto.OAuth2LoginRequest;
import com.smartcampus.operationhub.service.UserService;
import com.smartcampus.operationhub.service.OAuth2Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
@RequestMapping(value = "api/auth")
public class AuthController {

    private final UserService userService;
    private final OAuth2Service oauth2Service;

    public AuthController(UserService userService, OAuth2Service oauth2Service) {
        this.userService = userService;
        this.oauth2Service = oauth2Service;
    }

    /**
     * Traditional email/password login
     * @param loginRequest Contains email and password
     * @return AuthResponse with JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = userService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * OAuth 2.0 login endpoint
     * @param oauthRequest Contains ID token and provider name
     * @return AuthResponse with JWT token
     */
    @PostMapping("/oauth2/login")
    public ResponseEntity<AuthResponse> oauthLogin(@RequestBody OAuth2LoginRequest oauthRequest) {
        try {
            AuthResponse response = oauth2Service.loginWithProvider(
                    oauthRequest.getProvider(),
                    oauthRequest.getIdToken()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(null, "Invalid request: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, "Authentication failed: " + e.getMessage()));
        }
    }

    /**
     * Google-specific login endpoint
     * @param oauthRequest Contains ID token from Google
     * @return AuthResponse with JWT token
     */
    @PostMapping("/google/login")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody OAuth2LoginRequest oauthRequest) {
        try {
            AuthResponse response = oauth2Service.loginWithGoogle(oauthRequest.getIdToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, "Google authentication failed: " + e.getMessage()));
        }
    }
}