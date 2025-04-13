import React, { useState, useEffect } from 'react';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrency } from '../../utils/helpers';

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

const StaffPerformance = () => {
  const navigate = useNavigate();
  const { notification, showNotification, fetchMonthlyData, fetchStaffList } = useAdmin();
  
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffStats, setStaffStats] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  // 年の選択肢を生成（過去3年から現在まで）
  const yearOptions = [];
  for (let y = currentDate.getFullYear(); y >= currentDate.getFullYear() - 3; y--) {
    yearOptions.push(y);
  }
  
  // 月の選択肢
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 色設定
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 担当者リストを取得
        const staff = await fetchStaffList();
        setStaffList(staff);
        
        // 月間データを取得
        const monthlySummary = await fetchMonthlyData(year, month);
        
        // 担当者ごとのデータを集計
        const stats = {};
        
        // 初期化
        staff.forEach(s => {
          stats[s.name] = {
            name: s.name,
            karteCount: 0,
            totalRevenue: 0,
            totalProfit: 0,
            avgProfitRate: 0,
            karteList: []
          };
        });
        
        // データ集計
        if (monthlySummary && monthlySummary.karteList) {
          monthlySummary.karteList.forEach(karte => {
            const staffName = karte.tantosha || 'Unknown';
            if (!stats[staffName]) {
              stats[staffName] = {
                name: staffName,
                karteCount: 0,
                totalRevenue: 0,
                totalProfit: 0,
                avgProfitRate: 0,
                karteList: []
              };
            }
            
            stats[staffName].karteCount++;
            stats[staffName].totalRevenue += karte.revenue || 0;
            stats[staffName].totalProfit += karte.profit || 0;
            stats[staffName].karteList.push(karte);
          });
        }
        
        // 平均利益率計算
        Object.keys(stats).forEach(name => {
          const stat = stats[name];
          if (stat.totalRevenue > 0) {
            stat.avgProfitRate = (stat.totalProfit / stat.totalRevenue * 100);
          }
        });
        
        // 配列に変換してソート
        const statsArray = Object.values(stats).sort((a, b) => b.totalRevenue - a.totalRevenue);
        setStaffStats(statsArray);
        
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError(err);
        showNotification('データの取得に失敗しました', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [year, month, fetchMonthlyData, fetchStaffList, showNotification]);
  
  // 売上シェア円グラフ用データ
  const getRevenueShareData = () => {
    return staffStats
      .filter(staff => staff.totalRevenue > 0)
      .map(staff => ({
        name: staff.name,
        value: staff.totalRevenue
      }));
  };
  
  // 利益シェア円グラフ用データ
  const getProfitShareData = () => {
    return staffStats
      .filter(staff => staff.totalProfit > 0)
      .map(staff => ({
        name: staff.name,
        value: staff.totalProfit
      }));
  };
  
  // カルテ数バーグラフ用データ
  const getKarteCountData = () => {
    return staffStats
      .filter(staff => staff.karteCount > 0)
      .map(staff => ({
        name: staff.name,
        count: staff.karteCount
      }));
  };
  
  // CSVエクスポート機能
  const exportCSV = () => {
    if (staffStats.length === 0) return;
    
    // CSV文字列の作成
    let csvContent = "担当者,カルテ数,売上合計,利益合計,平均利益率\n";
    
    staffStats.forEach(staff => {
      csvContent += [
        `"${staff.name || ''}"`,
        staff.karteCount || 0,
        staff.totalRevenue || 0,
        staff.totalProfit || 0,
        `${staff.avgProfitRate?.toFixed(1) || 0}%`
      ].join(',') + "\n";
    });
    
    // CSVファイルのダウンロード
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = `${year}${String(month).padStart(2, '0')}`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', `staff_performance_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('CSVファイルをエクスポートしました', 'success');
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
          <Typography variant="h5" component="h1">担当者別実績</Typography>
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
            disabled={loading || staffStats.length === 0}
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
      ) : staffStats.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>データがありません</Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>担当者別実績</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>担当者</TableCell>
                    <TableCell align="right">カルテ数</TableCell>
                    <TableCell align="right">売上合計</TableCell>
                    <TableCell align="right">利益合計</TableCell>
                    <TableCell align="right">平均利益率</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffStats.map((staff) => (
                    <TableRow key={staff.name} hover>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell align="right">{staff.karteCount}</TableCell>
                      <TableCell align="right">{formatCurrency(staff.totalRevenue)}</TableCell>
                      <TableCell align="right">{formatCurrency(staff.totalProfit)}</TableCell>
                      <TableCell align="right">{staff.avgProfitRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>売上シェア</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getRevenueShareData()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={(entry) => `${entry.name}: ${((entry.value / staffStats.reduce((sum, s) => sum + s.totalRevenue, 0)) * 100).toFixed(1)}%`}
                      >
                        {getRevenueShareData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>利益シェア</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getProfitShareData()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#82ca9d"
                        label={(entry) => `${entry.name}: ${((entry.value / staffStats.reduce((sum, s) => sum + s.totalProfit, 0)) * 100).toFixed(1)}%`}
                      >
                        {getProfitShareData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>カルテ数比較</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getKarteCountData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="カルテ数" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>担当者別売上・利益</Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#8884d8" name="売上" />
                  <Bar dataKey="totalProfit" fill="#82ca9d" name="利益" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </>
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

export default StaffPerformance;