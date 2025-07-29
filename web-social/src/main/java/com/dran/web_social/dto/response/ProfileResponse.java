package com.dran.web_social.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    private String bio;
    private String banner;
    private String website;
    private String location;
    private Integer followersCount;
    private Integer followingCount;
    private Integer postsCount;
    private UserResponse user;
}
