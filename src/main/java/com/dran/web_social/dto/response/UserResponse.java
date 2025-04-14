package com.dran.web_social.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class UserResponse {
    private String userName;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String avatar;
    private String role;
    private String gender;
    private String birthDay;
    private boolean enabled;
    private boolean isVerified;
    private Set<String> roles;
}
