package com.SmartCampus.OperationHub.Config;

import com.SmartCampus.OperationHub.Model.UserModel;
import com.SmartCampus.OperationHub.Repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialize default admin user on application startup
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String defaultAdminPassword;
    private final String defaultUserPassword;

    public DataInitializer(
            UserRepo userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.admin-password:ChangeMeAdmin@2026}") String defaultAdminPassword,
            @Value("${app.seed.user-password:ChangeMeUser@2026}") String defaultUserPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.defaultAdminPassword = defaultAdminPassword;
        this.defaultUserPassword = defaultUserPassword;
    }

    @Override
    public void run(String... args) {
        // Check if admin user already exists
        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            // Create default admin user
            UserModel adminUser = new UserModel();
            adminUser.setName("Admin User");
            adminUser.setEmail("admin@example.com");
            adminUser.setPassword(passwordEncoder.encode(defaultAdminPassword));
            adminUser.setRole("ADMIN");

            userRepository.save(adminUser);
            logger.info("Default admin user created: {}", adminUser.getEmail());
        } else {
            logger.info("Admin user already exists");
        }

        // Create a test user if it doesn't exist
        if (userRepository.findByEmail("user@example.com").isEmpty()) {
            UserModel testUser = new UserModel();
            testUser.setName("Test User");
            testUser.setEmail("user@example.com");
            testUser.setPassword(passwordEncoder.encode(defaultUserPassword));
            testUser.setRole("USER");

            userRepository.save(testUser);
            logger.info("Test user created: {}", testUser.getEmail());
        } else {
            logger.info("Test user already exists");
        }
    }
}

