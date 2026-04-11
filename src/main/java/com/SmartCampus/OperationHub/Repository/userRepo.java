package com.SmartCampus.OperationHub.Repository;

import com.SmartCampus.OperationHub.Model.userModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface userRepo extends JpaRepository<userModel, Long> {
    Optional<userModel> findByEmail(String email);
}
