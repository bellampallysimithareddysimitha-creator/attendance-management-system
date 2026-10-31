package com.attendance.controller;

import com.attendance.dto.UserResponse;
import com.attendance.model.Role;
import com.attendance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(@RequestParam(required = false) Role role) {
        List<UserResponse> users;
        if (role != null) {
            users = userRepository.findByRole(role).stream().map(UserResponse::fromEntity).toList();
        } else {
            users = userRepository.findAll().stream().map(UserResponse::fromEntity).toList();
        }
        return ResponseEntity.ok(users);
    }
}
