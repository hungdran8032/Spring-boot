package com.dran.web_social.controllers;

import com.dran.web_social.dto.request.ChangePasswordRequest;
import com.dran.web_social.dto.request.ForgotPasswordRequest;
import com.dran.web_social.dto.request.ResetPasswordRequest;
import com.dran.web_social.services.PasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/password")
@RequiredArgsConstructor
@Slf4j
public class PasswordController {

    private final PasswordService passwordService;

    @PostMapping("/change")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        passwordService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("{\"message\": \"Mật khẩu đã được thay đổi thành công\"}");
    }

    @PostMapping("/forgot")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordService.forgotPassword(request);
        return ResponseEntity
                .ok("{\"message\": \"Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.\"}");
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordService.resetPassword(request);
        return ResponseEntity
                .ok("{\"message\": \"Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập ngay bây giờ.\"}");
    }

    @GetMapping("/validate-token")
    public ResponseEntity<String> validateResetToken(@RequestParam String token) {
        boolean isValid = passwordService.validatePasswordResetToken(token);
        if (isValid) {
            return ResponseEntity.ok("{\"valid\": true, \"message\": \"Token hợp lệ\"}");
        } else {
            return ResponseEntity.badRequest()
                    .body("{\"valid\": false, \"message\": \"Token không hợp lệ hoặc đã hết hạn\"}");
        }
    }
}
