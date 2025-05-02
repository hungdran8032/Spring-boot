package com.dran.web_social.services;

import com.dran.web_social.dto.request.ChangePasswordRequest;
import com.dran.web_social.dto.request.ForgotPasswordRequest;
import com.dran.web_social.dto.request.ResetPasswordRequest;
import com.dran.web_social.models.User;

public interface PasswordService {

    void changePassword(String username, ChangePasswordRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    boolean validatePasswordResetToken(String token);

    User getUserByPasswordResetToken(String token);
}
