import { useState, useRef, useEffect } from 'react';
import { useIoTData } from '../hooks/useIoTData';
import Sidebar from '../sections/Sidebar';
import TopBar from '../sections/TopBar';
import HeroSection from '../sections/HeroSection';
import KpiSection from '../sections/KpiSection';
import ChartsSection from '../sections/ChartsSection';
import AlertsSection from '../sections/AlertsSection';
import PredictionSection from '../sections/PredictionSection';
import DeviceSection from '../sections/DeviceSection';
import MapSection from '../sections/MapSection';
import Footer from '../sections/Footer';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const {
    readings,
    alerts,
    devices,
    predictions,
    floatingMetrics,
    currentTime,
    latestReading,
    unreadAlertsCount,
    markAlertAsRead,
  } = useIoTData();

  const alertsRef = useRef<HTMLDivElement>(null);

  const handleAlertsClick = () => {
    setActiveSection('alerts');
    setTimeout(() => {
      alertsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to alerts section when active
  useEffect(() => {
    if (activeSection === 'alerts' && alertsRef.current) {
      alertsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-iot-bg">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />

      {/* Main Content */}
      <div className="ml-64 transition-all duration-300">
        {/* Top Bar */}
        <TopBar
          currentTime={currentTime}
          unreadAlerts={unreadAlertsCount}
          onAlertsClick={handleAlertsClick}
        />

        {/* Page Content */}
        <main className="p-6 space-y-8">
          {/* Hero Section */}
          <HeroSection floatingMetrics={floatingMetrics} />

          {/* KPI Cards */}
          <KpiSection latestReading={latestReading} />

          {/* Charts */}
          <ChartsSection readings={readings} />

          {/* Alerts */}
          <div ref={alertsRef}>
            <AlertsSection alerts={alerts} onMarkAsRead={markAlertAsRead} />
          </div>

          {/* Predictions */}
          <PredictionSection predictions={predictions} readings={readings} />

          {/* Device Status */}
          <DeviceSection devices={devices} />

          {/* Map */}
          <MapSection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
