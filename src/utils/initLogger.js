// src/utils/initLogger.js
import logger, { LOG_LEVELS, setLogLevel, setLogEnabled } from './logger';

/**
 * アプリケーション起動時にロガーを初期化する
 * 環境変数とlocalStorageの設定を読み込んで適用
 */
export const initializeLogger = () => {
  // 環境設定の読み込み
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  // デフォルト設定の決定
  const defaultEnabled = isDev;
  const defaultLevel = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;
  
  try {
    // localStorage から以前の設定を復元（あれば）
    const savedConfig = JSON.parse(localStorage.getItem('debugConfig'));
    
    if (savedConfig && typeof savedConfig === 'object') {
      // 保存されていた設定を適用
      const enabled = typeof savedConfig.enabled === 'boolean' ? savedConfig.enabled : defaultEnabled;
      const level = Number.isInteger(savedConfig.level) ? savedConfig.level : defaultLevel;
      
      setLogEnabled(enabled);
      setLogLevel(level);
      
      logger.info('ロガー初期化完了:', { 
        enabled, 
        level, 
        levelName: getLevelName(level),
        source: 'localStorage'
      });
    } else {
      // 保存設定がない場合はデフォルト設定を適用
      setLogEnabled(defaultEnabled);
      setLogLevel(defaultLevel);
      
      logger.info('ロガー初期化完了:', { 
        enabled: defaultEnabled, 
        level: defaultLevel,
        levelName: getLevelName(defaultLevel),
        source: 'default'
      });
    }
  } catch (error) {
    // エラー時はデフォルト設定を適用
    setLogEnabled(defaultEnabled);
    setLogLevel(defaultLevel);
    
    logger.error('ロガー初期化エラー:', { error });
  }
};

/**
 * ログレベル名の取得
 */
const getLevelName = (levelValue) => {
  const names = {
    [LOG_LEVELS.NONE]: 'なし',
    [LOG_LEVELS.ERROR]: 'エラー',
    [LOG_LEVELS.WARN]: '警告',
    [LOG_LEVELS.INFO]: '情報',
    [LOG_LEVELS.DEBUG]: 'デバッグ',
    [LOG_LEVELS.TRACE]: 'トレース'
  };
  return names[levelValue] || '不明';
};

export default initializeLogger;