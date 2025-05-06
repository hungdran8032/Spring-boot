package com.dran.web_social.services;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.dran.web_social.dto.request.PostRequest;
import com.dran.web_social.dto.response.PostResponse;

public interface PostService {
    PostResponse createPost(String username, PostRequest request);

    PostResponse createPostWithMedia(String username, PostRequest request, List<MultipartFile> files);

    PostResponse getPostById(Long id);

    Page<PostResponse> getAllPosts(Pageable pageable);

    Page<PostResponse> getPostsByUser(String username, Pageable pageable);

    PostResponse updatePost(String username, Long postId, PostRequest request);

    void deletePost(String username, Long postId);

    void addMediaToPost(String username, Long postId, List<MultipartFile> files);

    void removeMediaFromPost(String username, Long postId, Long mediaId);
}
