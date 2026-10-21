import React, { useState, useRef } from 'react';
import {
  Mic,
  Square,
  Upload,
  Loader2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
  Volume2,
  Check,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useTimer } from '../hooks/useTimer';
import { evaluateSpeechApi } from '../services/api';
import { getVstepBandLevel } from '../constants/vstepRubricMatrix';

const PART_DATA = {
  part1: {
    time: 180,
    topic: "Let's talk about your hometown. Where is your hometown? What do you like most about it?"
  },
  part2: {
    time: 180,
    topic: "Describe a time when you had to make a difficult decision. What was the situation and what did you decide?"
  },
  part3: {
    time: 240,
    topic: "Some people think that university education should be free for everyone. Do you agree or disagree?"
  }
};

export default function GradePage({ historyHook }) {
  const { t, language } = useLanguage();
  const { history, addHistoryItem, deleteHistoryItem } = historyHook;

  // Selected exam part and topic - Mặc định Part 1 theo yêu cầu
  const [selectedPart, setSelectedPart] = useState('part1');
  const [topicText, setTopicText] = useState(PART_DATA.part1.topic);
  const [topicConfirmed, setTopicConfirmed] = useState(false);

  // Tab: 'feedback' | 'history'
  const [activeSubTab, setActiveSubTab] = useState('feedback');

  // Evaluation states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [liveStatusText, setLiveStatusText] = useState('');

  // Audio Recorder & Timer & Topic File Input
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const fileInputRef = useRef(null);
  const txtInputRef = useRef(null);

  // Xử lý nạp file đề bài .txt tương tự Chấm hàng loạt
  const handleTxtUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setTopicText(content.trim());
        setTopicConfirmed(true);
        setTimeout(() => setTopicConfirmed(false), 2500);
      }
    };
    reader.readAsText(file);
    // Reset file input value để có thể chọn lại cùng 1 file nếu muốn
    e.target.value = '';
  };

  // Auto-stop recording when timer reaches 0
  const handleTimeUp = async () => {
    if (isRecording) {
      await handleStopAndEvaluate();
    }
  };

  const { formattedTime, startTimer, stopTimer, resetTimer } = useTimer(
    PART_DATA[selectedPart].time,
    handleTimeUp
  );

  const handlePartChange = (e) => {
    const p = e.target.value;
    setSelectedPart(p);
    setTopicText(PART_DATA[p].topic);
    resetTimer(PART_DATA[p].time);
  };

  const handleStartRecording = async () => {
    setEvaluationResult(null);
    setLiveStatusText(t('live_listening'));
    await startRecording();
    startTimer(PART_DATA[selectedPart].time);
  };

  const handleStopAndEvaluate = async () => {
    stopTimer();
    setLiveStatusText(t('btn_evaluating'));
    setIsEvaluating(true);

    try {
      const blob = await stopRecording();
      if (!blob || blob.size === 0) {
        throw new Error('Recording is empty');
      }

      const result = await evaluateSpeechApi(blob, topicText, selectedPart, 'recording.wav');
      handleSuccessEvaluation(result, 'Microphone Recording');
    } catch (err) {
      console.error(err);
      alert('Lỗi chấm điểm: ' + err.message);
    } finally {
      setIsEvaluating(false);
      setLiveStatusText('');
      resetTimer(PART_DATA[selectedPart].time);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsEvaluating(true);
    setEvaluationResult(null);
    setLiveStatusText(`Đang xử lý ${file.name}...`);

    try {
      const result = await evaluateSpeechApi(file, topicText, selectedPart, file.name);
      handleSuccessEvaluation(result, file.name);
    } catch (err) {
      console.error(err);
      alert('Lỗi upload: ' + err.message);
    } finally {
      setIsEvaluating(false);
      setLiveStatusText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSuccessEvaluation = (result, filename) => {
    setEvaluationResult(result);
    setActiveSubTab('feedback');

    // Trigger celebratory confetti if score is high (>= 7.0)
    if (result.overall_score && result.overall_score >= 7.0) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    // Save to history
    addHistoryItem({
      score: result.overall_score,
      grammar: result.criteria_scores?.grammar,
      vocabulary: result.criteria_scores?.vocabulary,
      pronunciation: result.criteria_scores?.pronunciation,
      fluency: result.criteria_scores?.fluency,
      topic_development: result.criteria_scores?.topic_development ?? result.criteria_scores?.coherence,
      topic: topicText,
      textSaid: result.transcribed_text,
      filename: filename
    });
  };

  const handleResetForRetry = () => {
    setEvaluationResult(null);
    resetTimer(PART_DATA[selectedPart].time);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-hero">
        <h1>
          <Volume2 size={28} color="#6366f1" />
          <span>{t('app_title')}</span>
        </h1>
        <p>{t('page_grade_subtitle')}</p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid-2col">
        {/* Left Column: Results & Feedback */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Sub-tabs: Feedback vs History */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '14px',
              marginBottom: '20px'
            }}
          >
            <button
              onClick={() => setActiveSubTab('feedback')}
              className={`btn-secondary-outline ${activeSubTab === 'feedback' ? 'active' : ''}`}
              style={{
                borderRadius: '8px',
                padding: '8px 16px',
                borderColor: activeSubTab === 'feedback' ? 'var(--primary)' : 'var(--border)',
                color: activeSubTab === 'feedback' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <Sparkles size={16} />
              <span>{t('tab_feedback')}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('history')}
              className={`btn-secondary-outline ${activeSubTab === 'history' ? 'active' : ''}`}
              style={{
                borderRadius: '8px',
                padding: '8px 16px',
                borderColor: activeSubTab === 'history' ? 'var(--primary)' : 'var(--border)',
                color: activeSubTab === 'history' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <Clock size={16} />
              <span>{t('tab_history')}</span>
            </button>
          </div>

          {activeSubTab === 'feedback' ? (
            <div>
              {/* Overall Score with VSTEP Band Level Badge */}
              {(() => {
                const overallBand = evaluationResult?.overall_score !== undefined
                  ? getVstepBandLevel(evaluationResult.overall_score, language)
                  : null;

                return (
                  <div className="overall-banner">
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {t('overall_score_label')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0 }}>Band Score (Thang 10)</h3>
                        {overallBand && (
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              padding: '3px 12px',
                              borderRadius: '99px',
                              background: overallBand.bg,
                              color: overallBand.color,
                              border: `1.5px solid ${overallBand.color}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🏆 {overallBand.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="score-badge-large">
                        {evaluationResult ? `${evaluationResult.overall_score}/10` : '--/10'}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 5 Criteria Grid with Sub-band Level Badges */}
              <div className="criteria-grid criteria-grid-5">
                {[
                  { key: 'grammar', label: t('criterion_grammar'), score: evaluationResult?.criteria_scores?.grammar },
                  { key: 'vocabulary', label: t('criterion_vocab'), score: evaluationResult?.criteria_scores?.vocabulary },
                  { key: 'pronunciation', label: t('criterion_pronun'), score: evaluationResult?.criteria_scores?.pronunciation },
                  { key: 'fluency', label: t('criterion_fluency'), score: evaluationResult?.criteria_scores?.fluency },
                  {
                    key: 'topic_dev',
                    label: t('criterion_topic_dev'),
                    score: evaluationResult?.criteria_scores?.topic_development ?? evaluationResult?.criteria_scores?.coherence
                  }
                ].map((crit) => {
                  const cBand = crit.score !== undefined && crit.score !== null ? getVstepBandLevel(crit.score, language) : null;
                  return (
                    <div key={crit.key} className="criterion-card">
                      <div className="criterion-name">{crit.label}</div>
                      <div className="criterion-score">
                        {crit.score ?? '-'}
                      </div>
                      {cBand && (
                        <div
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: cBand.color,
                            background: cBand.bg,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            margin: '4px auto 0',
                            width: 'fit-content'
                          }}
                        >
                          {cBand.short}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detailed AI Feedback */}
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
                <Sparkles size={16} style={{ marginRight: '6px', color: '#f59e0b' }} />
                {t('feedback_header')}
              </h4>

              <div className="feedback-box">
                {evaluationResult?.detailed_feedback && evaluationResult.detailed_feedback.length > 0 ? (
                  evaluationResult.detailed_feedback.map((fb, idx) => (
                    <div key={idx} className={`feedback-item ${fb.category || 'grammar'}`}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                        {fb.issue || fb.title || 'Nhận xét'}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {fb.suggestion || fb.recommendation || fb.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                    <p>{t('feedback_empty')}</p>
                  </div>
                )}
              </div>

              {/* Model Answer */}
              {evaluationResult?.model_answer && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>
                    {t('model_answer_header')}
                  </h4>
                  <div className="model-answer-card">
                    "{evaluationResult.model_answer}"
                  </div>
                </div>
              )}

              {/* Retry Button */}
              {evaluationResult && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button className="btn-secondary-outline" onClick={handleResetForRetry}>
                    <RotateCcw size={16} />
                    <span>{t('btn_retry')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* History Sub-tab */
            <div style={{ maxHeight: '550px', overflowY: 'auto' }}>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                  <p>{t('history_empty')}</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '14px 0',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                        {item.date}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            color: 'var(--primary)',
                            fontSize: '0.9rem'
                          }}
                        >
                          {item.score}/10
                        </span>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <strong>{t('history_topic_label')}</strong> {item.topic}
                    </p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <em>"{item.textSaid || t('history_silence')}"</em>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Practice Area & Timer */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
            {t('practice_area_title')}
          </h3>

          {/* Part Selector */}
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
              {t('exam_part_label')}
            </label>
            <select
              value={selectedPart}
              onChange={handlePartChange}
              disabled={isRecording || isEvaluating}
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

          {/* Topic Box */}
          <div
            style={{
              background: 'var(--topic-box-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px'
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
              rows={3}
              value={topicText}
              onChange={(e) => setTopicText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setTopicConfirmed(true);
                  setTimeout(() => setTopicConfirmed(false), 2000);
                }
              }}
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

          {/* Live Speech Indicator */}
          {liveStatusText && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderLeft: '4px solid #ef4444',
                color: '#ef4444',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              {liveStatusText}
            </div>
          )}

          {/* Countdown Timer Display */}
          <div className="timer-hero-box" style={{ marginBottom: '20px' }}>
            {isRecording && (
              <div className="audio-visualizer">
                <div className="visualizer-bar" />
                <div className="visualizer-bar" />
                <div className="visualizer-bar" />
                <div className="visualizer-bar" />
                <div className="visualizer-bar" />
              </div>
            )}
            <div className="timer-digits">{formattedTime}</div>
          </div>

          {/* Actions: Start Record & Upload Audio */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={isRecording ? handleStopAndEvaluate : handleStartRecording}
              disabled={isEvaluating}
              className={`btn-primary-gradient ${isRecording ? 'btn-recording-pulse' : ''}`}
              style={{ width: '100%', padding: '14px' }}
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{t('btn_evaluating')}</span>
                </>
              ) : isRecording ? (
                <>
                  <Square size={20} />
                  <span>{t('btn_record_stop')}</span>
                </>
              ) : (
                <>
                  <Mic size={20} />
                  <span>{t('btn_record_start')}</span>
                </>
              )}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".mp3,.wav,.m4a,audio/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRecording || isEvaluating}
              className="btn-secondary-outline"
              style={{ width: '100%', padding: '12px' }}
            >
              <Upload size={18} />
              <span>{t('btn_upload_audio')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
