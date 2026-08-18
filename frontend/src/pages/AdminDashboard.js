import React, { useState, useEffect } from 'react';
import api from '../api';
import { useSocket } from '../context/SocketContext';

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '', department: '', priority: '' });
  const [sortOption, setSortOption] = useState('date_desc');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [commentText, setCommentText] = useState('');
  const [afterImage, setAfterImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  // SLA State
  const [slaReport, setSlaReport] = useState([]);
  const [slaLoading, setSlaLoading] = useState(true);
  const [showSlaPanel, setShowSlaPanel] = useState(true);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchIssues();
    fetchSlaReport();
  }, [filter]);

  // ── Real-time Socket.io updates (Admin) ──────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleIssueUpdated = (data) => {
      const { issueId, issue: updatedIssue } = data;
      // If issue exists in current list, update it; otherwise ignore (filter may exclude it)
      setIssues((prev) => {
        const exists = prev.some((iss) => iss._id === issueId);
        if (exists) {
          return prev.map((iss) => (iss._id === issueId ? updatedIssue : iss));
        }
        return prev;
      });

      // Admin notification for citizen-triggered events (accept/reject)
      if (data.comment?.includes('Citizen')) {
        triggerNotification(
          `👤 Citizen feedback on "${data.issueTitle}": ${data.newStatus.replace('_', ' ').toUpperCase()}`,
          'info'
        );
      }
    };

    socket.on('issueUpdated', handleIssueUpdated);

    // ── SLA escalation live event ──────────────────────────────────────
    const handleSlaEscalated = (data) => {
      triggerNotification(
        `⚠️ SLA Breach: "${data.issueTitle}" escalated to ${data.newPriority.toUpperCase()}`,
        'warning'
      );
      // Refresh SLA report
      fetchSlaReport();
      // Also refresh issues list to show updated priority
      fetchIssues();
    };
    socket.on('slaEscalated', handleSlaEscalated);
    // ──────────────────────────────────────────────────────────────────

    return () => {
      socket.off('issueUpdated', handleIssueUpdated);
      socket.off('slaEscalated', handleSlaEscalated);
    };
  }, [socket]);
  // ─────────────────────────────────────────────────────────────────────────

  const triggerNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      if (filter.department) params.append('department', filter.department);
      if (filter.priority) params.append('priority', filter.priority);
      
      const response = await api.get(`/issues?${params}`);
      setIssues(response.data.issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      triggerNotification('Failed to retrieve issues.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlaReport = async () => {
    try {
      setSlaLoading(true);
      const response = await api.get('/issues/sla-report');
      setSlaReport(response.data.report || []);
    } catch (error) {
      console.error('Error fetching SLA report:', error);
    } finally {
      setSlaLoading(false);
    }
  };

  const openStatusModal = (issue, status) => {
    setSelectedIssue(issue);
    setTargetStatus(status);
    setCommentText('');
    setAfterImage(null);
    setImagePreview('');
    setShowModal(true);
  };

  const closeStatusModal = () => {
    setShowModal(false);
    setSelectedIssue(null);
    setTargetStatus('');
    setCommentText('');
    setAfterImage(null);
    setImagePreview('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      setAfterImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      alert('Please enter a progress comment/update.');
      return;
    }
    if (targetStatus === 'resolved' && !afterImage) {
      alert('Proof of resolution (After Image) is required to resolve the issue.');
      return;
    }

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status', targetStatus);
      formData.append('comment', commentText.trim());
      if (afterImage) {
        formData.append('afterImage', afterImage);
      }

      const res = await api.put(`/issues/${selectedIssue._id}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      // Update local state
      setIssues(issues.map(issue => 
        issue._id === selectedIssue._id 
          ? { 
              ...issue, 
              status: targetStatus, 
              afterImageUrl: res.data.afterImageUrl, 
              statusHistory: res.data.statusHistory,
              updatedAt: new Date() 
            }
          : issue
      ));
      
      triggerNotification(`Issue status updated to ${targetStatus.replace('_', ' ').toUpperCase()}!`);
      closeStatusModal();
    } catch (error) {
      console.error('Error updating status:', error);
      triggerNotification('Failed to update issue status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const assignDepartment = async (issueId, department) => {
    try {
      const res = await api.put(`/issues/${issueId}/department`, { department });
      setIssues(issues.map(issue => 
        issue._id === issueId ? { ...issue, department: res.data.department } : issue
      ));
      triggerNotification(`Assigned to ${department.toUpperCase()} Department!`);
    } catch (error) {
      console.error('Error assigning department:', error);
      triggerNotification('Failed to assign department.', 'error');
    }
  };

  const setPriority = async (issueId, priority) => {
    try {
      const res = await api.put(`/issues/${issueId}/priority`, { priority });
      setIssues(issues.map(issue => 
        issue._id === issueId ? { ...issue, priority: res.data.priority } : issue
      ));
      triggerNotification(`Priority set to ${priority.toUpperCase()}!`);
    } catch (error) {
      console.error('Error setting priority:', error);
      triggerNotification('Failed to set priority.', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-50 text-green-800 border-green-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getSortedIssues = () => {
    const sorted = [...issues];
    switch (sortOption) {
      case 'date_desc':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'date_asc':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'upvotes_desc':
        return sorted.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
      case 'priority_desc':
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        return sorted.sort((a, b) => (priorityWeight[b.priority || 'medium'] || 2) - (priorityWeight[a.priority || 'medium'] || 2));
      default:
        return sorted;
    }
  };

  const getStats = () => {
    const total = issues.length;
    const pending = issues.filter(i => i.status === 'pending').length;
    const inProgress = issues.filter(i => i.status === 'in_progress').length;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    const escalated = slaReport.filter(i => i.escalated).length;
    const overdue = slaReport.filter(i => i.isOverdue).length;
    return { total, pending, inProgress, resolved, escalated, overdue };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const stats = getStats();
  const sortedIssues = getSortedIssues();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {notification.show && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border transition-all ${
          notification.type === 'error'   ? 'bg-red-50 border-red-200 text-red-800' :
          notification.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' :
          'bg-green-50 border-green-200 text-green-800'
        }`}>
          <span className="material-symbols-outlined text-base">
            {notification.type === 'error' ? 'error' : notification.type === 'warning' ? 'warning' : 'check_circle'}
          </span>
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-none">Municipal Admin Dashboard</h1>
            {/* Live indicator */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isConnected
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <p className="text-gray-500 mt-1">Manage reported issues, route tasks to departments, and upload proof of resolution.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Claims',   value: stats.total,     color: 'bg-blue-600',   icon: 'list_alt'    },
          { label: 'Pending',        value: stats.pending,   color: 'bg-yellow-500', icon: 'pending'     },
          { label: 'In Progress',    value: stats.inProgress,color: 'bg-blue-500',   icon: 'engineering' },
          { label: 'Resolved',       value: stats.resolved,  color: 'bg-green-600',  icon: 'verified'    },
          { label: 'SLA Breached',   value: stats.overdue,   color: stats.overdue > 0 ? 'bg-red-600' : 'bg-gray-400',   icon: 'timer_off'   },
          { label: 'Escalated',      value: stats.escalated, color: stats.escalated > 0 ? 'bg-orange-500' : 'bg-gray-400', icon: 'priority_high' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${s.color}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* SLA Alerts Panel */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-xl">timer_off</span>
            <h2 className="text-lg font-bold text-gray-900">SLA Alerts</h2>
            {slaReport.filter(i => i.isOverdue).length > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {slaReport.filter(i => i.isOverdue).length} OVERDUE
              </span>
            )}
            {slaReport.filter(i => !i.isOverdue && i.daysRemaining <= 1).length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {slaReport.filter(i => !i.isOverdue && i.daysRemaining <= 1).length} DUE SOON
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSlaPanel(!showSlaPanel)}
            className="text-xs text-gray-400 hover:text-gray-600 font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">
              {showSlaPanel ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
            {showSlaPanel ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {showSlaPanel && (
          slaLoading ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-gray-400 text-sm">
              Loading SLA data...
            </div>
          ) : slaReport.length === 0 ? (
            <div className="bg-white border border-green-100 rounded-2xl p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-green-400">check_circle</span>
              <p className="text-sm font-semibold text-green-700 mt-2">All issues are within SLA limits. Great work!</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Issue</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">SLA</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Deadline</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Escalated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {slaReport.map((item) => (
                    <tr key={item._id} className={item.isOverdue ? 'bg-red-50' : item.daysRemaining <= 1 ? 'bg-orange-50' : 'bg-white'}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 text-xs truncate max-w-[180px]">{item.title}</p>
                        <p className="text-gray-400 text-[10px] truncate max-w-[180px]">{item.location}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          item.status === 'pending'     ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                          item.status === 'in_progress' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          'bg-green-50 text-green-800 border-green-200'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          item.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                          item.priority === 'high'   ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          item.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-red-700 font-bold text-xs">
                            <span className="material-symbols-outlined text-sm">timer_off</span>
                            {Math.abs(item.daysRemaining)} day{Math.abs(item.daysRemaining) !== 1 ? 's' : ''} overdue
                          </span>
                        ) : item.daysRemaining <= 1 ? (
                          <span className="inline-flex items-center gap-1 text-orange-600 font-bold text-xs">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            {item.hoursRemaining}h remaining
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-700 font-semibold text-xs">
                            <span className="material-symbols-outlined text-sm">timer</span>
                            {item.daysRemaining}d remaining
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(item.slaDeadline).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {item.escalated ? (
                          <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                            <span className="material-symbols-outlined text-sm">priority_high</span>
                            Escalated
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mb-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Filter Status */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Filter Department */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Department</label>
            <select
              value={filter.department}
              onChange={(e) => setFilter({ ...filter, department: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              <option value="general">General</option>
              <option value="road">Road</option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="sanitation">Sanitation</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
              <option value="upvotes_desc">Upvotes (Most First)</option>
              <option value="priority_desc">Priority (Highest First)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter({ type: '', status: '', department: '', priority: '' });
                setSortOption('date_desc');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-bold transition-all focus:outline-none"
            >
              Reset Controls
            </button>
          </div>
        </div>
      </div>

      {/* Main List */}
      {sortedIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedIssues.map((issue) => (
            <div key={issue._id} className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
              {/* Header Image */}
              <div className="relative h-44 bg-gray-50">
                <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border shadow-sm ${getStatusBadgeClass(issue.status)}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{issue.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">Reported: {new Date(issue.createdAt).toLocaleDateString()} | Upvotes: {issue.upvotes?.length || 0}</p>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">{issue.description}</p>
                  
                  {/* Location Address */}
                  <div className="flex items-center text-xs text-gray-500 gap-1 mb-4">
                    <span className="material-symbols-outlined text-base text-gray-400">location_on</span>
                    <span className="truncate">{issue.location.address}</span>
                  </div>

                  {/* Settings section */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 border border-gray-150 rounded-xl">
                    {/* Inline Department Assignment */}
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assign Dept</label>
                      <select
                        value={issue.department || 'general'}
                        onChange={(e) => assignDepartment(issue._id, e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs rounded-lg px-2 py-1 text-gray-700 font-semibold focus:outline-none"
                      >
                        <option value="general">General</option>
                        <option value="road">Roads</option>
                        <option value="water">Water</option>
                        <option value="electricity">Electric</option>
                        <option value="sanitation">Sanitation</option>
                      </select>
                    </div>

                    {/* Inline Priority Assignment */}
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</label>
                      <select
                        value={issue.priority || 'medium'}
                        onChange={(e) => setPriority(issue._id, e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs rounded-lg px-2 py-1 text-gray-700 font-semibold focus:outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status action buttons */}
                <div>
                  {issue.status !== 'resolved' ? (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      {issue.status === 'pending' && (
                        <button
                          onClick={() => openStatusModal(issue, 'in_progress')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-sm"
                        >
                          ⚙️ Start Repairs
                        </button>
                      )}
                      <button
                        onClick={() => openStatusModal(issue, 'resolved')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-sm"
                      >
                        ✓ Mark Resolved
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-gray-100 bg-green-50 p-2.5 rounded-xl border border-green-150 text-center">
                      <p className="text-xs text-green-800 font-bold">✓ Resolved Successfully</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <span className="material-symbols-outlined text-5xl text-gray-300">search_off</span>
          <h3 className="text-lg font-bold text-gray-900 mt-2">No matching issues</h3>
          <p className="text-gray-500 text-sm mt-1">Try resetting the filters or check back later.</p>
        </div>
      )}

      {/* Premium Status Update Modal */}
      {showModal && selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Update Status to <span className={targetStatus === 'resolved' ? 'text-green-600' : 'text-blue-600'}>
                  {targetStatus.replace('_', ' ').toUpperCase()}
                </span>
              </h2>
              <button onClick={closeStatusModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Progress Comment / Update <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={targetStatus === 'resolved' ? 'Explain what was fixed (e.g. filled the pothole with tar and asphalt)' : 'Enter update details (e.g. repair crew dispatched with replacement parts)'}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300"
                />
              </div>

              {/* After Image Upload for Resolved status */}
              {targetStatus === 'resolved' && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Proof of Resolution (After Photo) <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-gray-50">
                    <input
                      type="file"
                      required
                      accept="image/*"
                      id="afterImageInput"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="afterImageInput" className="cursor-pointer block">
                      {imagePreview ? (
                        <div className="relative rounded-lg overflow-hidden border border-gray-150 max-h-40">
                          <img src={imagePreview} alt="Proof preview" className="w-full object-cover" />
                        </div>
                      ) : (
                        <div className="py-2">
                          <span className="material-symbols-outlined text-4xl text-gray-400">upload_file</span>
                          <p className="text-sm font-semibold text-gray-600 mt-1">Click to upload resolved proof</p>
                          <p className="text-xs text-gray-400 mt-0.5">Max file size: 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
                    targetStatus === 'resolved' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {updating ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
