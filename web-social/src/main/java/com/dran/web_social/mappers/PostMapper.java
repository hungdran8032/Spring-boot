package com.dran.web_social.mappers;

import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.dran.web_social.dto.request.PostRequest;
import com.dran.web_social.dto.response.MediaResponse;
import com.dran.web_social.dto.response.PostResponse;
import com.dran.web_social.models.Media;
import com.dran.web_social.models.Post;

@Mapper(componentModel = "spring")
public interface PostMapper {

    @Mapping(target = "media", ignore = true)
    @Mapping(target = "user", ignore = true)
    Post postRequestToPost(PostRequest request);

    @Mapping(target = "userName", source = "user.username")
    @Mapping(target = "userFullName", expression = "java(getFullName(post))")
    @Mapping(target = "userAvatar", source = "user.avatar")
    @Mapping(target = "media", source = "post", qualifiedByName = "getMediaList")
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

    @Mapping(target = "id", source = "id")
    @Mapping(target = "url", source = "url")
    @Mapping(target = "type", source = "type")
    MediaResponse mediaToMediaResponse(Media media);
}
