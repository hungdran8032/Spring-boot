package com.dran.web_social.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile extends BaseEntity {
    private String bio;
    private String banner;
    private String website;
    private String location;
    private Integer followersCount;
    private Integer followingCount;
    private Integer postsCount;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
