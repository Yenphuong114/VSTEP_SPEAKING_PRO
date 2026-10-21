import React, { useState, useMemo } from 'react';
import {
  Clock,
  Trash2,
  FileAudio,
  FolderOpen,
  Search,
  Filter,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { exportHistoryToExcel } from '../utils/exportExcel';
import { getVstepBandLevel } from '../constants/vstepRubricMatrix';

const PAGE_SIZE = 10;

export default function HistoryPage({ historyHook }) {
  const { t } = useLanguage();
  const {
    history,
    deleteHistoryItem,
    loadSampleData,
    clearAllHistory
  } = historyHook;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBand, setSelectedBand] = useState('all'); // 'all' | 'c1' | 'b2' | 'b1'
  const [selectedPart, setSelectedPart] = useState('all'); // 'all' | 'part1' | 'part2' | 'part3'
  const [currentPage, setCurrentPage] = useState(1);
  const [exportNotice, setExportNotice] = useState('');

  const handleLoadSample = () => {
    loadSampleData();
    setExportNotice('✨ Đã nạp 4 bài thi mẫu có bài nói và tiêu chí chi tiết!');
    setTimeout(() => setExportNotice(''), 4000);
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử bài thi?')) {
      clearAllHistory();
      setExportNotice('Đã xóa sạch lịch sử.');
      setTimeout(() => setExportNotice(''), 3000);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(t('history_delete_confirm'))) {
      deleteHistoryItem(id);
    }
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Search term
      const query = searchTerm.toLowerCase().trim();
      const matchSearch =
        !query ||
        (item.filename && item.filename.toLowerCase().includes(query)) ||
        (item.topic && item.topic.toLowerCase().includes(query)) ||
        (item.textSaid && item.textSaid.toLowerCase().includes(query));

      // Band filter
      let matchBand = true;
      const score = Number(item.score) || 0;
      if (selectedBand === 'c1') matchBand = score >= 8.5;
      else if (selectedBand === 'b2') matchBand = score >= 6.0 && score < 8.5;
      else if (selectedBand === 'b1') matchBand = score < 6.0;

      // Part filter
      let matchPart = true;
      if (selectedPart !== 'all') {
        const topicLower = (item.topic || '').toLowerCase();
        if (selectedPart === 'part1') matchPart = topicLower.includes('hometown') || topicLower.includes('part 1');
        else if (selectedPart === 'part2') matchPart = topicLower.includes('difficult decision') || topicLower.includes('part 2');
        else if (selectedPart === 'part3') matchPart = topicLower.includes('university') || topicLower.includes('part 3');
      }

      return matchSearch && matchBand && matchPart;
    });
  }, [history, searchTerm, selectedBand, selectedPart]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / PAGE_SIZE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredHistory.slice(start, start + PAGE_SIZE);
  }, [filteredHistory, currentPage]);

  const handleExportExcel = () => {
    exportHistoryToExcel(filteredHistory);
    setExportNotice('Đã xuất lịch sử ra Excel thành công!');
    setTimeout(() => setExportNotice(''), 3000);
  };

  return (
    <div className="page-container">
      <div className="page-hero">
        <h1>
          <Clock size={28} color="#6366f1" />
          <span>{t('nav_history')}</span>
        </h1>
        <p>{t('page_history_subtitle')}</p>
      </div>

      {/* Search, Filter & Export Toolbar */}
      <div className="glass-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px', background: 'var(--input-bg)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '8px 12px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Tìm theo tên file, đề bài, bài nói..."
              style={{ border: 'none', background: 'transparent', color: 'var(--text)', outline: 'none', width: '100%', fontSize: '0.86rem', fontFamily: 'inherit' }}
            />
          </div>

          {/* Filters & Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedBand}
              onChange={(e) => { setSelectedBand(e.target.value); setCurrentPage(1); }}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600, outline: 'none' }}
            >
              <option value="all">Tất cả Band điểm</option>
              <option value="c1">Band C1 (8.5 - 10.0)</option>
              <option value="b2">Band B2 (6.0 - 8.0)</option>
              <option value="b1">Band B1 (&lt; 6.0)</option>
            </select>

            <button
              className="btn-primary-gradient"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              onClick={handleExportExcel}
              disabled={filteredHistory.length === 0}
            >
              <FileSpreadsheet size={16} />
              <span>Xuất Excel ({filteredHistory.length})</span>
            </button>

            <button
              className="btn-secondary-outline"
              style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleLoadSample}
              title="Nạp 4 bài thi mẫu có bài nói và tiêu chí"
            >
              <Sparkles size={16} />
              <span>✨ Nạp Mẫu</span>
            </button>

            {history.length > 0 && (
              <button
                className="btn-secondary-outline"
                style={{ padding: '8px 12px', fontSize: '0.82rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={handleClearAll}
                title="Xóa toàn bộ lịch sử"
              >
                <Trash2 size={15} />
                <span>Xóa Hết</span>
              </button>
            )}
          </div>
        </div>

        {exportNotice && (
          <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="glass-card">
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', marginBottom: '14px' }}>
              <FolderOpen size={28} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', marginBottom: '8px' }}>
              Chưa có bài thi nào trong lịch sử
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
              Lịch sử lưu vết các bài thi bạn đã chấm. Bạn có thể tự chấm bài mới hoặc bấm nạp dữ liệu mẫu để xem giao diện hoạt động.
            </p>
            <button
              className="btn-primary-gradient"
              onClick={handleLoadSample}
              style={{ padding: '9px 20px', fontSize: '0.85rem' }}
            >
              <Sparkles size={16} />
              <span>✨ Nạp Dữ Liệu Mẫu Ngay</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'var(--score-box-bg)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Clock size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>{item.date}</span>
                    {item.filename && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          background: 'rgba(6, 182, 212, 0.12)',
                          color: '#06b6d4',
                          border: '1px solid rgba(6, 182, 212, 0.25)',
                          padding: '2px 8px',
                          borderRadius: '99px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600
                        }}
                      >
                        <FileAudio size={12} />
                        {item.filename}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(() => {
                      const bInfo = getVstepBandLevel(item.score);
                      return (
                        <>
                          {bInfo && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '99px',
                                background: bInfo.bg,
                                color: bInfo.color,
                                border: `1px solid ${bInfo.color}`
                              }}
                            >
                              🏆 {bInfo.short}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 800,
                              color: '#ffffff',
                              background: bInfo?.color || 'var(--primary)',
                              padding: '3px 12px',
                              borderRadius: '99px'
                            }}
                          >
                            {item.score}/10
                          </span>
                        </>
                      );
                    })()}

                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Xóa bài này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Topic */}
                <div style={{ fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--text-muted)' }}>{t('history_topic_label')}</strong> {item.topic}
                </div>

                {/* 5 Criteria Badges (Chuẩn Bộ GD&ĐT) */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                    Grammar: <strong>{item.grammar ?? '-'}</strong>
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                    Vocab: <strong>{item.vocabulary ?? '-'}</strong>
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                    Pronun: <strong>{item.pronunciation ?? '-'}</strong>
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                    Fluency: <strong>{item.fluency ?? '-'}</strong>
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                    Topic Dev: <strong>{item.topic_development ?? item.coherence ?? '-'}</strong>
                  </span>
                </div>

                {/* Transcript */}
                <div
                  style={{
                    background: 'var(--card)',
                    borderLeft: '3px solid var(--primary)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontStyle: 'italic',
                    color: 'var(--text)',
                    lineHeight: 1.4
                  }}
                >
                  <strong style={{ fontStyle: 'normal' }}>{t('history_speech_label')}</strong>{' '}
                  {item.textSaid ? `"${item.textSaid}"` : t('history_silence')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
            <button
              className="btn-secondary-outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ padding: '6px 12px' }}
            >
              <ChevronLeft size={16} />
              <span>Trang trước</span>
            </button>

            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)' }}>
              Trang {currentPage} / {totalPages} ({filteredHistory.length} bài)
            </span>

            <button
              className="btn-secondary-outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: '6px 12px' }}
            >
              <span>Trang sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
