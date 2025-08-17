package com.dran.web_social.config;

import com.dran.web_social.dto.response.AuthResponse;
import com.dran.web_social.mappers.ProfileMapper;
import com.dran.web_social.models.Profile;
// import com.dran.web_social.models.RefreshToken;
import com.dran.web_social.models.Role;
import com.dran.web_social.models.User;
import com.dran.web_social.models.UserRole;
import com.dran.web_social.redis.RTRedis;
import com.dran.web_social.redis.RedisService;
// import com.dran.web_social.repositories.RefreshTokenRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.repositories.UserRoleRepository;
import com.dran.web_social.services.RoleService;
import com.dran.web_social.utils.TokenType;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final UserRoleRepository userRoleRepository;
    // private final RefreshTokenRepository refreshTokenRepository;
    private final RedisService redisService;
    private final JwtConfig jwtConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ProfileMapper profileMapper;

    @Value("${jwt.refresh.expiration}")
    private long refreshTokenExpiration;

    private String generatePassword(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            password.append(characters.charAt(random.nextInt(characters.length())));
        }
        return password.toString();
    }

    @Transactional
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        try {
            log.info("OAuth2 authentication success");
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oAuth2User = oauthToken.getPrincipal();
            Map<String, Object> attributes = oAuth2User.getAttributes();

            log.info("OAuth2 attributes: {}", attributes);

            String email = (String) attributes.get("email");
            String name = (String) attributes.get("name");
            if (email == null) {
                log.error("Email is null in OAuth2 attributes");
                response.setContentType("application/json");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Email not found in OAuth2 attributes\"}");
                return;
            }
            String username = email.split("@")[0];
            Boolean emailVerified = (Boolean) attributes.get("email_verified");

            // Check if user exists
            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;

            if (userOptional.isEmpty()) {
                log.info("Creating new user for email: {}", email);
                String randomPassword = generatePassword(6); // Độ dài 12 ký tự
                String encodedPassword = new BCryptPasswordEncoder().encode(randomPassword);
                // Create new user
                user = User.builder()
                        .email(email)
                        .userName(username) // Use email as username
                        .password(encodedPassword)
                        .enabled(true)
                        .isVerified(emailVerified != null ? emailVerified : true)
                        .userRoles(new HashSet<>())
                        .build();

                // Split name into first and last name if possible
                if (name != null && name.contains(" ")) {
                    String[] nameParts = name.split(" ", 2);
                    user.setFirstName(nameParts[0]);
                    user.setLastName(nameParts[1]);
                } else {
                    user.setFirstName(name);
                }

                // Assign USER role
                Role role = roleService.getRoleByName("USER");
                UserRole userRole = UserRole.builder()
                        .user(user)
                        .role(role)
                        .build();

                user.getUserRoles().add(userRole);

                Profile profile = profileMapper.createDefaultProfile(user);
                user.setProfile(profile);

                userRepository.save(user);
                userRoleRepository.save(userRole);
            } else {
                log.info("User found for email: {}", email);
                user = userOptional.get();
            }

            // Generate JWT token
            Set<String> roles = user.getUserRoles().stream()
                    .map(ur -> ur.getRole().getName())
                    .collect(Collectors.toSet());

            String accessToken = jwtConfig.generateToken(user.getUsername(), roles, TokenType.ACCESS_TOKEN);
            String refreshToken = jwtConfig.generateToken(user.getUsername(), roles,
                    TokenType.REFRESH_TOKEN);
            // Lưu refresh token vào database
            // refreshTokenRepository.deleteByUserId(user.getId());
            // RefreshToken refreshTokenEntity = RefreshToken.builder()
            // .token(refreshToken)
            // .expiryDate(Instant.now().plusMillis(refreshTokenExpiration))
            // .user(user)
            // .build();
            // refreshTokenRepository.save(refreshTokenEntity);
            // Lưu refresh token vào Redis
            redisService.deleteAllByUserId(user.getId()); // Xóa tất cả token cũ
            RTRedis rtRedis = new RTRedis(refreshToken, Instant.now().plusMillis(refreshTokenExpiration), user.getId());
            redisService.save(rtRedis);

            // Tạo AuthResponse giống như khi đăng nhập thông thường
            AuthResponse authResponse = AuthResponse.builder()
                    .message("Đăng nhập Google thành công")
                    .userName(user.getUsername())
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .build();

            // // Trả về JSON response
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(authResponse));
            String redirectUrl = String.format(
                    "http://localhost:3000/google/callback?token=%s&refreshToken=%s",
                    accessToken, refreshToken);
            response.sendRedirect(redirectUrl);
            log.info("OAuth2 authentication completed successfully for user: {}", user.getUsername());
        } catch (Exception e) {
            log.error("Error in OAuth2 authentication success handler", e);
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
