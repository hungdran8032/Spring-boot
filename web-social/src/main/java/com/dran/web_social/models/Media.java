package com.dran.web_social.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Media extends BaseEntity {
    private String url;
    private String type;
    private String publicId;
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;
}
