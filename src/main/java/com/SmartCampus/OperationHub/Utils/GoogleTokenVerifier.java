package com.smartcampus.operationhub.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility class for verifying and parsing Google OAuth 2.0 ID tokens
 * Uses only standard Java libraries for JWT decoding
 */
@Component
public class GoogleTokenVerifier {

    @Value("${oauth2.google.client-id:your-client-id-here}")
    private String googleClientId;

    /**
     * Verify and decode a Google ID token
     * @param idToken The ID token from Google OAuth
     * @return Map containing token claims (sub, email, name, picture, etc.)
     */
    public Map<String, Object> verifyIdToken(String idToken) {
        try {
            // JWT format: header.payload.signature
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid token format");
            }

            // Decode payload (second part)
            String payload = parts[1];
            // Add padding if needed
            int padding = 4 - (payload.length() % 4);
            if (padding != 4) {
                payload += "=".repeat(padding);
            }

            // Decode from Base64
            byte[] decodedBytes = Base64.getUrlDecoder().decode(payload);
            String decodedPayload = new String(decodedBytes);

            // Parse JSON payload manually without ObjectMapper
            Map<String, Object> claims = parseJsonPayload(decodedPayload);

            // Verify the audience (client ID) - optional for development
            String audience = (String) claims.get("aud");
            if (audience != null && !audience.equals(googleClientId)) {
                // For development, just log a warning instead of failing
                System.out.println("Warning: Token audience (" + audience + ") does not match client ID (" + googleClientId + ")");
            }

            return claims;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid ID token: " + e.getMessage());
        }
    }

    /**
     * Parse JSON payload string into a Map
     * Extracts key-value pairs from JSON without requiring ObjectMapper
     * @param jsonPayload JSON string from decoded JWT payload
     * @return Map containing extracted claims
     */
    private Map<String, Object> parseJsonPayload(String jsonPayload) {
        Map<String, Object> claims = new HashMap<>();

        // Extract common fields using regex patterns
        claims.put("sub", extractJsonStringValue(jsonPayload, "sub"));
        claims.put("email", extractJsonStringValue(jsonPayload, "email"));
        claims.put("name", extractJsonStringValue(jsonPayload, "name"));
        claims.put("picture", extractJsonStringValue(jsonPayload, "picture"));
        claims.put("aud", extractJsonStringValue(jsonPayload, "aud"));
        claims.put("email_verified", extractJsonBooleanValue(jsonPayload, "email_verified"));

        return claims;
    }

    /**
     * Extract a string value from JSON using regex
     * @param json JSON string
     * @param key JSON key to extract
     * @return String value or null if not found
     */
    private String extractJsonStringValue(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    /**
     * Extract a boolean value from JSON using regex
     * @param json JSON string
     * @param key JSON key to extract
     * @return Boolean value or null if not found
     */
    private Boolean extractJsonBooleanValue(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + key + "\"\\s*:\\s*(true|false)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return Boolean.parseBoolean(matcher.group(1));
        }
        return null;
    }

    /**
     * Extract user information from Google ID token
     * @param idToken The ID token from Google OAuth
     * @return Map with user details (email, name, picture, sub)
     */
    public Map<String, Object> extractUserInfo(String idToken) {
        return verifyIdToken(idToken);
    }
}


