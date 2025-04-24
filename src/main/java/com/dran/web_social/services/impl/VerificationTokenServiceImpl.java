package com.dran.web_social.services.impl;

import com.dran.web_social.models.User;
import com.dran.web_social.models.UserToken;
import com.dran.web_social.models.UserToken.TypeUserToken;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.repositories.UserTokenRepository;
import com.dran.web_social.services.EmailService;
import com.dran.web_social.services.VerificationTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationTokenServiceImpl implements VerificationTokenService {

    private final UserTokenRepository verificationTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.verification.token.expiration:1440}") // 24 hours in minutes
    private int tokenExpirationMinutes;

    @Override
    @Transactional
    public UserToken createVerificationToken(User user) {
        // Delete any existing tokens for this user
        verificationTokenRepository.findByUser(user).ifPresent(verificationTokenRepository::delete);

        // Create new token
        UserToken token = UserToken.generateToken(user, tokenExpirationMinutes, TypeUserToken.VERIFICATION);
        UserToken savedToken = verificationTokenRepository.save(token);

        // Send verification email
        emailService.sendVerificationEmail(user, savedToken.getToken());

        return savedToken;
    }

    @Override
    @Transactional
    public boolean verifyToken(String token) {
        Optional<UserToken> verificationTokenOpt = verificationTokenRepository.findByToken(token);

        if (verificationTokenOpt.isEmpty()) {
            log.warn("Verification token not found: {}", token);
            return false;
        }

        UserToken verificationToken = verificationTokenOpt.get();

        if (verificationToken.isExpired()) {
            log.warn("Verification token expired: {}", token);
            verificationTokenRepository.delete(verificationToken);
            return false;
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        user.setVerified(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
        log.info("User verified successfully: {}", user.getUsername());

        return true;
    }

    @Override
    public void deleteToken(UserToken token) {
        verificationTokenRepository.delete(token);
    }

    @Override
    public UserToken findByToken(String token) {
        return verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token không tồn tại"));
    }

    @Override
    public UserToken findByUser(User user) {
        return verificationTokenRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy token cho người dùng này"));
    }

    @Override
    @Transactional
    public void resendVerificationToken(User user) {
        // Delete old token if exists
        verificationTokenRepository.findByUser(user).ifPresent(verificationTokenRepository::delete);

        // Create new token
        createVerificationToken(user);
        log.info("Verification token resent for user: {}", user.getUsername());
    }
}
