import React, { createContext, useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { db, clientsService } from '../services/firebase';
import logger from '../utils/logger';
import { useLoading } from './LoadingContext';
import { useAsync } from '../hooks';

// デバッグ用の一意のIDを生成
const DEBUG_ID = 'DEBUG_' + Math.random().toString(36).substring(2, 15);

const KarteContext = createContext();

export const KarteProvider = ({ children }) => {
  logger.debug(`KarteProvider マウント`, { id: DEBUG_ID });
  
  // LoadingContextを使用
  const { 
    withLoading, 
    showNotification: showGlobalNotification 
  } = useLoading();
  
  // 初期化追跡用のRef
  const isInitializedRef = useRef(false);
  const resetCountRef = useRef(0);
  
  const [currentId, setCurrentId] = useState(null);
  const [karteData, setKarteData] = useState({});
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [comments, setComments] = useState([]);
  const [salesDetails, setSalesDetails] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [clientCompanies, setClientCompanies] = useState([]);
  
  // クライアント情報管理のためのステート
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  
  // デバッグ用のステート監視
  useEffect(() => {
    logger.debug(`karteData 変更:`, { id: DEBUG_ID, data: karteData });
  }, [karteData]);
  
  useEffect(() => {
    logger.debug(`payments 変更:`, { id: DEBUG_ID, data: payments });
  }, [payments]);
  
  useEffect(() => {
    logger.debug(`expenses 変更:`, { id: DEBUG_ID, data: expenses });
  }, [expenses]);
  
  // アンマウント時のログ
  useEffect(() => {
    return () => {
      logger.debug(`KarteProvider アンマウント`, { id: DEBUG_ID });
    };
  }, []);

  // 通知を表示（グローバル通知に統合）
  const showNotification = useCallback((message, type = 'info') => {
    // ローカル通知も維持（トランジション期間中に両方サポート）
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
    
    // グローバル通知も表示
    showGlobalNotification(message, type);
  }, [showGlobalNotification]);

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
    memo: '',
    salesDetails: {
      accommodation: [],
      transportation: [],
      meals: [],
      others: []
    }
  });

  // 強制的にすべての状態をリセットする関数（Promise を返すように修正）
  const resetAllState = () => {
    return new Promise(resolve => {
      // リセット回数をカウント
      resetCountRef.current += 1;
      logger.debug(`resetAllState 呼び出し #${resetCountRef.current}`, { id: DEBUG_ID });
      
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
        memo: '',
        salesDetails: {
          accommodation: [],
          transportation: [],
          meals: [],
          others: []
        }
      };
      
      logger.debug(`リセット前 karteData:`, { id: DEBUG_ID, data: karteData });
      
      // すべての状態変数を明示的にリセット
      setCurrentId(null);
      setKarteData(emptyData);
      setPayments([]);
      setExpenses([]);
      setComments([]);
      setSalesDetails({
        accommodation: [],
        transportation: [],
        meals: [],
        others: []
      });
      setHasChanges(false);
      setLastSaved(null);
      
      // 指定時間後に状態が更新されたことを確認してから完了
      setTimeout(() => {
        logger.debug(`リセット後 karteData:`, { id: DEBUG_ID, data: karteData });
        logger.debug(`resetAllState 完了 #${resetCountRef.current}`, { id: DEBUG_ID });
        resolve();
      }, 50);
    });
  };

  // 新規カルテの作成
  const createNew = async () => {
    try {
      logger.debug(`createNew 開始`, { id: DEBUG_ID });
      
      // まず完全にリセット（非同期処理を待つ）
      await resetAllState();
      
      // カルテ番号を生成
      const newKarteNo = await generateInitialKarteNumber('domestic');
      logger.debug(`新規カルテ番号生成:`, { id: DEBUG_ID, karteNo: newKarteNo });
      
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
      logger.debug(`新規カルテデータ設定:`, { id: DEBUG_ID, data: newKarteData });
      setKarteData(newKarteData);
      
      // 設定が反映されたか確認するために少し待機
      await new Promise(resolve => setTimeout(() => {
        logger.debug(`createNew 完了, 現在のkarteData:`, { id: DEBUG_ID, data: karteData });
        resolve();
      }, 50));
      
      return true;
    } catch (error) {
      logger.error(`新規カルテ作成エラー:`, { id: DEBUG_ID, error });
      showNotification('新規カルテの初期化に失敗しました', 'error');
      return false;
    }
  };

  // カルテの読み込み（withLoadingで最適化）
  const loadKarte = useCallback(async (id) => {
    return withLoading(async () => {
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
          setSalesDetails(data.salesDetails || {
            accommodation: [],
            transportation: [],
            meals: [],
            others: []
          });
          setPayments(data.payments || []);
          setExpenses(data.expenses || []);
          setComments(data.comments || []);
          setLastSaved(data.lastUpdated?.toDate() || null);
          setHasChanges(false);
          showNotification('カルテを読み込みました', 'success');
          return true;
        } else {
          showNotification('カルテが見つかりません', 'error');
          return false;
        }
      } catch (error) {
        logger.error('カルテ読み込みエラー:', { error });
        showNotification('カルテの読み込みに失敗しました', 'error');
        return false;
      }
    }, 'カルテを読み込み中...');
  }, [withLoading, showNotification]);

  // カルテの保存（withLoadingで最適化）
  const saveKarte = useCallback(async () => {
    return withLoading(async () => {
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
          salesDetails,
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
        return true;
      } catch (error) {
        logger.error('保存エラー:', { error });
        showNotification('保存に失敗しました: ' + error.message, 'error');
        return false;
      }
    }, 'カルテを保存中...');
  }, [karteData, payments, expenses, comments, salesDetails, currentId, withLoading, showNotification]);
