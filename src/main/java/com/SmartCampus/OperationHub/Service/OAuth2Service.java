package com.smartcampus.operationhub.service;

import com.smartcampus.operationhub.dto.AuthResponse;
import com.smartcampus.operationhub.model.UserModel;
import com.smartcampus.operationhub.repository.UserRepo;
import com.smartcampus.operationhub.utils.GoogleTokenVerifier;
import com.smartcampus.operationhub.utils.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

/**
 * Service for handling OAuth 2.0 authentication
 */
@Service
public class OAuth2Service {

    private final UserRepo userRepository;
    private final JwtUtil jwtUtil;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final PasswordEncoder passwordEncoder;

    public OAuth2Service(UserRepo userRepository, JwtUtil jwtUtil,
                         GoogleTokenVerifier googleTokenVerifier,
                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.googleTokenVerifier = googleTokenVerifier;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Handle Google OAuth 2.0 login
     * @param idToken Google ID token
     * @return AuthResponse with JWT token
     */
    public AuthResponse loginWithGoogle(String idToken) {
        try {
            // Verify and extract user info from Google token
            Map<String, Object> userInfo = googleTokenVerifier.extractUserInfo(idToken);

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String providerId = (String) userInfo.get("sub");
            String picture = (String) userInfo.get("picture");

            // Check if user exists
            Optional<UserModel> existingUser = userRepository.findByEmail(email);

            UserModel user;
            if (existingUser.isPresent()) {
                user = existingUser.get();
                // Update user info if needed
                user.setName(name);
                user.setProvider("google");
                user.setProviderId(providerId);
                user.setProfilePicture(picture);
            } else {
                // Create new user
                user = new UserModel();
                user.setName(name);
                user.setEmail(email);
                user.setProvider("google");
                user.setProviderId(providerId);
                user.setProfilePicture(picture);
                user.setRole("USER");
                // Generate a random password for OAuth users (they won't use it)
                user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            }

            // Save or update user
            user = userRepository.save(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());

            return new AuthResponse(token, user.getRole());

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid Google token: " + e.getMessage());
        }
    }

    /**
     * Handle OAuth login with generic provider
     * @param provider Provider name (e.g., "google")
     * @param idToken ID token from provider
     * @return AuthResponse with JWT token
     */
    public AuthResponse loginWithProvider(String provider, String idToken) {
        if ("google".equalsIgnoreCase(provider)) {
            return loginWithGoogle(idToken);
        } else {
            throw new IllegalArgumentException("Unsupported OAuth provider: " + provider);
        }
    }
}

