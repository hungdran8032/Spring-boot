package com.dran.web_social.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

import org.springframework.security.core.Authentication;

import com.dran.web_social.dto.request.UpdateProfileRequest;
import com.dran.web_social.dto.response.ProfileResponse;
import com.dran.web_social.models.Profile;
import com.dran.web_social.models.User;
import com.dran.web_social.repositories.ProfileRepository;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.services.ProfileService;
import com.dran.web_social.services.CloudService;
import com.dran.web_social.mappers.UserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {
    private final ProfileRepository profileRepository;
    private final UserMapper userMapper;
    private final CloudService cloudService;
    private final UserRepository userRepository;

    @Override
    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User chưa đăng nhập");
        }

        String username = authentication.getName();
        System.out.println("Authentication name: " + username);
        User user = userRepository.findByUserName(
                username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        Profile profile = user.getProfile();
        if (profile == null) {
            profile = Profile.builder()
                    .user(user)
                    .followersCount(0)
                    .followingCount(0)
                    .postsCount(0)
                    .build();
        }

        if (profile == null) {
            throw new RuntimeException("Profile không tồn tại");
        }

        // Cập nhật các trường profile
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getWebsite() != null) {
            profile.setWebsite(request.getWebsite());
        }
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation());
        }
        if (request.getBanner() != null) {
            // Upload banner image to cloud
            try {
                Map<String, String> uploadResult = cloudService.uploadFile(request.getBanner());
                profile.setBanner(uploadResult.get("url"));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        Profile updatedProfile = profileRepository.save(profile);

        return ProfileResponse.builder()
                .bio(updatedProfile.getBio())
                .banner(updatedProfile.getBanner())
                .website(updatedProfile.getWebsite())
                .location(updatedProfile.getLocation())
                .followersCount(updatedProfile.getFollowersCount())
                .followingCount(updatedProfile.getFollowingCount())
                .postsCount(updatedProfile.getPostsCount())
                .user(userMapper.userToUserResponse(updatedProfile.getUser()))
                .build();
    }

    @Override
    public ProfileResponse getProfile(String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy người dùng có tài khoản: " + username));
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new RuntimeException("Profile không tồn tại");
        }

        return ProfileResponse.builder()
                .bio(profile.getBio())
                .banner(profile.getBanner())
                .website(profile.getWebsite())
                .location(profile.getLocation())
                .followersCount(profile.getFollowersCount())
                .followingCount(profile.getFollowingCount())
                .postsCount(profile.getPostsCount())
                .user(userMapper.userToUserResponse(user))
                .build();
    }

}
