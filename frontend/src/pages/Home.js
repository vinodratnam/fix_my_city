import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">CivicWatch</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Empowering communities to report, track, and resolve infrastructure issues together. 
              Make your neighborhood a better place to live.
            </p>
            <div className="flex justify-center gap-4">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-lg font-semibold text-lg transition-all border-2 border-gray-200 shadow-md"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive infrastructure monitoring and reporting services to help communities thrive.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-blue-600">report_problem</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Issue Reporting</h3>
            <p className="text-gray-600 mb-4">
              Report infrastructure problems like potholes, broken streetlights, water leaks, and garbage overflow with photos and precise location details.
            </p>
            <Link to={user ? "/report-issue" : "/login"} className="text-blue-600 font-semibold hover:text-blue-700">
              Report Now →
            </Link>
          </div>

          {/* Service 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-green-600">map</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Tracking</h3>
            <p className="text-gray-600 mb-4">
              Track the status of your reported issues in real-time. See when authorities acknowledge, start working on, and resolve problems.
            </p>
            <Link to={user ? "/map" : "/login"} className="text-green-600 font-semibold hover:text-green-700">
              View Map →
            </Link>
          </div>

          {/* Service 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-purple-600">analytics</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Get insights into infrastructure patterns, resolution times, and community engagement with comprehensive analytics and statistics.
            </p>
            <Link to={user ? "/dashboard" : "/login"} className="text-purple-600 font-semibold hover:text-purple-700">
              View Analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CivicWatch?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of citizens making a difference in their communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Issue Reporting</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">Fast</div>
              <div className="text-gray-600">Response Time</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600">Transparent</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-orange-600 mb-2">Free</div>
              <div className="text-gray-600">For Everyone</div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-blue-600">verified</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-600">Simple interface for reporting issues with photos and location. No technical knowledge required.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-green-600">speed</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Resolution</h3>
                <p className="text-gray-600">Direct connection with local authorities ensures faster response and problem resolution.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-purple-600">groups</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Driven</h3>
                <p className="text-gray-600">Join a community of active citizens working together to improve local infrastructure.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-orange-600">notifications_active</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                <p className="text-gray-600">Get instant notifications when your reported issues are acknowledged or resolved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resolved Problems Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Problems We Help Resolve</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From small neighborhood issues to major infrastructure problems, we help communities get results.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all">
            <span className="text-4xl mb-3 block">🕳️</span>
            <div className="font-semibold text-gray-900">Potholes</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all">
            <span className="text-4xl mb-3 block">💡</span>
            <div className="font-semibold text-gray-900">Streetlights</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all">
            <span className="text-4xl mb-3 block">💧</span>
            <div className="font-semibold text-gray-900">Water Leaks</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all">
            <span className="text-4xl mb-3 block">🗑️</span>
            <div className="font-semibold text-gray-900">Garbage</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all">
            <span className="text-4xl mb-3 block">🏛️</span>
            <div className="font-semibold text-gray-900">Public Property</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all">
            <span className="text-4xl mb-3 block">⚠️</span>
            <div className="font-semibold text-gray-900">Other Issues</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who are already improving their communities with CivicWatch.
          </p>
          {!user ? (
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
            >
              Start Reporting Today
            </Link>
          ) : (
            <Link
              to="/report-issue"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
            >
              Report an Issue
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CivicWatch</h3>
              <p className="text-gray-400">
                Empowering communities to report, track, and resolve infrastructure issues together.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to={user ? "/dashboard" : "/login"} className="hover:text-white">Dashboard</Link></li>
                <li><Link to={user ? "/map" : "/login"} className="hover:text-white">Map View</Link></li>
                <li><Link to={user ? "/report-issue" : "/login"} className="hover:text-white">Report Issue</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">
                Have questions? Reach out to us for support.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 CivicWatch. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
