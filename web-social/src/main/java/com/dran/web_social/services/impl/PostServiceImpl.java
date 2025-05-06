package com.dran.web_social.services.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dran.web_social.custom.exception.ResourceNotFoundException;
import com.dran.web_social.dto.request.PostRequest;
import com.dran.web_social.dto.response.PostResponse;
import com.dran.web_social.mappers.PostMapper;
import com.dran.web_social.models.Media;
import com.dran.web_social.models.Post;
import com.dran.web_social.models.User;
import com.dran.web_social.repositories.MediaRepository;
import com.dran.web_social.repositories.PostRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.services.CloudService;
import com.dran.web_social.services.MediaService;
import com.dran.web_social.services.PostService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final MediaRepository mediaRepository;
    private final CloudService cloudService;
    private final PostMapper postMapper;
    private final MediaService mediaService;

    // K can xai
    @Override
    @Transactional
    public PostResponse createPost(String username, PostRequest request) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với tên: " + username));

        Post post = postMapper.postRequestToPost(request);
        post.setUser(user);

        Post savedPost = postRepository.save(post);
        log.info("Đã tạo bài viết mới với ID: {}", savedPost.getId());

        return postMapper.postToPostResponse(savedPost);
    }

    @Override
    @Transactional
    public PostResponse createPostWithMedia(String username, PostRequest request, List<MultipartFile> files) {
        // PostResponse postResponse = createPost(username, request);
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với tên: " + username));
        Post posts = postMapper.postRequestToPost(request);
        posts.setUser(user);
        posts.setMedia(new HashSet<>());
        Post savedPost = postRepository.save(posts);
        PostResponse postResponse = postMapper.postToPostResponse(savedPost);
        Post post = postRepository.findById(posts.getId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postResponse.getId()));
        if (files != null && !files.isEmpty()) {
            List<Media> mediaList = uploadMediaFiles(files, post);
            post.getMedia().addAll(mediaList);
            savedPost.getMedia().addAll(mediaList);
            Post updatedPost = postRepository.save(post);
            return postMapper.postToPostResponse(updatedPost);
        }

        return postResponse;
    }

    @Override
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + id));
        return postMapper.postToPostResponse(post);
    }

    @Override
    public Page<PostResponse> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable)
                .map(postMapper::postToPostResponse);
    }

    @Override
    public Page<PostResponse> getPostsByUser(String username, Pageable pageable) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với tên: " + username));

        return postRepository.findByUserId(user.getId(), pageable)
                .map(postMapper::postToPostResponse);
    }

    @Override
    @Transactional
    public PostResponse updatePost(String username, Long postId, PostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        if (!post.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật bài viết này");
        }

        post.setContent(request.getContent());
        Post updatedPost = postRepository.save(post);
        log.info("Đã cập nhật bài viết với ID: {}", updatedPost.getId());

        return postMapper.postToPostResponse(updatedPost);
    }

    @Override
    @Transactional
    public void deletePost(String username, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        if (!post.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền xóa bài viết này");
        }

        // Xóa tất cả media liên quan trên Cloudinary
        post.getMedia().forEach(media -> {
            if (media.getPublicId() != null) {
                cloudService.deleteFile(media.getPublicId());
            }
        });

        postRepository.delete(post);
        log.info("Đã xóa bài viết với ID: {}", postId);
    }

    @Override
    @Transactional
    public void addMediaToPost(String username, Long postId, List<MultipartFile> files) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        if (!post.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền thêm media vào bài viết này");
        }

        if (files != null && !files.isEmpty()) {
            List<Media> mediaList = uploadMediaFiles(files, post);
            post.getMedia().addAll(mediaList);
            postRepository.save(post);
            log.info("Đã thêm {} media vào bài viết với ID: {}", mediaList.size(), postId);
        }
    }

    @Override
    @Transactional
    public void removeMediaFromPost(String username, Long postId, Long mediaId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        if (!post.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Bạn không có quyền xóa media khỏi bài viết này");
        }

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy media với ID: " + mediaId));

        if (!media.getPost().getId().equals(postId)) {
            throw new AccessDeniedException("Media này không thuộc về bài viết đã chỉ định");
        }

        // Xóa file trên Cloudinary
        if (media.getPublicId() != null) {
            cloudService.deleteFile(media.getPublicId());
        }

        // Xóa media khỏi post và database
        post.getMedia().remove(media);
        mediaRepository.delete(media);
        log.info("Đã xóa media với ID: {} khỏi bài viết với ID: {}", mediaId, postId);
    }

    private List<Media> uploadMediaFiles(List<MultipartFile> files, Post post) {
        List<Media> mediaList = new ArrayList<>();

        for (MultipartFile file : files) {
            Media media = mediaService.uploadMedia(post.getId(), file);
            mediaList.add(media);
        }

        return mediaList;
    }
}
