package com.dran.web_social.controllers;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dran.web_social.dto.request.UpdateProfileRequest;
import com.dran.web_social.dto.response.ProfileResponse;
import com.dran.web_social.models.User;
import com.dran.web_social.services.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> updateUserProfile(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) String website,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) MultipartFile banner) {

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .bio(bio)
                .website(website)
                .location(location)
                .banner(banner)
                .build();

        return ResponseEntity.ok(profileService.updateProfile(request));
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getUserProfile(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.getProfile(user.getUsername()));
    }

    @GetMapping("/{username}")
    public ResponseEntity<ProfileResponse> getUserProfileByUsername(
            @PathVariable String username) {
        return ResponseEntity.ok(profileService.getProfile(username));
    }

}
