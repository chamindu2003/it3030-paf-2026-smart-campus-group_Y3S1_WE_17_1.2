package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.LoginRequest;
import com.SmartCampus.OperationHub.DTO.AuthResponse;
import com.SmartCampus.OperationHub.Model.userModel;
import com.SmartCampus.OperationHub.Repository.userRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class userService {

    @Autowired
    private userRepo userRepository;

    @Autowired
    private AuthService authService;

    public AuthResponse login(LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }

    public userModel registerUser(userModel user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        return userRepository.save(user);
    }

    public Optional<userModel> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<userModel> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
