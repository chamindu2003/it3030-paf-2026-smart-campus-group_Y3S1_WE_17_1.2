package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.AuthResponse;
import com.SmartCampus.OperationHub.DTO.LoginRequest;
import com.SmartCampus.OperationHub.Model.UserModel;
import com.SmartCampus.OperationHub.Repository.UserRepo;
import com.SmartCampus.OperationHub.Utils.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepo userRepository;

    private final JwtUtil jwtUtil;

    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepo userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest loginRequest) {
        logger.info("Login attempt for email: {}", loginRequest.getEmail());
        
        Optional<UserModel> user = userRepository.findByEmail(loginRequest.getEmail());

        if (user.isEmpty()) {
            logger.warn("User not found with email: {}", loginRequest.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }

        if (passwordEncoder.matches(loginRequest.getPassword(), user.get().getPassword())) {
            logger.info("Password verified successfully for user: {}", loginRequest.getEmail());
            UserModel foundUser = user.get();
            String token = jwtUtil.generateToken(foundUser.getEmail());
            return new AuthResponse(token, foundUser.getRole());
        }

        logger.warn("Password verification failed for user: {}", loginRequest.getEmail());
        throw new BadCredentialsException("Invalid email or password");
    }
}