package com.dran.web_social.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dran.web_social.models.FriendShip;
import com.dran.web_social.utils.FriendshipStatus;

@Repository
public interface FriendShipRepository extends JpaRepository<FriendShip, FriendShip.FriendShipId> {
        @Query("SELECT f FROM FriendShip f WHERE " +
                        "(f.requesterId = :user1Id AND f.addresseeId = :user2Id) OR " +
                        "(f.requesterId = :user2Id AND f.addresseeId = :user1Id)")
        Optional<FriendShip> findFriendshipBetweenUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

        Optional<FriendShip> findByRequesterIdAndAddresseeId(Long requesterId, Long addresseeId);

        Optional<FriendShip> findByRequesterIdAndAddresseeIdAndStatus(Long requesterId, Long addresseeId,
                        FriendshipStatus status);

        List<FriendShip> findByAddresseeIdAndStatus(Long addresseeId, FriendshipStatus status);

        @Query("SELECT f FROM FriendShip f WHERE f.status = 'ACCEPTED' AND (f.requesterId = :userId OR f.addresseeId = :userId)")
        List<FriendShip> findAcceptedFriendships(@Param("userId") Long userId);

        @Query("SELECT f.status FROM FriendShip f WHERE " +
                        "(f.requesterId = :user1Id AND f.addresseeId = :user2Id) OR " +
                        "(f.requesterId = :user2Id AND f.addresseeId = :user1Id)")
        Optional<FriendshipStatus> findBlockedStatusBetweenUsers(@Param("user1Id") Long user1Id,
                        @Param("user2Id") Long user2Id);

}
