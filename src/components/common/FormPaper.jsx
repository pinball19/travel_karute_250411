import React from 'react';
import { Paper, styled } from '@mui/material';

// スタイル付きのペーパーコンポーネント
const StyledFormPaper = styled(Paper)(({ theme, padding = 3 }) => ({
  padding: theme.spacing(padding),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

/**
 * フォームペーパーコンポーネント
 * フォームセクションをラップするためのコンポーネント
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子要素
 * @param {number} props.padding - パディング（テーマスペーシング単位）
 * @param {Object} props.sx - 追加のスタイル
 * @param {number} props.elevation - エレベーション
 */
const FormPaper = ({ 
  children, 
  padding = 3,
  sx = {},
  elevation = 1,
  ...props 
}) => {
  return (
    <StyledFormPaper 
      padding={padding}
      elevation={elevation}
      sx={sx}
      {...props}
    >
      {children}
    </StyledFormPaper>
  );
};

export default FormPaper;