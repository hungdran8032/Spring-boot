package com.dran.web_social.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dran.web_social.dto.response.LikeResponse;
import com.dran.web_social.models.User;
import com.dran.web_social.services.LikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/post/{postId}")
    public ResponseEntity<LikeResponse> toggleLikePost(
            @AuthenticationPrincipal User user,
            @PathVariable Long postId) {
        return ResponseEntity.ok(likeService.toggleLikePost(user.getUsername(), postId));
    }

    @PostMapping("/comment/{commentId}")
    public ResponseEntity<LikeResponse> toggleLikeComment(
            @AuthenticationPrincipal User user,
            @PathVariable Long commentId) {
        return ResponseEntity.ok(likeService.toggleLikeComment(user.getUsername(), commentId));
    }

    @GetMapping("/post/{postId}/status")
    public ResponseEntity<Boolean> checkPostLiked(
            @PathVariable Long postId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(likeService.isPostLikedByUser(postId, user.getId()));
    }
}