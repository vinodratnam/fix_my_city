import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import IssueCard from '../components/IssueCard';

const Dashboard = () => {
  const { user } = useAuth();
  const { socket, addToast } = useSocket();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '', department: '', priority: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');

  useEffect(() => {
    fetchIssues();
  }, [filter, searchTerm]);

  // ── Real-time Socket.io updates ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleIssueUpdated = (data) => {
      const { issueId, issue: updatedIssue } = data;
      setIssues((prev) =>
        prev.map((iss) => (iss._id === issueId ? updatedIssue : iss))
      );

      // Show toast if this issue was reported by the current user
      if (user && updatedIssue?.reportedBy?._id === user.id) {
        const statusEmoji = { pending: '⏳', in_progress: '🔧', resolved: '✅' };
        addToast({
          type: data.newStatus === 'resolved' ? 'success' : 'info',
          emoji: statusEmoji[data.newStatus] || '📢',
          title: 'Your Issue Was Updated',
          message: `"${data.issueTitle}" → ${data.newStatus.replace('_', ' ').toUpperCase()}`,
        });
      }
    };

    socket.on('issueUpdated', handleIssueUpdated);
    return () => socket.off('issueUpdated', handleIssueUpdated);
  }, [socket, user, addToast]);
  // ────────────────────────────────────────────────────────────────────────────

  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      if (filter.department) params.append('department', filter.department);
      if (filter.priority) params.append('priority', filter.priority);
      
      const response = await api.get(`/issues?${params}`);
      let filteredIssues = response.data.issues;
      
      // Apply search filter locally
      if (searchTerm) {
        filteredIssues = filteredIssues.filter(issue =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setIssues(filteredIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      let comment = '';
      if (newStatus === 'resolved') {
        const commentInput = prompt("Enter resolution comment (Required):");
        if (!commentInput) {
          alert("Resolution comment is required.");
          return;
        }
        comment = commentInput;
      } else {
        comment = prompt("Enter progress update comment (Optional):") || '';
      }

      const formData = new FormData();
      formData.append('status', newStatus);
      if (comment) formData.append('comment', comment);

      // If resolving without an afterImage via quick action, backend falls back to standard placeholder
      await api.put(`/issues/${issueId}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      // Refresh list to update all status records
      fetchIssues();
    } catch (error) {
      console.error('Error updating issue status:', error);
      alert('Error updating issue status. Ensure you are authorized.');
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
    
    return { total, pending, inProgress, resolved };
  };

  const stats = getStats();
  const sortedIssues = getSortedIssues();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">CivicWatch Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">dashboard</span>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Reports</dt>
                  <dd className="text-xl font-bold text-gray-950">{stats.total}</dd>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">pending</span>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending</dt>
                  <dd className="text-xl font-bold text-gray-950">{stats.pending}</dd>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">engineering</span>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">In Progress</dt>
                  <dd className="text-xl font-bold text-gray-950">{stats.inProgress}</dd>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resolved</dt>
                  <dd className="text-xl font-bold text-gray-950">{stats.resolved}</dd>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mb-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  🔍 Search Issues
                </label>
                <input
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="in_progress">🔧 In Progress</option>
                  <option value="resolved">✅ Resolved</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Department
                </label>
                <select
                  value={filter.department}
                  onChange={(e) => setFilter({ ...filter, department: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                >
                  <option value="">All Depts</option>
                  <option value="general">General</option>
                  <option value="road">Roads</option>
                  <option value="water">Water</option>
                  <option value="electricity">Electric</option>
                  <option value="sanitation">Sanitation</option>
                </select>
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Sort By
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                >
                  <option value="date_desc">Date (Newest First)</option>
                  <option value="date_asc">Date (Oldest First)</option>
                  <option value="upvotes_desc">Upvotes (Highest First)</option>
                  <option value="priority_desc">Priority (Highest First)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Issues Grid */}
          {sortedIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedIssues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  userRole={user?.role}
                  onStatusUpdate={updateIssueStatus}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-12">
                <span className="material-symbols-outlined text-5xl text-gray-300">search_off</span>
                <h3 className="text-xl font-bold text-gray-900 mt-2 mb-1">No issues found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  {searchTerm || filter.type || filter.status || filter.department
                    ? 'Try adjusting your filters or search terms.' 
                    : 'Be the first to report an infrastructure issue in your area!'}
                </p>
                {!searchTerm && !filter.type && !filter.status && !filter.department && (
                  <button
                    onClick={() => window.location.href = '/report-issue'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    📝 Report an Issue
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
