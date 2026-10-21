import React, { useState } from 'react';
import { Mic, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginOverlay() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setErrorMsg('');

    const res = await login(password.trim());
    setLoading(false);

    if (!res.success) {
      setIsShaking(true);
      setErrorMsg(t('login_error_wrong'));
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #0b0f19 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className={`glass-card ${isShaking ? 'shake' : ''}`}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          padding: '40px 32px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          borderRadius: '24px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.45)',
              marginBottom: '16px'
            }}
          >
            <Mic size={28} />
          </div>
          <span
            style={{
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '99px',
              display: 'inline-block',
              marginBottom: '8px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
            }}
          >
            ⚡ React Core v2.0
          </span>
          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 800 }}>
            {t('login_title')}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            {t('login_subtitle')}
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '8px'
            }}
          >
            {t('login_password_label')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login_password_placeholder')}
            autoFocus
            style={{
              width: '100%',
              padding: '13px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontSize: '0.95rem',
              outline: 'none',
              marginBottom: '8px',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              fontFamily: 'inherit'
            }}
          />
          <small
            style={{
              display: 'block',
              color: '#64748b',
              fontSize: '0.74rem',
              marginBottom: '16px',
              lineHeight: 1.4
            }}
          >
            🔒 Mật khẩu theo cấu hình trong file <code style={{ color: '#06b6d4' }}>back_end/.env</code> (ví dụ: <code style={{ color: '#a5b4fc' }}>vstep_teacher_2025</code>)
          </small>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-gradient"
            style={{ width: '100%', borderRadius: '12px', padding: '13px' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>{t('login_btn')}</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
