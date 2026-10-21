import * as XLSX from 'xlsx';
import { getVstepBandLevel } from '../constants/vstepRubricMatrix';

/**
 * Xuất dữ liệu đối chiếu AI vs GV ra file Excel (.xlsx) kèm Bậc năng lực VSTEP (B1, B2, C1)
 */
export function exportComparisonToExcel(comparisonGroups, stats) {
  const dataRows = [];

  let stt = 1;
  comparisonGroups.forEach((group) => {
    const item = group.primary;
    const hasGv = item.teacher_score !== null && item.teacher_score !== undefined;
    const diff = hasGv ? Math.abs(item.score - Number(item.teacher_score)).toFixed(2) : '-';
    const matchPct = hasGv ? Math.max(0, Math.round((1 - Math.abs(item.score - Number(item.teacher_score)) / 10) * 100)) + '%' : '-';
    
    let evaluation = '-';
    if (hasGv) {
      const numDiff = Math.abs(item.score - Number(item.teacher_score));
      if (numDiff <= 0.5) evaluation = 'Khớp cao (≤ 0.5đ)';
      else if (numDiff <= 1.0) evaluation = 'Chấp nhận được (0.6 - 1.0đ)';
      else evaluation = 'Cần xem lại (> 1.0đ)';
    }

    const aiBand = getVstepBandLevel(item.score);
    const gvBand = hasGv ? getVstepBandLevel(Number(item.teacher_score)) : null;

    dataRows.push({
      'STT': stt++,
      'Tên File': group.filename,
      'Số lần test': group.attempts.length,
      'Ngày chấm mới nhất': item.date || '-',
      'Đề bài': item.topic || '-',
      'Ngữ pháp (AI)': item.grammar ?? '-',
      'Từ vựng (AI)': item.vocabulary ?? '-',
      'Phát âm (AI)': item.pronunciation ?? '-',
      'Trôi chảy (AI)': item.fluency ?? '-',
      'Bố cục nội dung (AI)': item.topic_development ?? item.coherence ?? '-',
      'Điểm AI Tổng': item.score ?? '-',
      'Bậc VSTEP (AI)': aiBand ? aiBand.name : '-',
      'Điểm Giáo Viên': item.teacher_score ?? 'Chưa nhập',
      'Bậc VSTEP (GV)': gvBand ? gvBand.name : 'Chưa nhập',
      'Độ lệch |AI - GV|': diff,
      'Tỷ lệ khớp': matchPct,
      'Đánh giá thẩm định': evaluation
    });
  });

  // Dòng cách
  dataRows.push({});

  // Dòng tổng kết số liệu
  dataRows.push({
    'STT': 'TỔNG KẾT',
    'Tên File': `Tổng số file: ${comparisonGroups.length}`,
    'Số lần test': `Tổng lượt chấm: ${comparisonGroups.reduce((acc, g) => acc + g.attempts.length, 0)}`,
    'Điểm AI Tổng': `Điểm TB AI: ${stats.avgAi || '-'}`,
    'Điểm Giáo Viên': `Điểm TB GV: ${stats.avgGv || '-'}`,
    'Độ lệch |AI - GV|': `Sai số MAE: ${stats.mae !== null ? stats.mae : '-'}`,
    'Tỷ lệ khớp': `Đồng thuận: ${stats.agreementPct !== null ? stats.agreementPct + '%' : '-'}`
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Căn chỉnh độ rộng cột
  worksheet['!cols'] = [
    { wch: 8 },  // STT
    { wch: 28 }, // Tên File
    { wch: 12 }, // Số lần test
    { wch: 20 }, // Ngày chấm
    { wch: 40 }, // Đề bài
    { wch: 14 }, // G
    { wch: 14 }, // V
    { wch: 14 }, // P
    { wch: 14 }, // F
    { wch: 20 }, // Bố cục
    { wch: 14 }, // Điểm AI
    { wch: 24 }, // Bậc AI
    { wch: 16 }, // Điểm GV
    { wch: 24 }, // Bậc GV
    { wch: 16 }, // Lệch
    { wch: 14 }, // Khớp
    { wch: 24 }  // Thẩm định
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DoiChieu_AI_vs_GV');

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `VSTEP_BaoCao_DoiChieu_AI_vs_GV_${dateStr}.xlsx`);
}

/**
 * Xuất toàn bộ Lịch sử bài thi ra file Excel (.xlsx) kèm Bậc VSTEP
 */
export function exportHistoryToExcel(historyItems) {
  const dataRows = historyItems.map((item, index) => {
    const bandInfo = getVstepBandLevel(item.score);
    return {
      'STT': index + 1,
      'Ngày làm bài': item.date,
      'Tên file / Nguồn': item.filename || 'Thu âm trực tiếp',
      'Nội dung đề bài': item.topic || '-',
      'Điểm AI Tổng': item.score ?? '-',
      'Xếp loại Bậc VSTEP': bandInfo ? bandInfo.name : '-',
      'Ngữ pháp (Grammar)': item.grammar ?? '-',
      'Từ vựng (Vocabulary)': item.vocabulary ?? '-',
      'Phát âm (Pronunciation)': item.pronunciation ?? '-',
      'Trôi chảy (Fluency)': item.fluency ?? '-',
      'Bố cục nội dung (Topic Dev)': item.topic_development ?? item.coherence ?? '-',
      'Bài nói (Transcript)': item.textSaid || '(Không thu được giọng nói)'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  worksheet['!cols'] = [
    { wch: 8 },  // STT
    { wch: 20 }, // Ngày làm bài
    { wch: 25 }, // Tên file
    { wch: 40 }, // Đề bài
    { wch: 14 }, // Điểm tổng
    { wch: 26 }, // Bậc VSTEP
    { wch: 18 }, // G
    { wch: 18 }, // V
    { wch: 20 }, // P
    { wch: 18 }, // F
    { wch: 22 }, // Topic Dev
    { wch: 60 }  // Transcript
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch Sử Luyện Thi');

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `VSTEP_LichSu_Speaking_${dateStr}.xlsx`);
}
