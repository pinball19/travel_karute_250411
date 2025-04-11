import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit,
  where // where関数を追加
} from 'firebase/firestore';
import { db } from '../services/firebase';

// デバッグ用の一意のIDを生成
const DEBUG_ID = 'DEBUG_' + Math.random().toString(36).substring(2, 15);

const KarteContext = createContext();

export const KarteProvider = ({ children }) => {
  console.log(`[${DEBUG_ID}] KarteProvider マウント`);
  
  // 初期化追跡用のRef
  const isInitializedRef = useRef(false);
  const resetCountRef = useRef(0);
  
  const [currentId, setCurrentId] = useState(null);
  const [karteData, setKarteData] = useState({});
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [comments, setComments] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  
  // デバッグ用のステート監視
  useEffect(() => {
    console.log(`[${DEBUG_ID}] karteData 変更:`, karteData);
  }, [karteData]);
  
  useEffect(() => {
    console.log(`[${DEBUG_ID}] payments 変更:`, payments);
  }, [payments]);
  
  useEffect(() => {
    console.log(`[${DEBUG_ID}] expenses 変更:`, expenses);
  }, [expenses]);
  
  // アンマウント時のログ
  useEffect(() => {
    return () => {
      console.log(`[${DEBUG_ID}] KarteProvider アンマウント`);
    };
  }, []);

  // 通知を表示
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  // 空のカルテデータを生成する関数
  const getEmptyKarteData = (karteNo = '') => ({
    travelType: 'domestic',
    karteNo: karteNo,
    companyPerson: '',
    clientCompany: '',
    clientPerson: '',
    clientPhone: '',
    clientEmail: '',
    departureDate: '',
    returnDate: '',
    nights: '',
    departurePlace: '',
    destination: '',
    destinationOther: '',
    travelContent: '',
    totalPersons: '',
    totalAmount: '',
    unitPrice: '',
    paymentTo: '',
    arrangementStatus: 'not-started',
    memo: ''
  });

  // 強制的にすべての状態をリセットする関数（Promise を返すように修正）
  const resetAllState = () => {
    return new Promise(resolve => {
      // リセット回数をカウント
      resetCountRef.current += 1;
      console.log(`[${DEBUG_ID}] resetAllState 呼び出し #${resetCountRef.current}`);
      
      // 完全にクリアした新しいオブジェクトを作成（参照の問題を回避）
      const emptyData = {
        travelType: 'domestic',
        karteNo: '',
        companyPerson: '',
        clientCompany: '',
        clientPerson: '',
        clientPhone: '',
        clientEmail: '',
        departureDate: '',
        returnDate: '',
        nights: '',
        departurePlace: '',
        destination: '',
        destinationOther: '',
        travelContent: '',
        totalPersons: '',
        totalAmount: '',
        unitPrice: '',
        paymentTo: '',
        arrangementStatus: 'not-started',
        memo: ''
      };
      
      console.log(`[${DEBUG_ID}] リセット前 karteData:`, karteData);
      
      // すべての状態変数を明示的にリセット
      setCurrentId(null);
      setKarteData(emptyData);
      setPayments([]);
      setExpenses([]);
      setComments([]);
      setHasChanges(false);
      setLastSaved(null);
      
      // 指定時間後に状態が更新されたことを確認してから完了
      setTimeout(() => {
        console.log(`[${DEBUG_ID}] リセット後 karteData:`, karteData);
        console.log(`[${DEBUG_ID}] resetAllState 完了 #${resetCountRef.current}`);
        resolve();
      }, 50);
    });
  };

  // 新規カルテの作成
  const createNew = async () => {
    try {
      console.log(`[${DEBUG_ID}] createNew 開始`);
      
      // まず完全にリセット（非同期処理を待つ）
      await resetAllState();
      
      // カルテ番号を生成
      const newKarteNo = await generateInitialKarteNumber('domestic');
      console.log(`[${DEBUG_ID}] 新規カルテ番号生成:`, newKarteNo);
      
      // 空のデータを作成して、カルテ番号だけ設定
      const newKarteData = {
        travelType: 'domestic',
        karteNo: newKarteNo,
        companyPerson: '',
        clientCompany: '',
        clientPerson: '',
        clientPhone: '',
        clientEmail: '',
        departureDate: '',
        returnDate: '',
        nights: '',
        departurePlace: '',
        destination: '',
        destinationOther: '',
        travelContent: '',
        totalPersons: '',
        totalAmount: '',
        unitPrice: '',
        paymentTo: '',
        arrangementStatus: 'not-started',
        memo: ''
      };
      
      // 新しいカルテデータを設定
      console.log(`[${DEBUG_ID}] 新規カルテデータ設定:`, newKarteData);
      setKarteData(newKarteData);
      
      // 設定が反映されたか確認するために少し待機
      await new Promise(resolve => setTimeout(() => {
        console.log(`[${DEBUG_ID}] createNew 完了, 現在のkarteData:`, karteData);
        resolve();
      }, 50));
      
      return true;
    } catch (error) {
      console.error(`[${DEBUG_ID}] 新規カルテ作成エラー:`, error);
      showNotification('新規カルテの初期化に失敗しました', 'error');
      return false;
    }
  };

  // カルテの読み込み
  const loadKarte = async (id) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'karte', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentId(id);
        setKarteData({
          travelType: data.travelType || 'domestic',
          karteNo: data.karteNo || '',
          companyPerson: data.companyPerson || '',
          clientCompany: data.clientCompany || '',
          clientPerson: data.clientPerson || '',
          clientPhone: data.clientPhone || '',
          clientEmail: data.clientEmail || '',
          departureDate: data.departureDate || '',
          returnDate: data.returnDate || '',
          nights: data.nights || '',
          departurePlace: data.departurePlace || '',
          destination: data.destination || '',
          destinationOther: data.destinationOther || '',
          travelContent: data.travelContent || '',
          totalPersons: data.totalPersons || '',
          totalAmount: data.totalAmount || '',
          unitPrice: data.unitPrice || '',
          paymentTo: data.paymentTo || '',
          arrangementStatus: data.arrangementStatus || 'not-started',
          memo: data.memo || ''
        });
        setPayments(data.payments || []);
        setExpenses(data.expenses || []);
        setComments(data.comments || []);
        setLastSaved(data.lastUpdated?.toDate() || null);
        setHasChanges(false);
        showNotification('カルテを読み込みました', 'success');
        setLoading(false);
        return true;
      } else {
        showNotification('カルテが見つかりません', 'error');
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('カルテ読み込みエラー:', error);
      showNotification('カルテの読み込みに失敗しました', 'error');
      setLoading(false);
      return false;
    }
  };

  // カルテの保存
  const saveKarte = async () => {
    setLoading(true);
    try {
      // 行き先の特別処理
      const destinationValue = karteData.destination === 'other' 
        ? karteData.destinationOther
        : karteData.destination;

      const saveData = {
        ...karteData,
        destination: destinationValue,
        payments,
        expenses,
        comments,
        lastUpdated: serverTimestamp(),
        karteInfo: {
          karteNo: karteData.karteNo || '',
          tantosha: karteData.companyPerson || '',
          dantaiName: karteData.clientCompany || '',
          departureDate: karteData.departureDate || '',
          personCount: karteData.totalPersons || '',
          destination: destinationValue || ''
        }
      };

      if (currentId) {
        // 更新
        await updateDoc(doc(db, 'karte', currentId), saveData);
      } else {
        // 新規作成
        const docRef = await addDoc(collection(db, 'karte'), saveData);
        setCurrentId(docRef.id);
      }
      
      setLastSaved(new Date());
      setHasChanges(false);
      showNotification('カルテを保存しました', 'success');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('保存エラー:', error);
      showNotification('保存に失敗しました: ' + error.message, 'error');
      setLoading(false);
      return false;
    }
  };
