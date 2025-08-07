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
import com.dran.web_social.services.WebSocketService;
import com.dran.web_social.utils.CommentUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;
    private final WebSocketService webSocketService;

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
                .level(0)
                .deleted(false)
                .build();
        if (request.getParentId() != null) {
            CommentPost parentComment = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy comment cha với ID: " + request.getParentId()));

            comment.setParent(parentComment);

            // ✅ Gắn đúng level, giới hạn tối đa là 2
            int newLevel = parentComment.getLevel() + 1;
            comment.setLevel(Math.min(newLevel, 2)); // Đảm bảo không vượt quá cấp 2

            parentComment.setRepliesCount(parentComment.getRepliesCount() + 1);
            commentRepository.save(parentComment);
        }

        CommentPost savedComment = commentRepository.save(comment);
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        CommentResponse response = commentMapper.commentToCommentResponse(savedComment, user.getId());
        webSocketService.notifyCommentCreated(postId, response, username);

        return response;
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

        CommentResponse response = commentMapper.commentToCommentResponse(updatedComment, user.getId());

        // Gửi thông báo realtime
        webSocketService.notifyCommentUpdated(comment.getPost().getId(), response, username);

        return response;
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

        Long postId = comment.getPost().getId();

        comment.setDeleted(true);
        commentRepository.save(comment);

        // Update parent replies count if this is a reply
        if (comment.getParent() != null) {
            CommentPost parent = comment.getParent();
            parent.setRepliesCount(Math.max(0, parent.getRepliesCount() - 1));
            commentRepository.save(parent);
        }

        // Update post comments count
        Post post = comment.getPost();
        int deletedCount = countDeletedCommentsRecursively(commentId);
        post.setCommentsCount(Math.max(0, post.getCommentsCount() - deletedCount));
        postRepository.save(post);

        // Gửi thông báo realtime
        webSocketService.notifyCommentDeleted(postId, commentId, username);
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

        Page<CommentPost> topLevelComments = commentRepository.findTopLevelCommentsByPostId(postId, pageable);
        List<CommentPost> allComments = commentRepository.findByPostId(postId); // Bao gồm cả replies

        List<CommentResponse> result = CommentUtil.processCommentsForAPI(
                topLevelComments.getContent(),
                allComments,
                currentUser != null ? currentUser.getId() : null,
                commentMapper);

        return new PageImpl<>(result, pageable, topLevelComments.getTotalElements());
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
        List<CommentPost> allReplies = commentRepository.findByPostId(postId); // Lấy tất cả comment của post
        List<CommentResponse> processed = CommentUtil.processCommentsForAPI(
                comments.getContent(), allReplies, null, commentMapper);
        return new PageImpl<>(processed, pageable, comments.getTotalElements());
    }
}
