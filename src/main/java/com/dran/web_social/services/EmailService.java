package com.dran.web_social.services;

import com.dran.web_social.models.User;

public interface EmailService {
    void sendVerificationEmail(User user, String token);

    void sendPasswordResetEmail(User user, String token);
}
