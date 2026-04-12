package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.AuthResponse;
import com.SmartCampus.OperationHub.DTO.LoginRequest;
import com.SmartCampus.OperationHub.Model.userModel;
import com.SmartCampus.OperationHub.Repository.userRepo;
import com.SmartCampus.OperationHub.Utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private userRepo userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest loginRequest) {
        Optional<userModel> user = userRepository.findByEmail(loginRequest.getEmail());

        if (user.isPresent() && user.get().getPassword().equals(loginRequest.getPassword())) {
            userModel foundUser = user.get();
            String token = jwtUtil.generateToken(foundUser.getEmail());
            return new AuthResponse(token, foundUser.getRole());
        }

        throw new RuntimeException("Invalid email or password");
    }
}