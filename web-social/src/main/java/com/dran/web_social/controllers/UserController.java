package com.dran.web_social.controllers;

import com.dran.web_social.dto.request.UpdateUserRequest;
import com.dran.web_social.dto.response.UserResponse;
import com.dran.web_social.services.UserService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/username/{userName}")
    public ResponseEntity<UserResponse> getUserByUserName(@PathVariable String userName) {
        return ResponseEntity.ok(userService.getUserByUserName(userName));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @PutMapping("/update-profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateUserRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        // Ensure the username in the request matches the authenticated user
        if (!request.getUserName().equals(currentUsername)) {
            throw new RuntimeException("Không thể cập nhật hồ sơ của người dùng khác");
        }

        return ResponseEntity.ok(userService.updateUser(request));
    }
}