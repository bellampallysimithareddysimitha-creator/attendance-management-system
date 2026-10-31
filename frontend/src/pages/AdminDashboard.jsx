import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { StatCard } from '../components/StatCard';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
  Plus,
  Filter,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Calendar,
  AlertCircle,
  Check
} from 'lucide-react';

export const AdminDashboard = () => {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    attendanceRatePercentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal State for Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    remarks: '',
  });

  // Tab State: 'records' | 'users'
  const [activeTab, setActiveTab] = useState('records');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, [filterDate, filterUserId, filterStatus]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/attendance/stats'),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
      await fetchRecords();
    } catch (err) {
      setError('Failed to load system dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterUserId) params.userId = filterUserId;
      if (filterStatus) params.status = filterStatus;

      const res = await api.get('/api/admin/attendance', { params });
      setRecords(res.data);
    } catch (err) {
      setError('Failed to fetch attendance records');
    }
  };

  const fetchStats = async () => {
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      const res = await api.get('/api/admin/attendance/stats', { params });
      setStats(res.data);
    } catch {
      // Non-blocking
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setFormData({
      userId: users[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      remarks: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (rec) => {
    setEditingRecord(rec);
    setFormData({
      userId: rec.userId,
      date: rec.date,
      status: rec.status,
      remarks: rec.remarks || '',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await api.put(`/api/admin/attendance/${editingRecord.id}`, {
          date: formData.date,
          status: formData.status,
          remarks: formData.remarks,
        });
        showSuccess('Attendance record updated successfully');
      } else {
        await api.post('/api/admin/attendance', formData);
        showSuccess('Attendance record created successfully');
      }
      setModalOpen(false);
      fetchRecords();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/api/admin/attendance/${id}`);
      showSuccess('Record deleted successfully');
      fetchRecords();
      fetchStats();
    } catch (err) {
      setError('Failed to delete attendance record');
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const resetFilters = () => {
    setFilterDate('');
    setFilterUserId('');
    setFilterStatus('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Present
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Late
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Absent
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Administrative Command Center
          </h1>
          <p className="text-sm text-slate-500">
            Enterprise attendance overview, student registries, and real-time records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchRecords();
              fetchStats();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            New Entry
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

      {/* Aggregated Real-Time KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Marked"
          value={stats.totalRecords}
          subtitle={filterDate ? `Records on ${filterDate}` : 'All-time records'}
          icon={Users}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Present"
          value={stats.presentCount}
          subtitle="On-time attendees"
          icon={CheckCircle}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Late"
          value={stats.lateCount}
          subtitle="After cutoff threshold"
          icon={Clock}
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Absent"
          value={stats.absentCount}
          subtitle="Unexcused or missed"
          icon={XCircle}
          colorClass="bg-rose-50 text-rose-600"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRatePercentage}%`}
          subtitle="(Present + Late) / Total"
          icon={Percent}
          colorClass="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'records'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daily Attendance Records ({records.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Student & User Registry ({users.length})
        </button>
      </div>

      {activeTab === 'records' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <select
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Students / Users</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>
            </div>

            {(filterDate || filterUserId || filterStatus) && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Student / User</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Remarks</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        No attendance records match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{rec.userFullName}</div>
                          <div className="text-xs text-slate-400">{rec.userEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                          {rec.date}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">
                          {rec.timestamp ? new Date(rec.timestamp).toLocaleTimeString() : '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(rec.status)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          {rec.remarks || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(rec)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* User Registry Tab */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">System Role</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{u.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{u.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{u.username}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.role === 'ROLE_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role === 'ROLE_ADMIN' ? 'ADMIN' : 'STUDENT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Modal for Create / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingRecord ? 'Edit Attendance Record' : 'Create New Attendance Entry'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {!editingRecord && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Select Student
                  </label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.username})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Attendance Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['PRESENT', 'LATE', 'ABSENT'].map((statusOption) => (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: statusOption })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                        formData.status === statusOption
                          ? statusOption === 'PRESENT'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : statusOption === 'LATE'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Authorized leave, medical reason, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20"
                >
                  {editingRecord ? 'Save Changes' : 'Record Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
