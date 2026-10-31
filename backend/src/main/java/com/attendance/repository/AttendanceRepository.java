package com.attendance.repository;

import com.attendance.model.Attendance;
import com.attendance.model.AttendanceStatus;
import com.attendance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByUserOrderByDateDescTimestampDesc(User user);

    Optional<Attendance> findByUserIdAndDate(Long userId, LocalDate date);

    List<Attendance> findByDateOrderByTimestampDesc(LocalDate date);

    List<Attendance> findAllByOrderByDateDescTimestampDesc();

    @Query("SELECT a FROM Attendance a WHERE " +
           "(:date IS NULL OR a.date = :date) AND " +
           "(:userId IS NULL OR a.user.id = :userId) AND " +
           "(:status IS NULL OR a.status = :status) " +
           "ORDER BY a.date DESC, a.timestamp DESC")
    List<Attendance> searchAttendance(
            @Param("date") LocalDate date,
            @Param("userId") Long userId,
            @Param("status") AttendanceStatus status
    );

    long countByDate(LocalDate date);

    long countByDateAndStatus(LocalDate date, AttendanceStatus status);

    long countByStatus(AttendanceStatus status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, AttendanceStatus status);
}
