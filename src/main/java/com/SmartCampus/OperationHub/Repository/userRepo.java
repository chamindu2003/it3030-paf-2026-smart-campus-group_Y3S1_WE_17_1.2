package com.SmartCampus.OperationHub.Repository;

import com.SmartCampus.OperationHub.Model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<UserModel, Long> {
    Optional<UserModel> findByEmail(String email);
}