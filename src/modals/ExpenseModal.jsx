import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DateInput, CurrencyInput, StatusChip } from '../components/common';
import { useFormState } from '../hooks';

/**
 * 支払情報の追加/編集モーダル
 * 
 * @param {Object} props
 * @param {boolean} props.open - モーダルの表示状態
 * @param {Object} props.expense - 編集中の支払情報（新規追加時はnull）
 * @param {Function} props.onClose - モーダルを閉じる関数
 * @param {Function} props.onSave - 保存時のコールバック関数
 */
const ExpenseModal = ({ open, expense, onClose, onSave }) => {
  // カスタムフックを使用してフォーム状態を管理
  const initialState = {
    date: '',
    vendor: '',
    phone: '',
    person: '',
    dueDate: '',
    amount: '',
    status: '未手配',
    notes: ''
  };

  const handleSubmit = (data) => {
    // 数値に変換
    const expenseData = {
      ...data,
      amount: parseFloat(data.amount) || 0
    };
    
    onSave(expenseData);
  };

  const { 
    formData, 
    handleChange, 
    resetForm,
    handleSubmit: submitForm
  } = useFormState(initialState, handleSubmit);

  // expense が変更されたときにフォームデータを更新
  React.useEffect(() => {
    if (expense) {
      resetForm({
        date: expense.date || '',
        vendor: expense.vendor || '',
        phone: expense.phone || '',
        person: expense.person || '',
        dueDate: expense.dueDate || '',
        amount: expense.amount || '',
        status: expense.status || '未手配',
        notes: expense.notes || ''
      });
    } else {
      // 新規作成時は初期化
      resetForm(initialState);
    }
  }, [expense, open, resetForm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {expense ? '支払情報の編集' : '支払情報の追加'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <DateInput
            label="利用日"
            name="date"
            value={formData.date}
            onChange={handleChange}
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
          <DateInput
            label="支払予定日"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
          <CurrencyInput
            label="支払金額"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
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
              <MenuItem value="未手配">
                <StatusChip status="未手配" size="small" />
              </MenuItem>
              <MenuItem value="手配中">
                <StatusChip status="手配中" size="small" />
              </MenuItem>
              <MenuItem value="手配完了">
                <StatusChip status="手配完了" size="small" />
              </MenuItem>
              <MenuItem value="支払済み">
                <StatusChip status="支払済み" size="small" />
              </MenuItem>
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
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={submitForm} variant="contained" color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseModal;