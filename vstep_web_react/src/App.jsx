import React, { useState } from 'react';
import { Menu, Mic } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useHistory } from './hooks/useHistory';

import Sidebar from './components/Sidebar';
import LoginOverlay from './components/LoginOverlay';
import GradePage from './components/GradePage';
import BatchPage from './components/BatchPage';
import ComparePage from './components/ComparePage';
import HistoryPage from './components/HistoryPage';
import RubricModal from './components/RubricModal';

function MainApp() {
  const { isAuthenticated, role } = useAuth();
  const { t } = useLanguage();
  const historyHook = useHistory();

  const [activeTab, setActiveTab] = useState('grade'); // 'grade' | 'batch' | 'compare' | 'history'
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If not authenticated, display login overlay
  if (!isAuthenticated) {
    return <LoginOverlay />;
  }

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <div className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <Mic size={15} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>VSTEP Pro</span>
        </div>

        <div style={{ width: '38px' }} />
      </div>

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRubric={() => setIsRubricOpen(true)}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {activeTab === 'grade' && <GradePage historyHook={historyHook} />}
        {activeTab === 'batch' && <BatchPage historyHook={historyHook} />}
        {activeTab === 'compare' && <ComparePage historyHook={historyHook} />}
        {activeTab === 'history' && <HistoryPage historyHook={historyHook} />}
      </main>

      {/* Rubric Config Modal */}
      <RubricModal
        isOpen={isRubricOpen}
        onClose={() => setIsRubricOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
