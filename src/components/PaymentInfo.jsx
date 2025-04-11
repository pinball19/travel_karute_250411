import React, { useState } from 'react';
import { useKarte } from '../context/KarteContext';
import { Paper, Typography, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import PaymentCard from './PaymentCard';
import PaymentModal from '../modals/PaymentModal';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  backgroundColor: '#70ad47',
  color: 'white',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const AddButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const PaymentInfo = () => {
  const { payments, addPayment, updatePayment, deletePayment } = useKarte();
  const [open, setOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const handleClickOpen = () => {
    setEditingPayment(null);
    setOpen(true);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = (paymentData) => {
    if (editingPayment) {
      updatePayment(editingPayment.id, paymentData);
    } else {
      addPayment(paymentData);
    }
    
    setOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('この入金情報を削除しますか？')) {
      deletePayment(id);
    }
  };

  return (
    <FormPaper elevation={2}>
      <SectionTitle variant="h6">◆ 入金情報</SectionTitle>
      
      {payments.length === 0 ? (
        <Typography color="textSecondary" align="center" sx={{ my: 3 }}>
          入金情報がありません
        </Typography>
      ) : (
        <Box>
          {payments.map(payment => (
            <PaymentCard
              key={payment.id}
              payment={payment}
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
        入金情報を追加
      </AddButton>

      {/* 入金情報追加/編集モーダル */}
      <PaymentModal
        open={open}
        payment={editingPayment}
        onClose={handleClose}
        onSave={handleSave}
      />
    </FormPaper>
  );
};

export default PaymentInfo;