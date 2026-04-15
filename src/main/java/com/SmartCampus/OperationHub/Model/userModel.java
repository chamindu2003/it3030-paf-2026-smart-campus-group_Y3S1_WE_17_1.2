package com.smartcampus.operationhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserModel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column
    private String password;
    
    @Column(nullable = false)
    private String role;
    
    // OAuth Provider fields
    @Column
    private String provider; // e.g., "google", "github", "local"
    
    @Column
    private String providerId; // OAuth provider's user ID
    
    @Column
    private String profilePicture; // Profile picture URL from OAuth provider
}
