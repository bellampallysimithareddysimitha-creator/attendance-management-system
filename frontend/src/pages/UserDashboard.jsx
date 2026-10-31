import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  Check,
  Percent,
  History,
  XCircle
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [historyRes, todayRes] = await Promise.all([
        api.get('/api/attendance/my-history'),
        api.get('/api/attendance/today'),
      ]);
      setHistory(historyRes.data);
      if (todayRes.status === 200 && todayRes.data) {
        setTodayRecord(todayRes.data);
      }
    } catch (err) {
      setError('Unable to load your attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      setMarking(true);
      setError('');
      const res = await api.post('/api/attendance/mark', {});
      setTodayRecord(res.data);
      setSuccessMsg('Attendance marked successfully with timestamp!');
      await fetchUserData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarking(false);
    }
  };

  // Compute personal metrics
  const totalRecords = history.length;
  const presentCount = history.filter((r) => r.status === 'PRESENT').length;
  const lateCount = history.filter((r) => r.status === 'LATE').length;
  const absentCount = history.filter((r) => r.status === 'ABSENT').length;
  const attendanceRate = totalRecords > 0
    ? Math.round(((presentCount + lateCount) / totalRecords * 100) * 10) / 10
    : 100;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-700/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Active Session
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hello, {user?.fullName || user?.username}
          </h1>
          <p className="text-emerald-100 text-sm flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {todayStr}
          </p>
        </div>

        {/* Action Button: Mark Daily Attendance */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center sm:items-end gap-2">
          <div className="text-xs text-emerald-100 font-medium">
            {todayRecord ? 'Status: Recorded for Today' : 'Ready to Check In?'}
          </div>
          <button
            onClick={handleMarkAttendance}
            disabled={marking}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
              todayRecord
                ? 'bg-white text-emerald-800 hover:bg-emerald-50'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-900 shadow-emerald-950/20 hover:scale-105'
            }`}
          >
            {marking ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : todayRecord ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Update Today's Check-in</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-slate-900" />
                <span>Mark Daily Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-xs font-bold underline">Dismiss</button>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Today's Status Banner Card */}
      {todayRecord && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              todayRecord.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
              todayRecord.status === 'LATE' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Attendance Stamp</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">
                  Status: {todayRecord.status}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  (Stamped at {new Date(todayRecord.timestamp).toLocaleTimeString()})
                </span>
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-500 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-center">
            {todayRecord.remarks || 'No remarks'}
          </span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance Rate"
          value={`${attendanceRate}%`}
          subtitle="Attendance score"
          icon={Percent}
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Total Days Logged"
          value={totalRecords}
          subtitle="Cumulative check-ins"
          icon={Calendar}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="On-Time Days"
          value={presentCount}
          subtitle="Punctual attendance"
          icon={CheckCircle2}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Late Occurrences"
          value={lateCount}
          subtitle="Logged after 09:30 AM"
          icon={Clock}
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <History className="w-5 h-5 text-emerald-600" />
            <span>Personal Attendance History</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {history.length} records found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    No attendance records yet. Click "Mark Daily Attendance" to log your first record!
                  </td>
                </tr>
              ) : (
                history.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 text-xs">
                      {rec.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">
                      {rec.timestamp ? new Date(rec.timestamp).toLocaleTimeString() : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rec.status === 'LATE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {rec.status === 'PRESENT' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {rec.status === 'LATE' && <Clock className="w-3.5 h-3.5" />}
                        {rec.status === 'ABSENT' && <XCircle className="w-3.5 h-3.5" />}
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {rec.remarks || 'Regular entry'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
