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
    private String message;

    /**
     * Constructor for success responses with token and role
     * @param token JWT token
     * @param role User role
     */
    public AuthResponse(String token, String role) {
        this.token = token;
        this.role = role;
        this.message = null;
    }
}

