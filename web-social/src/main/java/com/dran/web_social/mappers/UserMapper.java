package com.dran.web_social.mappers;

import com.dran.web_social.dto.request.RegisterRequest;
import com.dran.web_social.dto.response.AuthResponse;
import com.dran.web_social.dto.response.UserResponse;
import com.dran.web_social.models.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "isVerified", constant = "false")
    @Mapping(target = "userRoles", ignore = true)
    @Mapping(target = "createAt", ignore = true)
    @Mapping(target = "updateAt", ignore = true)
    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "avatar", ignore = true)
    @Mapping(target = "gender", ignore = true)
    @Mapping(target = "birthDay", ignore = true)
    @Mapping(target = "posts", ignore = true)
    @Mapping(target = "profile", ignore = true)
    User registerRequestToUser(RegisterRequest request);

    @Mapping(target = "message", constant = "Registration successful")
    @Mapping(target = "userName", source = "username")
    @Mapping(target = "token", ignore = true)
    @Mapping(target = "refreshToken", ignore = true)
    AuthResponse userToAuthResponse(User user);

    @Mapping(target = "message", constant = "Login successful")
    @Mapping(target = "userName", source = "username")
    @Mapping(target = "token", ignore = true)
    @Mapping(target = "refreshToken", ignore = true)
    AuthResponse userToLoginAuthResponse(User user);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "userName", source = "username")
    @Mapping(target = "isVerified", source = "verified")
    @Mapping(target = "roles", expression = "java(user.getUserRoles().stream().map(ur -> ur.getRole().getName()).collect(java.util.stream.Collectors.toSet()))")
    UserResponse userToUserResponse(User user);
}
