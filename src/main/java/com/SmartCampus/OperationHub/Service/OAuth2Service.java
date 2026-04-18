package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.AuthResponse;
import com.SmartCampus.OperationHub.Model.UserModel;
import com.SmartCampus.OperationHub.Repository.UserRepo;
import com.SmartCampus.OperationHub.Utils.GoogleTokenVerifier;
import com.SmartCampus.OperationHub.Utils.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

/**
 * Service for handling OAuth 2.0 authentication
 */
@Service
public class OAuth2Service {

    private static final String GOOGLE_PROVIDER = "google";

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
            
            // Validate required fields
            if (email == null || email.isEmpty()) {
                throw new IllegalStateException("Email not provided in Google token");
            }
            if (providerId == null || providerId.isEmpty()) {
                throw new IllegalStateException("Google ID (sub) not provided in token");
            }

            // Check if user exists
            Optional<UserModel> existingUser = userRepository.findByEmail(email);

            UserModel user;
            if (existingUser.isPresent()) {
                user = existingUser.get();
                // Update user info if needed
                if (name != null) user.setName(name);
                user.setProvider(GOOGLE_PROVIDER);
                user.setProviderId(providerId);
                if (picture != null) user.setProfilePicture(picture);
            } else {
                // Create new user
                user = new UserModel();
                user.setName(name != null ? name : email.split("@")[0]);
                user.setEmail(email);
                user.setProvider(GOOGLE_PROVIDER);
                user.setProviderId(providerId);
                if (picture != null) user.setProfilePicture(picture);
                user.setRole("USER");
                // Generate a random password for OAuth users (they won't use it)
                user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            }

            // Save or update user
            user = userRepository.save(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());

            return new AuthResponse(token, user.getRole());

        } catch (IllegalStateException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("Invalid Google token: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new IllegalStateException("Google authentication failed: " + e.getMessage(), e);
        }
    }

    /**
     * Handle OAuth login with generic provider
     * @param provider Provider name (e.g., "google")
     * @param idToken ID token from provider
     * @return AuthResponse with JWT token
     */
    public AuthResponse loginWithProvider(String provider, String idToken) {
        if (GOOGLE_PROVIDER.equalsIgnoreCase(provider)) {
            return loginWithGoogle(idToken);
        } else {
            throw new IllegalArgumentException("Unsupported OAuth provider: " + provider);
        }
    }
}

