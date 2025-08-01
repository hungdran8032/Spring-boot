package com.dran.web_social.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private int likesCount;
    private int repliesCount;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    // User info
    private String userName;
    private String userFullName;
    private String userAvatar;

    // Parent comment info
    private Long parentId;

    // Replies
    private List<CommentResponse> replies;

    // Current user interaction
    private boolean isLiked;
    private boolean isOwner;

    // Deletion status
    private boolean deleted;
}
