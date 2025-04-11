import React from 'react';
import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

/**
 * 月間データを取得するカスタムフック
 * @param {number} year - 対象年
 * @param {number} month - 対象月
 * @returns {Object} - 月間データ、ローディング状態、エラー
 */
const useMonthlyData = (year, month) => {
  const { fetchMonthlyData } = useAdmin();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const monthlyData = await fetchMonthlyData(year, month);
        setData(monthlyData);
        setError(null);
      } catch (err) {
        console.error('月間データ取得エラー:', err);
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [year, month, fetchMonthlyData]);

  return { data, loading, error };
};

export default useMonthlyData;