import { useState, useCallback, useEffect } from 'react';
import logger from '../utils/logger';

/**
 * 非同期処理を管理するカスタムフック
 * 
 * @param {Function} asyncFunction - 実行する非同期関数
 * @param {boolean} immediate - コンポーネントマウント時に自動実行するかどうか
 * @param {Array} deps - 依存配列（immediateがtrueの場合に使用）
 * @param {Function} onSuccess - 成功時のコールバック
 * @param {Function} onError - エラー時のコールバック
 * @returns {Object} 非同期処理の状態と実行関数
 */
const useAsync = (
  asyncFunction,
  { 
    immediate = false, 
    deps = [], 
    onSuccess, 
    onError,
    errorHandler
  } = {}
) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastCallArgs, setLastCallArgs] = useState([]);

  // 最大リトライ回数
  const MAX_RETRY = 3;

  // 非同期関数の実行
  const execute = useCallback(
    async (...args) => {
      setStatus('pending');
      setLastCallArgs(args);
      setValue(null);
      setError(null);

      try {
        const response = await asyncFunction(...args);
        setValue(response);
        setStatus('success');
        
        if (onSuccess) {
          onSuccess(response);
        }
        
        // 成功したらリトライカウントをリセット
        setRetryCount(0);
        
        return response;
      } catch (error) {
        logger.error('Async operation failed:', { error, function: asyncFunction.name, args });
        setError(error);
        setStatus('error');
        
        if (onError) {
          onError(error);
        }
        
        // エラーハンドラがあれば実行
        if (errorHandler) {
          errorHandler(error, { 
            retry: () => {
              if (retryCount < MAX_RETRY) {
                setRetryCount(prevCount => prevCount + 1);
                return execute(...args);
              }
              return Promise.reject(new Error('最大リトライ回数に達しました'));
            },
            retryCount,
            args
          });
        }
        
        throw error;
      }
    },
    [asyncFunction, onSuccess, onError, errorHandler, retryCount]
  );

  // コンポーネントマウント時に自動実行
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, ...deps]);

  // リトライ回数が変更されたときに自動リトライ
  useEffect(() => {
    if (retryCount > 0 && retryCount <= MAX_RETRY && status === 'error') {
      const retryDelay = Math.pow(2, retryCount) * 500; // 指数バックオフ
      
      const retryTimer = setTimeout(() => {
        logger.info(`Retrying async operation (${retryCount}/${MAX_RETRY})...`);
        execute(...lastCallArgs);
      }, retryDelay);
      
      return () => clearTimeout(retryTimer);
    }
  }, [retryCount, status, execute, lastCallArgs]);

  // 非同期処理をリセット
  const reset = useCallback(() => {
    setStatus('idle');
    setValue(null);
    setError(null);
    setRetryCount(0);
  }, []);

  // リトライ
  const retry = useCallback(() => {
    if (lastCallArgs.length > 0) {
      return execute(...lastCallArgs);
    }
    return Promise.reject(new Error('前回の呼び出し引数がありません'));
  }, [execute, lastCallArgs]);

  return {
    execute,
    retry,
    reset,
    status,
    value,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
    retryCount
  };
};

export default useAsync;