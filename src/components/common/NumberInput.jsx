import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

/**
 * 数値入力フィールドコンポーネント
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
 * @param {string} props.suffix - 数値の後に表示する単位 (例: '人', '個')
 * @param {number} props.min - 最小値
 * @param {number} props.max - 最大値
 * @param {number} props.step - ステップ値
 * @param {Object} props.sx - スタイルオブジェクト
 * @param {string} props.variant - テキストフィールドのバリアント
 * @param {string} props.margin - マージン設定
 */
const NumberInput = ({
  label,
  value = '',
  onChange,
  name,
  helperText,
  required = false,
  readOnly = false,
  placeholder,
  suffix,
  min,
  max,
  step = 1,
  sx,
  variant,
  margin,
  id,
  fullWidth = true,
  error,
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

  const inputProps = {
    min: min,
    max: max,
    step: step,
    readOnly: readOnly,
    ...(suffix && {
      endAdornment: (
        <InputAdornment position="end">
          {suffix}
        </InputAdornment>
      )
    })
  };

  return (
    <TextField
      id={id || `number-input-${name}`}
      name={name}
      label={label}
      type="number"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      helperText={helperText}
      required={required}
      InputProps={inputProps}
      inputProps={{ min, max, step }}
      sx={{ ...sx }}
      fullWidth={fullWidth}
      variant={variant}
      margin={margin || "normal"}
      error={error}
      {...props}
    />
  );
};

export default NumberInput;