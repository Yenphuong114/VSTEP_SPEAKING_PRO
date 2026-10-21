import React from 'react';
import {
  Mic,
  Layers,
  Scale,
  Clock,
  Sliders,
  Moon,
  Sun,
  Globe,
  LogOut,
  X,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenRubric,
  mobileOpen,
  setMobileOpen
}) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { role, logout } = useAuth();

  const handleNav = (tab) => {
    setActiveTab(tab);
    if (setMobileOpen) setMobileOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'vi' ? 'en' : 'vi'));
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 90
          }}
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Header / Logo */}
        <div className="sb-header">
          <div className="sb-logo-badge">
            <Mic size={22} />
          </div>
          <div className="sb-title-group">
            <h2>{t('app_title')}</h2>
            <p>AI Assessment Suite</p>
          </div>
          <span className="sb-badge-version" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff', fontWeight: 800, padding: '3px 8px', borderRadius: '8px', fontSize: '0.68rem', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)' }}>
            ⚡ React v2.0
          </span>

          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Card */}
        <div className="sb-user-card">
          <div className="sb-avatar">
            {role === 'admin' ? '👑' : 'GV'}
          </div>
          <div className="sb-user-meta">
            <div className="sb-user-name">{t('sidebar_user_label')}</div>
            <span className={`sb-role-tag ${role === 'admin' ? 'admin' : 'teacher'}`}>
              {role === 'admin' ? '👑 Admin' : 'Giảng viên'}
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="sb-menu">
          <div className="sb-category">{t('sidebar_section_tools')}</div>

          <button
            className={`sb-nav-button ${activeTab === 'grade' ? 'active' : ''}`}
            onClick={() => handleNav('grade')}
          >
            <Mic size={18} />
            <span>{t('nav_grade')}</span>
          </button>

          <button
            className={`sb-nav-button ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => handleNav('batch')}
          >
            <Layers size={18} />
            <span>{t('nav_batch')}</span>
          </button>

          <button
            className={`sb-nav-button ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => handleNav('compare')}
          >
            <Scale size={18} />
            <span>{t('nav_compare')}</span>
            <span className="sb-item-badge-new">{t('badge_new')}</span>
          </button>

          <button
            className={`sb-nav-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleNav('history')}
          >
            <Clock size={18} />
            <span>{t('nav_history')}</span>
          </button>

          <div className="sb-category" style={{ marginTop: '12px' }}>
            {t('sidebar_section_config')}
          </div>

          <button
            className="sb-nav-button"
            onClick={() => {
              if (onOpenRubric) onOpenRubric();
              if (setMobileOpen) setMobileOpen(false);
            }}
          >
            <Sliders size={18} />
            <span>{t('nav_rubric')}</span>
            {role !== 'admin' && (
              <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: 'auto' }}>
                🔒
              </span>
            )}
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="sb-footer">
          {/* Theme Toggle */}
          <button className="sb-footer-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} />}
            <span>{theme === 'dark' ? 'Chế độ Sáng' : 'Chế độ Tối'}</span>
          </button>

          {/* Language Toggle */}
          <button className="sb-footer-btn" onClick={toggleLanguage}>
            <Globe size={17} />
            <span>{language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}</span>
          </button>

          {/* Logout Button */}
          <button className="sb-footer-btn danger" onClick={logout}>
            <LogOut size={17} />
            <span>{t('logout_btn')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
