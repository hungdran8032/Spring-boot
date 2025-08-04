package com.dran.web_social.repositories;

import com.dran.web_social.models.LikeComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeCommentRepository extends JpaRepository<LikeComment, Long> {

    @Query("SELECT lc FROM LikeComment lc WHERE lc.comment.id = :commentId AND lc.user.id = :userId")
    Optional<LikeComment> findByCommentIdAndUserId(@Param("commentId") Long commentId, @Param("userId") Long userId);

    // @Query("SELECT COUNT(lc) FROM LikeComment lc WHERE lc.comment.id = :commentId
    // AND lc.isLiked = true")
    @Query("SELECT COUNT(lc) FROM LikeComment lc WHERE lc.comment.id = :commentId AND lc.isLiked = true")
    int countByCommentId(@Param("commentId") Long commentId);

    @Query("SELECT lc.isLiked FROM LikeComment lc WHERE lc.comment.id = :commentId AND lc.user.id = :userId")
    Optional<Boolean> findIsLikedByCommentIdAndUserId(@Param("commentId") Long commentId, @Param("userId") Long userId);

    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
}