package com.dran.web_social.services;

import com.dran.web_social.dto.request.LoginRequest;
import com.dran.web_social.dto.request.RefreshTokenRequest;
import com.dran.web_social.dto.request.RegisterRequest;
import com.dran.web_social.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest req);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);
}
