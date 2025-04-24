package com.dran.web_social.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserToken extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeUserToken type;

    public static UserToken generateToken(User user, int expirationMinutes, TypeUserToken type) {
        return UserToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(Instant.now().plusSeconds(expirationMinutes * 60L))
                .type(type)
                .build();
    }

    public boolean isExpired() {
        return Instant.now().isAfter(this.expiryDate);
    }

    public enum TypeUserToken {
        VERIFICATION, RESET_PASSWORD
    }
}
