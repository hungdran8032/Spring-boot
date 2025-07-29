package com.dran.web_social.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.dran.web_social.models.Post;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId ORDER BY p.createAt DESC")
    Page<Post> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("DELETE FROM Media m WHERE m.post.id = :postId")
    @Modifying
    @Transactional
    void deleteMediaByPostId(@Param("postId") Long postId);

    @Query("DELETE FROM Post p WHERE p.id = :postId")
    @Modifying
    @Transactional
    void deletePostById(@Param("postId") Long postId);
}
