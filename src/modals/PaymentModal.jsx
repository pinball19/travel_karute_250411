import React from 'react';

import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  Typography
} from '@mui/material';

/**
 * 入金情報の追加/編集モーダル
 * 
 * @param {Object} props
 * @param {boolean} props.open - モーダルの表示状態
 * @param {Object} props.payment - 編集中の入金情報（新規追加時はnull）
 * @param {Function} props.onClose - モーダルを閉じる関数
 * @param {Function} props.onSave - 保存時のコールバック関数
 */
const PaymentModal = ({ open, payment, onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    dueDate: '',
    date: '',
    amount: '',
    place: '',
    notes: ''
  });

  // payment が変更されたときにフォームデータを更新
  React.useEffect(() => {
    if (payment) {
      setFormData({
        dueDate: payment.dueDate || '',
        date: payment.date || '',
        amount: payment.amount || '',
        place: payment.place || '',
        notes: payment.notes || ''
      });
    } else {
      // 新規作成時は初期化
      setFormData({
        dueDate: '',
        date: '',
        amount: '',
        place: '',
        notes: ''
      });
    }
  }, [payment, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // 数値に変換
    const paymentData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0
    };
    
    onSave(paymentData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {payment ? '入金情報の編集' : '入金情報の追加'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            label="入金予定日"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="入金日"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="入金額"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            InputProps={{
              endAdornment: <Typography sx={{ ml: 1 }}>円</Typography>,
            }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="入金場所"
            name="place"
            value={formData.place}
            onChange={handleChange}
          />
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

export default PaymentModal;