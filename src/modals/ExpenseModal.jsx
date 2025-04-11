import React from 'react';

import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

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
  const [formData, setFormData] = React.useState({
    date: '',
    vendor: '',
    phone: '',
    person: '',
    dueDate: '',
    amount: '',
    status: '未手配',
    notes: ''
  });

  // expense が変更されたときにフォームデータを更新
  React.useEffect(() => {
    if (expense) {
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
    } else {
      // 新規作成時は初期化
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
    }
  }, [expense, open]);

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
    
    onSave(expenseData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {expense ? '支払情報の編集' : '支払情報の追加'}
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
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseModal;