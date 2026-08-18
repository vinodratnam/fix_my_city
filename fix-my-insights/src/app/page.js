'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesGrid from '../components/FeaturesGrid';
import MapSection from '../components/MapSection';
import TrackingTimeline from '../components/TrackingTimeline';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import ReportModal from '../components/ReportModal';

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [modalOpen, setModalOpen] = useState(false);
  const [customIssues, setCustomIssues] = useState([]);
  const [apiIssues, setApiIssues] = useState([]);

  // Apply theme class to HTML/Body on change
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch live issues from Express backend
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/issues?limit=50');
        if (res.ok) {
          const data = await res.json();
          if (data && data.issues) {
            const typeMap = {
              pothole: 'pothole',
              streetlight: 'streetlight',
              water_leakage: 'water',
              garbage_overflow: 'garbage',
              public_property: 'pavement',
              road_damage: 'pavement',
              tree_fallen: 'tree',
              traffic_signal: 'traffic',
              other: 'pavement'
            };
            const statusMap = {
              'pending': 'live',
              'in-progress': 'progress',
              'resolved': 'resolved',
              'critical': 'urgent'
            };
            const icons = {
              pothole: '🕳️',
              streetlight: '💡',
              water: '💧',
              garbage: '🗑️',
              pavement: '🛤️',
              tree: '🌳',
              traffic: '🚦'
            };
            const formatted = data.issues.map(iss => {
              const lng = iss.location?.coordinates?.[0] || 77.2;
              const lat = iss.location?.coordinates?.[1] || 28.5;
              
              // Seed deterministic x, y percentages on the SVG map (range 15% to 85%)
              const x = 15 + (Math.abs(Math.sin(lng * 1000)) * 70);
              const y = 15 + (Math.abs(Math.cos(lat * 1000)) * 70);

              return {
                id: iss._id,
                title: iss.title,
                type: typeMap[iss.type] || 'pothole',
                icon: icons[typeMap[iss.type] || 'pothole'] || '📍',
                status: statusMap[iss.status] || 'live',
                priority: iss.priority || 'medium',
                description: iss.description,
                address: iss.location?.address || 'Reported Location',
                latitude: lat,
                longitude: lng,
                x: parseFloat(x.toFixed(1)),
                y: parseFloat(y.toFixed(1)),
                upvotes: iss.upvotes?.length || 0,
                time: new Date(iss.createdAt).toLocaleDateString(),
                dept: iss.department || 'Auto-assigned',
                imageUrl: iss.imageUrl,
                afterImageUrl: iss.afterImageUrl,
              };
            });
            setApiIssues(formatted);
          }
        }
      } catch (err) {
        console.warn("Could not connect to live backend API. Using fallback mock data.");
      }
    };

    fetchIssues();
    const interval = setInterval(fetchIssues, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleReportClick = () => {
    setModalOpen(true);
  };

  const handleNewReportSuccess = (newIssue) => {
    // Generate simulated geographic positions within range for the interactive SVG Map
    // Latitude range: 28.3 - 28.7, Longitude range: 77.0 - 77.4
    const randomLat = 28.3 + Math.random() * 0.4;
    const randomLng = 77.0 + Math.random() * 0.4;
    
    const formattedIssue = {
      ...newIssue,
      lat: parseFloat(randomLat.toFixed(3)),
      lng: parseFloat(randomLng.toFixed(3)),
      address: newIssue.address || 'Reported Location',
    };

    setCustomIssues(prev => [formattedIssue, ...prev]);
  };

  return (
    <div className="relative min-h-screen flex flex-col noise">
      
      {/* Navbar Section */}
      <Navbar theme={theme} toggleTheme={toggleTheme} onReportClick={handleReportClick} />

      {/* Hero Section */}
      <HeroSection onReportClick={handleReportClick} />

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Interactive Map Section */}
      <MapSection customIssues={customIssues} apiIssues={apiIssues} />

      {/* Timeline Tracking Section */}
      <TrackingTimeline apiIssues={apiIssues} />

      {/* AI-Powered Analytics Dashboard */}
      <AnalyticsDashboard />

      {/* Social Proof Testimonials */}
      <Testimonials />

      {/* Interactive FAQ Section */}
      <FAQ />

      {/* Sleek footer */}
      <Footer />

      {/* Multi-step reporting wizard modal */}
      <ReportModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleNewReportSuccess} 
      />

      {/* Mobile-first Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <button
          onClick={handleReportClick}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #2563EB, #8B5CF6)',
            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <span className="text-2xl animate-pulse">➕</span>
        </button>
      </div>

    </div>
  );
}
