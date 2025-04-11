import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [staffList, setStaffList] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalKarte: 0,
    totalRevenue: 0,
    totalProfit: 0,
    averageProfitRate: 0
  });

  // 通知を表示する関数
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  // 全体統計情報を取得
  // src/context/AdminContext.js の fetchOverallStats 関数
const fetchOverallStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // カルテ数を取得
      const karteSnapshot = await getDocs(collection(db, 'karte'));
      const karteCount = karteSnapshot.size;
      
      // 集計用の変数
      let totalRevenue = 0;
      let totalExpense = 0;
      let totalProfit = 0;
      
      // マウント状態を追跡
      let isMounted = true;
      
      // 一度にすべてのデータを取得して処理する
      const batchPromises = [];
      const batchSize = 20; // Firestoreの制限に基づいて調整
      
      for (let i = 0; i < karteSnapshot.docs.length; i += batchSize) {
        const batch = karteSnapshot.docs.slice(i, i + batchSize);
        batchPromises.push(Promise.all(batch.map(doc => {
          const data = doc.data();
          
          // 入金データを集計
          const payments = data.payments || [];
          const revenue = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
          
          // 支払いデータを集計
          const expenses = data.expenses || [];
          const expense = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
          
          // 利益を計算
          const profit = revenue - expense;
          
          totalRevenue += revenue;
          totalExpense += expense;
          totalProfit += profit;
          
          return true; // Promise.allのために何かを返す
        })));
      }
      
      await Promise.all(batchPromises);
      
      // コンポーネントがまだマウントされているか確認
      if (!isMounted) return;
      
      // 平均利益率を計算
      const averageProfitRate = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
      
      setOverallStats({
        totalKarte: karteCount,
        totalRevenue,
        totalProfit,
        averageProfitRate
      });
      
      setLoading(false);
    } catch (err) {
      console.error('全体統計取得エラー:', err);
      setError(err);
      setLoading(false);
      showNotification('統計情報の取得に失敗しました', 'error');
    }
    
    // クリーンアップ関数を返す
    return () => {
      isMounted = false;
    };
  };

  // 月間データを取得
  const fetchMonthlyData = async (year, month) => {
    setLoading(true);
    setError(null);
    
    try {
      // 対象月の初日と末日を設定
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      // カルテデータを取得
      const q = query(
        collection(db, 'karte'),
        where('lastUpdated', '>=', startDate),
        where('lastUpdated', '<=', endDate)
      );
      
      const querySnapshot = await getDocs(q);
      
      // 集計用の変数
      const karteList = [];
      let totalRevenue = 0;
      let totalExpense = 0;
      let totalProfit = 0;
      
      // カルテデータを処理
      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        // 入金データを集計
        const payments = data.payments || [];
        const revenue = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
        
        // 支払いデータを集計
        const expenses = data.expenses || [];
        const expense = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        
        // 利益を計算
        const profit = revenue - expense;
        const profitRate = revenue > 0 ? (profit / revenue * 100) : 0;
        
        // カルテ情報をリストに追加
        karteList.push({
          id: doc.id,
          ...data.karteInfo,
          revenue,
          expense,
          profit,
          profitRate,
          lastUpdated: data.lastUpdated?.toDate()
        });
        
        // 合計に加算
        totalRevenue += revenue;
        totalExpense += expense;
        totalProfit += profit;
      });
      
      // 平均利益率を計算
      const averageProfitRate = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
      
      setLoading(false);
      
      return {
        karteCount: karteList.length,
        karteList,
        totalRevenue,
        totalExpense,
        totalProfit,
        averageProfitRate
      };
      
    } catch (err) {
      console.error('月間データ取得エラー:', err);
      setError(err);
      setLoading(false);
      showNotification('月間データの取得に失敗しました', 'error');
      return null;
    }
  };

  // 担当者一覧を取得
  const fetchStaffList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const staffSnapshot = await getDocs(collection(db, 'staff'));
      const staffData = staffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStaffList(staffData);
      setLoading(false);
      return staffData;
    } catch (err) {
      console.error('担当者リスト取得エラー:', err);
      setError(err);
      setLoading(false);
      showNotification('担当者リストの取得に失敗しました', 'error');
      return [];
    }
  };

  // 担当者を追加
  const addStaff = async (staffData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newStaffRef = doc(collection(db, 'staff'));
      await setDoc(newStaffRef, {
        ...staffData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      showNotification('担当者を追加しました', 'success');
      setLoading(false);
      
      // 担当者リストを再取得
      fetchStaffList();
      return true;
    } catch (err) {
      console.error('担当者追加エラー:', err);
      setError(err);
      setLoading(false);
      showNotification('担当者の追加に失敗しました', 'error');
      return false;
    }
  };

  // 担当者を更新
  const updateStaff = async (id, staffData) => {
    setLoading(true);
    setError(null);
    
    try {
      const staffRef = doc(db, 'staff', id);
      await setDoc(staffRef, {
        ...staffData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      showNotification('担当者情報を更新しました', 'success');
      setLoading(false);
      
      // 担当者リストを再取得
      fetchStaffList();
      return true;
    } catch (err) {
      console.error('担当者更新エラー:', err);
      setError(err);
      setLoading(false);
      showNotification('担当者情報の更新に失敗しました', 'error');
      return false;
    }
  };

  // 担当者を削除
  const deleteStaff = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteDoc(doc(db, 'staff', id));
      
      showNotification('担当者を削除しました', 'success');
      setLoading(false);
      
      // 担当者リストを再取得
      fetchStaffList();
      return true;
    } catch (err) {
      console.error('担当者削除エラー:', err);
      setError(err);
      setLoading(false);
      showNotification('担当者の削除に失敗しました', 'error');
      return false;
    }
  };

  // 初期化時に担当者リストのみ取得（総合実績は不要なので削除）
  useEffect(() => {
    // fetchOverallStatsの呼び出しを削除
    fetchStaffList();
  }, []);

  // コンテキスト値の設定
  const contextValue = {
    loading,
    error,
    notification,
    overallStats,
    staffList,
    showNotification,
    fetchOverallStats,
    fetchMonthlyData,
    fetchStaffList,
    addStaff,
    updateStaff,
    deleteStaff
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

// カスタムフック
export const useAdmin = () => useContext(AdminContext);

export default AdminContext;