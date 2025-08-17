package com.dran.web_social.redis;

import java.io.Serializable;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RTRedis implements Serializable {
    private static final long serialVersionUID = 1L;

    private String token; // refresh token string
    private Instant expiryDate; // ngày hết hạn
    private Long userId; // gắn với user
}