// src/context/KarteContext.js (後半)
  // カルテの削除（withLoadingで最適化）
  const deleteKarte = useCallback(async (id) => {
    return withLoading(async () => {
      try {
        await deleteDoc(doc(db, 'karte', id));
        showNotification('カルテを削除しました', 'success');
        if (currentId === id) {
          createNew();
        }
        return true;
      } catch (error) {
        logger.error('削除エラー:', { error });
        showNotification('削除に失敗しました: ' + error.message, 'error');
        return false;
      }
    }, 'カルテを削除中...');
  }, [currentId, createNew, withLoading, showNotification]);

  // カルテ一覧の取得（withLoadingで最適化）
  const getKarteList = useCallback(async () => {
    return withLoading(async () => {
      try {
        const q = query(collection(db, 'karte'), orderBy('lastUpdated', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data().karteInfo,
          lastUpdated: doc.data().lastUpdated?.toDate() || null
        }));
        return list;
      } catch (error) {
        logger.error('一覧取得エラー:', { error });
        showNotification('カルテ一覧の取得に失敗しました', 'error');
        return [];
      }
    }, 'カルテ一覧を読み込み中...');
  }, [withLoading, showNotification]);

  // フィールドの更新（メモ化）
  const updateField = useCallback((field, value) => {
    setKarteData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);
  
  // 売上明細の更新
  const updateSalesDetails = (detailsData) => {
    setSalesDetails(detailsData);
    setHasChanges(true);
  };
  
  // クライアント会社名の候補取得
  const fetchClientCompanies = async (searchText) => {
    if (!searchText || searchText.length < 1) return [];
    
    try {
      // 新しいclientsコレクションから検索
      const clientResults = await clientsService.searchClients(searchText);
      
      if (clientResults.length > 0) {
        // クライアントコレクションから会社名を抽出
        const companies = clientResults.map(client => client.name);
        setClients(clientResults);
        setClientCompanies(companies);
        return companies;
      }
      
      // 新しいコレクションでデータが見つからない場合は、従来のkarteコレクションから検索
      const q = query(
        collection(db, 'karte'),
        orderBy('clientCompany'),
        where('clientCompany', '>=', searchText),
        where('clientCompany', '<=', searchText + '\uf8ff'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const companies = [];
      
      querySnapshot.forEach(doc => {
        const company = doc.data().clientCompany;
        if (company && !companies.includes(company)) {
          companies.push(company);
        }
      });
      
      setClientCompanies(companies);
      return companies;
    } catch (error) {
      logger.error('会社名検索エラー:', { error });
      return [];
    }
  };
  
  // クライアント情報の取得（メモ化）
  const getClientById = useCallback(async (clientId) => {
    try {
      const client = await clientsService.getClient(clientId);
      if (client) {
        setSelectedClient(client);
        return client;
      }
      return null;
    } catch (error) {
      logger.error('クライアント取得エラー:', { error });
      return null;
    }
  }, []);
  
  // クライアント情報の保存
  const saveClient = async (clientData, clientId = null) => {
    try {
      setLoading(true);
      const savedId = await clientsService.saveClient(clientData, clientId);
      
      // 保存したクライアントを選択状態に
      const client = await clientsService.getClient(savedId);
      setSelectedClient(client);
      
      setLoading(false);
      showNotification('クライアント情報を保存しました', 'success');
      return savedId;
    } catch (error) {
      logger.error('クライアント保存エラー:', { error });
      setLoading(false);
      showNotification('クライアント情報の保存に失敗しました', 'error');
      return null;
    }
  };
  
  // 連絡先の追加
  const addClientContact = async (clientId, contactData) => {
    try {
      setLoading(true);
      const newContact = await clientsService.addContact(clientId, contactData);
      
      // 選択中のクライアントを更新
      if (selectedClient && selectedClient.id === clientId) {
        const client = await clientsService.getClient(clientId);
        setSelectedClient(client);
      }
      
      setLoading(false);
      showNotification('連絡先を追加しました', 'success');
      return newContact;
    } catch (error) {
      logger.error('連絡先追加エラー:', { error });
      setLoading(false);
      showNotification('連絡先の追加に失敗しました', 'error');
      return null;
    }
  };
  
  // 連絡先の更新
  const updateClientContact = async (clientId, contactId, contactData) => {
    try {
      setLoading(true);
      await clientsService.updateContact(clientId, contactId, contactData);
      
      // 選択中のクライアントを更新
      if (selectedClient && selectedClient.id === clientId) {
        const client = await clientsService.getClient(clientId);
        setSelectedClient(client);
      }
      
      setLoading(false);
      showNotification('連絡先を更新しました', 'success');
      return true;
    } catch (error) {
      logger.error('連絡先更新エラー:', { error });
      setLoading(false);
      showNotification('連絡先の更新に失敗しました', 'error');
      return false;
    }
  };
  
  // 連絡先の削除
  const deleteClientContact = async (clientId, contactId) => {
    try {
      setLoading(true);
      await clientsService.deleteContact(clientId, contactId);
      
      // 選択中のクライアントを更新
      if (selectedClient && selectedClient.id === clientId) {
        const client = await clientsService.getClient(clientId);
        setSelectedClient(client);
      }
      
      setLoading(false);
      showNotification('連絡先を削除しました', 'success');
      return true;
    } catch (error) {
      logger.error('連絡先削除エラー:', { error });
      setLoading(false);
      showNotification('連絡先の削除に失敗しました', 'error');
      return false;
    }
  };
  
  // 連絡先を選択（メモ化）
  const selectContact = useCallback((contact) => {
    setSelectedContact(contact);
    
    // 選択された連絡先情報を基本情報に設定
    if (contact) {
      updateField('clientPerson', contact.personName || '');
      updateField('clientPhone', contact.phone || '');
      updateField('clientEmail', contact.email || '');
    }
  }, [updateField]);

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
  const addComment = (text, images = []) => {
    // 画像データをBase64で保存
    const processedImages = images.map(img => {
      if (typeof img === 'string' && img.startsWith('data:')) {
        return img; // すでにBase64の場合はそのまま
      } else if (img instanceof File) {
        // FileオブジェクトをBase64に変換
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(img);
        });
      }
      return null;
    }).filter(Boolean);
    
    // Promise配列が含まれる可能性があるため、すべてのPromiseを解決
    Promise.all(processedImages).then(resolvedImages => {
      const newComment = {
        id: Date.now().toString(),
        text,
        images: resolvedImages,
        // 担当者名の自動設定を削除
        author: '',
        date: new Date().toISOString()
      };
      setComments(prev => [newComment, ...prev]);
      setHasChanges(true);
    });
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
      logger.error('カルテ番号生成エラー:', { error });
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
        logger.error('初期化エラー:', { error });
        // エラーが発生した場合でも最低限の初期化を実行
        resetAllState();
      }
    };
    
    initializeKarte();
  }, []);

  // コンテキスト値をメモ化して不要な再レンダリングを防ぐ
  const contextValue = useMemo(() => ({
    currentId,
    karteData,
    payments,
    expenses,
    comments,
    salesDetails,
    clientCompanies,
    hasChanges,
    lastSaved,
    loading,
    notification,
    // クライアント情報管理のステート
    clients,
    selectedClient,
    selectedContact,
    // 基本メソッド
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
    updateSalesDetails,
    fetchClientCompanies,
    showNotification,
    resetAllState, // 強制リセット関数
    // クライアント情報管理のメソッド
    getClientById,
    saveClient,
    addClientContact,
    updateClientContact,
    deleteClientContact,
    selectContact
  }), [
    currentId, karteData, payments, expenses, comments, salesDetails, 
    clientCompanies, hasChanges, lastSaved, loading, notification,
    clients, selectedClient, selectedContact,
    createNew, loadKarte, saveKarte, deleteKarte, getKarteList,
    updateField, addPayment, updatePayment, deletePayment,
    addExpense, updateExpense, deleteExpense, addComment,
    calculateSummary, updateSalesDetails, fetchClientCompanies,
    showNotification, resetAllState, getClientById, saveClient,
    addClientContact, updateClientContact, deleteClientContact, selectContact
  ]);

  return (
    <KarteContext.Provider value={contextValue}>
      {children}
    </KarteContext.Provider>
  );
};

// カスタムフック
export const useKarte = () => useContext(KarteContext);

export default KarteContext;
