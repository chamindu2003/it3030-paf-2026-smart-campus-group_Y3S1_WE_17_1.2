package com.SmartCampus.OperationHub.Controller;

import com.SmartCampus.OperationHub.DTO.LoginRequest;
import com.SmartCampus.OperationHub.DTO.AuthResponse;
import com.SmartCampus.OperationHub.Model.userModel;
import com.SmartCampus.OperationHub.Service.userService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping(value = "api/v1")
public class userController {

    @Autowired
    private userService userService;

    @GetMapping("/getUser")
    public String getUser() {
        return "Hello User";
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = userService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<userModel> register(@RequestBody userModel user) {
        try {
            userModel savedUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<userModel> getUserByEmail(@PathVariable String email) {
        Optional<userModel> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
