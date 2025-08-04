package com.dran.web_social.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "likes_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// implements Comparable<Comment>
public class LikeComment extends BaseEntity {
    @Column(name = "is_liked", nullable = false)
    private boolean isLiked;
    @ManyToOne
    @JoinColumn(name = "comment_id")
    private CommentPost comment;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
