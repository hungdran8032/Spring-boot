package com.dran.web_social.services;

import com.dran.web_social.dto.request.CommentRequest;
import com.dran.web_social.dto.response.CommentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {

    CommentResponse createComment(String username, Long postId, CommentRequest request);

    CommentResponse updateComment(String username, Long commentId, CommentRequest request);

    void deleteComment(String username, Long commentId);

    Page<CommentResponse> getCommentsByPostId(Long postId, Pageable pageable, String currentUsername);

    Page<CommentResponse> getListCommentByPostId(Long postId, Pageable pageable);

    CommentResponse getCommentById(Long commentId, String currentUsername);
}