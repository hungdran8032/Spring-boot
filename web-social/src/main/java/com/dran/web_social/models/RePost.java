// package com.dran.web_social.models;

// import java.util.HashSet;
// import java.util.Set;

// import jakarta.persistence.CascadeType;
// import jakarta.persistence.OneToMany;

// public class RePost extends BaseEntity {
// private String content;
// private int likesCount = 0;
// private int commentsCount = 0;
// // Ai là người đã share
// private User reposter;
// // Post nào
// private Post originalPost;
// @OneToMany(mappedBy = "repost", cascade = CascadeType.ALL, orphanRemoval =
// true)
// private Set<LikePost> likes = new HashSet<>();

// @OneToMany(mappedBy = "repost", cascade = CascadeType.ALL, orphanRemoval =
// true)
// private Set<CommentPost> comments = new HashSet<>();

// }
