package com.dran.web_social.services.impl;

import com.dran.web_social.custom.exception.ResourceNotFoundException;
import com.dran.web_social.dto.request.CommentRequest;
import com.dran.web_social.dto.response.CommentResponse;
import com.dran.web_social.mappers.CommentMapper;
import com.dran.web_social.models.CommentPost;
import com.dran.web_social.models.Post;
import com.dran.web_social.models.User;
import com.dran.web_social.repositories.CommentRepository;
import com.dran.web_social.repositories.PostRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.services.CommentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    // Tạo bình luận cho bài viết
    @Override
    @Transactional
    public CommentResponse createComment(String username, Long postId, CommentRequest request) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        CommentPost comment = CommentPost.builder()
                .content(request.getContent())
                .post(post)
                .user(user)
                .likesCount(0)
                .repliesCount(0)
                .deleted(false)
                .build();

        // Handle reply
        if (request.getParentId() != null) {
            CommentPost parentComment = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy comment cha với ID: " + request.getParentId()));
            comment.setParent(parentComment);

            // Update replies count
            parentComment.setRepliesCount(parentComment.getRepliesCount() + 1);
            commentRepository.save(parentComment);
        }

        CommentPost savedComment = commentRepository.save(comment);

        // Update post comments count
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        return commentMapper.commentToCommentResponse(savedComment, user.getId());
    }

    // Chỉnh sửa bình luận
    @Override
    @Transactional
    public CommentResponse updateComment(String username, Long commentId, CommentRequest request) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        CommentPost comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy comment với ID: " + commentId));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền sửa comment này");
        }

        comment.setContent(request.getContent());
        CommentPost updatedComment = commentRepository.save(comment);

        return commentMapper.commentToCommentResponse(updatedComment, user.getId());
    }

    // Xoá bình luận
    @Override
    @Transactional
    public void deleteComment(String username, Long commentId) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        CommentPost comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy comment với ID: " + commentId));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền xóa comment này");
        }

        comment.setDeleted(true);
        commentRepository.save(comment);

        // Update parent replies count if this is a reply
        if (comment.getParent() != null) {
            CommentPost parent = comment.getParent();
            parent.setRepliesCount(Math.max(0, parent.getRepliesCount() - 1));
            commentRepository.save(parent);
        }

        // Update post comments count (count all deleted comments including hidden
        // replies)
        Post post = comment.getPost();
        int deletedCount = countDeletedCommentsRecursively(commentId);
        post.setCommentsCount(Math.max(0, post.getCommentsCount() - deletedCount));
        postRepository.save(post);
    }

    private int countDeletedCommentsRecursively(Long commentId) {
        List<CommentPost> allReplies = commentRepository.findAllRepliesByParentId(commentId);
        int count = 1; // Current comment

        for (CommentPost reply : allReplies) {
            count += countDeletedCommentsRecursively(reply.getId());
        }

        return count;
    }

    @Override
    public Page<CommentResponse> getCommentsByPostId(Long postId, Pageable pageable, String currentUsername) {
        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUserName(currentUsername).orElse(null);
        }

        // Chỉ lấy top-level comments chưa bị xóa
        Page<CommentPost> comments = commentRepository.findTopLevelCommentsByPostId(postId, pageable);
        final Long currentUserId = currentUser != null ? currentUser.getId() : null;

        return comments.map(comment -> {
            CommentResponse response = commentMapper.commentToCommentResponse(comment, currentUserId);

            // Chỉ load replies nếu comment gốc chưa bị xóa
            if (!comment.getDeleted()) {
                List<CommentPost> replies = commentRepository.findRepliesByParentId(comment.getId());
                List<CommentResponse> replyResponses = replies.stream()
                        .map(reply -> commentMapper.commentToCommentResponse(reply, currentUserId))
                        .collect(Collectors.toList());
                response.setReplies(replyResponses);
            } else {
                response.setReplies(List.of()); // Empty replies for deleted comments
            }

            return response;
        });
    }

    @Override
    public CommentResponse getCommentById(Long commentId, String currentUsername) {
        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUserName(currentUsername).orElse(null);
        }

        CommentPost comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy comment với ID: " + commentId));

        return commentMapper.commentToCommentResponse(comment, currentUser != null ? currentUser.getId() : null);
    }

    @Override
    public Page<CommentResponse> getListCommentByPostId(Long postId, Pageable pageable) {
        Page<CommentPost> comments = commentRepository.findTopLevelCommentsByPostId(postId, pageable);
        return comments.map(comment -> {
            CommentResponse response = commentMapper.commentToCommentResponse(comment, null);

            if (!comment.getDeleted()) {
                List<CommentPost> replies = commentRepository.findRepliesByParentId(comment.getId());
                List<CommentResponse> replyResponses = replies.stream()
                        .map(reply -> commentMapper.commentToCommentResponse(reply, null))
                        .collect(Collectors.toList());
                response.setReplies(replyResponses);
            } else {
                response.setReplies(List.of());
            }

            return response;
        });
    }
}
