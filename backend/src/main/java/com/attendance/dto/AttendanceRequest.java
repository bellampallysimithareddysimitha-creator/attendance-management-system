package com.attendance.dto;

import com.attendance.model.AttendanceStatus;
import java.time.LocalDate;

public class AttendanceRequest {

    private Long userId;
    private LocalDate date;
    private AttendanceStatus status;
    private String remarks;

    public AttendanceRequest() {
    }

    public AttendanceRequest(Long userId, LocalDate date, AttendanceStatus status, String remarks) {
        this.userId = userId;
        this.date = date;
        this.status = status;
        this.remarks = remarks;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
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
