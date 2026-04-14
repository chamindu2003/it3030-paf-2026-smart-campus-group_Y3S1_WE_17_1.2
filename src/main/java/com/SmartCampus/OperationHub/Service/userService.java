package com.smartcampus.operationhub.service;

import com.smartcampus.operationhub.dto.LoginRequest;
import com.smartcampus.operationhub.dto.AuthResponse;
import com.smartcampus.operationhub.model.UserModel;
import com.smartcampus.operationhub.repository.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

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
            throw new IllegalStateException("Email already exists");
        }
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<UserModel> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<UserModel> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
