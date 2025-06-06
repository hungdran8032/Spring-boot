package com.dran.web_social.controllers;

import com.dran.web_social.dto.request.LoginRequest;
import com.dran.web_social.dto.request.RefreshTokenRequest;
import com.dran.web_social.dto.request.RegisterRequest;
import com.dran.web_social.dto.response.AuthResponse;
import com.dran.web_social.models.User;
import com.dran.web_social.repositories.RefreshTokenRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.services.AuthService;
import com.dran.web_social.services.VerificationTokenService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenService verificationTokenService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody RefreshTokenRequest request) {
        refreshTokenRepository.findByToken(request.getRefreshToken())
                .ifPresent(refreshTokenRepository::delete);
        return ResponseEntity.ok("{\"message\": \"Logged out\"}");
    }

    @GetMapping("/google/login")
    public void googleLogin(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/google");
    }

    @GetMapping("/google/callback")
    public ResponseEntity<AuthResponse> googleCallback() {
        // Phương thức này sẽ không được gọi trực tiếp vì OAuth2LoginSuccessHandler
        // sẽ xử lý callback và trả về JSON
        // Nhưng chúng ta cần định nghĩa nó để Spring Security biết endpoint này tồn tại
        return ResponseEntity.ok(AuthResponse.builder().message("OAuth2 callback").build());
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyAccount(@RequestParam String token) {
        boolean verified = verificationTokenService.verifyToken(token);
        Map<String, String> response = new HashMap<>();

        if (verified) {
            response.put("message", "Tài khoản đã được kích hoạt thành công");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Token không hợp lệ hoặc đã hết hạn");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerificationEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Email không được cung cấp");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

            if (user.isEnabled()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Tài khoản đã được kích hoạt");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            verificationTokenService.resendVerificationToken(user);

            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn");
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}