package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.LoginRequest;
import com.SmartCampus.OperationHub.DTO.AuthResponse;
import com.SmartCampus.OperationHub.Model.UserModel;
import com.SmartCampus.OperationHub.Repository.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepo userRepository;

    private final AuthService authService;

    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepo userRepository, AuthService authService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }

    public UserModel registerUser(UserModel user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.warn("Registration failed: Email already exists - {}", user.getEmail());
            throw new IllegalStateException("Email already exists");
        }
        
        // Encode password before saving
        logger.info("Registering new user: {} with role: {}", user.getEmail(), user.getRole());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        UserModel savedUser = userRepository.save(user);
        logger.info("User registered successfully: {}", user.getEmail());
        return savedUser;
    }

    public Optional<UserModel> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<UserModel> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
