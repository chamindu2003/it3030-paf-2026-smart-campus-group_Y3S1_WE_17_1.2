package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.LoginRequest;
import com.SmartCampus.OperationHub.DTO.AuthResponse;
import com.SmartCampus.OperationHub.Model.UserModel;
import com.SmartCampus.OperationHub.Repository.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
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

    public List<UserModel> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public UserModel updateUserByEmail(String email, UserModel updateData) {
        UserModel existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (updateData.getName() != null && !updateData.getName().isBlank()) {
            existingUser.setName(updateData.getName());
        }

        if (updateData.getRole() != null && !updateData.getRole().isBlank()) {
            existingUser.setRole(updateData.getRole());
        }

        if (updateData.getProfilePicture() != null) {
            existingUser.setProfilePicture(updateData.getProfilePicture());
        }

        if (updateData.getEmail() != null
                && !updateData.getEmail().isBlank()
                && !existingUser.getEmail().equalsIgnoreCase(updateData.getEmail())) {
            if (userRepository.existsByEmail(updateData.getEmail())) {
                throw new IllegalStateException("Email already exists");
            }
            existingUser.setEmail(updateData.getEmail());
        }

        if (updateData.getPassword() != null && !updateData.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(updateData.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    @Transactional
    public void deleteUserByEmail(String email) {
        UserModel existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        userRepository.delete(existingUser);
    }
}
