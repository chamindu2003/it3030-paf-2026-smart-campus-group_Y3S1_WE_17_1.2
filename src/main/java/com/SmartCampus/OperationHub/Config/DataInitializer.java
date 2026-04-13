package com.SmartCampus.OperationHub.Config;

import com.SmartCampus.OperationHub.Model.userModel;
import com.SmartCampus.OperationHub.Repository.userRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialize default admin user on application startup
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private userRepo userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin user already exists
        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            // Create default admin user
            userModel adminUser = new userModel();
            adminUser.setName("Admin User");
            adminUser.setEmail("admin@example.com");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setRole("ADMIN");

            userRepository.save(adminUser);
            System.out.println("✅ Default admin user created!");
            System.out.println("   Email: admin@example.com");
            System.out.println("   Password: admin123");
        } else {
            System.out.println("✅ Admin user already exists");
        }

        // Create a test user if it doesn't exist
        if (userRepository.findByEmail("user@example.com").isEmpty()) {
            userModel testUser = new userModel();
            testUser.setName("Test User");
            testUser.setEmail("user@example.com");
            testUser.setPassword(passwordEncoder.encode("user123"));
            testUser.setRole("USER");

            userRepository.save(testUser);
            System.out.println("✅ Test user created!");
            System.out.println("   Email: user@example.com");
            System.out.println("   Password: user123");
        } else {
            System.out.println("✅ Test user already exists");
        }
    }
}

