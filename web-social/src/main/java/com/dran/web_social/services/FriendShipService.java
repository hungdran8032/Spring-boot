package com.dran.web_social.services;

import java.util.List;

import com.dran.web_social.dto.response.UserResponse;

public interface FriendShipService {
    void sendFriendRequest(Long requesterId, Long addresseeId);

    void acceptFriendRequest(Long currentUserId, Long requesterId);

    void declineFriendRequest(Long currentUserId, Long requesterId);

    void cancelFriendRequest(Long currentUserId, Long addresseeId);

    void unfriend(Long currentUserId, Long friendId);

    void blockUser(Long currentUserId, Long targetUser);

    List<UserResponse> getListFriend(Long userId);

    List<UserResponse> getRecievedFriendRequest(Long userId);

    void checkIfUsersAreBlocked(Long userId1, Long userId2);
}
