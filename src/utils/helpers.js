// src/utils/helpers.js

/**
 * 初期カルテ番号を生成
 * @param {string} travelType - 旅行タイプ（'domestic'または'international'）
 * @returns {string} - 生成されたカルテ番号
 */
export const generateInitialKarteNumber = (travelType = 'domestic') => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const prefix = travelType === 'domestic' ? 'D' : 'I';
    return `${prefix}-${yyyy}${mm}${dd}-`;
  };
  
  /**
   * 日付を日本語形式でフォーマット
   * @param {string|Date} date - フォーマットする日付
   * @param {boolean} includeTime - 時間を含めるかどうか
   * @returns {string} - フォーマットされた日付
   */
  export const formatDate = (date, includeTime = false) => {
    if (!date) return '-';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return d.toLocaleDateString('ja-JP', options);
  };
  
  /**
   * 金額を通貨形式でフォーマット
   * @param {number} amount - フォーマットする金額
   * @returns {string} - フォーマットされた金額
   */
  export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return amount.toLocaleString() + '円';
  };
  
  /**
   * 泊数を計算
   * @param {string} departureDate - 出発日
   * @param {string} returnDate - 帰着日
   * @returns {number} - 計算された泊数
   */
  export const calculateNights = (departureDate, returnDate) => {
    if (!departureDate || !returnDate) return 0;
    
    const start = new Date(departureDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  /**
   * 単価を計算
   * @param {number} totalAmount - 総額
   * @param {number} totalPersons - 総人数
   * @returns {number} - 計算された単価
   */
  export const calculateUnitPrice = (totalAmount, totalPersons) => {
    if (!totalAmount || !totalPersons || totalPersons <= 0) return 0;
    return Math.round(totalAmount / totalPersons);
  };