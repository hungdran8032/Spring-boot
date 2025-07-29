package com.dran.web_social.services.impl;

import com.dran.web_social.dto.request.UpdateUserRequest;
import com.dran.web_social.dto.response.UserResponse;
import com.dran.web_social.mappers.UserMapper;
import com.dran.web_social.models.Profile;
import com.dran.web_social.models.User;
import com.dran.web_social.repositories.ProfileRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.services.CloudService;
import com.dran.web_social.services.UserService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ProfileRepository profileRepository;
    private final CloudService cloudService; // Thêm dependency

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có id: " + id));
        return userMapper.userToUserResponse(user);
    }

    @Override
    public UserResponse getUserByUserName(String userName) {
        User user = userRepository.findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có tài khoản: " + userName));
        return userMapper.userToUserResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có email: " + email));
        return userMapper.userToUserResponse(user);
    }

    @Override
    public void checkUserNameExists(String userName) {
        if (userRepository.existsByUserName(userName)) {
            throw new RuntimeException("Người dùng này đã có rồi!");
        }
    }

    @Override
    public void checkEmailExists(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email này đã được đăng ký có rồi!");
        }
    }

    @Override
    @Transactional
    public UserResponse updateUser(UpdateUserRequest req) {
        // Get current user
        User user = userRepository.findByUserName(req.getUserName())
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy người dùng có tài khoản: " + req.getUserName()));

        // Update user basic information
        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new RuntimeException("Email này đã được sử dụng bởi người dùng khác");
            }
            user.setEmail(req.getEmail());
        }

        if (req.getFirstName() != null) {
            user.setFirstName(req.getFirstName());
        }

        if (req.getLastName() != null) {
            user.setLastName(req.getLastName());
        }

        if (req.getPhone() != null) {
            user.setPhone(req.getPhone());
        }

        if (req.getAddress() != null) {
            user.setAddress(req.getAddress());
        }

        if (req.getAvatar() != null) {
            // Upload avatar image to cloud
            try {
                Map<String, String> uploadResult = cloudService.uploadFile(req.getAvatar());
                user.setAvatar(uploadResult.get("url"));
            } catch (Exception e) {
                log.error("Failed to upload avatar image", e);
                throw new RuntimeException("Lỗi khi upload ảnh avatar");
            }
        }

        if (req.getGender() != null) {
            user.setGender(req.getGender());
        }

        if (req.getBirthDay() != null) {
            try {
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                Date birthDay = dateFormat.parse(req.getBirthDay());
                user.setBirthDay(birthDay);
            } catch (ParseException e) {
                throw new RuntimeException("Định dạng ngày sinh không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd");
            }
        }

        // Update or create profile information
        Profile profile = user.getProfile();
        if (profile == null) {
            profile = Profile.builder()
                    .user(user)
                    .followersCount(0)
                    .followingCount(0)
                    .postsCount(0)
                    .build();
        }

        if (req.getBio() != null) {
            profile.setBio(req.getBio());
        }

        if (req.getBanner() != null) {
            // Upload banner image to cloud
            try {
                Map<String, String> uploadResult = cloudService.uploadFile(req.getBanner());
                profile.setBanner(uploadResult.get("url"));
            } catch (Exception e) {
                log.error("Failed to upload banner image", e);
                throw new RuntimeException("Lỗi khi upload ảnh banner");
            }
        }

        if (req.getWebsite() != null) {
            profile.setWebsite(req.getWebsite());
        }

        if (req.getLocation() != null) {
            profile.setLocation(req.getLocation());
        }

        // Save profile first
        profileRepository.save(profile);
        user.setProfile(profile);

        // Save updated user
        User updatedUser = userRepository.save(user);
        log.info("User profile updated successfully: {}", updatedUser.getUsername());

        return userMapper.userToUserResponse(updatedUser);
    }

}
