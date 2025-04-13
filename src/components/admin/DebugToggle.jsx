// src/components/admin/DebugToggle.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Switch, 
  FormControlLabel,
  Typography,
  Paper
} from '@mui/material';
import logger, { LOG_LEVELS, setLogLevel, setLogEnabled, logConfig } from '../../utils/logger';

/**
 * デバッグモードを切り替えるコンポーネント
 * 管理者ページでのみ表示する
 */
const DebugToggle = () => {
  const [enabled, setEnabled] = useState(logConfig.enabled);
  const [level, setLevel] = useState(logConfig.level);

  // 初回ロード時に localStorage から設定を復元
  useEffect(() => {
    try {
      const savedConfig = JSON.parse(localStorage.getItem('debugConfig'));
      if (savedConfig) {
        setEnabled(savedConfig.enabled);
        setLevel(savedConfig.level);
        setLogEnabled(savedConfig.enabled);
        setLogLevel(savedConfig.level);
      }
    } catch (error) {
      logger.error('デバッグ設定の読み込みエラー:', { error });
    }
  }, []);

  // 設定変更時に localStorage に保存
  const saveSettings = (newEnabled, newLevel) => {
    try {
      const config = { enabled: newEnabled, level: newLevel };
      localStorage.setItem('debugConfig', JSON.stringify(config));
    } catch (error) {
      logger.error('デバッグ設定の保存エラー:', { error });
    }
  };

  // ログ有効/無効の切り替え
  const handleToggleEnabled = (event) => {
    const newEnabled = event.target.checked;
    setEnabled(newEnabled);
    setLogEnabled(newEnabled);
    saveSettings(newEnabled, level);
    
    // フィードバック
    if (newEnabled) {
      logger.info('デバッグログが有効になりました');
    }
  };

  // ログレベルの変更
  const handleLevelChange = (event) => {
    const newLevel = event.target.value;
    setLevel(newLevel);
    setLogLevel(newLevel);
    saveSettings(enabled, newLevel);
    
    // フィードバック
    logger.info(`ログレベルが ${getLevelName(newLevel)} に設定されました`);
  };

  // ログレベル名の取得
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

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        デバッグ設定
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={handleToggleEnabled}
              color="primary"
            />
          }
          label="デバッグログを有効にする"
        />
      </Box>
      
      <FormControl sx={{ minWidth: 200 }} disabled={!enabled}>
        <InputLabel id="log-level-label">ログレベル</InputLabel>
        <Select
          labelId="log-level-label"
          value={level}
          label="ログレベル"
          onChange={handleLevelChange}
        >
          <MenuItem value={LOG_LEVELS.NONE}>なし</MenuItem>
          <MenuItem value={LOG_LEVELS.ERROR}>エラーのみ</MenuItem>
          <MenuItem value={LOG_LEVELS.WARN}>警告以上</MenuItem>
          <MenuItem value={LOG_LEVELS.INFO}>情報以上</MenuItem>
          <MenuItem value={LOG_LEVELS.DEBUG}>デバッグ以上</MenuItem>
          <MenuItem value={LOG_LEVELS.TRACE}>トレース（すべて）</MenuItem>
        </Select>
      </FormControl>
      
      {enabled && (
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          現在のログレベル: {getLevelName(level)} ({level})
        </Typography>
      )}
    </Paper>
  );
};

export default DebugToggle;