package com.dran.web_social.controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dran.web_social.custom.exception.ResourceNotFoundException;
import com.dran.web_social.dto.request.PostRequest;
import com.dran.web_social.dto.response.PostResponse;
import com.dran.web_social.models.User;
import com.dran.web_social.services.PostService;
import com.dran.web_social.utils.JsonUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // Tạo bài viết
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> createPostWithMedia(
            @AuthenticationPrincipal User user,
            @RequestPart(value = "post", required = false) String post,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        PostRequest request = JsonUtil.parseJson(post, PostRequest.class);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.createPostWithMedia(user.getUsername(), request, files));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @GetMapping("/{id}/with-like-status")
    public ResponseEntity<PostResponse> getPostByIdWithLikeStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(postService.getPostByIdWithLikeStatus(id, user.getUsername()));
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal User user) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        if (user != null) {
            return ResponseEntity.ok(postService.getAllPostsWithLikeStatus(pageable, user.getUsername()));
        } else {
            return ResponseEntity.ok(postService.getAllPosts(pageable));
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<Page<PostResponse>> getPostsByUser(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal User currentUser) {

        try {
            Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            if (currentUser != null) {
                Page<PostResponse> posts = postService.getPostsByUserWithLikeStatus(username, pageable,
                        currentUser.getUsername());
                return ResponseEntity.ok(posts);
            } else {
                Page<PostResponse> posts = postService.getPostsByUser(username, pageable);
                return ResponseEntity.ok(posts);
            }
        } catch (ResourceNotFoundException e) {
            // Return empty page instead of error
            return ResponseEntity.ok(Page.empty());
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> updatePost(
            @AuthenticationPrincipal User user,
            @PathVariable("id") Long id,
            @RequestPart(value = "post", required = false) String post,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {

        PostRequest request = JsonUtil.parseJson(post, PostRequest.class);
        return ResponseEntity.ok(postService.updatePost(user.getUsername(), id, request, files));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal User user,
            @PathVariable("id") Long id) {
        postService.deletePost(user, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/with-like-status")
    public ResponseEntity<Page<PostResponse>> getAllPostsWithLikeStatus(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal User user) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(postService.getAllPostsWithLikeStatus(pageable, user.getUsername()));
    }

}
