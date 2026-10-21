import React, { useState, useMemo } from 'react';
import {
  Scale,
  FileAudio,
  Target,
  Ruler,
  Wand2,
  Save,
  BarChart2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Trash2,
  Star,
  Layers,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { exportComparisonToExcel } from '../utils/exportExcel';
import { getVstepBandLevel } from '../constants/vstepRubricMatrix';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ComparePage({ historyHook }) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const {
    history,
    updateTeacherScore,
    autoDetectTeacherScores,
    getGroupedHistory,
    setPrimaryAttempt,
    deleteHistoryItem,
    deleteOldAttemptsForFile,
    computeStats,
    loadSampleData,
    clearAllHistory
  } = historyHook;

  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({}); // { [key]: boolean }

  // Chart configuration
  const [chartMode, setChartMode] = useState('histogram'); // 'histogram' | 'paged'
  const [chartScope, setChartScope] = useState('recent'); // 'recent' | 'worst' | 'all'
  const [chartPage, setChartPage] = useState(0);
  const CHART_PAGE_SIZE = 10;

  const groupedFiles = useMemo(() => getGroupedHistory(), [getGroupedHistory]);
  const stats = useMemo(() => computeStats(), [computeStats]);

  const toggleExpand = (key) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleScoreChange = (id, val) => {
    const num = val === '' ? null : parseFloat(val);
    updateTeacherScore(id, isNaN(num) ? null : num);
  };

  const handleAutoDetect = () => {
    const count = autoDetectTeacherScores();
    setSavedSuccessMsg(`Đã nhận diện ${count} điểm GV từ tên file!`);
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const handleLoadSample = () => {
    loadSampleData();
    setSavedSuccessMsg('✨ Đã nạp 4 bài thi mẫu (có bài test 3 lần & các mức lệch điểm)!');
    setTimeout(() => setSavedSuccessMsg(''), 4000);
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa sạch toàn bộ lịch sử bài thi?')) {
      clearAllHistory();
      setSavedSuccessMsg('Đã xóa sạch lịch sử.');
      setTimeout(() => setSavedSuccessMsg(''), 3000);
    }
  };

  const handleExportExcel = () => {
    exportComparisonToExcel(groupedFiles, stats);
    setSavedSuccessMsg('Đã xuất file Excel thành công!');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  // Prepare Histogram Data (Mode 1 - 3 cột chuẩn)
  const histogramData = {
    labels: ['🟢 Khớp cao (≤ 0.5đ)', '🟡 Chấp nhận (0.6 - 1.0đ)', '🔴 Bất đồng (> 1.0đ)'],
    datasets: [
      {
        label: 'Số lượng bài thi',
        data: [
          stats.distribution?.high || 0,
          stats.distribution?.moderate || 0,
          stats.distribution?.low || 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  // Prepare Paged Bar Chart Data (Mode 2 - phân trang tối đa 10 file)
  const itemsWithTeacher = useMemo(() => {
    return groupedFiles
      .map(g => g.primary)
      .filter(item => item.teacher_score !== null && item.teacher_score !== undefined);
  }, [groupedFiles]);

  const pagedItems = useMemo(() => {
    let sorted = [...itemsWithTeacher];
    if (chartScope === 'worst') {
      // Sort by largest difference descending
      sorted.sort((a, b) => Math.abs(b.score - Number(b.teacher_score)) - Math.abs(a.score - Number(a.teacher_score)));
    }

    if (chartScope === 'all') {
      return sorted;
    }

    const start = chartPage * CHART_PAGE_SIZE;
    return sorted.slice(start, start + CHART_PAGE_SIZE);
  }, [itemsWithTeacher, chartScope, chartPage]);

  const totalChartPages = Math.ceil(itemsWithTeacher.length / CHART_PAGE_SIZE) || 1;

  const pagedBarData = {
    labels: pagedItems.map((h, i) => (h.filename ? (h.filename.length > 18 ? h.filename.substring(0, 16) + '...' : h.filename) : `Bài ${i + 1}`)),
    datasets: [
      {
        label: 'Điểm AI',
        data: pagedItems.map(h => h.score || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6
      },
      {
        label: 'Điểm Giáo Viên',
        data: pagedItems.map(h => h.teacher_score || 0),
        backgroundColor: 'rgba(6, 182, 212, 0.8)',
        borderColor: '#06b6d4',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: chartMode === 'histogram' ? undefined : 10,
        grid: { color: theme === 'dark' ? '#23304a' : '#e2e8f0' },
        ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b', maxRotation: 25 }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
          font: { family: 'Plus Jakarta Sans', weight: 600 }
        }
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-hero">
        <h1>
          <Scale size={28} color="#06b6d4" />
          <span>{t('compare_title')}</span>
        </h1>
        <p>{t('compare_subtitle')}</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid-3col" style={{ marginBottom: '20px' }}>
        <div className="kpi-stat-card">
          <div className="kpi-icon-wrap indigo">
            <FileAudio size={24} />
          </div>
          <div>
            <div className="kpi-num">{groupedFiles.length}</div>
            <div className="kpi-txt">File duy nhất ({history.length} lượt chấm)</div>
          </div>
        </div>

        <div className="kpi-stat-card">
          <div className="kpi-icon-wrap cyan">
            <Target size={24} />
          </div>
          <div>
            <div className="kpi-num">
              {stats.agreementPct !== null ? `${stats.agreementPct}%` : '--%'}
            </div>
            <div className="kpi-txt">{t('kpi_agreement')}</div>
          </div>
        </div>

        <div className="kpi-stat-card">
          <div className="kpi-icon-wrap amber">
            <Ruler size={24} />
          </div>
          <div>
            <div className="kpi-num">{stats.mae !== null ? stats.mae : '--'}</div>
            <div className="kpi-txt">{t('kpi_mae')} (Điểm TB: AI {stats.avgAi || '-'} / GV {stats.avgGv || '-'})</div>
          </div>
        </div>
      </div>

      {/* Agreement Rate Progress Bar */}
      {stats.agreementPct !== null && (
        <div className="glass-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.86rem', marginBottom: '8px' }}>
            <span>{t('agreement_label')}</span>
            <span style={{ color: stats.agreementPct >= 80 ? '#10b981' : '#f59e0b' }}>
              {stats.agreementPct}% ({stats.distribution?.pctHigh}% bài khớp hoàn hảo)
            </span>
          </div>
          <div style={{ height: '10px', borderRadius: '99px', background: 'var(--border)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${stats.agreementPct}%`,
                background:
                  stats.agreementPct >= 80
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : stats.agreementPct >= 65
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #ef4444, #f87171)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn-primary-gradient"
            style={{ padding: '9px 18px', fontSize: '0.85rem' }}
            onClick={handleExportExcel}
            disabled={groupedFiles.length === 0}
          >
            <FileSpreadsheet size={16} />
            <span>Xuất Báo Cáo Excel (.xlsx)</span>
          </button>

          <button className="btn-secondary-outline" onClick={handleAutoDetect}>
            <Wand2 size={16} />
            <span>{t('btn_auto_detect')}</span>
          </button>

          <button
            className="btn-secondary-outline"
            onClick={handleLoadSample}
            style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Nạp ngay 4 bài thi mẫu có bài test 3 lần & phân phối lệch điểm"
          >
            <Sparkles size={16} />
            <span>✨ Nạp Dữ Liệu Mẫu (Demo)</span>
          </button>

          {history.length > 0 && (
            <button
              className="btn-secondary-outline"
              onClick={handleClearAll}
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              title="Xóa sạch lịch sử để reset trắng"
            >
              <Trash2 size={15} />
              <span>Xóa Hết</span>
            </button>
          )}

          {savedSuccessMsg && (
            <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={16} />
              {savedSuccessMsg}
            </span>
          )}
        </div>

        <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
          💡 Các file test nhiều lần được tự động gom nhóm chống trùng lặp
        </small>
      </div>

      {/* Grouped Comparison Table */}
      <div className="table-responsive-box" style={{ marginBottom: '24px' }}>
        <table className="custom-data-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ minWidth: '220px' }}>{t('col_filename')}</th>
              <th colSpan={2}>Grammar</th>
              <th colSpan={2}>Vocab</th>
              <th colSpan={2}>Pronun</th>
              <th colSpan={2}>Fluency</th>
              <th colSpan={2}>Topic Dev</th>
              <th rowSpan={2}>{t('col_ai_total')}</th>
              <th rowSpan={2}>{t('col_gv_score')}</th>
              <th rowSpan={2}>{t('col_match')}</th>
              <th rowSpan={2}>Thao tác</th>
            </tr>
            <tr>
              <th>AI</th><th>GV*</th>
              <th>AI</th><th>GV*</th>
              <th>AI</th><th>GV*</th>
              <th>AI</th><th>GV*</th>
              <th>AI</th><th>GV*</th>
            </tr>
          </thead>
          <tbody>
            {groupedFiles.length === 0 ? (
              <tr>
                <td colSpan={15} style={{ padding: '50px 20px', textAlign: 'center' }}>
                  <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                      <Sparkles size={28} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>
                      Chưa có bài thi nào trong lịch sử để đối chiếu
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Bạn có thể chấm bài mới ở tab <strong>Chấm Điểm Đơn / Hàng Loạt</strong>, hoặc bấm nút dưới đây để <strong>nạp 4 bài thi mẫu</strong> nhằm thấy ngay tính năng <strong>Biểu đồ 3 cột</strong>, <strong>Gom nhóm file test nhiều lần</strong> và <strong>Xuất Excel</strong>.
                    </p>
                    <button
                      className="btn-primary-gradient"
                      onClick={handleLoadSample}
                      style={{ padding: '10px 22px', fontSize: '0.88rem', marginTop: '6px' }}
                    >
                      <Sparkles size={16} />
                      <span>✨ Nạp 4 Bài Mẫu Thử Nghiệm Ngay</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              groupedFiles.map((group) => {
                const item = group.primary;
                const isExpanded = expandedGroups[group.key];
                const hasMultiple = group.attempts.length > 1;

                const gvScore = item.teacher_score !== null && item.teacher_score !== undefined ? item.teacher_score : '';
                const hasGv = gvScore !== '';
                const diff = hasGv ? Math.abs(item.score - Number(gvScore)) : null;
                const matchPct = diff !== null ? Math.max(0, Math.round((1 - diff / 10) * 100)) : null;
                const gvEach = hasGv ? (Number(gvScore) * 0.25 * 4).toFixed(1) : '-';

                return (
                  <React.Fragment key={group.key}>
                    {/* Main Unique File Row */}
                    <tr style={{ background: isExpanded ? 'var(--card-subtle)' : undefined }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {hasMultiple && (
                            <button
                              onClick={() => toggleExpand(group.key)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                padding: 0
                              }}
                              title="Bấm để xem các lần test khác"
                            >
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{group.filename}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span>{item.date}</span>
                              {hasMultiple && (
                                <span
                                  onClick={() => toggleExpand(group.key)}
                                  style={{
                                    cursor: 'pointer',
                                    background: 'rgba(99, 102, 241, 0.12)',
                                    color: '#6366f1',
                                    padding: '1px 6px',
                                    borderRadius: '99px',
                                    fontWeight: 700
                                  }}
                                >
                                  {group.attempts.length} lần test
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.grammar ?? '-'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{gvEach}</td>

                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.vocabulary ?? '-'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{gvEach}</td>

                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.pronunciation ?? '-'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{gvEach}</td>

                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.fluency ?? '-'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{gvEach}</td>

                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.topic_development ?? item.coherence ?? '-'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{gvEach}</td>

                      <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <span>{item.score}/10</span>
                          {getVstepBandLevel(item.score) && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: getVstepBandLevel(item.score).bg,
                                color: getVstepBandLevel(item.score).color,
                                border: `1px solid ${getVstepBandLevel(item.score).color}40`
                              }}
                            >
                              {getVstepBandLevel(item.score).short}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={gvScore}
                            onChange={(e) => handleScoreChange(item.id, e.target.value)}
                            placeholder="--"
                            style={{
                              width: '60px',
                              padding: '6px 8px',
                              borderRadius: '8px',
                              border: '1.5px solid var(--border)',
                              background: 'var(--input-bg)',
                              color: 'var(--text)',
                              textAlign: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}
                          />
                          {hasGv && getVstepBandLevel(Number(gvScore)) && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: getVstepBandLevel(Number(gvScore)).bg,
                                color: getVstepBandLevel(Number(gvScore)).color,
                                border: `1px solid ${getVstepBandLevel(Number(gvScore)).color}40`
                              }}
                            >
                              {getVstepBandLevel(Number(gvScore)).short}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        {matchPct !== null ? (
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              padding: '3px 8px',
                              borderRadius: '99px',
                              background:
                                matchPct >= 80
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : matchPct >= 65
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(239, 68, 68, 0.15)',
                              color: matchPct >= 80 ? '#10b981' : matchPct >= 65 ? '#f59e0b' : '#ef4444'
                            }}
                          >
                            {matchPct}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>--</span>
                        )}
                      </td>

                      <td>
                        {hasMultiple && (
                          <button
                            className="btn-secondary-outline"
                            style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                            onClick={() => deleteOldAttemptsForFile(group.filename)}
                            title="Xóa các lần test cũ, chỉ giữ bản chính này"
                          >
                            Dọn bản cũ
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Accordion Sub-rows for Multiple Test Attempts */}
                    {isExpanded &&
                      group.attempts.map((att, attIdx) => {
                        const isMain = att.id === item.id;
                        return (
                          <tr
                            key={att.id}
                            style={{
                              background: isMain ? 'rgba(99, 102, 241, 0.05)' : 'var(--score-box-bg)',
                              fontSize: '0.78rem'
                            }}
                          >
                            <td style={{ paddingLeft: '32px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>Lần #{group.attempts.length - attIdx}: {att.date}</span>
                                {isMain && (
                                  <span style={{ background: '#10b981', color: '#fff', fontSize: '0.62rem', padding: '1px 6px', borderRadius: '99px', fontWeight: 800 }}>
                                    Đang chọn
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{att.grammar ?? '-'}</td><td>-</td>
                            <td>{att.vocabulary ?? '-'}</td><td>-</td>
                            <td>{att.pronunciation ?? '-'}</td><td>-</td>
                            <td>{att.fluency ?? '-'}</td><td>-</td>
                            <td>{att.topic_development ?? att.coherence ?? '-'}</td><td>-</td>
                            <td style={{ fontWeight: 700 }}>{att.score}/10</td>
                            <td>-</td>
                            <td>-</td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                {!isMain && (
                                  <button
                                    onClick={() => setPrimaryAttempt(att.id, group.filename)}
                                    className="btn-secondary-outline"
                                    style={{ padding: '2px 6px', fontSize: '0.68rem' }}
                                    title="Chọn lần này làm điểm chính thức"
                                  >
                                    <Star size={11} />
                                    <span>Chọn chính</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteHistoryItem(att.id)}
                                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                  title="Xóa lần test này"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Smart Scalable Charts Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="#6366f1" />
              <span>Phân Tích Thẩm Định AI vs Giáo Viên</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {chartMode === 'histogram'
                ? 'Biểu đồ phân bổ độ tin cậy (luôn cố định 3 cột chuẩn dù có 100 hay 1.000 file)'
                : 'Biểu đồ đối chiếu điểm từng file (phân trang tối đa 10 file/trang chống tràn)'}
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className={`btn-secondary-outline ${chartMode === 'histogram' ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '8px',
                background: chartMode === 'histogram' ? 'var(--primary-gradient)' : 'transparent',
                color: chartMode === 'histogram' ? '#fff' : 'var(--text)'
              }}
              onClick={() => setChartMode('histogram')}
            >
              Phân Phối Độ Lệch (3 Cột)
            </button>

            <button
              className={`btn-secondary-outline ${chartMode === 'paged' ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '8px',
                background: chartMode === 'paged' ? 'var(--primary-gradient)' : 'transparent',
                color: chartMode === 'paged' ? '#fff' : 'var(--text)'
              }}
              onClick={() => setChartMode('paged')}
            >
              So Sánh Từng File (10 Bài)
            </button>
          </div>
        </div>

        {/* Paged Bar Chart Filters */}
        {chartMode === 'paged' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-secondary-outline"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: chartScope === 'recent' ? 'var(--primary)' : 'var(--border)' }}
                onClick={() => { setChartScope('recent'); setChartPage(0); }}
              >
                10 bài gần nhất
              </button>
              <button
                className="btn-secondary-outline"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: chartScope === 'worst' ? 'var(--primary)' : 'var(--border)' }}
                onClick={() => { setChartScope('worst'); setChartPage(0); }}
              >
                🔥 Top lệch điểm nhiều nhất
              </button>
              <button
                className="btn-secondary-outline"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: chartScope === 'all' ? 'var(--primary)' : 'var(--border)' }}
                onClick={() => setChartScope('all')}
              >
                Tất cả ({itemsWithTeacher.length})
              </button>
            </div>

            {chartScope !== 'all' && totalChartPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <button
                  className="btn-secondary-outline"
                  disabled={chartPage === 0}
                  onClick={() => setChartPage(prev => Math.max(0, prev - 1))}
                  style={{ padding: '4px 8px' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>Trang {chartPage + 1} / {totalChartPages}</span>
                <button
                  className="btn-secondary-outline"
                  disabled={chartPage >= totalChartPages - 1}
                  onClick={() => setChartPage(prev => Math.min(totalChartPages - 1, prev + 1))}
                  style={{ padding: '4px 8px' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Chart Canvas */}
        <div style={{ height: '320px' }}>
          {chartMode === 'histogram' ? (
            <Bar data={histogramData} options={chartOptions} />
          ) : (
            <Bar data={pagedBarData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
}
