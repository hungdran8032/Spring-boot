package com.dran.web_social.services.impl;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dran.web_social.config.JwtConfig;
import com.dran.web_social.dto.request.LoginRequest;
import com.dran.web_social.dto.request.RefreshTokenRequest;
import com.dran.web_social.dto.request.RegisterRequest;
import com.dran.web_social.dto.response.AuthResponse;
import com.dran.web_social.mappers.UserMapper;
import com.dran.web_social.models.RefreshToken;
import com.dran.web_social.models.Role;
import com.dran.web_social.models.User;
import com.dran.web_social.models.UserRole;
import com.dran.web_social.repositories.RefreshTokenRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.repositories.UserRoleRepository;
import com.dran.web_social.services.AuthService;
import com.dran.web_social.services.RoleService;
import com.dran.web_social.services.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
        private final RefreshTokenRepository refreshTokenRepository;
        private final UserRepository userRepository;
        private final RoleService roleService;
        private final UserRoleRepository userRoleRepository;
        private final BCryptPasswordEncoder passwordEncoder;
        private final UserMapper userMapper;
        private final UserService userService;
        private final JwtConfig jwtConfig;
        private final AuthenticationManager authenticationManager;

        @Override
        public AuthResponse register(RegisterRequest req) {
                userService.checkUserNameExists(req.getUserName());
                userService.checkEmailExists(req.getEmail());
                User user = userMapper.registerRequestToUser(req);
                user.setPassword(passwordEncoder.encode(req.getPassword()));
                user.setUserRoles(new HashSet<>());
                Role role = roleService.getRoleByName("USER");
                UserRole user_role = UserRole.builder().user(user).role(role).build();
                user.getUserRoles().add(user_role);
                userRepository.save(user);
                userRoleRepository.save(user_role);
                // Tạo JWT token
                Set<String> roles = user.getUserRoles().stream()
                                .map(ur -> ur.getRole().getName())
                                .collect(Collectors.toSet());
                String token = jwtConfig.generateToken(user.getUsername(), roles);
                String refreshToken = jwtConfig.generateRefreshToken(user.getUsername());

                // Lưu refresh token
                RefreshToken refreshTokenEntity = RefreshToken.builder()
                                .token(refreshToken)
                                .expiryDate(Instant.now().plusMillis(7 * 86400000)) // 7 ngày
                                .user(user)
                                .build();
                refreshTokenRepository.save(refreshTokenEntity);
                AuthResponse response = userMapper.userToAuthResponse(user);
                response.setToken(token);
                response.setRefreshToken(refreshToken);
                response.setUserName(user.getUsername());
                return response;
        }

        @Override
        @Transactional
        public AuthResponse login(LoginRequest request) {
                // Xác thực với AuthenticationManager
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getUserName(), request.getPassword()));

                // Lấy UserDetails từ authentication
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();

                // Tạo access token và refresh token
                Set<String> roles = userDetails.getAuthorities().stream()
                                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                                .collect(Collectors.toSet());
                String accessToken = jwtConfig.generateToken(userDetails.getUsername(), roles);
                String refreshToken = jwtConfig.generateRefreshToken(userDetails.getUsername());

                // Lưu refresh token
                User user = (User) userDetails;
                refreshTokenRepository.deleteByUserId(user.getId()); // Xóa refresh token cũ
                RefreshToken refreshTokenEntity = RefreshToken.builder()
                                .token(refreshToken)
                                .expiryDate(Instant.now().plusMillis(7 * 86400000)) // 7 ngày
                                .user(user)
                                .build();
                refreshTokenRepository.save(refreshTokenEntity);

                // Ánh xạ sang DTO phản hồi
                AuthResponse response = userMapper.userToLoginAuthResponse(user);
                response.setToken(accessToken);
                response.setRefreshToken(refreshToken);
                response.setUserName(userDetails.getUsername());
                return response;
        }

        @Override
        public AuthResponse refreshToken(RefreshTokenRequest request) {
                String refreshToken = request.getRefreshToken();
                RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

                if (storedToken.getExpiryDate().isBefore(Instant.now())) {
                        refreshTokenRepository.delete(storedToken);
                        throw new RuntimeException("Refresh token expired");
                }

                User user = storedToken.getUser();
                Set<String> roles = user.getUserRoles().stream()
                                .map(ur -> ur.getRole().getName())
                                .collect(Collectors.toSet());
                String newAccessToken = jwtConfig.generateToken(user.getUsername(), roles);
                String newRefreshToken = jwtConfig.generateRefreshToken(user.getUsername());

                // Xóa RT cũ, lưu RT mới
                refreshTokenRepository.delete(storedToken);
                RefreshToken newTokenEntity = RefreshToken.builder()
                                .token(newRefreshToken)
                                .expiryDate(Instant.now().plusMillis(10 * 60 * 1000)) // 10 phút
                                .user(user)
                                .build();
                refreshTokenRepository.save(newTokenEntity);

                AuthResponse response = new AuthResponse();
                response.setMessage("Token refreshed");
                response.setUserName(user.getUsername());
                response.setToken(newAccessToken);
                response.setRefreshToken(newRefreshToken); // Trả cả RT mới
                return response;
        }

}
