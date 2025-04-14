package com.dran.web_social.controllers;

import com.dran.web_social.dto.response.UserResponse;
import com.dran.web_social.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id") // Chỉ admin hoặc user sở hữu
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/username/{userName}")
    @PreAuthorize("hasRole('ADMIN') or #userName == authentication.principal.username")
    public ResponseEntity<UserResponse> getUserByUserName(@PathVariable String userName) {
        return ResponseEntity.ok(userService.getUserByUserName(userName));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }
}