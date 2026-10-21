import React, { useState, useRef } from 'react';
import {
  Layers,
  FolderOpen,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  FileAudio,
  Check
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { evaluateSpeechApi } from '../services/api';

const PART_TOPICS = {
  part1: "Let's talk about your hometown. Where is your hometown? What do you like most about it?",
  part2: "Describe a time when you had to make a difficult decision. What was the situation and what did you decide?",
  part3: "Some people think that university education should be free for everyone. Do you agree or disagree?"
};

export default function BatchPage({ historyHook }) {
  const { t } = useLanguage();
  const { addHistoryItem } = historyHook;

  const [batchPart, setBatchPart] = useState('part1');
  const [batchTopic, setBatchTopic] = useState(PART_TOPICS.part1);
  const [topicConfirmed, setTopicConfirmed] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState([]); // Array of { file, status: 'pending'|'processing'|'done'|'error', result }
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fileInputRef = useRef(null);
  const txtInputRef = useRef(null);

  const handleSelectFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);
    setFileStatuses(
      files.map((f) => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        status: 'pending',
        score: null,
        error: null,
        rawFile: f
      }))
    );
    setCurrentIndex(0);
  };

  const handlePartChange = (e) => {
    const p = e.target.value;
    setBatchPart(p);
    setBatchTopic(PART_TOPICS[p] || PART_TOPICS.part1);
    setTopicConfirmed(true);
    setTimeout(() => setTopicConfirmed(false), 2000);
  };

  const handleTxtUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setBatchTopic(content.trim());
        setTopicConfirmed(true);
        setTimeout(() => setTopicConfirmed(false), 2500);
      }
    };
    reader.readAsText(file);
    if (txtInputRef.current) txtInputRef.current.value = '';
  };

  const handleStartBatch = async () => {
    if (fileStatuses.length === 0 || isProcessing) return;

    setIsProcessing(true);

    for (let i = 0; i < fileStatuses.length; i++) {
      setCurrentIndex(i + 1);

      // Update current to processing
      setFileStatuses((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'processing' } : item))
      );

      const target = fileStatuses[i];

      try {
        const result = await evaluateSpeechApi(
          target.rawFile,
          batchTopic,
          batchPart,
          target.name
        );

        // Save result
        setFileStatuses((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'done', score: result.overall_score } : item
          )
        );

        // Add to global history
        addHistoryItem({
          score: result.overall_score,
          grammar: result.criteria_scores?.grammar,
          vocabulary: result.criteria_scores?.vocabulary,
          pronunciation: result.criteria_scores?.pronunciation,
          fluency: result.criteria_scores?.fluency,
          topic_development: result.criteria_scores?.topic_development ?? result.criteria_scores?.coherence,
          topic: batchTopic,
          textSaid: result.transcribed_text,
          filename: target.name
        });
      } catch (err) {
        console.error('Batch file error', err);
        setFileStatuses((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'error', error: err.message } : item
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const completedCount = fileStatuses.filter((f) => f.status === 'done' || f.status === 'error').length;
  const progressPercent = fileStatuses.length > 0 ? Math.round((completedCount / fileStatuses.length) * 100) : 0;

  return (
    <div className="page-container">
      <div className="page-hero">
        <h1>
          <Layers size={28} color="#6366f1" />
          <span>{t('batch_modal_title')}</span>
        </h1>
        <p>{t('batch_modal_alert')}</p>
      </div>

      <div className="grid-2col">
        {/* Step 1: Topic Config */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
            {t('batch_step1_title')}
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '6px'
              }}
            >
              {t('batch_part_label')}
            </label>
            <select
              value={batchPart}
              onChange={handlePartChange}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--border)',
                background: 'var(--input-bg)',
                color: 'var(--text)',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
                fontFamily: 'inherit'
              }}
            >
              <option value="part1">{t('exam_part_1')}</option>
              <option value="part2">{t('exam_part_2')}</option>
              <option value="part3">{t('exam_part_3')}</option>
            </select>
          </div>

          <div
            style={{
              background: 'var(--topic-box-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '14px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: topicConfirmed ? '#10b981' : 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '99px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'background 0.2s ease'
                  }}
                >
                  {topicConfirmed ? <Check size={12} /> : null}
                  {topicConfirmed ? 'ĐÃ NHẬN ĐỀ' : 'TOPIC'}
                </span>

                <input
                  type="file"
                  ref={txtInputRef}
                  accept=".txt"
                  style={{ display: 'none' }}
                  onChange={handleTxtUpload}
                />
                <button
                  type="button"
                  className="btn-secondary-outline"
                  style={{
                    padding: '3px 9px',
                    fontSize: '0.72rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '6px'
                  }}
                  onClick={() => txtInputRef.current?.click()}
                  title="Tải nội dung đề bài từ file .txt"
                >
                  <FileText size={13} />
                  <span>{t('btn_upload_txt')}</span>
                </button>
              </div>

              <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {t('topic_hint')}
              </small>
            </div>

            <textarea
              rows={4}
              value={batchTopic}
              onChange={(e) => setBatchTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setTopicConfirmed(true);
                  setTimeout(() => setTopicConfirmed(false), 2000);
                }
              }}
              disabled={isProcessing}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                color: 'var(--text)',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                fontWeight: 500
              }}
            />
          </div>
        </div>

        {/* Step 2: Upload Files & Progress */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
            {t('batch_step2_title')}
          </h3>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".mp3,.wav,.m4a,audio/*"
              style={{ display: 'none' }}
              onChange={handleSelectFiles}
            />

            <button
              className="btn-primary-gradient"
              style={{ width: '100%', padding: '14px' }}
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
            >
              <FolderOpen size={20} />
              <span>{t('batch_btn_select')}</span>
            </button>

            <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {selectedFiles.length > 0
                ? `${selectedFiles.length} ${t('batch_files_selected')}`
                : t('batch_no_files')}
            </div>
          </div>

          {/* Start Evaluation Action */}
          {selectedFiles.length > 0 && (
            <button
              className="btn-primary-gradient"
              disabled={isProcessing || selectedFiles.length === 0}
              onClick={handleStartBatch}
              style={{
                width: '100%',
                marginBottom: '16px',
                background: isProcessing ? '#64748b' : 'linear-gradient(135deg, #10b981, #059669)'
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang chấm ({currentIndex}/{fileStatuses.length})...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>{t('batch_btn_start')}</span>
                </>
              )}
            </button>
          )}

          {/* Progress Bar */}
          {fileStatuses.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginBottom: '6px'
                }}
              >
                <span>{t('batch_progress_title')}</span>
                <span style={{ color: 'var(--primary)' }}>
                  {completedCount}/{fileStatuses.length} ({progressPercent}%)
                </span>
              </div>
              <div
                style={{
                  height: '10px',
                  borderRadius: '99px',
                  background: 'var(--border)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'var(--primary-gradient)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* File Status List */}
          <div
            style={{
              flex: 1,
              maxHeight: '260px',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '8px'
            }}
          >
            {fileStatuses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                {t('batch_no_files')}
              </div>
            ) : (
              fileStatuses.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <FileAudio size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                  </div>

                  <div>
                    {item.status === 'pending' && (
                      <span style={{ color: 'var(--text-muted)' }}>{t('batch_status_pending')}</span>
                    )}
                    {item.status === 'processing' && (
                      <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Loader2 size={13} className="animate-spin" />
                        {t('batch_status_processing')}
                      </span>
                    )}
                    {item.status === 'done' && (
                      <span
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '99px'
                        }}
                      >
                        {item.score}/10
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>{t('batch_status_error')}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
