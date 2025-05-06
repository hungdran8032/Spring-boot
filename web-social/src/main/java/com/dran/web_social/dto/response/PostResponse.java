package com.dran.web_social.dto.response;

import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {
    private Long id;
    private String content;
    private String userName;
    private String userFullName;
    private String userAvatar;
    private Date createAt;
    private Date updateAt;
    private List<MediaResponse> media;
}
