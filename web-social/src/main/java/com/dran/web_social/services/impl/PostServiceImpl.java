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
import com.dran.web_social.services.LikeService;
import com.dran.web_social.services.MediaService;
import com.dran.web_social.services.PostService;
import com.dran.web_social.services.UserService;

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
    private final LikeService likeService;
    private final UserService userService;

    @Override
    @Transactional
    public PostResponse createPostWithMedia(String username, PostRequest request, List<MultipartFile> files) {

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
    public PostResponse getPostByIdWithLikeStatus(Long id, String username) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + id));
        return postMapper.postToPostResponseWithLikeStatus(post, username, likeService, userService);
    }

    @Override
    public Page<PostResponse> getAllPosts(Pageable pageable) {
        Page<Post> posts = postRepository.findAll(pageable);
        return posts.map(postMapper::postToPostResponse);
    }

    @Override
    public Page<PostResponse> getAllPostsWithLikeStatus(Pageable pageable, String username) {
        Page<Post> posts = postRepository.findAll(pageable);
        return posts.map(post -> postMapper.postToPostResponseWithLikeStatus(post, username, likeService, userService));
    }

    @Override
    public Page<PostResponse> getPostsByUser(String username, Pageable pageable) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với tên: " + username));

        Page<Post> posts = postRepository.findByUserId(user.getId(), pageable);
        return posts.map(postMapper::postToPostResponse);
    }

    @Override
    public Page<PostResponse> getPostsByUserWithLikeStatus(String username, Pageable pageable, String currentUsername) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với tên: " + username));

        Page<Post> posts = postRepository.findByUserId(user.getId(), pageable);
        return posts.map(
                post -> postMapper.postToPostResponseWithLikeStatus(post, currentUsername, likeService, userService));
    }

    @Override
    @Transactional
    public PostResponse updatePost(String username, Long postId, PostRequest request, List<MultipartFile> files) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với tên: " + username));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));
        if (!post.getUser().getUsername().equals(user.getUsername())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật bài viết này");
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        // Xóa tất cả media cũ nếu có media mới được upload
        if (files != null && !files.isEmpty()) {
            // Xóa media cũ trên Cloudinary
            post.getMedia().forEach(media -> {
                if (media.getPublicId() != null) {
                    cloudService.deleteFile(media.getPublicId());
                }
            });

            // Xóa media cũ khỏi database
            mediaRepository.deleteAll(post.getMedia());
            post.getMedia().clear();

            // Thêm media mới
            List<Media> mediaList = uploadMediaFiles(files, post);
            post.getMedia().addAll(mediaList);
        }

        Post updatedPost = postRepository.save(post);
        log.info("Đã cập nhật bài viết với ID: {}", updatedPost.getId());

        return postMapper.postToPostResponse(updatedPost);
    }

    @Transactional
    @Override
    public void deletePost(User user, Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + postId));

        if (!post.getUser().getUsername().equals(user.getUsername())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật bài viết này");
        }

        // Xóa tất cả media liên quan trên Cloudinary trước
        if (post.getMedia() != null && !post.getMedia().isEmpty()) {
            for (Media media : post.getMedia()) {
                if (media.getPublicId() != null) {
                    try {
                        cloudService.deleteFile(media.getPublicId());
                    } catch (Exception e) {
                        log.error("Failed to delete media with publicId: {} for postId: {}",
                                media.getPublicId(),
                                postId, e);
                        throw new RuntimeException("Failed to delete media for postId: " + postId,
                                e);
                    }
                }
            }
        }
        postRepository.deleteMediaByPostId(postId);
        postRepository.deletePostById(postId);

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
