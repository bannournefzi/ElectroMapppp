package org.example.electromap1.role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role,Integer> {
    @Query("SELECT r FROM Role r WHERE UPPER(TRIM(r.name)) = UPPER(TRIM(:role))")
    Optional<Role> findByName(@Param("role") String role);
}
