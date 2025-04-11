// src/utils/reportUtils.js

/**
 * カルテデータを月別に集計する
 * @param {Array} karteList - カルテデータの配列
 * @param {number} year - 対象年
 * @returns {Object} - 月別に集計されたデータ
 */
export const aggregateMonthlyData = (karteList) => {
    // 初期化: 12ヶ月分のデータを0で初期化
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: `${i + 1}月`,
      karteCount: 0,
      revenue: 0,
      expense: 0,
      profit: 0
    }));
    
    // カルテデータを月ごとに集計
    karteList.forEach(karte => {
      if (!karte.lastUpdated) return;
      
      const date = new Date(karte.lastUpdated);
      const monthIndex = date.getMonth();
      
      // 該当月のデータを更新
      monthlyData[monthIndex].karteCount += 1;
      monthlyData[monthIndex].revenue += (karte.revenue || 0);
      monthlyData[monthIndex].expense += (karte.expense || 0);
      monthlyData[monthIndex].profit += (karte.profit || 0);
    });
    
    return monthlyData;
  };
  
  /**
   * カルテデータをCSV形式に変換
   * @param {Array} karteList - カルテデータの配列
   * @param {Object} options - オプション
   * @returns {string} - CSV形式の文字列
   */
  export const convertToCSV = (karteList, options = {}) => {
    if (!karteList || karteList.length === 0) return '';
    
    const {
      includeHeader = true,
      delimiter = ',',
      fields = [
        { key: 'karteNo', label: 'カルテNo' },
        { key: 'tantosha', label: '担当者' },
        { key: 'dantaiName', label: 'クライアント' },
        { key: 'departureDate', label: '出発日' },
        { key: 'destination', label: '行先' },
        { key: 'revenue', label: '売上' },
        { key: 'expense', label: '費用' },
        { key: 'profit', label: '利益' },
        { key: 'profitRate', label: '利益率', format: value => `${value?.toFixed(1) || 0}%` }
      ]
    } = options;
    
    // ヘッダー行
    let csv = '';
    if (includeHeader) {
      csv += fields.map(field => `"${field.label}"`).join(delimiter) + '\n';
    }
    
    // データ行
    karteList.forEach(karte => {
      const row = fields.map(field => {
        let value = karte[field.key] || '';
        
        // 値のフォーマット
        if (field.format && typeof field.format === 'function') {
          value = field.format(value);
        }
        
        // 文字列の場合はダブルクォートで囲む
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      });
      
      csv += row.join(delimiter) + '\n';
    });
    
    return csv;
  };
  
  /**
   * 日付範囲を取得（月の初日と末日）
   * @param {number} year - 年
   * @param {number} month - 月（1-12）
   * @returns {Object} - 初日と末日
   */
  export const getMonthDateRange = (year, month) => {
    // 月の初日
    const startDate = new Date(year, month - 1, 1);
    
    // 月の末日
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    return { startDate, endDate };
  };