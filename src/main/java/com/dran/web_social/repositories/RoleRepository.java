package com.dran.web_social.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dran.web_social.models.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
