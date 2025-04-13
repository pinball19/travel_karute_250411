// src/utils/logger.js

/**
 * ログレベルを定義
 */
export const LOG_LEVELS = {
  NONE: 0,    // ログ出力なし
  ERROR: 1,   // エラーのみ
  WARN: 2,    // 警告とエラー
  INFO: 3,    // 情報、警告、エラー
  DEBUG: 4,   // デバッグ、情報、警告、エラー
  TRACE: 5    // トレース、デバッグ、情報、警告、エラー
};

/**
 * 現在の環境に基づいてデフォルトログレベルを決定
 */
const DEFAULT_LOG_LEVEL = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

/**
 * アプリケーション全体のログ設定
 */
export const logConfig = {
  level: DEFAULT_LOG_LEVEL,
  enabled: true,
  prefix: '[TravelKarute]',
};

/**
 * 現在のログレベルを設定
 * @param {number} level - 設定するログレベル
 */
export const setLogLevel = (level) => {
  if (Object.values(LOG_LEVELS).includes(level)) {
    logConfig.level = level;
  }
};

/**
 * ログ出力の有効/無効を切り替え
 * @param {boolean} enabled - ログを有効にするかどうか
 */
export const setLogEnabled = (enabled) => {
  logConfig.enabled = !!enabled;
};

/**
 * ログ出力の共通処理
 * @param {number} level - ログレベル
 * @param {string} method - 使用するconsoleメソッド
 * @param {Array} args - ログ引数
 */
const log = (level, method, ...args) => {
  if (!logConfig.enabled || level > logConfig.level) return;
  
  // 先頭の引数が文字列の場合、プレフィックスを追加
  if (typeof args[0] === 'string') {
    args[0] = `${logConfig.prefix} ${args[0]}`;
  } else {
    args.unshift(logConfig.prefix);
  }
  
  // eslint-disable-next-line no-console
  console[method](...args);
};

/**
 * エラーレベルのログを出力
 */
export const error = (...args) => log(LOG_LEVELS.ERROR, 'error', ...args);

/**
 * 警告レベルのログを出力
 */
export const warn = (...args) => log(LOG_LEVELS.WARN, 'warn', ...args);

/**
 * 情報レベルのログを出力
 */
export const info = (...args) => log(LOG_LEVELS.INFO, 'info', ...args);

/**
 * デバッグレベルのログを出力
 */
export const debug = (...args) => log(LOG_LEVELS.DEBUG, 'log', ...args);

/**
 * トレースレベルのログを出力
 */
export const trace = (...args) => log(LOG_LEVELS.TRACE, 'debug', ...args);

// デフォルトエクスポート
export default {
  error,
  warn,
  info,
  debug,
  trace,
  setLogLevel,
  setLogEnabled,
  LOG_LEVELS,
};