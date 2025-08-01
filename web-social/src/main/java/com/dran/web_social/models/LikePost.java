package com.dran.web_social.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "likes_post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikePost extends BaseEntity {
    @Column(name = "is_liked", nullable = false)
    private boolean isLiked = false;
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
