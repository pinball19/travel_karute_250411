import React from 'react';
import { Typography, styled } from '@mui/material';

// スタイル付きの見出しコンポーネント
const StyledSectionTitle = styled(Typography)(({ theme, color = 'primary' }) => ({
  backgroundColor: color === 'primary' ? theme.palette.primary.main : theme.palette[color]?.main || theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  fontWeight: 500,
}));

/**
 * セクションタイトルコンポーネント
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - タイトルテキスト
 * @param {string} props.color - 背景色 (primary, secondary, error, etc.)
 * @param {string} props.variant - Typographyのvariant
 * @param {Object} props.sx - 追加のスタイル
 */
const SectionTitle = ({ 
  children, 
  color = 'primary', 
  variant = 'h6',
  sx = {},
  ...props 
}) => {
  return (
    <StyledSectionTitle 
      variant={variant} 
      color={color}
      sx={sx}
      {...props}
    >
      {children}
    </StyledSectionTitle>
  );
};

export default SectionTitle;