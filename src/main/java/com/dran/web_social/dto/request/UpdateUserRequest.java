package com.dran.web_social.dto.request;

import lombok.Data;

@Data
public class UpdateUserRequest {
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
}
