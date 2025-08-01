package com.dran.web_social.services;

import com.dran.web_social.dto.request.UpdateProfileRequest;
import com.dran.web_social.dto.response.ProfileResponse;

public interface ProfileService {
    ProfileResponse updateProfile(UpdateProfileRequest request);

    ProfileResponse getProfile(String username);
}
