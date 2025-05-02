package com.dran.web_social.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterRequest {
    private String userName;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
}
