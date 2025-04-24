package com.dran.web_social.services;

import com.dran.web_social.models.User;
import com.dran.web_social.models.UserToken;

public interface VerificationTokenService {
    UserToken createVerificationToken(User user);

    boolean verifyToken(String token);

    void deleteToken(UserToken token);

    UserToken findByToken(String token);

    UserToken findByUser(User user);

    void resendVerificationToken(User user);
}
