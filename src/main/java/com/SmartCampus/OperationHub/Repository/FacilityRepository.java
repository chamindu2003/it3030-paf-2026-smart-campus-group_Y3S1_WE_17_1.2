package com.SmartCampus.OperationHub.Repository;

import com.SmartCampus.OperationHub.Enums.FacilityType;
import com.SmartCampus.OperationHub.Model.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FacilityRepository extends JpaRepository<Facility, Long> {

    @Query("SELECT f FROM Facility f WHERE " +
            "(:type IS NULL OR f.type = :type) AND " +
            "(:minCapacity IS NULL OR f.capacity >= :minCapacity) AND " +
            "(:location IS NULL OR LOWER(f.location) LIKE LOWER(CONCAT('%', :location, '%')))")
    List<Facility> findWithFilters(
            @Param("type") FacilityType type,
            @Param("minCapacity") Integer minCapacity,
            @Param("location") String location);
}