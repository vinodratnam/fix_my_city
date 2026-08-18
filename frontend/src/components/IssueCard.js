import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const IssueCard = ({ issue, onStatusUpdate, userRole }) => {
  const { user } = useAuth();
  const [upvotesList, setUpvotesList] = useState(issue.upvotes || []);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const hasUpvoted = user ? upvotesList.includes(user.id) : false;

  const handleAccept = async () => {
    setIsSubmittingFeedback(true);
    try {
      await api.put(`/issues/${issue._id}/accept`);
      alert("Resolution accepted! Issue is officially closed.");
      window.location.reload();
    } catch (err) {
      console.error("Accept error:", err);
      alert("Failed to accept resolution.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Rejection reason comment is required.");
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      await api.put(`/issues/${issue._id}/reject`, { comment: rejectReason.trim() });
      alert("Resolution rejected. Issue moved back to In Progress.");
      window.location.reload();
    } catch (err) {
      console.error("Reject error:", err);
      alert("Failed to reject resolution.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-50 text-green-800 border-green-300';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pothole':
        return 'pit';
      case 'streetlight':
        return 'lightbulb';
      case 'water_leakage':
        return 'water_drop';
      case 'garbage_overflow':
        return 'delete';
      case 'public_property':
        return 'domain';
      default:
        return 'warning';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'pothole':
        return 'Pothole';
      case 'streetlight':
        return 'Streetlight';
      case 'water_leakage':
        return 'Water Leakage';
      case 'garbage_overflow':
        return 'Garbage Overflow';
      case 'public_property':
        return 'Public Property';
      default:
        return 'Other';
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      alert("Please login to upvote issues!");
      return;
    }
    if (isUpvoting) return;
    setIsUpvoting(true);
    try {
      const res = await api.post(`/issues/${issue._id}/upvote`);
      if (res.data) {
        if (res.data.upvoted) {
          setUpvotesList(prev => [...prev, user.id]);
        } else {
          setUpvotesList(prev => prev.filter(id => id !== user.id));
        }
      }
    } catch (err) {
      console.error("Failed to upvote:", err);
    } finally {
      setIsUpvoting(false);
    }
  };

  // Find the resolution comments in statusHistory
  const resolutionEvent = issue.statusHistory?.find(h => h.status === 'resolved');
  const resolutionComment = resolutionEvent?.comment;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Image Header */}
      <div className="relative h-48 bg-gray-50 flex-shrink-0">
        {issue.imageUrl ? (
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="w-full h-full hidden items-center justify-center text-gray-400">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl mb-1">image_not_supported</span>
            <p className="text-xs">No Image Preview</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wider rounded-full border shadow-sm ${getStatusColor(issue.status)}`}>
            {issue.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Priority Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border shadow-sm ${getPriorityColor(issue.priority)}`}>
            🚨 {issue.priority || 'medium'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title and Type */}
          <div className="mb-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
              📍 {issue.department ? `${issue.department.toUpperCase()} DEPT` : 'GENERAL DISPATCH'}
            </span>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug">
              {issue.title}
            </h3>
          </div>

          {/* Type Badge */}
          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              <span className="material-symbols-outlined text-sm mr-1">{getTypeIcon(issue.type)}</span> {getTypeLabel(issue.type)}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {issue.description}
          </p>

          {/* Location details */}
          <div className="flex items-start text-xs text-gray-500 mb-4 gap-1.5">
            <span className="material-symbols-outlined text-base text-gray-400 mt-0.5">location_on</span>
            <span className="line-clamp-2">{issue.location?.address || 'Address not available'}</span>
          </div>

          {/* Proof of Resolution (Before / After view) */}
          {issue.status === 'resolved' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-green-800 mb-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span className="text-xs font-bold uppercase tracking-wider">Proof of Resolution</span>
              </div>
              {issue.afterImageUrl && (
                <div className="mb-2 relative rounded-lg overflow-hidden border border-green-150 shadow-sm">
                  <img src={issue.afterImageUrl} alt="Resolution Proof" className="w-full h-32 object-cover" />
                  <span className="absolute bottom-1 right-1 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">AFTER</span>
                </div>
              )}
              {resolutionComment ? (
                <p className="text-xs text-green-700 italic font-medium">"{resolutionComment}"</p>
              ) : (
                <p className="text-xs text-green-600">Issue resolved successfully by the department.</p>
              )}
            </div>
          )}

          {/* Accept / Reject Resolution Feedback Prompt */}
          {user && issue.status === 'resolved' && (issue.reportedBy?._id === user.id || issue.reportedBy === user.id) && !issue.statusHistory?.some(h => h.comment.includes('Resolution Accepted')) && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-bold text-blue-900 mb-2">Municipal authorities marked this resolved. Was this resolved to your satisfaction?</p>
              {showRejectInput ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason details..."
                    className="w-full text-xs p-2 border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={isSubmittingFeedback}
                      className="flex-grow bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 rounded-lg disabled:opacity-50"
                    >
                      Submit Rejection
                    </button>
                    <button
                      onClick={() => setShowRejectInput(false)}
                      disabled={isSubmittingFeedback}
                      className="px-3 border border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-bold py-1.5 rounded-lg disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    disabled={isSubmittingFeedback}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 rounded-lg disabled:opacity-50"
                  >
                    Yes, Accept
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={isSubmittingFeedback}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 rounded-lg disabled:opacity-50"
                  >
                    No, Reject
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Timeline Toggle */}
          {issue.statusHistory && issue.statusHistory.length > 0 && (
            <div className="mb-4">
              <button 
                onClick={() => setShowTimeline(!showTimeline)}
                className="text-xs text-gray-500 hover:text-gray-700 font-semibold flex items-center gap-1 focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">
                  {showTimeline ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </span>
                {showTimeline ? 'Hide status history' : 'Show status history'}
              </button>

              {showTimeline && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-150 rounded-xl">
                  <div className="relative pl-4 border-l border-gray-300 space-y-4">
                    {issue.statusHistory.map((history, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
                        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                          <span className="uppercase">{history.status.replace('_', ' ')}</span>
                          <span className="text-gray-400 font-normal">{new Date(history.timestamp).toLocaleDateString()}</span>
                        </div>
                        {history.comment && (
                          <p className="text-xs text-gray-500 mt-1 italic">"{history.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center text-[11px] text-gray-400 gap-1">
              <span className="material-symbols-outlined text-base">person</span>
              <span className="truncate max-w-[100px]">{issue.reportedBy?.name || 'Anonymous'}</span>
            </div>

            {/* Upvote Button */}
            <button
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                hasUpvoted 
                  ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-sm'
                  : 'bg-white border-gray-250 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>👍</span>
              <span>{upvotesList.length}</span>
            </button>
          </div>

          {/* Admin status update controls (for Dashboard main view) */}
          {userRole === 'admin' && issue.status !== 'resolved' && onStatusUpdate && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
              {issue.status === 'pending' && (
                <button
                  onClick={() => onStatusUpdate(issue._id, 'in_progress')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Start Work
                </button>
              )}
              <button
                onClick={() => onStatusUpdate(issue._id, 'resolved')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Resolve Issue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
