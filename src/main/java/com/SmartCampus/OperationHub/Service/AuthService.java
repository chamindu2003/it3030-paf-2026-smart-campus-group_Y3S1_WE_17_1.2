package com.SmartCampus.OperationHub.Service;

import com.SmartCampus.OperationHub.DTO.AuthResponse;
import com.SmartCampus.OperationHub.DTO.LoginRequest;
import com.SmartCampus.OperationHub.Model.UserModel;
import com.SmartCampus.OperationHub.Repository.UserRepo;
import com.SmartCampus.OperationHub.Utils.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepo userRepository;

    private final JwtUtil jwtUtil;

    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepo userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Optional<UserModel> user = userRepository.findByEmail(loginRequest.getEmail());

        if (user.isPresent() && passwordEncoder.matches(loginRequest.getPassword(), user.get().getPassword())) {
            UserModel foundUser = user.get();
            String token = jwtUtil.generateToken(foundUser.getEmail());
            return new AuthResponse(token, foundUser.getRole());
        }

        throw new BadCredentialsException("Invalid email or password");
    }
}