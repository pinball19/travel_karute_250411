import React from 'react';

import { useKarte } from '../context/KarteContext';
import { Paper, Typography, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  backgroundColor: '#5b9bd5',
  color: 'white',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const MemoSection = () => {
  const { karteData, updateField } = useKarte();
  
  const handleChange = (e) => {
    updateField('memo', e.target.value);
  };
  
  return (
    <FormPaper elevation={2}>
      <SectionTitle variant="h6">◆ メモ欄</SectionTitle>
      
      <TextField
        fullWidth
        id="memo"
        name="memo"
        value={karteData.memo || ''}
        onChange={handleChange}
        placeholder="自由にメモを記入してください"
        multiline
        rows={5}
        variant="outlined"
      />
    </FormPaper>
  );
};

export default MemoSection;