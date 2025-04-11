import React, { useState } from 'react';
import { useKarte } from '../context/KarteContext';
import { Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ExpenseCard from './ExpenseCard';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  backgroundColor: '#ed7d31',
  color: 'white',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const AddButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ExpenseInfo = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useKarte();
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    vendor: '',
    phone: '',
    person: '',
    dueDate: '',
    amount: '',
    status: '未手配',
    notes: ''
  });

  const handleClickOpen = () => {
    setEditingExpense(null);
    setFormData({
      date: '',
      vendor: '',
      phone: '',
      person: '',
      dueDate: '',
      amount: '',
      status: '未手配',
      notes: ''
    });
    setOpen(true);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date || '',
      vendor: expense.vendor || '',
      phone: expense.phone || '',
      person: expense.person || '',
      dueDate: expense.dueDate || '',
      amount: expense.amount || '',
      status: expense.status || '未手配',
      notes: expense.notes || ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // 数値に変換
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0
    };

    if (editingExpense) {
        // src/components/ExpenseInfo.js (続き)
      updateExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    
    setOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('この支払情報を削除しますか？')) {
      deleteExpense(id);
    }
  };

  return (
    <FormPaper elevation={2}>
      <SectionTitle variant="h6">◆ 支払情報</SectionTitle>
      
      {expenses.length === 0 ? (
        <Typography color="textSecondary" align="center" sx={{ my: 3 }}>
          支払情報がありません
        </Typography>
      ) : (
        <Box>
          {expenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}
      
      <AddButton
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
      >
        支払情報を追加
      </AddButton>

      {/* 支払情報追加/編集モーダル */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingExpense ? '支払情報の編集' : '支払情報の追加'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="利用日"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="手配先名"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="電話/FAX"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="担当者"
              name="person"
              value={formData.person}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="支払予定日"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="支払金額"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              InputProps={{
                endAdornment: <Typography sx={{ ml: 1 }}>円</Typography>,
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="expense-status-label">手配状況</InputLabel>
              <Select
                labelId="expense-status-label"
                name="status"
                value={formData.status}
                label="手配状況"
                onChange={handleChange}
              >
                <MenuItem value="未手配">未手配</MenuItem>
                <MenuItem value="手配中">手配中</MenuItem>
                <MenuItem value="手配完了">手配完了</MenuItem>
                <MenuItem value="支払済み">支払済み</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              label="備考"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </FormPaper>
  );
};

export default ExpenseInfo;