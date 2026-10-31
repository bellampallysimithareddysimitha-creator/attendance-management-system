package com.attendance.dto;

public class DailyAttendanceStats {

    private long totalRecords;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private double attendanceRatePercentage;

    public DailyAttendanceStats() {
    }

    public DailyAttendanceStats(long totalRecords, long presentCount, long absentCount, long lateCount, double attendanceRatePercentage) {
        this.totalRecords = totalRecords;
        this.presentCount = presentCount;
        this.absentCount = absentCount;
        this.lateCount = lateCount;
        this.attendanceRatePercentage = attendanceRatePercentage;
    }

    public long getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(long totalRecords) {
        this.totalRecords = totalRecords;
    }

    public long getPresentCount() {
        return presentCount;
    }

    public void setPresentCount(long presentCount) {
        this.presentCount = presentCount;
    }

    public long getAbsentCount() {
        return absentCount;
    }

    public void setAbsentCount(long absentCount) {
        this.absentCount = absentCount;
    }

    public long getLateCount() {
        return lateCount;
    }

    public void setLateCount(long lateCount) {
        this.lateCount = lateCount;
    }

    public double getAttendanceRatePercentage() {
        return attendanceRatePercentage;
    }

    public void setAttendanceRatePercentage(double attendanceRatePercentage) {
        this.attendanceRatePercentage = attendanceRatePercentage;
    }
}
