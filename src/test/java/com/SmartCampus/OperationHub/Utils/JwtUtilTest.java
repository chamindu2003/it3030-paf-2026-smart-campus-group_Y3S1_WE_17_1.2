package com.SmartCampus.OperationHub.Utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for JwtUtil class
 */
@SpringBootTest
@DisplayName("JWT Utility Tests")
class JwtUtilTest {

    @Autowired
    private JwtUtil jwtUtil;

    private String testEmail = "test@example.com";
    private String testToken;

    @BeforeEach
    void setUp() {
        // Generate a token before each test
        testToken = jwtUtil.generateToken(testEmail);
    }

    @Test
    @DisplayName("Should generate a valid token")
    void testGenerateToken() {
        String token = jwtUtil.generateToken("user@example.com");
        assertNotNull(token, "Token should not be null");
        assertFalse(token.isEmpty(), "Token should not be empty");
        assertTrue(token.contains("."), "Token should have JWT format with dots");
    }

    @Test
    @DisplayName("Should generate token with custom claims")
    void testGenerateTokenWithClaims() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ADMIN");
        claims.put("department", "IT");

        String token = jwtUtil.generateToken("user@example.com", claims);
        assertNotNull(token, "Token with claims should not be null");
        assertFalse(token.isEmpty(), "Token with claims should not be empty");
    }

    @Test
    @DisplayName("Should extract username from token")
    void testExtractUsername() {
        String extractedEmail = jwtUtil.extractUsername(testToken);
        assertEquals(testEmail, extractedEmail, "Extracted email should match original email");
    }

    @Test
    @DisplayName("Should validate a valid token")
    void testValidateToken() {
        Boolean isValid = jwtUtil.validateToken(testToken);
        assertTrue(isValid, "Valid token should pass validation");
    }

    @Test
    @DisplayName("Should validate token with username")
    void testValidateTokenWithUsername() {
        Boolean isValid = jwtUtil.validateToken(testToken, testEmail);
        assertTrue(isValid, "Valid token with matching username should pass validation");
    }

    @Test
    @DisplayName("Should reject token with wrong username")
    void testValidateTokenWithWrongUsername() {
        Boolean isValid = jwtUtil.validateToken(testToken, "different@example.com");
        assertFalse(isValid, "Token with mismatched username should fail validation");
    }

    @Test
    @DisplayName("Should reject invalid token")
    void testValidateInvalidToken() {
        String invalidToken = "invalid.token.here";
        Boolean isValid = jwtUtil.validateToken(invalidToken);
        assertFalse(isValid, "Invalid token should fail validation");
    }

    @Test
    @DisplayName("Should extract expiration date")
    void testExtractExpiration() {
        assertNotNull(jwtUtil.extractExpiration(testToken), 
            "Expiration date should not be null");
    }

    @Test
    @DisplayName("Should extract custom claims")
    void testExtractClaim() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "USER");
        String tokenWithClaims = jwtUtil.generateToken(testEmail, claims);

        String role = jwtUtil.extractClaim(tokenWithClaims, c -> c.get("role", String.class));
        assertEquals("USER", role, "Extracted claim should match original claim");
    }

    @Test
    @DisplayName("Should get JWT expiration in milliseconds")
    void testGetJwtExpirationInMs() {
        Long expiration = jwtUtil.getJwtExpirationInMs();
        assertNotNull(expiration, "Expiration time should not be null");
        assertTrue(expiration > 0, "Expiration time should be positive");
    }

    @Test
    @DisplayName("Generated tokens should be different each time")
    void testTokensAreDifferent() {
        String token1 = jwtUtil.generateToken(testEmail);
        String token2 = jwtUtil.generateToken(testEmail);
        assertNotEquals(token1, token2, "Each generated token should be unique (different timestamps)");
    }

    @Test
    @DisplayName("Should handle empty username gracefully")
    void testGenerateTokenWithEmptyUsername() {
        assertDoesNotThrow(() -> {
            String token = jwtUtil.generateToken("");
            assertNotNull(token, "Should generate token even with empty username");
        }, "Should not throw exception for empty username");
    }

    @Test
    @DisplayName("Should validate token without username parameter")
    void testValidateTokenWithoutUsername() {
        Boolean isValid = jwtUtil.validateToken(testToken);
        assertTrue(isValid, "Should validate token without requiring username");
    }
}

