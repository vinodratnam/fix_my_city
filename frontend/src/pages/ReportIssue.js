import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const DEFAULT_LAT = 13.0827; // Chennai default
const DEFAULT_LNG = 80.2707;

const ReportIssue = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pothole',
    address: '',
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState('');
  const [locationStatus, setLocationStatus] = useState('detecting');
  const navigate = useNavigate();

  // All hooks must come before any conditional returns
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLocationStatus('detected');
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          setLocationStatus('fallback');
          // Keep defaults (Chennai)
        },
        { timeout: 8000 }
      );
    } else {
      setLocationStatus('unavailable');
    }
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Redirecting to login...</div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      setLoading(false);
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      setLoading(false);
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      setError('Location coordinates are required. Please allow location access or enter manually.');
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title.trim());
    formDataToSend.append('description', formData.description.trim());
    formDataToSend.append('type', formData.type);
    formDataToSend.append('address', formData.address.trim());
    formDataToSend.append('latitude', formData.latitude);
    formDataToSend.append('longitude', formData.longitude);
    // Only append image if one was actually selected
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      await api.post('/issues', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Issue reported successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      console.error('Error creating issue:', err);
      const msg = err.response?.data?.message || err.message || 'Network error. Is the backend running?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report Infrastructure Issue</h1>
          <p className="text-gray-600 mt-2">Help improve your community by reporting civic infrastructure problems.</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-semibold">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow-md rounded-xl px-6 py-8 space-y-6">

            {/* Issue Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Large pothole on MG Road near Gate 3"
                className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Issue Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-1">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                id="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="pothole">🕳️ Pothole</option>
                <option value="streetlight">💡 Broken Streetlight</option>
                <option value="water_leakage">💧 Water Leakage</option>
                <option value="garbage_overflow">🗑️ Garbage Overflow</option>
                <option value="public_property">🏛️ Damaged Public Property</option>
                <option value="other">⚠️ Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail. Include severity, how long it has existed, and any safety concerns..."
                className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-1">
                Address / Location Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                id="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter the exact address, landmark, or area description"
                className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* GPS Coordinates */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                GPS Coordinates
                {locationStatus === 'detected' && (
                  <span className="ml-2 text-xs font-normal text-green-600">✓ Auto-detected</span>
                )}
                {locationStatus === 'fallback' && (
                  <span className="ml-2 text-xs font-normal text-yellow-600">⚠ Using default (Chennai). You can edit below.</span>
                )}
                {locationStatus === 'detecting' && (
                  <span className="ml-2 text-xs font-normal text-blue-500">Detecting...</span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    id="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    id="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-1">
                Photo Evidence <span className="text-gray-400 font-normal">(Optional, max 5MB)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg mx-auto" />
                  ) : (
                    <div className="py-4">
                      <div className="text-3xl mb-2">📸</div>
                      <div className="text-sm text-gray-600">Click to upload a photo</div>
                      <div className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP supported</div>
                    </div>
                  )}
                </label>
                {preview && (
                  <button
                    type="button"
                    onClick={() => { setPreview(''); setFormData(prev => ({ ...prev, image: null })); }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Submit */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 py-3 px-8 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              style={{ flexGrow: 2 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting...
                </span>
              ) : '📝 Submit Issue Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
