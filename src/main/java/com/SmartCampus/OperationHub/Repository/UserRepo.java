package com.SmartCampus.OperationHub.Repository;

import com.SmartCampus.OperationHub.Model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<UserModel, Long> {
    
    /**
     * Find a user by email address
     * @param email the email to search for
     * @return Optional containing the user if found, empty otherwise
     */
    Optional<UserModel> findByEmail(String email);
    
    /**
     * Find a user by OAuth provider and provider ID
     * @param provider the OAuth provider (e.g., "google", "github")
     * @param providerId the user ID from the OAuth provider
     * @return Optional containing the user if found, empty otherwise
     */
    Optional<UserModel> findByProviderAndProviderId(String provider, String providerId);
    
    /**
     * Check if a user exists by email
     * @param email the email to check
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
}
