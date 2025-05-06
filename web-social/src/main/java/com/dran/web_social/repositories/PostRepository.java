package com.dran.web_social.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.dran.web_social.models.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByUserId(Long userId, Pageable pageable);
}
