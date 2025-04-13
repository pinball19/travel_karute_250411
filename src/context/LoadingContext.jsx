import React, { createContext, useContext, useState, useCallback } from 'react';
import { Backdrop, CircularProgress, Snackbar, Alert } from '@mui/material';
import logger from '../utils/logger';

// LoadingContext の作成
const LoadingContext = createContext();

/**
 * アプリケーション全体のローディング状態を管理するプロバイダー
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子コンポーネント
 */
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 3000
  });

  // ローディング状態を開始
  const startLoading = useCallback((text = '') => {
    setLoading(true);
    setLoadingText(text);
  }, []);

  // ローディング状態を終了
  const stopLoading = useCallback(() => {
    setLoading(false);
    setLoadingText('');
  }, []);

  // 非同期処理のラッパー
  const withLoading = useCallback(async (asyncFn, text = '') => {
    startLoading(text);
    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      logger.error('非同期処理でエラーが発生しました', { error });
      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  // 通知を表示
  const showNotification = useCallback((message, severity = 'info', autoHideDuration = 3000) => {
    setNotification({
      open: true,
      message,
      severity,
      autoHideDuration
    });
  }, []);

  // 通知を閉じる
  const closeNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  // コンテキスト値
  const contextValue = {
    loading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading,
    showNotification,
    closeNotification
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}

      {/* グローバルローディングオーバーレイ */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: theme => theme.zIndex.drawer + 1,
          flexDirection: 'column'
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
        {loadingText && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            {loadingText}
          </div>
        )}
      </Backdrop>

      {/* グローバル通知 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.autoHideDuration}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </LoadingContext.Provider>
  );
};

/**
 * ローディング状態を使用するためのカスタムフック
 * 
 * @returns {Object} ローディング状態と関連機能
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoadingはLoadingProviderの中で使用する必要があります');
  }
  return context;
};

export default LoadingContext;