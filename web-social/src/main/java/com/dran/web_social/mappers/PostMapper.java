package com.dran.web_social.mappers;

import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.dran.web_social.dto.request.PostRequest;
import com.dran.web_social.dto.response.MediaResponse;
import com.dran.web_social.dto.response.PostResponse;
import com.dran.web_social.models.LikePost;
import com.dran.web_social.models.Media;
import com.dran.web_social.models.Post;
import com.dran.web_social.services.LikeService;
import com.dran.web_social.services.UserService;

@Mapper(componentModel = "spring")
public interface PostMapper {

    @Mapping(target = "media", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "likes", ignore = true)
    @Mapping(target = "comments", ignore = true)
    Post postRequestToPost(PostRequest request);

    @Mapping(target = "userName", source = "post.user.username")
    @Mapping(target = "userFullName", expression = "java(getFullName(post))")
    @Mapping(target = "userAvatar", source = "post.user.avatar")
    @Mapping(target = "media", source = "post", qualifiedByName = "getMediaList")
    @Mapping(target = "isLiked", expression = "java(isLikedByUser(post, username, likeService, userService))")
    @Mapping(target = "likesCount", expression = "java(getLikesCount(post))")
    @Mapping(target = "commentsCount", expression = "java(getCommentsCount(post))")
    @Mapping(target = "sharesCount", expression = "java(0)")
    PostResponse postToPostResponseWithLikeStatus(Post post, String username, LikeService likeService,
            UserService userService);

    @Mapping(target = "userName", source = "user.username")
    @Mapping(target = "userFullName", expression = "java(getFullName(post))")
    @Mapping(target = "userAvatar", source = "user.avatar")
    @Mapping(target = "media", source = "post", qualifiedByName = "getMediaList")
    @Mapping(target = "isLiked", expression = "java(false)")
    @Mapping(target = "likesCount", expression = "java(getLikesCount(post))")
    @Mapping(target = "commentsCount", expression = "java(getCommentsCount(post))")
    @Mapping(target = "sharesCount", expression = "java(0)")
    PostResponse postToPostResponse(Post post);

    @Named("getFullName")
    default String getFullName(Post post) {
        String firstName = post.getUser().getFirstName();
        String lastName = post.getUser().getLastName();

        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        } else if (firstName != null) {
            return firstName;
        } else if (lastName != null) {
            return lastName;
        } else {
            return post.getUser().getUsername();
        }
    }

    @Named("getMediaList")
    default List<MediaResponse> getMediaList(Post post) {
        if (post.getMedia() == null) {
            return List.of();
        }
        return post.getMedia().stream()
                .map(this::mediaToMediaResponse)
                .collect(Collectors.toList());
    }

    default boolean isLikedByUser(Post post, String username, LikeService likeService, UserService userService) {
        if (username == null || likeService == null || userService == null) {
            return false;
        }
        try {
            // Get user by username to get userId
            var userResponse = userService.getUserByUserName(username);
            Long userId = userResponse.getId();
            return likeService.isPostLikedByUser(post.getId(), userId);
        } catch (Exception e) {
            return false;
        }
    }

    default int getLikesCount(Post post) {
        if (post.getLikes() == null) {
            return 0;
        }
        return (int) post.getLikes().stream()
                .filter(LikePost::isLiked) // ✅ chỉ lấy like thật
                .count();
    }

    default int getCommentsCount(Post post) {
        if (post.getComments() == null) {
            return 0;
        }
        return post.getComments().size();
    }

    @Mapping(target = "id", source = "id")
    @Mapping(target = "url", source = "url")
    @Mapping(target = "type", source = "type")
    MediaResponse mediaToMediaResponse(Media media);

}
