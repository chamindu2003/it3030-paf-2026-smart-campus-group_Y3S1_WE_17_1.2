package com.SmartCampus.OperationHub.Utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:your-secret-key-min-256-bits-long-change-this-in-application-properties}")
    private String secretKey;

    @Value("${jwt.expiration:86400000}")  // 24 hours in milliseconds by default
    @Getter
    private Long jwtExpirationInMs;

    /**
     * Generate JWT token with username and additional claims
     *
     * @param username the username to include in the token
     * @return generated JWT token
     */
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    /**
     * Generate JWT token with username and additional claims
     *
     * @param username the username to include in the token
     * @param claims additional claims to include in the token
     * @return generated JWT token
     */
    public String generateToken(String username, Map<String, Object> claims) {
        claims.putIfAbsent("username", username);
        return createToken(claims, username);
    }

    /**
     * Create JWT token
     *
     * @param claims the claims to include in the token
     * @param subject the subject (usually username) of the token
     * @return created JWT token
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
            .claims(claims)
            .subject(subject)
            .id(UUID.randomUUID().toString())
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
                .compact();
    }

    /**
     * Extract username/subject from JWT token
     *
     * @param token the JWT token
     * @return username extracted from the token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract a specific claim from JWT token
     *
     * @param token the JWT token
     * @param claimsResolver function to resolve the claim
     * @return the extracted claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract all claims from JWT token
     *
     * @param token the JWT token
     * @return all claims from the token
     */
    private Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extract expiration date from JWT token
     *
     * @param token the JWT token
     * @return expiration date of the token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Check if JWT token is expired
     *
     * @param token the JWT token
     * @return true if token is expired, false otherwise
     */
    private Boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Validate JWT token
     *
     * @param token the JWT token
     * @param username the username to validate against
     * @return true if token is valid, false otherwise
     */
    public Boolean validateToken(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            return (extractedUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Validate JWT token (without username comparison)
     *
     * @param token the JWT token
     * @return true if token is valid, false otherwise
     */
    public Boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}





