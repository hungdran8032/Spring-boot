package com.dran.web_social.services.impl;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dran.web_social.custom.exception.ResourceNotFoundException;
import com.dran.web_social.dto.response.UserResponse;
import com.dran.web_social.mappers.UserMapper;
import com.dran.web_social.models.FriendShip;
import com.dran.web_social.repositories.FriendShipRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.services.FriendShipService;
import com.dran.web_social.utils.FriendshipStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendShipServiceImpl implements FriendShipService {
    private final FriendShipRepository friendShipRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public void sendFriendRequest(Long requesterId, Long addresseeId) {
        if (Objects.equals(requesterId, addresseeId)) {
            throw new ResourceNotFoundException("Bạn không thể tự kết bạn với bản thân");
        }
        userRepository.findById(addresseeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + addresseeId));

        // Kiểm tra đã là bạn/chặn hay chưa
        Optional<FriendShip> existingFriendShipOtp = friendShipRepository.findFriendshipBetweenUsers(requesterId,
                addresseeId);

        if (existingFriendShipOtp.isPresent()) {
            FriendShip existingFriendShip = existingFriendShipOtp.get();
            FriendshipStatus status = existingFriendShip.getStatus();
            switch (status) {
                case ACCEPTED:
                    throw new ResourceNotFoundException("Hai người đã là bạn rồi");
                case PENDING:
                    if (Objects.equals(existingFriendShip.getRequesterId(), requesterId)) {
                        throw new ResourceNotFoundException("Bạn đã gửi lời mời kết bạn cho người này rồi.");
                    } else {
                        throw new ResourceNotFoundException(
                                "Người này đã gửi lời mời kết bạn cho bạn. Hãy kiểm tra danh sách lời mời.");
                    }
                case BLOCKED:
                    throw new ResourceNotFoundException("Không tìm thấy người dùng này.");
            }
        }

        FriendShip newRequest = new FriendShip();
        newRequest.setRequesterId(requesterId);
        newRequest.setAddresseeId(addresseeId);
        newRequest.setStatus(FriendshipStatus.PENDING);

        friendShipRepository.save(newRequest);
    }

    @Override
    public void acceptFriendRequest(Long currentUserId, Long requesterId) {
        FriendShip friendShip = friendShipRepository.findByRequesterIdAndAddresseeIdAndStatus(requesterId,
                currentUserId,
                FriendshipStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lời mới kết bạn"));
        friendShip.setStatus(FriendshipStatus.ACCEPTED);
        friendShipRepository.save(friendShip);
    }

    @Override
    public void declineFriendRequest(Long currentUserId, Long requesterId) {
        FriendShip friendShip = friendShipRepository
                .findByRequesterIdAndAddresseeIdAndStatus(requesterId, currentUserId,
                        FriendshipStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lời mời kết bạn"));
        friendShipRepository.delete(friendShip);
    }

    @Override
    public void cancelFriendRequest(Long currentUserId, Long addresseeId) {
        FriendShip friendShip = friendShipRepository
                .findByRequesterIdAndAddresseeIdAndStatus(
                        currentUserId,
                        addresseeId,
                        FriendshipStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lời mời kết bạn"));
        friendShipRepository.delete(friendShip);
    }

    @Override
    public void unfriend(Long currentUserId, Long friendId) {
        FriendShip friendShip = friendShipRepository.findFriendshipBetweenUsers(currentUserId, friendId)
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .orElseThrow(() -> new ResourceNotFoundException("Hai người không phải là bạn"));
        friendShipRepository.delete(friendShip);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getListFriend(Long userId) {
        List<FriendShip> friendShips = friendShipRepository.findAcceptedFriendships(userId);
        return friendShips.stream().map(friendShip -> {
            if (Objects.equals(friendShip.getRequesterId(), userId)) {
                return friendShip.getAddressee();
            } else {
                return friendShip.getRequester();
            }
        }).map(userMapper::userToUserResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getRecievedFriendRequest(Long userId) {
        List<FriendShip> friendShips = friendShipRepository.findByAddresseeIdAndStatus(userId,
                FriendshipStatus.PENDING);
        return friendShips.stream()
                .map(FriendShip::getRequester)
                .map(userMapper::userToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void blockUser(Long currentUserId, Long targetUser) {
        if (Objects.equals(currentUserId, targetUser)) {
            throw new ResourceNotFoundException("Bạn không thể tự chặn chính mình.");
        }
        userRepository.findById(targetUser)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + targetUser));
        Optional<FriendShip> friendshipOpt = friendShipRepository.findFriendshipBetweenUsers(currentUserId, targetUser);

        FriendShip friendshipToBlock;

        if (friendshipOpt.isPresent()) {
            friendshipToBlock = friendshipOpt.get();
        } else {
            friendshipToBlock = new FriendShip();
        }

        friendshipToBlock.setRequesterId(currentUserId);
        friendshipToBlock.setAddresseeId(targetUser);
        friendshipToBlock.setStatus(FriendshipStatus.BLOCKED);
        friendShipRepository.save(friendshipToBlock);
    }

    @Override
    public void checkIfUsersAreBlocked(Long userId1, Long userId2) {
        if (userId1 == null || userId2 == null || Objects.equals(userId1, userId2)) {
            return;
        }

        friendShipRepository.findBlockedStatusBetweenUsers(userId1, userId2)
                .ifPresent(status -> {
                    if (status == FriendshipStatus.BLOCKED) {
                        throw new AccessDeniedException("Bạn không có quyền thực hiện hành động này.");
                    }
                });
    }

}