// src/context/KarteContext.js (後半)
  // カルテの削除
  const deleteKarte = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'karte', id));
      showNotification('カルテを削除しました', 'success');
      if (currentId === id) {
        createNew();
      }
      setLoading(false);
      return true;
    } catch (error) {
      console.error('削除エラー:', error);
      showNotification('削除に失敗しました: ' + error.message, 'error');
      setLoading(false);
      return false;
    }
  };

  // カルテ一覧の取得
  const getKarteList = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'karte'), orderBy('lastUpdated', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data().karteInfo,
        lastUpdated: doc.data().lastUpdated?.toDate() || null
      }));
      setLoading(false);
      return list;
    } catch (error) {
      console.error('一覧取得エラー:', error);
      showNotification('カルテ一覧の取得に失敗しました', 'error');
      setLoading(false);
      return [];
    }
  };

  // フィールドの更新
  const updateField = (field, value) => {
    setKarteData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // 泊数の自動計算
  const calculateNights = () => {
    const { departureDate, returnDate } = karteData;
    if (departureDate && returnDate) {
      const start = new Date(departureDate);
      const end = new Date(returnDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      updateField('nights', diffDays.toString());
    }
  };

  // 単価の自動計算
  const calculateUnitPrice = () => {
    const amount = parseFloat(karteData.totalAmount) || 0;
    const persons = parseInt(karteData.totalPersons) || 0;
    
    if (amount > 0 && persons > 0) {
      const unitPrice = Math.round(amount / persons);
      updateField('unitPrice', unitPrice.toString());
    } else {
      updateField('unitPrice', '');
    }
  };

  // 入金情報の追加
  const addPayment = (payment) => {
    const newPayment = {
      ...payment,
      id: Date.now().toString()
    };
    setPayments(prev => [...prev, newPayment]);
    setHasChanges(true);
    return newPayment;
  };

  // 入金情報の更新
  const updatePayment = (id, payment) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...payment, id } : p));
    setHasChanges(true);
  };

  // 入金情報の削除
  const deletePayment = (id) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    setHasChanges(true);
  };

  // 支払情報の追加
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString()
    };
    setExpenses(prev => [...prev, newExpense]);
    setHasChanges(true);
    return newExpense;
  };

  // 支払情報の更新
  const updateExpense = (id, expense) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...expense, id } : e));
    setHasChanges(true);
  };

  // 支払情報の削除
  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setHasChanges(true);
  };

  // コメントの追加
  const addComment = (text) => {
    const newComment = {
      id: Date.now().toString(),
      text,
      // 担当者名の自動設定を削除
      author: '',
      date: new Date().toISOString()
    };
    setComments(prev => [newComment, ...prev]);
    setHasChanges(true);
    return newComment;
  };

  // 収支情報の計算
  const calculateSummary = () => {
    const totalPayment = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const profit = totalPayment - totalExpense;
    const profitRate = totalPayment > 0 ? (profit / totalPayment * 100).toFixed(1) : '0';
    const totalPersons = parseInt(karteData.totalPersons) || 0;
    const profitPerPerson = totalPersons > 0 ? Math.round(profit / totalPersons) : 0;

    return {
      totalPayment,
      totalExpense,
      profit,
      profitRate,
      profitPerPerson
    };
  };

  // 初期カルテ番号の生成
  const generateInitialKarteNumber = async (travelType = 'domestic') => {
    const today = new Date();
    const yyyy = today.getFullYear().toString().slice(-2); // 年の下2桁
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    const prefix = travelType === 'domestic' ? 'D' : 'I';
    
    // 同じ日付のカルテ数を取得して連番を決定
    try {
      // Firestore でプレフィックスと日付が一致するカルテを検索
      const prefixPattern = `${prefix}-${dateStr}`;
      const q = query(
        collection(db, 'karte'),
        where('karteNo', '>=', prefixPattern),
        where('karteNo', '<', prefixPattern + '\uf8ff') // プレフィックスで始まるすべてのドキュメント
      );
      
      const snapshot = await getDocs(q);
      const count = snapshot.size + 1; // 既存の数 + 1 が新しい連番
      const serialNumber = String(count).padStart(3, '0'); // 001, 002, ...形式
      
      return `${prefix}-${dateStr}-${serialNumber}`;
    } catch (error) {
      console.error('カルテ番号生成エラー:', error);
      // エラー時はデフォルトで001を使用
      return `${prefix}-${dateStr}-001`;
    }
  };

  // useEffectで自動計算
  useEffect(() => {
    if (karteData.departureDate && karteData.returnDate) {
      calculateNights();
    }
  }, [karteData.departureDate, karteData.returnDate]);

  useEffect(() => {
    if (karteData.totalAmount || karteData.totalPersons) {
      calculateUnitPrice();
    }
  }, [karteData.totalAmount, karteData.totalPersons]);

  // 初期化時に新規カルテを作成
  useEffect(() => {
    // 初回のみ非同期で新規カルテを作成
    const initializeKarte = async () => {
      try {
        // まず強制的に状態をリセット
        await resetAllState();
        
        // 新規カルテを作成（カルテ番号を生成して設定）
        await createNew();
      } catch (error) {
        console.error('初期化エラー:', error);
        // エラーが発生した場合でも最低限の初期化を実行
        resetAllState();
      }
    };
    
    initializeKarte();
  }, []);

  return (
    <KarteContext.Provider value={{
      currentId,
      karteData,
      payments,
      expenses,
      comments,
      hasChanges,
      lastSaved,
      loading,
      notification,
      createNew,
      loadKarte,
      saveKarte,
      deleteKarte,
      getKarteList,
      updateField,
      addPayment,
      updatePayment,
      deletePayment,
      addExpense,
      updateExpense,
      deleteExpense,
      addComment,
      calculateSummary,
      showNotification,
      resetAllState // 強制リセット関数を追加
    }}>
      {children}
    </KarteContext.Provider>
  );
};

// カスタムフック
export const useKarte = () => useContext(KarteContext);

export default KarteContext;
