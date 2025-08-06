package com.dran.web_social.dto.websocket;

import com.dran.web_social.dto.response.CommentResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentMessage {
    private String type; // "CREATE", "UPDATE", "DELETE"
    private Long postId;
    private CommentResponse comment;
    private String username;
}