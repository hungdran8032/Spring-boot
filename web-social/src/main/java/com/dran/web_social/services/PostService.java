package com.dran.web_social.services;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.dran.web_social.dto.request.PostRequest;
import com.dran.web_social.dto.response.PostResponse;
import com.dran.web_social.models.User;

public interface PostService {

    PostResponse createPostWithMedia(String username, PostRequest request, List<MultipartFile> files);

    PostResponse getPostById(Long id);

    PostResponse getPostByIdWithLikeStatus(Long id, String username);

    Page<PostResponse> getAllPosts(Pageable pageable);

    Page<PostResponse> getAllPostsWithLikeStatus(Pageable pageable, String username);

    Page<PostResponse> getPostsByUser(String username, Pageable pageable);

    Page<PostResponse> getPostsByUserWithLikeStatus(String username, Pageable pageable, String currentUsername);

    PostResponse updatePost(String username, Long postId, PostRequest request, List<MultipartFile> files);

    void deletePost(User user, Long postId);
}
