package com.dran.web_social.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dran.web_social.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserName(String userName);

    Optional<User> findByEmail(String email);

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);
}