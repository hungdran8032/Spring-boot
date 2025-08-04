
package com.dran.web_social.repositories;

import com.dran.web_social.models.LikePost;
import com.dran.web_social.models.Post;
import com.dran.web_social.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikePostRepository extends JpaRepository<LikePost, Long> {

    Optional<LikePost> findByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);

    @Query("SELECT COUNT(lp) FROM LikePost lp WHERE lp.post.id = :postId AND lp.isLiked = true")
    int countByPostIdAndLikedTrue(@Param("postId") Long postId);

    @Query("SELECT lp.isLiked FROM LikePost lp WHERE lp.post.id = :postId AND lp.user.id = :userId")
    Optional<Boolean> findIsLikedByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    @Modifying
    @Query("DELETE FROM LikePost lp WHERE lp.id = :id")
    void deleteLikeById(@Param("id") Long id);

    Optional<LikePost> findByUserAndPost(User user, Post post);

    int countByPost(Post post);
}
