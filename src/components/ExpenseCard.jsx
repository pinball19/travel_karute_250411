import React from 'react';

import { Card, CardContent, Typography, Button, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: '1px solid #ddd',
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid #ddd',
}));

const CardActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

const ItemLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '0.925rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(0.5),
  backgroundColor: '#f5f5f5',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  display: 'inline-block',
}));

const ItemValue = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '1rem',
  paddingLeft: theme.spacing(1),
}));

const InfoItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(1),
  backgroundColor: 'white',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid #e0e0e0',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(0.5, 1),
}));

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  // 金額をフォーマット
  const formatAmount = (amount) => {
    return Number(amount).toLocaleString() + '円';
  };

  // 日付をフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <StyledCard>
      <CardHeader>
        <Typography variant="subtitle1" fontWeight="bold">
          {expense.vendor} ({expense.status})
        </Typography>
        <CardActions>
          <ActionButton
            size="small"
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => onEdit(expense)}
          >
            編集
          </ActionButton>
          <ActionButton
            size="small"
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(expense.id)}
          >
            削除
          </ActionButton>
        </CardActions>
      </CardHeader>
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <InfoItem>
              <ItemLabel>利用日</ItemLabel>
              <ItemValue>{formatDate(expense.date) || '-'}</ItemValue>
            </InfoItem>
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <InfoItem>
              <ItemLabel>担当者</ItemLabel>
              <ItemValue>{expense.person || '-'}</ItemValue>
            </InfoItem>
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <InfoItem>
              <ItemLabel>支払予定日</ItemLabel>
              <ItemValue>{formatDate(expense.dueDate) || '-'}</ItemValue>
            </InfoItem>
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <InfoItem>
              <ItemLabel>支払金額</ItemLabel>
              <ItemValue>{formatAmount(expense.amount)}</ItemValue>
            </InfoItem>
          </Grid>
          {expense.phone && (
            <Grid size={{xs: 12, sm: 6}}>
              <InfoItem>
                <ItemLabel>電話/FAX</ItemLabel>
                <ItemValue>{expense.phone}</ItemValue>
              </InfoItem>
            </Grid>
          )}
          <Grid size={{xs: 12}}>
            <Box sx={{ 
              mt: 0, 
              borderTop: '1px solid #ddd', 
              backgroundColor: '#f5f5f5', 
              padding: 1,
              paddingLeft: 1.5,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              minHeight: '40px'
            }}>
              <ItemLabel sx={{ 
                backgroundColor: '#ed7d31', 
                color: 'white', 
                marginRight: 1.5,
                marginBottom: 0
              }}>備考</ItemLabel>
              <Typography variant="body1">{expense.notes || '（備考なし）'}</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default ExpenseCard;