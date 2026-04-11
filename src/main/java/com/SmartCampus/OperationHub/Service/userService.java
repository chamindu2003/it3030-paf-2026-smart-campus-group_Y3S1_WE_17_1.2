package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.LoginRequest;
import com.SmartCampus.OperationHub.DTO.AuthResponse;
import com.SmartCampus.OperationHub.Model.userModel;
import com.SmartCampus.OperationHub.Repository.userRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
public class userService {

    @Autowired
    private userRepo userRepository;

    public AuthResponse login(LoginRequest loginRequest) {
        Optional<userModel> user = userRepository.findByEmail(loginRequest.getEmail());
        
        if (user.isPresent() && user.get().getPassword().equals(loginRequest.getPassword())) {
            userModel foundUser = user.get();
            String token = generateToken(foundUser.getId());
            return new AuthResponse(token, foundUser.getRole());
        }
        
        throw new RuntimeException("Invalid email or password");
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

    private String generateToken(Long userId) {
        return UUID.randomUUID().toString() + "-" + userId;
    }
}
