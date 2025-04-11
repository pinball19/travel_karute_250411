import React from 'react';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  backgroundColor: color ? theme.palette[color].light : theme.palette.grey[50],
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  '& svg': {
    fontSize: '2rem',
  }
}));

const ValueTypography = styled(Typography)(({ theme, color }) => ({
  fontWeight: 'bold',
  color: color ? theme.palette[color].dark : theme.palette.text.primary,
}));

/**
 * 統計情報表示用カードコンポーネント
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - 表示するアイコン
 * @param {string} props.title - カードのタイトル
 * @param {string|number} props.value - 表示する値
 * @param {string} props.color - カードの色（primary, secondary, success, warning, error）
 * @param {React.ReactNode} props.action - アクションボタンなど
 */
const StatCard = ({ icon, title, value, color, action }) => {
  return (
    <StyledCard color={color}>
      <CardContent>
        {icon && (
          <IconWrapper>
            {icon}
          </IconWrapper>
        )}
        <Typography color="textSecondary" gutterBottom variant="body2">
          {title}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <ValueTypography variant="h5" color={color}>
            {value}
          </ValueTypography>
          {action && (
            <Box>
              {action}
            </Box>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default StatCard;