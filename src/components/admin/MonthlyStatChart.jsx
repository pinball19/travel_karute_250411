import React from 'react';

import {
  Box,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/helpers';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  minHeight: 300,
}));

/**
 * 月間統計グラフコンポーネント
 * 
 * @param {Object} props
 * @param {Array} props.data - グラフデータ
 * @param {boolean} props.loading - ローディング状態
 * @param {string} props.title - タイトル
 * @param {number} props.height - グラフの高さ（デフォルト: 300）
 */
const MonthlyStatChart = ({ 
  data = [], 
  loading = false, 
  title = '月間統計', 
  height = 300 
}) => {
  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1, border: '1px solid #ddd' }}>
          <Typography variant="body2">{`${label}`}</Typography>
          {payload.map((entry, index) => (
            <Typography 
              key={`tooltip-${index}`} 
              variant="body2" 
              sx={{ color: entry.color }}
            >
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <StyledPaper>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <ChartContainer style={{ height }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : data.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="textSecondary">データがありません</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {/* 動的にグラフのバーを生成 */}
              {Object.keys(data[0])
                .filter(key => key !== 'name')
                .map((key, index) => {
                  // 色の配列
                  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#af19ff'];
                  return (
                    <Bar 
                      key={key} 
                      dataKey={key} 
                      name={key} 
                      fill={colors[index % colors.length]} 
                    />
                  );
                })}
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </StyledPaper>
  );
};

export default MonthlyStatChart;