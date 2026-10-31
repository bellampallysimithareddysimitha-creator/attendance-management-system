package com.attendance.controller;

import com.attendance.dto.AttendanceRequest;
import com.attendance.dto.AttendanceResponse;
import com.attendance.dto.DailyAttendanceStats;
import com.attendance.model.AttendanceStatus;
import com.attendance.model.User;
import com.attendance.repository.UserRepository;
import com.attendance.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    public AttendanceController(AttendanceService attendanceService, UserRepository userRepository) {
        this.attendanceService = attendanceService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) {
            throw new IllegalStateException("Authentication token missing");
        }
        return userRepository.findByUsername(authentication.getName())
                .or(() -> userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authentication.getName()));
    }

    // ==============================================================
    // STUDENT / USER PORTAL ENDPOINTS
    // ==============================================================

    @PostMapping("/attendance/mark")
    public ResponseEntity<?> markDailyAttendance(
            @RequestBody(required = false) AttendanceRequest request,
            Authentication authentication
    ) {
        try {
            User user = getAuthenticatedUser(authentication);
            AttendanceResponse response = attendanceService.markDailyAttendance(user, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/attendance/my-history")
    public ResponseEntity<?> getMyHistory(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            List<AttendanceResponse> history = attendanceService.getStudentAttendanceHistory(user);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/attendance/today")
    public ResponseEntity<?> getTodayRecord(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            return attendanceService.getTodayAttendance(user)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.noContent().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ==============================================================
    // ADMIN SUITE ENDPOINTS
    // ==============================================================

    @GetMapping("/admin/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> getFilteredAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) AttendanceStatus status
    ) {
        List<AttendanceResponse> records = attendanceService.getFilteredAttendance(date, userId, status);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/admin/attendance/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DailyAttendanceStats> getStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        DailyAttendanceStats stats = attendanceService.getAggregatedStats(date);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/admin/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createRecordByAdmin(@RequestBody AttendanceRequest request) {
        try {
            AttendanceResponse response = attendanceService.createOrUpdateRecordByAdmin(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/admin/attendance/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRecord(
            @PathVariable Long id,
            @RequestBody AttendanceRequest request
    ) {
        try {
            AttendanceResponse response = attendanceService.updateAttendance(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/attendance/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRecord(@PathVariable Long id) {
        try {
            attendanceService.deleteAttendance(id);
            return ResponseEntity.ok(Map.of("message", "Attendance record deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
