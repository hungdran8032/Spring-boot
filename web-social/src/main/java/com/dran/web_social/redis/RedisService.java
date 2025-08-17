package com.dran.web_social.redis;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final String USER_TOKEN_SET_PREFIX = "user_refresh_tokens:";
    @Autowired
    private ObjectMapper objectMapper;

    public RedisService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void save(RTRedis refreshToken) {
        String key = REFRESH_TOKEN_PREFIX + refreshToken.getToken();
        System.out.println("Saving refresh token with key: " + key);
        redisTemplate.opsForValue().set(key, refreshToken);

        long ttlSeconds = Duration.between(Instant.now(), refreshToken.getExpiryDate()).getSeconds();
        if (ttlSeconds <= 0) {
            System.out.println("Warning: TTL is zero or negative for key: " + key + ", skipping expire.");
            return;
        }
        redisTemplate.expire(key, ttlSeconds, TimeUnit.SECONDS);
        System.out.println("Set TTL for " + key + ": " + ttlSeconds + " seconds");

        // Lưu token vào set của user
        if (refreshToken.getUserId() != null) {
            String userKey = USER_TOKEN_SET_PREFIX + refreshToken.getUserId();
            redisTemplate.opsForSet().add(userKey, refreshToken.getToken());
            redisTemplate.expire(userKey, ttlSeconds, TimeUnit.SECONDS);
        }
    }

    public Optional<RTRedis> findByToken(String token) {
        String key = REFRESH_TOKEN_PREFIX + token;
        Object value = redisTemplate.opsForValue().get(key);

        if (value == null)
            return Optional.empty();

        RTRedis rt = objectMapper.convertValue(value, RTRedis.class);
        return Optional.of(rt);
    }

    public void deleteByToken(String token) {
        String key = REFRESH_TOKEN_PREFIX + token;
        RTRedis refreshToken = findByToken(token).orElse(null);
        if (refreshToken != null && refreshToken.getUserId() != null) {
            String userKey = USER_TOKEN_SET_PREFIX + refreshToken.getUserId();
            redisTemplate.opsForSet().remove(userKey, token);
        }
        redisTemplate.delete(key);
    }

    public void deleteAllByUserId(Long userId) {
        String userKey = USER_TOKEN_SET_PREFIX + userId;
        Set<Object> tokens = redisTemplate.opsForSet().members(userKey);
        if (tokens != null) {
            tokens.forEach(t -> deleteByToken((String) t));
        }
        redisTemplate.delete(userKey);
    }
}