import React from 'react';

import { useKarte } from '../context/KarteContext';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  backgroundColor: '#7030a0',
  color: 'white',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const ValueBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  borderRadius: theme.shape.borderRadius,
  fontWeight: 'bold',
  fontSize: '1.1rem',
}));

const LabelTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const SummaryInfo = () => {
  const { calculateSummary } = useKarte();
  
  const summary = calculateSummary();
  
  return (
    <FormPaper elevation={2}>
      <SectionTitle variant="h6">◆ 収支情報</SectionTitle>
      
      <Grid container spacing={3}>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <LabelTypography>総入金額</LabelTypography>
          <ValueBox>
            {summary.totalPayment.toLocaleString()} 円
          </ValueBox>
        </Grid>
        
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <LabelTypography>総支払額</LabelTypography>
          <ValueBox>
            {summary.totalExpense.toLocaleString()} 円
          </ValueBox>
        </Grid>
        
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <LabelTypography>利益額</LabelTypography>
          <ValueBox>
            {summary.profit.toLocaleString()} 円
          </ValueBox>
        </Grid>
        
        <Grid size={{xs: 12, sm: 6, md: 6}}>
          <LabelTypography>利益率</LabelTypography>
          <ValueBox>
            {summary.profitRate} %
          </ValueBox>
        </Grid>
        
        <Grid size={{xs: 12, sm: 6, md: 6}}>
          <LabelTypography>一人あたり利益</LabelTypography>
          <ValueBox>
            {summary.profitPerPerson.toLocaleString()} 円
          </ValueBox>
        </Grid>
      </Grid>
    </FormPaper>
  );
};

export default SummaryInfo;