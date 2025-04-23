package com.dran.web_social.config;

import com.dran.web_social.dto.response.AuthResponse;
import com.dran.web_social.models.RefreshToken;
import com.dran.web_social.models.Role;
import com.dran.web_social.models.User;
import com.dran.web_social.models.UserRole;
import com.dran.web_social.repositories.RefreshTokenRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.repositories.UserRoleRepository;
import com.dran.web_social.services.RoleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
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
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtConfig jwtConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

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

            // Check if user exists
            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;

            if (userOptional.isEmpty()) {
                log.info("Creating new user for email: {}", email);
                // Create new user
                user = User.builder()
                        .email(email)
                        .userName(email) // Use email as username
                        .enabled(true)
                        .isVerified(true) // Google already verified the email
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

            String token = jwtConfig.generateToken(user.getUsername(), roles);
            String refreshToken = jwtConfig.generateRefreshToken(user.getUsername());

            // Lưu refresh token vào database
            refreshTokenRepository.deleteByUserId(user.getId()); // Xóa refresh token cũ nếu có
            RefreshToken refreshTokenEntity = RefreshToken.builder()
                    .token(refreshToken)
                    .expiryDate(Instant.now().plusMillis(7 * 86400000)) // 7 ngày
                    .user(user)
                    .build();
            refreshTokenRepository.save(refreshTokenEntity);

            // Tạo AuthResponse giống như khi đăng nhập thông thường
            AuthResponse authResponse = AuthResponse.builder()
                    .message("Đăng nhập Google thành công")
                    .userName(user.getUsername())
                    .token(token)
                    .refreshToken(refreshToken)
                    .build();

            // Trả về JSON response
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(authResponse));

            log.info("OAuth2 authentication completed successfully for user: {}", user.getUsername());
        } catch (Exception e) {
            log.error("Error in OAuth2 authentication success handler", e);
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
