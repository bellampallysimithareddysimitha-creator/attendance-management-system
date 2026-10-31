package com.attendance.dto;

import com.attendance.model.Attendance;
import com.attendance.model.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceResponse {

    private Long id;
    private Long userId;
    private String username;
    private String userFullName;
    private String userEmail;
    private LocalDate date;
    private LocalDateTime timestamp;
    private AttendanceStatus status;
    private String remarks;

    public AttendanceResponse() {
    }

    public AttendanceResponse(Long id, Long userId, String username, String userFullName, String userEmail,
                              LocalDate date, LocalDateTime timestamp, AttendanceStatus status, String remarks) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.userFullName = userFullName;
        this.userEmail = userEmail;
        this.date = date;
        this.timestamp = timestamp;
        this.status = status;
        this.remarks = remarks;
    }

    public static AttendanceResponse fromEntity(Attendance attendance) {
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getUser().getId(),
                attendance.getUser().getUsername(),
                attendance.getUser().getFullName(),
                attendance.getUser().getEmail(),
                attendance.getDate(),
                attendance.getTimestamp(),
                attendance.getStatus(),
                attendance.getRemarks()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
