package com.dran.web_social.redis;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisClientConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.time.Duration;

@Configuration
public class RedisConfig {
    @Value("${spring.data.redis.host}")
    private String HOST;
    @Value("${spring.data.redis.port}")
    private int PORT;
    @Value("${spring.data.redis.password}")
    private String PASSWORD;
    @Value("${spring.data.redis.ssl.enabled}")
    private boolean SSL_ENABLED;
    @Value("${spring.data.redis.timeout}")
    private Long TIMEOUT;

    @Bean
    public JedisConnectionFactory jedisConnectionFactory() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(HOST, PORT);
        redisConfig.setPassword(PASSWORD);
        redisConfig.setDatabase(0);

        JedisClientConfiguration.JedisClientConfigurationBuilder jedisClientConfig = JedisClientConfiguration.builder();
        jedisClientConfig.connectTimeout(Duration.ofMillis(TIMEOUT));
        jedisClientConfig.readTimeout(Duration.ofMillis(TIMEOUT));

        if (SSL_ENABLED) {
            jedisClientConfig.useSsl();
            System.out.println("SSL enabled for Redis connection to " + HOST + ":" + PORT);
        }
        return new JedisConnectionFactory(redisConfig, jedisClientConfig.build());
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Custom ObjectMapper
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule()); // fix cho Instant, LocalDateTime...
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Dùng Jackson2JsonRedisSerializer với custom mapper
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        serializer.setObjectMapper(mapper);

        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();
        return template;
    }
}
