package com.SmartCampus.OperationHub.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for OAuth 2.0 login requests
 * Contains the ID token from OAuth provider
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2LoginRequest {
    private String idToken; // ID token from OAuth provider (Google, GitHub, etc.)
    private String provider; // Provider name (e.g., "google")
}

