import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box
} from '@mui/material';
import { DateInput, CurrencyInput } from '../components/common';
import { useFormState } from '../hooks';

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
  // カスタムフックを使用してフォーム状態を管理
  const initialState = {
    dueDate: '',
    date: '',
    amount: '',
    place: '',
    notes: ''
  };

  const handleSubmit = (data) => {
    // 数値に変換
    const paymentData = {
      ...data,
      amount: parseFloat(data.amount) || 0
    };
    
    onSave(paymentData);
  };

  const { 
    formData, 
    handleChange, 
    resetForm,
    handleSubmit: submitForm
  } = useFormState(initialState, handleSubmit);

  // payment が変更されたときにフォームデータを更新
  React.useEffect(() => {
    if (payment) {
      resetForm({
        dueDate: payment.dueDate || '',
        date: payment.date || '',
        amount: payment.amount || '',
        place: payment.place || '',
        notes: payment.notes || ''
      });
    } else {
      // 新規作成時は初期化
      resetForm(initialState);
    }
  }, [payment, open, resetForm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {payment ? '入金情報の編集' : '入金情報の追加'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <DateInput
            label="入金予定日"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
          <DateInput
            label="入金日"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
          <CurrencyInput
            label="入金額"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
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
        <Button onClick={submitForm} variant="contained" color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;