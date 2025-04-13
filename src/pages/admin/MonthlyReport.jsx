import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import useMonthlyData from '../../hooks/useMonthlyData';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrency, formatDate } from '../../utils/helpers';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.grey[50],
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const MonthlyReport = () => {
  const navigate = useNavigate();
  const { notification } = useAdmin();
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  
  const { data, loading, error } = useMonthlyData(year, month);
  
  // 年の選択肢を生成（過去3年から現在まで）
  const yearOptions = [];
  for (let y = currentDate.getFullYear(); y >= currentDate.getFullYear() - 3; y--) {
    yearOptions.push(y);
  }
  
  // 月の選択肢
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // チャート用データの変換
  const getChartData = () => {
    if (!data) return [];
    
    // シンプルな収支グラフデータ
    return [
      { name: '売上', value: data.totalRevenue },
      { name: '費用', value: data.totalExpense },
      { name: '利益', value: data.totalProfit }
    ];
  };
  
  // カルテごとの売上・利益グラフデータ
  const getKarteChartData = () => {
    if (!data || !data.karteList || data.karteList.length === 0) return [];
    
    return data.karteList
      .slice(0, 5) // 上位5件のみ表示
      .map(karte => ({
        name: karte.karteNo || karte.dantaiName || '不明',
        revenue: karte.revenue || 0,
        profit: karte.profit || 0
      }));
  };
  
  // CSVエクスポート機能
  const exportCSV = () => {
    if (!data) return;
    
    // CSV文字列の作成
    let csvContent = "カルテNo,担当者,クライアント,出発日,行先,売上,費用,利益,利益率\n";
    
    data.karteList.forEach(karte => {
      csvContent += [
        `"${karte.karteNo || ''}"`,
        `"${karte.tantosha || ''}"`,
        `"${karte.dantaiName || ''}"`,
        `"${karte.departureDate || ''}"`,
        `"${karte.destination || ''}"`,
        karte.revenue || 0,
        karte.expense || 0,
        karte.profit || 0,
        `${karte.profitRate?.toFixed(1) || 0}%`
      ].join(',') + "\n";
    });
    
    // CSVファイルのダウンロード
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `monthly_report_${year}_${month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <StyledContainer maxWidth="lg">
      <HeaderBox>
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={() => navigate('/admin')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">月別実績レポート</Typography>
        </Box>
        
        <Box display="flex" alignItems="center">
          <FormControl variant="outlined" size="small" sx={{ width: 120, mr: 2 }}>
            <InputLabel>年</InputLabel>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              label="年"
            >
              {yearOptions.map(y => (
                <MenuItem key={y} value={y}>{y}年</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ width: 120, mr: 2 }}>
            <InputLabel>月</InputLabel>
            <Select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              label="月"
            >
              {monthOptions.map(m => (
                <MenuItem key={m} value={m}>{m}月</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={exportCSV}
            disabled={loading || !data}
          >
            CSVエクスポート
          </Button>
        </Box>
      </HeaderBox>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
          <Typography color="error">データの読み込みに失敗しました: {error.message}</Typography>
        </Paper>
      ) : data ? (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    カルテ数
                  </Typography>
                  <Typography variant="h4" component="div">
                    {data.karteCount}件
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    総売上
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(data.totalRevenue)}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    総利益
                  </Typography>
                  <Typography variant="h4" component="div">
                    {formatCurrency(data.totalProfit)}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    利益率
                  </Typography>
                  <Typography variant="h4" component="div">
                    {data.averageProfitRate.toFixed(1)}%
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>
          
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>月間収支</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="金額" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>主要カルテの売上/利益</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getKarteChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#8884d8" name="売上" />
                      <Bar dataKey="profit" fill="#82ca9d" name="利益" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>カルテ一覧</Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>カルテNo</TableCell>
                    <TableCell>担当者</TableCell>
                    <TableCell>クライアント</TableCell>
                    <TableCell>出発日</TableCell>
                    <TableCell>行先</TableCell>
                    <TableCell align="right">売上</TableCell>
                    <TableCell align="right">利益</TableCell>
                    <TableCell align="right">利益率</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.karteList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        該当するカルテがありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.karteList.map(karte => (
                      <TableRow key={karte.id} hover>
                        <TableCell>{karte.karteNo || '-'}</TableCell>
                        <TableCell>{karte.tantosha || '-'}</TableCell>
                        <TableCell>{karte.dantaiName || '-'}</TableCell>
                        <TableCell>{karte.departureDate || '-'}</TableCell>
                        <TableCell>{karte.destination || '-'}</TableCell>
                        <TableCell align="right">{formatCurrency(karte.revenue)}</TableCell>
                        <TableCell align="right">{formatCurrency(karte.profit)}</TableCell>
                        <TableCell align="right">{karte.profitRate?.toFixed(1) || 0}%</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/karte/${karte.id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography>データがありません</Typography>
        </Paper>
      )}

      {/* 通知スナックバー */}
      <Snackbar
        open={notification.show}
        autoHideDuration={3000}
        onClose={() => {}}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={notification.type}
          variant="filled"
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export default MonthlyReport;