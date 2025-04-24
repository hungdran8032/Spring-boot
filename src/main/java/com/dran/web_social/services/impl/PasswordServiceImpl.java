package com.dran.web_social.services.impl;

import com.dran.web_social.dto.request.ChangePasswordRequest;
import com.dran.web_social.dto.request.ForgotPasswordRequest;
import com.dran.web_social.dto.request.ResetPasswordRequest;
import com.dran.web_social.models.UserToken;
import com.dran.web_social.models.UserToken.TypeUserToken;
import com.dran.web_social.models.User;
import com.dran.web_social.repositories.UserTokenRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.services.EmailService;
import com.dran.web_social.services.PasswordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordServiceImpl implements PasswordService {

    private final UserRepository userRepository;
    private final UserTokenRepository passwordResetTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.password.reset.token.expiration:15}") // 15 minutes by default
    private int tokenExpirationMinutes;

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        // Validate request
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        // Get user
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", username);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + request.getEmail()));

        // Delete any existing tokens
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        // Create new token
        UserToken token = UserToken.generateToken(user, tokenExpirationMinutes, TypeUserToken.RESET_PASSWORD);
        passwordResetTokenRepository.save(token);

        // Send email
        emailService.sendPasswordResetEmail(user, token.getToken());

        log.info("Password reset email sent to: {}", request.getEmail());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Validate request
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        // Validate token
        UserToken token = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ"));

        if (token.isExpired()) {
            passwordResetTokenRepository.delete(token);
            throw new RuntimeException("Token đã hết hạn");
        }

        // Get user and update password
        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Delete token
        passwordResetTokenRepository.delete(token);

        log.info("Password reset successfully for user: {}", user.getUsername());
    }

    @Override
    public boolean validatePasswordResetToken(String token) {
        Optional<UserToken> tokenOpt = passwordResetTokenRepository.findByToken(token);

        if (tokenOpt.isEmpty()) {
            return false;
        }

        UserToken resetToken = tokenOpt.get();
        return !resetToken.isExpired();
    }

    @Override
    public User getUserByPasswordResetToken(String token) {
        UserToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ"));

        if (resetToken.isExpired()) {
            throw new RuntimeException("Token đã hết hạn");
        }

        return resetToken.getUser();
    }
}
