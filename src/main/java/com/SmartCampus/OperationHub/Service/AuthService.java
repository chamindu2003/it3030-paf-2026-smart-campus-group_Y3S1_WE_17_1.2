package com.smartcampus.operationhub.service;

import com.smartcampus.operationhub.dto.AuthResponse;
import com.smartcampus.operationhub.dto.LoginRequest;
import com.smartcampus.operationhub.model.UserModel;
import com.smartcampus.operationhub.repository.UserRepo;
import com.smartcampus.operationhub.utils.JwtUtil;
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