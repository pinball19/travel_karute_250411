import React from 'react';
import { Chip } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaymentIcon from '@mui/icons-material/Payment';

/**
 * ステータスを表示するChipコンポーネント
 * 
 * @param {Object} props
 * @param {string} props.status - ステータス値
 * @param {Object} props.statusConfig - ステータス設定オブジェクト (オプション)
 * @param {string} props.size - Chipのサイズ (small, medium)
 * @param {Object} props.sx - スタイルオブジェクト
 */
const StatusChip = ({ 
  status, 
  statusConfig,
  size = 'small', 
  sx = {},
  ...props 
}) => {
  // デフォルトのステータス設定
  const defaultStatusConfig = {
    // カルテ手配状態
    'not-started': { color: 'default', label: '未着手', icon: <ErrorIcon /> },
    'in-progress': { color: 'warning', label: '手配中', icon: <PendingIcon /> },
    'completed': { color: 'success', label: '手配完了', icon: <DoneIcon /> },
    
    // 支払状態
    '未手配': { color: 'default', label: '未手配', icon: <ErrorIcon /> },
    '手配中': { color: 'warning', label: '手配中', icon: <HourglassEmptyIcon /> },
    '手配完了': { color: 'info', label: '手配完了', icon: <DoneIcon /> },
    '支払済み': { color: 'success', label: '支払済み', icon: <PaymentIcon /> },
    
    // 汎用ステータス
    'pending': { color: 'warning', label: '処理中', icon: <PendingIcon /> },
    'approved': { color: 'success', label: '承認済', icon: <DoneIcon /> },
    'rejected': { color: 'error', label: '却下', icon: <ErrorIcon /> }
  };

  // 使用するステータス設定
  const config = statusConfig || defaultStatusConfig;
  
  // ステータスの情報を取得
  const statusInfo = config[status] || { 
    color: 'default',
    label: status || '不明',
    icon: null
  };

  return (
    <Chip
      label={statusInfo.label}
      color={statusInfo.color}
      icon={statusInfo.icon}
      size={size}
      sx={{
        fontWeight: 'medium',
        ...sx
      }}
      {...props}
    />
  );
};

/**
 * ステータスのコンフィグをエクスポート
 * 必要に応じて拡張または上書き可能
 */
export const statusConfig = {
  // カルテ手配状態
  'not-started': { color: 'default', label: '未着手', icon: <ErrorIcon /> },
  'in-progress': { color: 'warning', label: '手配中', icon: <PendingIcon /> },
  'completed': { color: 'success', label: '手配完了', icon: <DoneIcon /> },
  
  // 支払状態
  '未手配': { color: 'default', label: '未手配', icon: <ErrorIcon /> },
  '手配中': { color: 'warning', label: '手配中', icon: <HourglassEmptyIcon /> },
  '手配完了': { color: 'info', label: '手配完了', icon: <DoneIcon /> },
  '支払済み': { color: 'success', label: '支払済み', icon: <PaymentIcon /> }
};

/**
 * ステータスコードからテキストを取得する関数
 * 
 * @param {string} status - ステータスコード
 * @param {Object} config - ステータス設定 (オプション)
 * @returns {string} ステータスのラベルテキスト
 */
export const statusToText = (status, config = statusConfig) => {
  return config[status]?.label || status || '不明';
};

export default StatusChip;