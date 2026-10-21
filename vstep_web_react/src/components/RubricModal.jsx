import React, { useState, useEffect } from 'react';
import {
  Sliders,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Globe,
  Loader2,
  Table as TableIcon,
  Search,
  Filter,
  Layers,
  BookOpen,
  Shield,
  ShieldAlert,
  Edit3,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { RUBRIC_PRESET_EN, RUBRIC_PRESET_VI } from '../constants/translations';
import {
  VSTEP_OFFICIAL_MATRIX_VI,
  VSTEP_OFFICIAL_MATRIX_EN,
  getVstepBandLevel
} from '../constants/vstepRubricMatrix';
import { getRubricApi, saveRubricApi } from '../services/api';

const CRITERIA_KEYS = ['grammar', 'vocabulary', 'pronunciation', 'fluency', 'topic_development'];

export default function RubricModal({ isOpen, onClose }) {
  const { t, language } = useLanguage();
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'weights' | 'settings'
  const [rubricLang, setRubricLang] = useState('vi'); // 'vi' | 'en'
  const [rubricData, setRubricData] = useState(RUBRIC_PRESET_VI);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingScoreKey, setEditingScoreKey] = useState(null); // 'criterionId_score'

  // Accordion state for 5 criteria: First criterion (Ngữ pháp) expanded by default, others collapsed for neatness
  const [expandedCriteria, setExpandedCriteria] = useState({
    grammar: true,
    vocabulary: false,
    pronunciation: false,
    fluency: false,
    topic_development: false
  });

  // Matrix Filter States
  const [selectedCritFilter, setSelectedCritFilter] = useState('all'); // 'all' | 'grammar' | etc.
  const [selectedBandFilter, setSelectedBandFilter] = useState('all'); // 'all' | 'c1' | 'b2' | 'b1' | 'a'
  const [matrixSearch, setMatrixSearch] = useState('');

  // Active matrix object (VI or EN)
  const baseMatrix = rubricLang === 'en' ? VSTEP_OFFICIAL_MATRIX_EN : VSTEP_OFFICIAL_MATRIX_VI;

  // Fetch from backend when opened (ONLY on isOpen, do NOT re-fetch on rubricLang toggle)
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getRubricApi()
        .then((data) => {
          if (data && data.criteria) {
            setRubricData(data);
          } else {
            setRubricData(RUBRIC_PRESET_VI);
          }
        })
        .catch(() => {
          setRubricData(RUBRIC_PRESET_VI);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle individual criterion accordion
  const toggleCriterion = (criterionId) => {
    setExpandedCriteria((prev) => ({
      ...prev,
      [criterionId]: !prev[criterionId]
    }));
  };

  const expandAllCriteria = () => {
    setExpandedCriteria({
      grammar: true,
      vocabulary: true,
      pronunciation: true,
      fluency: true,
      topic_development: true
    });
  };

  const collapseAllCriteria = () => {
    setExpandedCriteria({
      grammar: false,
      vocabulary: false,
      pronunciation: false,
      fluency: false,
      topic_development: false
    });
  };

  // Switch between presets and language
  const handleSelectPreset = (lang) => {
    setRubricLang(lang);
    if (lang === 'en') {
      setRubricData(RUBRIC_PRESET_EN);
    } else {
      setRubricData(RUBRIC_PRESET_VI);
    }
  };

  // Calculate total weight
  const totalWeight = CRITERIA_KEYS.reduce((sum, key) => {
    const w = rubricData.criteria?.[key]?.weight || 0;
    return sum + Math.round(w * 100);
  }, 0);

  const isValidWeight = totalWeight === 100;

  const handleWeightChange = (key, val) => {
    if (!isAdmin) return;
    const num = Math.max(0, Math.min(100, parseInt(val) || 0));
    setRubricData((prev) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [key]: {
          ...prev.criteria?.[key],
          weight: num / 100.0
        }
      }
    }));
  };

  const handleAutoBalance = () => {
    if (!isAdmin) return;
    setRubricData((prev) => {
      const updatedCriteria = { ...prev.criteria };
      CRITERIA_KEYS.forEach((k) => {
        updatedCriteria[k] = { ...updatedCriteria[k], weight: 0.20 };
      });
      return { ...prev, criteria: updatedCriteria };
    });
  };

  const handleMatrixDescriptorChange = (criterionId, score, newText) => {
    if (!isAdmin) return;
    setRubricData((prev) => {
      const crit = prev.criteria?.[criterionId] || {};
      const bands = { ...(crit.band_descriptors || {}) };
      bands[String(score)] = newText;

      return {
        ...prev,
        criteria: {
          ...prev.criteria,
          [criterionId]: {
            ...crit,
            band_descriptors: bands
          }
        }
      };
    });
  };

  const handleDescChange = (key, val) => {
    if (!isAdmin) return;
    setRubricData((prev) => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [key]: {
          ...prev.criteria?.[key],
          description: val
        }
      }
    }));
  };

  const handleSettingChange = (field, val) => {
    if (!isAdmin) return;
    setRubricData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: val
      }
    }));
  };

  const handleWpmChange = (bound, val) => {
    if (!isAdmin) return;
    setRubricData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        wpm_range: {
          ...prev.settings?.wpm_range,
          [bound]: parseInt(val) || 0
        }
      }
    }));
  };

  const handleSave = async () => {
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền lưu cấu hình Rubric.');
      return;
    }
    if (!isValidWeight) {
      alert(t('rubric_alert_error'));
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await saveRubricApi(rubricData, role);
      setMessage(t('msg_rubric_saved') || 'Đã lưu cấu hình Barem thành công!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      alert('Lỗi lưu Rubric: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filter matrix criteria & scores
  const filteredCriteria = baseMatrix.criteria.filter((c) => {
    if (selectedCritFilter !== 'all' && c.id !== selectedCritFilter) return false;
    return true;
  });

  const getScoresForBandFilter = () => {
    if (selectedBandFilter === 'c1') return [10, 9];
    if (selectedBandFilter === 'b2') return [8, 7, 6];
    if (selectedBandFilter === 'b1') return [5, 4];
    if (selectedBandFilter === 'a') return [3, 2, 1, 0];
    return [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  };

  // Helper: Get descriptor text strictly according to current rubricLang
  const getDescriptorText = (criterionId, score, defaultText) => {
    if (rubricLang === 'en') {
      // In English mode, read from official English matrix
      const enCrit = VSTEP_OFFICIAL_MATRIX_EN.criteria.find((x) => x.id === criterionId);
      return enCrit?.descriptors?.[score] || defaultText || '';
    }
    // In Vietnamese mode, check if Admin modified in rubricData, else use official Vietnamese text
    const customDesc = rubricData?.criteria?.[criterionId]?.band_descriptors?.[String(score)];
    if (customDesc && typeof customDesc === 'string' && customDesc.trim()) {
      return customDesc;
    }
    const viCrit = VSTEP_OFFICIAL_MATRIX_VI.criteria.find((x) => x.id === criterionId);
    return viCrit?.descriptors?.[score] || defaultText || '';
  };

  return (
    <div className="modal-backdrop-blur">
      <div className="modal-window" style={{ maxWidth: '1060px', height: '92vh' }}>
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: isAdmin
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {isAdmin ? <Shield size={22} /> : <BookOpen size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {rubricLang === 'en'
                    ? 'VSTEP Speaking Rubric & Band Descriptors'
                    : 'Barem Tiêu Chí Chấm Thi Nói VSTEP (Bộ GD&ĐT)'}
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '99px',
                    background: isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(79, 70, 229, 0.15)',
                    color: isAdmin ? '#d97706' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isAdmin ? '👑 Quyền Admin (Được sửa)' : '👁️ Giáo viên (Chỉ xem)'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {rubricLang === 'en'
                  ? 'Official 5-Criteria Matrix (Scale 0-10) with CEFR Level Conversion (B1, B2, C1)'
                  : 'Bảng Barem 5 tiêu chí độc lập x Thang điểm 0-10 quy đổi Bậc năng lực (B1, B2, C1)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Role & Permission Alert Banner */}
        <div
          style={{
            padding: '8px 24px',
            background: isAdmin ? 'rgba(245, 158, 11, 0.08)' : 'rgba(79, 70, 229, 0.06)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAdmin ? (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={14} />
                Bạn đang ở chế độ Quản trị viên: Có thể chỉnh sửa nội dung Barem, thay đổi trọng số và lưu vĩnh viễn vào hệ thống.
              </span>
            ) : (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={14} />
                Chế độ Giáo viên (Chỉ xem): Bạn chỉ có quyền tra cứu tiêu chí để chấm bài. Quyền chỉnh sửa thuộc về Admin.
              </span>
            )}
          </div>

          {/* Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {rubricLang === 'en' ? 'Rubric Language:' : 'Ngôn ngữ Barem:'}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className={`btn-secondary-outline ${rubricLang === 'vi' ? 'active' : ''}`}
                style={{
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: rubricLang === 'vi' ? 'var(--primary-gradient)' : 'transparent',
                  color: rubricLang === 'vi' ? '#ffffff' : 'var(--text)',
                  borderColor: rubricLang === 'vi' ? 'var(--primary)' : 'var(--border)'
                }}
                onClick={() => handleSelectPreset('vi')}
              >
                🇻🇳 Tiếng Việt
              </button>
              <button
                type="button"
                className={`btn-secondary-outline ${rubricLang === 'en' ? 'active' : ''}`}
                style={{
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: rubricLang === 'en' ? 'var(--primary-gradient)' : 'transparent',
                  color: rubricLang === 'en' ? '#ffffff' : 'var(--text)',
                  borderColor: rubricLang === 'en' ? 'var(--primary)' : 'var(--border)'
                }}
                onClick={() => handleSelectPreset('en')}
              >
                🇬🇧 English (CEFR)
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--card)'
          }}
        >
          <button
            className={`btn-secondary-outline ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('matrix')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderRadius: '99px',
              borderColor: activeTab === 'matrix' ? 'var(--cyan)' : 'var(--border)',
              background: activeTab === 'matrix' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
              color: activeTab === 'matrix' ? '#ffffff' : 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700
            }}
          >
            <TableIcon size={14} />
            <span>{rubricLang === 'en' ? '1. Official Rubric Matrix 0-10' : '1. Bảng Barem Chuẩn 0-10'}</span>
          </button>

          <button
            className={`btn-secondary-outline ${activeTab === 'weights' ? 'active' : ''}`}
            onClick={() => setActiveTab('weights')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderRadius: '99px',
              borderColor: activeTab === 'weights' ? 'var(--primary)' : 'var(--border)',
              background: activeTab === 'weights' ? 'var(--primary-gradient)' : 'transparent',
              color: activeTab === 'weights' ? '#ffffff' : 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700
            }}
          >
            <Sliders size={14} />
            <span>{rubricLang === 'en' ? '2. Criteria Weights & AI' : '2. Trọng Số & Cài Đặt AI'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <Loader2 size={36} className="animate-spin" color="var(--primary)" />
            </div>
          ) : activeTab === 'matrix' ? (
            /* TAB 1: BẢNG BAREM CHUẨN 0-10 + BẢNG QUY ĐỔI BẬC NĂNG LỰC VSTEP */
            <div>
              {/* VSTEP Band Level Conversion Reference Card */}
              <div
                style={{
                  background: 'var(--score-box-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Award size={18} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                    {rubricLang === 'en'
                      ? 'VSTEP Proficiency Band Conversion Scale (Ministry of Education & Training):'
                      : 'Bảng Quy Đổi Điểm Số Sang Bậc Năng Lực VSTEP (Bộ GD&ĐT):'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: '10px'
                  }}
                >
                  {/* Band C1 */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1.5px solid #10b981'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.88rem' }}>
                        {rubricLang === 'en' ? 'Level 5 (C1)' : 'Bậc 5 (C1)'}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#10b981', fontSize: '0.82rem' }}>
                        8.5 – 10.0
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      {rubricLang === 'en' ? 'Proficient / Advanced User' : 'Năng lực thông thạo / Cao cấp'}
                    </p>
                  </div>

                  {/* Band B2 */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1.5px solid #6366f1'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.88rem' }}>
                        {rubricLang === 'en' ? 'Level 4 (B2)' : 'Bậc 4 (B2)'}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#6366f1', fontSize: '0.82rem' }}>
                        6.0 – 8.0
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      {rubricLang === 'en' ? 'Independent User / Good' : 'Năng lực độc lập / Khá'}
                    </p>
                  </div>

                  {/* Band B1 */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1.5px solid #f59e0b'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.88rem' }}>
                        {rubricLang === 'en' ? 'Level 3 (B1)' : 'Bậc 3 (B1)'}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#f59e0b', fontSize: '0.82rem' }}>
                        4.0 – 5.5
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      {rubricLang === 'en' ? 'Threshold / Passed B1' : 'Năng lực ngưỡng / Đạt chuẩn B1'}
                    </p>
                  </div>

                  {/* Below B1 */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1.5px solid #ef4444'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.88rem' }}>
                        {rubricLang === 'en' ? 'Below B1 (A1 - A2)' : 'Dưới B1 (A1 - A2)'}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#ef4444', fontSize: '0.82rem' }}>
                        0.0 – 3.5
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      {rubricLang === 'en' ? 'Elementary / Not Certified' : 'Sơ cấp / Chưa đạt chuẩn B1'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter & Accordion Action Bar */}
              <div
                style={{
                  background: 'var(--score-box-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '12px 18px',
                  marginBottom: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Search, Band Filter & Expand/Collapse All Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={matrixSearch}
                      onChange={(e) => setMatrixSearch(e.target.value)}
                      placeholder={
                        rubricLang === 'en'
                          ? 'Search keywords in descriptors (e.g., connectors, stress, vocabulary)...'
                          : 'Tìm từ khóa trong tiêu chí (vd: liên kết, thành ngữ, trọng âm, câu phức)...'
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text)',
                        fontSize: '0.82rem'
                      }}
                    />
                  </div>

                  {/* Expand / Collapse All Accordion Buttons */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-secondary-outline"
                      style={{ padding: '4px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={expandAllCriteria}
                      title="Mở toàn bộ 5 khung tiêu chí"
                    >
                      <ChevronDown size={14} />
                      <span>{rubricLang === 'en' ? 'Expand All' : 'Mở tất cả'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary-outline"
                      style={{ padding: '4px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={collapseAllCriteria}
                      title="Thu gọn cả 5 khung tiêu chí"
                    >
                      <ChevronRight size={14} />
                      <span>{rubricLang === 'en' ? 'Collapse All' : 'Thu gọn tất cả'}</span>
                    </button>
                  </div>

                  {/* Band Filter */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {rubricLang === 'en' ? 'Band:' : 'Bậc:'}
                    </span>
                    {[
                      { id: 'all', label: rubricLang === 'en' ? 'All (0-10)' : 'Tất cả (0-10)' },
                      { id: 'c1', label: 'C1 (9-10)', color: '#10b981' },
                      { id: 'b2', label: 'B2 (6-8)', color: '#6366f1' },
                      { id: 'b1', label: 'B1 (4-5)', color: '#f59e0b' },
                      { id: 'a', label: rubricLang === 'en' ? '< B1 (0-3)' : 'Dưới B1 (0-3)', color: '#ef4444' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBandFilter(b.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: selectedBandFilter === b.id ? (b.color || 'var(--primary)') : 'var(--border)',
                          background: selectedBandFilter === b.id ? (b.color ? `${b.color}22` : 'var(--score-box-bg)') : 'transparent',
                          color: selectedBandFilter === b.id ? (b.color || 'var(--text)') : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Criteria Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px' }}>
                    {rubricLang === 'en' ? 'Criteria Filter:' : 'Chọn Tiêu chí:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCritFilter('all')}
                    style={{
                      padding: '3px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      borderRadius: '99px',
                      border: '1px solid',
                      borderColor: selectedCritFilter === 'all' ? 'var(--cyan)' : 'var(--border)',
                      background: selectedCritFilter === 'all' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                      color: selectedCritFilter === 'all' ? 'var(--cyan)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {rubricLang === 'en' ? 'All 5 Criteria' : 'Tất cả 5 tiêu chí'}
                  </button>
                  {baseMatrix.criteria.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCritFilter(c.id);
                        // Khi click chọn 1 tiêu chí, tự động mở accordion của tiêu chí đó
                        setExpandedCriteria((prev) => ({ ...prev, [c.id]: true }));
                      }}
                      style={{
                        padding: '3px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        borderRadius: '99px',
                        border: '1px solid',
                        borderColor: selectedCritFilter === c.id ? c.color : 'var(--border)',
                        background: selectedCritFilter === c.id ? `${c.color}20` : 'transparent',
                        color: selectedCritFilter === c.id ? c.color : 'var(--text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accordion Descriptors List for the 5 Criteria */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredCriteria.map((c) => {
                  const isExpanded = !!expandedCriteria[c.id];
                  const scores = getScoresForBandFilter();
                  const matchingScores = scores.filter((score) => {
                    const desc = getDescriptorText(c.id, score, c.descriptors[score]);
                    if (!matrixSearch.trim()) return true;
                    return desc.toLowerCase().includes(matrixSearch.toLowerCase().trim());
                  });

                  if (matchingScores.length === 0) return null;

                  return (
                    <div
                      key={c.id}
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Clickable Accordion Header */}
                      <div
                        onClick={() => toggleCriterion(c.id)}
                        style={{
                          padding: '12px 20px',
                          background: isExpanded ? 'var(--score-box-bg)' : 'var(--card)',
                          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'background 0.2s ease'
                        }}
                        title={isExpanded ? 'Bấm để thu gọn' : 'Bấm để mở rộng xem các nấc điểm'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: c.color, margin: 0 }}>
                                {c.name}
                              </h4>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  padding: '1px 8px',
                                  borderRadius: '99px',
                                  background: 'rgba(6, 182, 212, 0.12)',
                                  color: 'var(--cyan)'
                                }}
                              >
                                {rubricLang === 'en' ? 'Weight: 20%' : 'Tỷ trọng: 20%'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                              {c.sub_criteria.map((sub, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-muted)'
                                  }}
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {isExpanded
                              ? (rubricLang === 'en' ? 'Click to collapse' : 'Bấm để thu gọn')
                              : (rubricLang === 'en' ? `Show ${matchingScores.length} scores (0-10)` : `Xem ${matchingScores.length} mức điểm (0-10)`)}
                          </span>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              background: isExpanded ? 'rgba(99, 102, 241, 0.15)' : 'var(--card-subtle)',
                              border: '1px solid var(--border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isExpanded ? 'var(--primary)' : 'var(--text-muted)',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.25s ease'
                            }}
                          >
                            <ChevronDown size={16} />
                          </div>
                        </div>
                      </div>

                      {/* Collapsible Content: Scores List (0 - 10) */}
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {matchingScores.map((score) => {
                            const bandInfo = getVstepBandLevel(score, rubricLang);
                            const currentDesc = getDescriptorText(c.id, score, c.descriptors[score]);
                            const isEditing = editingScoreKey === `${c.id}_${score}`;

                            return (
                              <div
                                key={score}
                                style={{
                                  padding: '12px 20px',
                                  borderBottom: '1px solid var(--border)',
                                  display: 'grid',
                                  gridTemplateColumns: '140px 1fr auto',
                                  gap: '14px',
                                  alignItems: 'start',
                                  background: score % 2 === 0 ? 'transparent' : 'var(--score-box-bg)'
                                }}
                              >
                                {/* Score & Band Badge */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                      style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '1.15rem',
                                        fontWeight: 800,
                                        color: bandInfo?.color || 'var(--text)'
                                      }}
                                    >
                                      {rubricLang === 'en' ? `Band ${score}` : `Điểm ${score}`}
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: bandInfo?.bg,
                                      color: bandInfo?.color,
                                      width: 'fit-content',
                                      border: `1px solid ${bandInfo?.color}40`
                                    }}
                                  >
                                    {bandInfo?.levelLabel}
                                  </span>
                                </div>

                                {/* Descriptor Text: 100% English when EN, 100% Vietnamese when VI */}
                                <div style={{ fontSize: '0.84rem', lineHeight: '1.55', color: 'var(--text)' }}>
                                  {isAdmin && isEditing ? (
                                    <textarea
                                      rows={3}
                                      value={currentDesc}
                                      onChange={(e) =>
                                        handleMatrixDescriptorChange(c.id, score, e.target.value)
                                      }
                                      style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: '1.5px solid var(--primary)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text)',
                                        fontSize: '0.82rem',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                      }}
                                    />
                                  ) : (
                                    <div style={{ whiteSpace: 'pre-line' }}>{currentDesc}</div>
                                  )}
                                </div>

                                {/* Action: Admin edit button */}
                                {isAdmin && (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingScoreKey(isEditing ? null : `${c.id}_${score}`)
                                      }
                                      style={{
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        color: isEditing ? 'var(--primary)' : 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.72rem'
                                      }}
                                    >
                                      <Edit3 size={12} />
                                      <span>{isEditing ? 'Xong' : 'Sửa'}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* TAB 2: TRỌNG SỐ 5 TIÊU CHÍ VÀ CÀI ĐẶT AI EXAMINER */
            <div>
              {/* Total Weight Card */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--score-box-bg)',
                  border: '1px solid var(--border)',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>
                      {t('rubric_total_weight_label')}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={handleAutoBalance}
                        className="btn-secondary-outline"
                        style={{ padding: '2px 10px', fontSize: '0.74rem', color: 'var(--cyan)' }}
                      >
                        <Sparkles size={12} />
                        <span>{t('rubric_balance_btn')}</span>
                      </button>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      padding: '2px 10px',
                      borderRadius: '99px',
                      background: isValidWeight ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isValidWeight ? '#10b981' : '#ef4444'
                    }}
                  >
                    {isValidWeight ? t('rubric_total_valid') : `${totalWeight}% (Cần đủ 100%)`}
                  </span>
                </div>
                <div style={{ height: '8px', borderRadius: '99px', background: 'var(--border)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(totalWeight, 100)}%`,
                      background: isValidWeight ? '#10b981' : '#ef4444'
                    }}
                  />
                </div>
              </div>

              {/* 5 Criteria Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {CRITERIA_KEYS.map((key) => {
                  const crit = rubricData.criteria?.[key] || {};
                  const currentPercent = Math.round((crit.weight || 0) * 100);

                  return (
                    <div
                      key={key}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        background: 'var(--score-box-bg)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{crit.name || key}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="5"
                            disabled={!isAdmin}
                            value={currentPercent}
                            onChange={(e) => handleWeightChange(key, e.target.value)}
                            style={{
                              width: '56px',
                              padding: '4px',
                              borderRadius: '6px',
                              border: '1.5px solid var(--border)',
                              background: isAdmin ? 'var(--input-bg)' : 'transparent',
                              color: 'var(--text)',
                              textAlign: 'center',
                              fontWeight: 700
                            }}
                          />
                          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>%</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        disabled={!isAdmin}
                        value={currentPercent}
                        onChange={(e) => handleWeightChange(key, e.target.value)}
                        style={{ width: '100%', marginBottom: '8px', accentColor: 'var(--primary)', cursor: isAdmin ? 'pointer' : 'not-allowed' }}
                      />

                      <textarea
                        rows={2}
                        disabled={!isAdmin}
                        value={crit.description || ''}
                        onChange={(e) => handleDescChange(key, e.target.value)}
                        placeholder="Mô tả tiêu chí..."
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: isAdmin ? 'var(--input-bg)' : 'transparent',
                          color: 'var(--text)',
                          fontSize: '0.8rem',
                          resize: 'none',
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* AI Examiner Settings */}
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '12px' }}>
                {rubricLang === 'en' ? 'AI Examiner Configuration' : 'Cấu hình Giám Khảo AI & Tốc Độ Nói'}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--score-box-bg)', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px' }}>
                    {t('rubric_strictness_label')}
                  </label>
                  <select
                    disabled={!isAdmin}
                    value={rubricData.settings?.examiner_strictness || 'standard'}
                    onChange={(e) => handleSettingChange('examiner_strictness', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.84rem' }}
                  >
                    <option value="standard">{t('rubric_strictness_standard')}</option>
                    <option value="strict">{t('rubric_strictness_strict')}</option>
                    <option value="lenient">{t('rubric_strictness_lenient')}</option>
                  </select>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--score-box-bg)', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px' }}>
                    {t('rubric_lang_label')}
                  </label>
                  <select
                    disabled={!isAdmin}
                    value={rubricData.settings?.feedback_language || 'vi'}
                    onChange={(e) => handleSettingChange('feedback_language', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.84rem' }}
                  >
                    <option value="vi">{t('rubric_lang_vi')}</option>
                    <option value="en">{t('rubric_lang_en')}</option>
                  </select>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--score-box-bg)', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px' }}>
                    {rubricLang === 'en' ? 'Target WPM Range (Words/min)' : 'Tốc độ nói mục tiêu (WPM)'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      disabled={!isAdmin}
                      value={rubricData.settings?.wpm_range?.min || 110}
                      onChange={(e) => handleWpmChange('min', e.target.value)}
                      style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', textAlign: 'center' }}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      disabled={!isAdmin}
                      value={rubricData.settings?.wpm_range?.max || 150}
                      onChange={(e) => handleWpmChange('max', e.target.value)}
                      style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>từ/phút</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--card)'
          }}
        >
          {message ? (
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={16} />
              {message}
            </span>
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              * Barem VSTEP theo Công văn & Quy chế thi chuẩn năng lực ngoại ngữ của Bộ GD&ĐT
            </span>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary-outline" onClick={onClose} disabled={saving}>
              {t('rubric_btn_close')}
            </button>
            {isAdmin && (
              <button
                className="btn-primary-gradient"
                disabled={!isValidWeight || saving}
                onClick={handleSave}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{t('rubric_btn_save')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
