package com.dran.web_social.mappers;

import com.dran.web_social.dto.response.CommentResponse;
import com.dran.web_social.models.CommentPost;
import com.dran.web_social.services.LikeService;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class CommentMapper {

    @Autowired
    protected LikeService likeService;

    @Mapping(target = "userName", expression = "java(getUsername(comment))")
    @Mapping(target = "userFullName", expression = "java(getFullName(comment))")
    @Mapping(target = "userAvatar", expression = "java(getAvatar(comment))")
    @Mapping(target = "content", expression = "java(getContent(comment))")
    @Mapping(target = "parentId", source = "comment.parent.id")
    @Mapping(target = "isLiked", expression = "java(isLikedByCurrentUser(comment, currentUserId))")
    @Mapping(target = "isOwner", expression = "java(isOwner(comment, currentUserId))")
    @Mapping(target = "replies", ignore = true)
    public abstract CommentResponse commentToCommentResponse(CommentPost comment, Long currentUserId);

    protected String getUsername(CommentPost comment) {
        return comment.getDeleted() ? "[deleted]" : comment.getUser().getUsername();
    }

    protected String getFullName(CommentPost comment) {
        if (comment.getDeleted())
            return "[Người dùng đã xóa]";
        if (comment.getUser() == null)
            return "";
        String firstName = comment.getUser().getFirstName() != null ? comment.getUser().getFirstName() : "";
        String lastName = comment.getUser().getLastName() != null ? comment.getUser().getLastName() : "";
        return (firstName + " " + lastName).trim();
    }

    protected String getAvatar(CommentPost comment) {
        return comment.getDeleted() ? null : comment.getUser().getAvatar();
    }

    protected String getContent(CommentPost comment) {
        return comment.getDeleted() ? "[Comment đã bị xóa]" : comment.getContent();
    }

    protected boolean isLikedByCurrentUser(CommentPost comment, Long currentUserId) {
        if (currentUserId == null || comment.getDeleted())
            return false;
        return likeService.isCommentLikedByUser(comment.getId(), currentUserId);
    }

    protected boolean isOwner(CommentPost comment, Long currentUserId) {
        if (currentUserId == null || comment.getDeleted())
            return false;
        return comment.getUser().getId().equals(currentUserId);
    }
}
