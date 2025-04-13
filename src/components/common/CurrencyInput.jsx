import React from 'react';
import { TextField, InputAdornment, Typography } from '@mui/material';

/**
 * 金額入力フィールドコンポーネント
 * 
 * @param {Object} props
 * @param {string} props.label - 入力フィールドのラベル
 * @param {string|number} props.value - 入力値
 * @param {Function} props.onChange - 値変更時のコールバック関数
 * @param {string} props.name - フィールド名
 * @param {string} props.helperText - ヘルパーテキスト
 * @param {boolean} props.required - 必須項目かどうか
 * @param {boolean} props.readOnly - 読み取り専用かどうか
 * @param {string} props.placeholder - プレースホルダーテキスト
 * @param {string} props.currency - 通貨単位 (デフォルト: '円')
 * @param {Object} props.sx - スタイルオブジェクト
 * @param {Object} props.inputProps - 入力要素のprops
 * @param {string} props.variant - テキストフィールドのバリアント
 * @param {string} props.margin - マージン設定
 * @param {string} props.id - フィールドID
 * @param {string} props.error - エラー状態
 */
const CurrencyInput = ({
  label = '金額',
  value = '',
  onChange,
  name,
  helperText,
  required = false,
  readOnly = false,
  placeholder,
  currency = '円',
  sx,
  inputProps,
  variant,
  margin,
  id,
  error,
  fullWidth = true,
  ...props
}) => {
  const handleChange = (e) => {
    // 入力値が空の場合は空文字列を返す、それ以外は数値に変換
    const numericValue = e.target.value === '' ? '' : e.target.value;
    
    if (onChange) {
      // 元のイベントオブジェクトを維持しつつ、値を更新
      const event = {
        ...e,
        target: {
          ...e.target,
          name: name,
          value: numericValue
        }
      };
      onChange(event);
    }
  };

  return (
    <TextField
      id={id || `currency-input-${name}`}
      name={name}
      label={label}
      type="number"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      helperText={helperText}
      required={required}
      InputProps={{
        readOnly: readOnly,
        endAdornment: (
          <InputAdornment position="end">
            <Typography variant="body2" color="text.secondary">
              {currency}
            </Typography>
          </InputAdornment>
        ),
        ...inputProps
      }}
      sx={{ ...sx }}
      fullWidth={fullWidth}
      variant={variant}
      margin={margin || "normal"}
      error={error}
      {...props}
    />
  );
};

export default CurrencyInput;