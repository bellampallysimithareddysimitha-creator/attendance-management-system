package com.attendance.service;

import com.attendance.dto.AttendanceRequest;
import com.attendance.dto.AttendanceResponse;
import com.attendance.dto.DailyAttendanceStats;
import com.attendance.model.Attendance;
import com.attendance.model.AttendanceStatus;
import com.attendance.model.User;
import com.attendance.repository.AttendanceRepository;
import com.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    /**
     * Mark daily attendance for a student. Automatically checks time thresholds.
     */
    @Transactional
    public AttendanceResponse markDailyAttendance(User user, AttendanceRequest request) {
        LocalDate today = (request != null && request.getDate() != null) ? request.getDate() : LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Optional<Attendance> existing = attendanceRepository.findByUserIdAndDate(user.getId(), today);
        Attendance attendance;

        // Auto-assign status based on standard school/work cutoff (e.g. 09:30 AM)
        AttendanceStatus resolvedStatus;
        if (request != null && request.getStatus() != null) {
            resolvedStatus = request.getStatus();
        } else {
            LocalTime cutoffTime = LocalTime.of(9, 30);
            resolvedStatus = now.toLocalTime().isAfter(cutoffTime) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
        }

        String remarks = (request != null && request.getRemarks() != null) ? request.getRemarks() : "Marked via Portal";

        if (existing.isPresent()) {
            attendance = existing.get();
            attendance.setTimestamp(now);
            attendance.setStatus(resolvedStatus);
            attendance.setRemarks(remarks + " (Updated)");
        } else {
            attendance = new Attendance(user, today, now, resolvedStatus, remarks);
        }

        Attendance saved = attendanceRepository.save(attendance);
        return AttendanceResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getStudentAttendanceHistory(User user) {
        return attendanceRepository.findByUserOrderByDateDescTimestampDesc(user)
                .stream()
                .map(AttendanceResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<AttendanceResponse> getTodayAttendance(User user) {
        return attendanceRepository.findByUserIdAndDate(user.getId(), LocalDate.now())
                .map(AttendanceResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getFilteredAttendance(LocalDate date, Long userId, AttendanceStatus status) {
        return attendanceRepository.searchAttendance(date, userId, status)
                .stream()
                .map(AttendanceResponse::fromEntity)
                .toList();
    }

    @Transactional
    public AttendanceResponse createOrUpdateRecordByAdmin(AttendanceRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required for administrative attendance records");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        AttendanceStatus status = request.getStatus() != null ? request.getStatus() : AttendanceStatus.PRESENT;
        String remarks = request.getRemarks() != null ? request.getRemarks() : "Recorded by Administrator";

        Attendance attendance = attendanceRepository.findByUserIdAndDate(user.getId(), date)
                .orElseGet(() -> new Attendance(user, date, LocalDateTime.now(), status, remarks));

        attendance.setStatus(status);
        attendance.setRemarks(remarks);
        attendance.setTimestamp(LocalDateTime.now());

        Attendance saved = attendanceRepository.save(attendance);
        return AttendanceResponse.fromEntity(saved);
    }

    @Transactional
    public AttendanceResponse updateAttendance(Long id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found with id: " + id));

        if (request.getStatus() != null) {
            attendance.setStatus(request.getStatus());
        }
        if (request.getRemarks() != null) {
            attendance.setRemarks(request.getRemarks());
        }
        if (request.getDate() != null) {
            attendance.setDate(request.getDate());
        }

        attendance.setTimestamp(LocalDateTime.now());
        Attendance updated = attendanceRepository.save(attendance);
        return AttendanceResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new IllegalArgumentException("Attendance record not found with id: " + id);
        }
        attendanceRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public DailyAttendanceStats getAggregatedStats(LocalDate targetDate) {
        long totalRecords;
        long present;
        long absent;
        long late;

        if (targetDate != null) {
            totalRecords = attendanceRepository.countByDate(targetDate);
            present = attendanceRepository.countByDateAndStatus(targetDate, AttendanceStatus.PRESENT);
            absent = attendanceRepository.countByDateAndStatus(targetDate, AttendanceStatus.ABSENT);
            late = attendanceRepository.countByDateAndStatus(targetDate, AttendanceStatus.LATE);
        } else {
            totalRecords = attendanceRepository.count();
            present = attendanceRepository.countByStatus(AttendanceStatus.PRESENT);
            absent = attendanceRepository.countByStatus(AttendanceStatus.ABSENT);
            late = attendanceRepository.countByStatus(AttendanceStatus.LATE);
        }

        double rate = totalRecords > 0
                ? Math.round(((double) (present + late) / totalRecords * 100.0) * 10.0) / 10.0
                : 0.0;

        return new DailyAttendanceStats(totalRecords, present, absent, late, rate);
    }
}
