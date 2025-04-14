package com.dran.web_social.services;

import com.dran.web_social.dto.request.UpdateUserRequest;
import com.dran.web_social.dto.response.UserResponse;

public interface UserService {
    UserResponse getUserById(Long id);

    UserResponse getUserByUserName(String userName);

    UserResponse getUserByEmail(String email);

    UserResponse updateUser(UpdateUserRequest req);

    void checkUserNameExists(String userName);

    void checkEmailExists(String email);
}
