package com.dran.web_social.repositories;

import com.dran.web_social.models.User;
import com.dran.web_social.models.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserTokenRepository extends JpaRepository<UserToken, Long> {
    Optional<UserToken> findByToken(String token);

    Optional<UserToken> findByUser(User user);

    void deleteByUser(User user);
}
