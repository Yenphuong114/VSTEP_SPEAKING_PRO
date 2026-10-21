import { useState, useCallback } from 'react';

const STORAGE_KEY = 'vstep_history';

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveToStorage = useCallback((items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save history to storage', e);
    }
  }, []);

  const addHistoryItem = useCallback((item) => {
    const now = new Date();
    const dateString = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN');

    const newItem = {
      id: Date.now().toString(),
      date: dateString,
      score: item.score,
      grammar: item.grammar,
      vocabulary: item.vocabulary,
      pronunciation: item.pronunciation,
      fluency: item.fluency,
      topic_development: item.topic_development ?? item.coherence ?? null,
      topic: item.topic || '',
      textSaid: item.textSaid || '',
      filename: item.filename || null,
      teacher_score: item.teacher_score !== undefined ? item.teacher_score : null,
      is_primary: true
    };

    setHistory((prev) => {
      // If same filename exists, ensure new one is primary
      const updated = [newItem, ...prev.map(p => {
        if (newItem.filename && p.filename === newItem.filename) {
          return { ...p, is_primary: false };
        }
        return p;
      })];
      saveToStorage(updated);
      return updated;
    });

    return newItem;
  }, [saveToStorage]);

  const deleteHistoryItem = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const updateTeacherScore = useCallback((id, teacherScore) => {
    setHistory((prev) => {
      const target = prev.find(item => item.id === id);
      const filename = target ? target.filename : null;

      const updated = prev.map((item) => {
        // Sync teacher score to this specific item and any identical filename group
        if (item.id === id || (filename && item.filename === filename)) {
          return { ...item, teacher_score: teacherScore };
        }
        return item;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const setPrimaryAttempt = useCallback((id, filename) => {
    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (item.filename === filename) {
          return { ...item, is_primary: item.id === id };
        }
        return item;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const deleteOldAttemptsForFile = useCallback((filename) => {
    setHistory((prev) => {
      const attempts = prev.filter(i => i.filename === filename);
      if (attempts.length <= 1) return prev;
      const primary = attempts.find(a => a.is_primary) || attempts[0];
      const updated = prev.filter(i => i.filename !== filename || i.id === primary.id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const autoDetectTeacherScores = useCallback(() => {
    let count = 0;
    setHistory((prev) => {
      const updated = prev.map((item) => {
        if (!item.filename || item.teacher_score !== null) return item;
        const match = item.filename.match(/(?:_|-|\[|\s)([0-9](?:\.[0-9])?)(?:_|-|\]|\.|\s|$)/);
        if (match) {
          const val = parseFloat(match[1]);
          if (!isNaN(val) && val >= 0 && val <= 10) {
            count++;
            return { ...item, teacher_score: val };
          }
        }
        return item;
      });
      if (count > 0) saveToStorage(updated);
      return updated;
    });
    return count;
  }, [saveToStorage]);

  // Nhóm các bài theo tên file (Group by filename)
  const getGroupedHistory = useCallback(() => {
    const groups = {};
    history.forEach((item) => {
      const key = item.filename || `live_speech_${item.id}`;
      if (!groups[key]) {
        groups[key] = {
          filename: item.filename || 'Thu âm trực tiếp',
          key: key,
          attempts: []
        };
      }
      groups[key].attempts.push(item);
    });

    return Object.values(groups).map((group) => {
      // Tìm lần chấm được chọn làm primary hoặc lần mới nhất
      const primary = group.attempts.find(a => a.is_primary) || group.attempts[0];
      return {
        ...group,
        primary
      };
    });
  }, [history]);

  // Tính toán KPI Thống kê
  const computeStats = useCallback(() => {
    const grouped = getGroupedHistory();
    const primaryItems = grouped.map(g => g.primary);
    const totalFiles = primaryItems.length;

    const itemsWithTeacher = primaryItems.filter(
      (h) => h.teacher_score !== null && h.teacher_score !== undefined && !isNaN(h.teacher_score)
    );

    if (itemsWithTeacher.length === 0) {
      return {
        totalFiles,
        agreementPct: null,
        mae: null,
        avgAi: null,
        avgGv: null,
        distribution: { high: 0, moderate: 0, low: 0 }
      };
    }

    let totalDiff = 0;
    let agreementSum = 0;
    let sumAi = 0;
    let sumGv = 0;
    let countHigh = 0;
    let countMod = 0;
    let countLow = 0;

    itemsWithTeacher.forEach((h) => {
      const ai = Number(h.score) || 0;
      const gv = Number(h.teacher_score) || 0;
      const diff = Math.abs(ai - gv);
      totalDiff += diff;
      sumAi += ai;
      sumGv += gv;

      const matchPct = Math.max(0, Math.round((1 - diff / 10) * 100));
      agreementSum += matchPct;

      if (diff <= 0.5) countHigh++;
      else if (diff <= 1.0) countMod++;
      else countLow++;
    });

    const mae = (totalDiff / itemsWithTeacher.length).toFixed(2);
    const agreementPct = Math.round(agreementSum / itemsWithTeacher.length);
    const avgAi = (sumAi / itemsWithTeacher.length).toFixed(2);
    const avgGv = (sumGv / itemsWithTeacher.length).toFixed(2);

    return {
      totalFiles,
      agreementPct,
      mae,
      avgAi,
      avgGv,
      distribution: {
        high: countHigh,
        moderate: countMod,
        low: countLow,
        pctHigh: Math.round((countHigh / itemsWithTeacher.length) * 100),
        pctMod: Math.round((countMod / itemsWithTeacher.length) * 100),
        pctLow: Math.round((countLow / itemsWithTeacher.length) * 100)
      }
    };
  }, [getGroupedHistory]);

  const loadSampleData = useCallback(() => {
    const samples = [
      {
        id: 'sample_1_attempt_3',
        date: '20/10/2026 14:30:15',
        score: 7.5,
        grammar: 7.5,
        vocabulary: 7.0,
        pronunciation: 7.5,
        fluency: 8.0,
        topic_development: 7.5,
        topic: 'Part 1: Hometown & Family',
        textSaid: 'I was born and raised in Da Nang, a vibrant coastal city famous for beautiful beaches and hospitable local people.',
        filename: 'Thi_Sinh_01_Part1_grade_7.5.wav',
        teacher_score: 7.5,
        is_primary: true
      },
      {
        id: 'sample_1_attempt_2',
        date: '20/10/2026 14:15:00',
        score: 7.0,
        grammar: 7.0,
        vocabulary: 7.0,
        pronunciation: 7.0,
        fluency: 7.0,
        topic_development: 7.0,
        topic: 'Part 1: Hometown & Family',
        textSaid: 'I was born in Da Nang city, with many beaches and friendly people.',
        filename: 'Thi_Sinh_01_Part1_grade_7.5.wav',
        teacher_score: 7.5,
        is_primary: false
      },
      {
        id: 'sample_1_attempt_1',
        date: '20/10/2026 14:00:20',
        score: 6.5,
        grammar: 6.5,
        vocabulary: 6.5,
        pronunciation: 6.5,
        fluency: 6.5,
        topic_development: 6.5,
        topic: 'Part 1: Hometown & Family',
        textSaid: 'I live in Da Nang. It is a nice city with sea.',
        filename: 'Thi_Sinh_01_Part1_grade_7.5.wav',
        teacher_score: 7.5,
        is_primary: false
      },
      {
        id: 'sample_2',
        date: '20/10/2026 15:10:00',
        score: 8.2,
        grammar: 8.5,
        vocabulary: 8.0,
        pronunciation: 8.0,
        fluency: 8.5,
        topic_development: 8.0,
        topic: 'Part 2: Difficult Decision Between Study Abroad or Work',
        textSaid: 'Facing with three choices between studying abroad, taking a local job, or volunteering, I firmly advocate that studying abroad offers the most profound benefits.',
        filename: 'Thi_Sinh_02_Part2_grade_8.0.mp3',
        teacher_score: 8.0,
        is_primary: true
      },
      {
        id: 'sample_3',
        date: '20/10/2026 15:45:00',
        score: 7.2,
        grammar: 7.0,
        vocabulary: 7.5,
        pronunciation: 7.0,
        fluency: 7.5,
        topic_development: 7.0,
        topic: 'Part 3: Online Education Advantages & Challenges',
        textSaid: 'Online education provides immense flexibility and cost reduction for modern students, yet it demands high self-discipline to prevent procrastination.',
        filename: 'Thi_Sinh_03_Part3_grade_6.5.wav',
        teacher_score: 6.5,
        is_primary: true
      },
      {
        id: 'sample_4',
        date: '20/10/2026 16:20:00',
        score: 6.8,
        grammar: 6.5,
        vocabulary: 7.0,
        pronunciation: 6.5,
        fluency: 7.0,
        topic_development: 7.0,
        topic: 'Part 1: Free Time Activities',
        textSaid: 'In my free time, I like playing computer games with my friends on weekend because it helps me relax.',
        filename: 'Thi_Sinh_04_Part1_grade_5.0.mp3',
        teacher_score: 5.0,
        is_primary: true
      }
    ];

    setHistory(samples);
    saveToStorage(samples);
    return samples.length;
  }, [saveToStorage]);

  const clearAllHistory = useCallback(() => {
    setHistory([]);
    saveToStorage([]);
  }, [saveToStorage]);

  return {
    history,
    addHistoryItem,
    deleteHistoryItem,
    updateTeacherScore,
    setPrimaryAttempt,
    deleteOldAttemptsForFile,
    autoDetectTeacherScores,
    getGroupedHistory,
    computeStats,
    loadSampleData,
    clearAllHistory
  };
}
