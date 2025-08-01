package com.dran.web_social.repositories;

import com.dran.web_social.models.CommentPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentPost, Long> {

    @Query("SELECT c FROM CommentPost c WHERE c.post.id = :postId AND c.parent IS NULL AND c.deleted = false ORDER BY c.createAt DESC")
    Page<CommentPost> findTopLevelCommentsByPostId(@Param("postId") Long postId, Pageable pageable);

    @Query("SELECT c FROM CommentPost c WHERE c.parent.id = :parentId AND c.parent.deleted = false ORDER BY c.createAt ASC")
    List<CommentPost> findRepliesByParentId(@Param("parentId") Long parentId);

    // Count only non-deleted comments
    @Query("SELECT COUNT(c) FROM CommentPost c WHERE c.post.id = :postId AND c.deleted = false")
    int countActiveByPostId(@Param("postId") Long postId);

    @Query("SELECT COUNT(c) FROM CommentPost c WHERE c.parent.id = :parentId AND c.deleted = false")
    int countActiveRepliesByParentId(@Param("parentId") Long parentId);

    // Thêm method để lấy tất cả replies (bao gồm cả deleted) để đếm
    @Query("SELECT c FROM CommentPost c WHERE c.parent.id = :parentId")
    List<CommentPost> findAllRepliesByParentId(@Param("parentId") Long parentId);
}
