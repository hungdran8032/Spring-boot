package com.dran.web_social.services.impl;

import com.dran.web_social.models.User;
import com.dran.web_social.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.url:http://localhost:9000}")
    private String appUrl;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async
    public void sendVerificationEmail(User user, String token) {
        try {
            String verificationUrl = frontendUrl + "/verify?token=" + token + "&email=" + user.getEmail();

            Context context = new Context();
            context.setVariable("name", user.getFirstName() != null ? user.getFirstName() : user.getUsername());
            context.setVariable("verificationUrl", verificationUrl);

            String emailContent = templateEngine.process("verification-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Xác thực tài khoản Web Social");
            helper.setText(emailContent, true);

            mailSender.send(mimeMessage);
            log.info("Verification email sent to: {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send verification email to: {}", user.getEmail(), e);
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(User user, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;

            Context context = new Context();
            context.setVariable("name", user.getFirstName() != null ? user.getFirstName() : user.getUsername());
            context.setVariable("resetUrl", resetUrl);

            String emailContent = templateEngine.process("reset-password-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Đặt lại mật khẩu Web Social");
            helper.setText(emailContent, true);

            mailSender.send(mimeMessage);
            log.info("Password reset email sent to: {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {}", user.getEmail(), e);
        }
    }
}
