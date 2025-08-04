package com.dran.web_social.services.impl;

import com.dran.web_social.custom.exception.ResourceNotFoundException;
import com.dran.web_social.dto.response.LikeResponse;
import com.dran.web_social.models.CommentPost;
import com.dran.web_social.models.LikeComment;
import com.dran.web_social.models.LikePost;
import com.dran.web_social.models.Post;
import com.dran.web_social.models.User;
import com.dran.web_social.repositories.CommentRepository;
import com.dran.web_social.repositories.LikeCommentRepository;
import com.dran.web_social.repositories.LikePostRepository;
import com.dran.web_social.repositories.PostRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.services.LikeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LikeServiceImpl implements LikeService {

    private final LikePostRepository likePostRepository;
    private final LikeCommentRepository likeCommentRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public LikeResponse toggleLikePost(String username, Long postId) {

        // Check đủ thể loại
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        // Kiểm tra xem người dùng đã like bài viết này chưa
        Optional<LikePost> existingLike = likePostRepository.findByPostIdAndUserId(postId, user.getId());

        boolean currentLiked;
        if (existingLike.isPresent()) {
            // Unlike
            LikePost likePost = existingLike.get();
            likePost.setLiked(!likePost.isLiked());
            likePostRepository.save(likePost);
            currentLiked = likePost.isLiked();
        } else {
            // Like
            LikePost likePost = LikePost.builder()
                    .post(post)
                    .user(user)
                    .isLiked(true)
                    .build();
            likePostRepository.save(likePost);
            currentLiked = true;
        }

        // Đồng bộ likesCount với database thực tế
        int actualLikesCount = likePostRepository.countByPostIdAndLikedTrue(postId);
        post.setLikesCount(actualLikesCount);
        postRepository.save(post);

        return LikeResponse.builder()
                .liked(currentLiked)
                .likesCount(actualLikesCount)
                .build();
    }

    @Override
    @Transactional
    public LikeResponse toggleLikeComment(String username, Long commentId) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        CommentPost comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy comment với ID: " + commentId));

        Optional<LikeComment> existingLike = likeCommentRepository.findByCommentIdAndUserId(commentId, user.getId());

        boolean currentLiked;
        if (existingLike.isPresent()) {
            // Unlike
            LikeComment likeComment = existingLike.get();
            likeComment.setLiked(!likeComment.isLiked());
            likeCommentRepository.save(likeComment);
            currentLiked = likeComment.isLiked(); // ✅ Sửa tại đây
        } else {
            // Like
            LikeComment likeComment = LikeComment.builder()
                    .comment(comment)
                    .user(user)
                    .isLiked(true)
                    .build();
            likeCommentRepository.save(likeComment);
            currentLiked = true;
        }

        // Đồng bộ likesCount với database thực tế
        int actualLikesCount = likeCommentRepository.countByCommentId(commentId);
        comment.setLikesCount(actualLikesCount);
        commentRepository.save(comment);

        return LikeResponse.builder()
                .liked(currentLiked)
                .likesCount(actualLikesCount)
                .build();
    }

    @Override
    public boolean isPostLikedByUser(Long postId, Long userId) {
        return likePostRepository.findIsLikedByPostIdAndUserId(postId, userId).orElse(false);
    }

    @Override
    public boolean isCommentLikedByUser(Long commentId, Long userId) {
        return likeCommentRepository.findIsLikedByCommentIdAndUserId(commentId, userId).orElse(false);
    }

    @Override
    public int getPostLikesCount(Long postId) {
        return likePostRepository.countByPostIdAndLikedTrue(postId);
    }

    @Override
    public int getCommentLikesCount(Long commentId) {
        return likeCommentRepository.countByCommentId(commentId);
    }
}
