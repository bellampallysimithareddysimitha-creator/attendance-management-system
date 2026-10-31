package com.attendance.config;

import com.attendance.model.Attendance;
import com.attendance.model.AttendanceStatus;
import com.attendance.model.Role;
import com.attendance.model.User;
import com.attendance.repository.AttendanceRepository;
import com.attendance.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            AttendanceRepository attendanceRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initial data injection.");
            return;
        }

        logger.info("Initializing zero-friction seed data...");

        // 1. Create Default Admin
        User admin = new User(
                "admin",
                "admin@attendance.com",
                passwordEncoder.encode("Admin@123"),
                "System Administrator",
                Role.ROLE_ADMIN
        );
        userRepository.save(admin);

        // 2. Create Students
        User student1 = new User(
                "alex.morgan",
                "alex@attendance.com",
                passwordEncoder.encode("Student@123"),
                "Alex Morgan",
                Role.ROLE_STUDENT
        );
        User student2 = new User(
                "jane.doe",
                "jane@attendance.com",
                passwordEncoder.encode("Student@123"),
                "Jane Doe",
                Role.ROLE_STUDENT
        );
        User student3 = new User(
                "robert.chen",
                "robert@attendance.com",
                passwordEncoder.encode("Student@123"),
                "Robert Chen",
                Role.ROLE_STUDENT
        );

        userRepository.save(student1);
        userRepository.save(student2);
        userRepository.save(student3);

        // 3. Seed Attendance Records across past days and today
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate twoDaysAgo = today.minusDays(2);

        // Two days ago
        attendanceRepository.save(new Attendance(student1, twoDaysAgo, LocalDateTime.of(twoDaysAgo, LocalTime.of(8, 55)), AttendanceStatus.PRESENT, "On time"));
        attendanceRepository.save(new Attendance(student2, twoDaysAgo, LocalDateTime.of(twoDaysAgo, LocalTime.of(9, 45)), AttendanceStatus.LATE, "Traffic delay"));
        attendanceRepository.save(new Attendance(student3, twoDaysAgo, LocalDateTime.of(twoDaysAgo, LocalTime.of(9, 0)), AttendanceStatus.PRESENT, "Regular"));

        // Yesterday
        attendanceRepository.save(new Attendance(student1, yesterday, LocalDateTime.of(yesterday, LocalTime.of(8, 50)), AttendanceStatus.PRESENT, "Early"));
        attendanceRepository.save(new Attendance(student2, yesterday, LocalDateTime.of(yesterday, LocalTime.of(9, 10)), AttendanceStatus.PRESENT, "On time"));
        attendanceRepository.save(new Attendance(student3, yesterday, LocalDateTime.of(yesterday, LocalTime.of(0, 0)), AttendanceStatus.ABSENT, "Sick leave"));

        // Today
        attendanceRepository.save(new Attendance(student1, today, LocalDateTime.of(today, LocalTime.of(8, 58)), AttendanceStatus.PRESENT, "Marked via Portal"));
        attendanceRepository.save(new Attendance(student2, today, LocalDateTime.of(today, LocalTime.of(9, 35)), AttendanceStatus.LATE, "Marked via Portal"));

        logger.info("==================================================================");
        logger.info("ZERO-FRICTION DEMO CREDENTIALS INITIALIZED:");
        logger.info("Admin Portal:   admin@attendance.com   / Admin@123");
        logger.info("Student Portal: alex@attendance.com    / Student@123");
        logger.info("Student Portal: jane@attendance.com    / Student@123");
        logger.info("Student Portal: robert@attendance.com  / Student@123");
        logger.info("==================================================================");
    }
}
