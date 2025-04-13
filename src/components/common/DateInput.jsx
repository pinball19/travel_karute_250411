import React from 'react';
import { TextField } from '@mui/material';

/**
 * 日付入力フィールドコンポーネント
 * 
 * @param {Object} props
 * @param {string} props.label - 入力フィールドのラベル
 * @param {string} props.value - 入力値 (YYYY-MM-DD形式)
 * @param {Function} props.onChange - 値変更時のコールバック関数
 * @param {string} props.name - フィールド名
 * @param {string} props.helperText - ヘルパーテキスト
 * @param {boolean} props.required - 必須項目かどうか
 * @param {boolean} props.readOnly - 読み取り専用かどうか
 * @param {string} props.minDate - 最小日付 (YYYY-MM-DD形式)
 * @param {string} props.maxDate - 最大日付 (YYYY-MM-DD形式)
 * @param {Object} props.sx - スタイルオブジェクト
 * @param {string} props.variant - テキストフィールドのバリアント
 * @param {string} props.margin - マージン設定
 */
const DateInput = ({
  label,
  value = '',
  onChange,
  name,
  helperText,
  required = false,
  readOnly = false,
  minDate = "2020-01-01",
  maxDate = "2030-12-31",
  sx,
  variant,
  margin,
  id,
  fullWidth = true,
  ...props
}) => {
  return (
    <TextField
      id={id || `date-input-${name}`}
      name={name}
      label={label}
      type="date"
      value={value}
      onChange={onChange}
      helperText={helperText}
      required={required}
      InputProps={{
        readOnly: readOnly
      }}
      InputLabelProps={{ 
        shrink: true 
      }}
      inputProps={{ 
        min: minDate, 
        max: maxDate
      }}
      sx={{ 
        input: { cursor: 'pointer' },
        ...sx 
      }}
      fullWidth={fullWidth}
      variant={variant}
      margin={margin || "normal"}
      {...props}
    />
  );
};

export default DateInput;