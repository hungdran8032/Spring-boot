package com.dran.web_social.services;

import com.dran.web_social.dto.response.CommentResponse;

public interface WebSocketService {
    void notifyCommentCreated(Long postId, CommentResponse comment, String username);

    void notifyCommentUpdated(Long postId, CommentResponse comment, String username);

    void notifyCommentDeleted(Long postId, Long commentId, String username);
}
