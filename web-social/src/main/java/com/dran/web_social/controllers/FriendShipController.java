package com.dran.web_social.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dran.web_social.dto.response.UserResponse;
import com.dran.web_social.models.User;
import com.dran.web_social.services.FriendShipService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/friend")
public class FriendShipController {

    private final FriendShipService friendShipService;

    @PostMapping("/{addresseeId}")
    public ResponseEntity<?> sendFriendRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long addresseeId) {

        friendShipService.sendFriendRequest(user.getId(), addresseeId);
        return ResponseEntity.ok(Map.of("message", "Gửi yêu cầu kết bạn thành công."));
    }

    @PostMapping("/accept/{requesterId}")
    public ResponseEntity<?> acceptFriendRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long requesterId) {

        friendShipService.acceptFriendRequest(user.getId(), requesterId);
        return ResponseEntity.ok(Map.of("message", "Chấp nhận yêu cầu kết bạn thành công."));
    }

    @DeleteMapping("/decline/{requesterId}")
    public ResponseEntity<?> declineFriendRequest(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long requesterId) {
        friendShipService.declineFriendRequest(currentUser.getId(), requesterId);
        return ResponseEntity.ok(Map.of("message", "Đã từ chối yêu cầu kết bạn."));
    }

    @DeleteMapping("/cancel/{addresseeId}")
    public ResponseEntity<?> cancelFriendRequest(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long addresseeId) {
        friendShipService.cancelFriendRequest(currentUser.getId(), addresseeId);
        return ResponseEntity.ok(Map.of("message", "Đã hủy yêu cầu kết bạn đã gửi."));
    }

    @DeleteMapping("/unfriend/{friendId}")
    public ResponseEntity<?> unfriend(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long friendId) {
        friendShipService.unfriend(currentUser.getId(), friendId);
        return ResponseEntity.ok(Map.of("message", "Hủy kết bạn thành công."));
    }

    @GetMapping("/friends")
    public ResponseEntity<List<UserResponse>> getFriendsList(
            @AuthenticationPrincipal User currentUser) {
        List<UserResponse> friends = friendShipService.getListFriend(currentUser.getId());
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/requests/received")
    public ResponseEntity<List<UserResponse>> getReceivedFriendRequests(
            @AuthenticationPrincipal User currentUser) {
        List<UserResponse> requests = friendShipService.getRecievedFriendRequest(currentUser.getId());
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/block/{targetUserId}")
    public ResponseEntity<?> blockUser(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long targetUserId) {
        friendShipService.blockUser(currentUser.getId(), targetUserId);
        return ResponseEntity.ok(Map.of("message", "Đã chặn người dùng."));
    }
}
