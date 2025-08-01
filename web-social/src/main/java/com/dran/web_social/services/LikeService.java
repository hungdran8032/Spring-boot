package com.dran.web_social.services;

import com.dran.web_social.dto.response.LikeResponse;

public interface LikeService {
    
    LikeResponse toggleLikePost(String username, Long postId);
    
    LikeResponse toggleLikeComment(String username, Long commentId);
    
    boolean isPostLikedByUser(Long postId, Long userId);
    
    boolean isCommentLikedByUser(Long commentId, Long userId);
    
    int getPostLikesCount(Long postId);
    
    int getCommentLikesCount(Long commentId);
}