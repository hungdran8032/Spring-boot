package com.dran.web_social.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import java.util.Collections;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final String[] WHITE_LIST = {
            "api/v1/auth/**"
    };

    private final String[] BLACK_LIST = {
            "api/v1/roles/**"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(WHITE_LIST).permitAll()
                        // .requestMatchers(WHITE_LIST).hasRole("USER")
                        .requestMatchers(BLACK_LIST).hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex.authenticationEntryPoint(
                        jwtAuthenticationEntryPoint));
        return http.build();
    }

    @Bean
    // Mã hoá mật khẩu
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    // Cấu hình xác thực
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    // Cấu hình CORS
    public CorsConfigurationSource corsConfigurationSource() {
        return new CorsConfigurationSource() {
            @Override
            // Lấy cấu hình CORS
            public CorsConfiguration getCorsConfiguration(@NonNull HttpServletRequest request) {
                // Cấu hình CORS
                CorsConfiguration cfg = new CorsConfiguration();
                // Cho phép tất cả các nguồn
                cfg.setAllowedOrigins(Collections.singletonList("http://localhost:5173"));
                // Cho phép tất cả các phương thức
                cfg.setAllowedMethods(Collections.singletonList("*"));
                // Cho phép tất cả các header
                cfg.setAllowedHeaders(Collections.singletonList("*"));
                // Cho phép gửi credentials
                cfg.setAllowCredentials(true);
                // Cho phép hiển thị header Authorization
                cfg.setExposedHeaders(Collections.singletonList("Authorization"));
                // Thời gian tồn tại của CORS
                cfg.setMaxAge(3600L);
                return cfg;
            }
        };
    }
}
