import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tabs,
  Tab,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import MoneyIcon from '@mui/icons-material/Money';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import ListIcon from '@mui/icons-material/List';
import { useAdmin } from '../../context/AdminContext';
import { collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { formatCurrency, formatDate } from '../../utils/helpers';
import DebugToggle from '../../components/admin/DebugToggle';
import logger from '../../utils/logger';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginTop: theme.spacing(1),
}));

const months = [
  '1月', '2月', '3月', '4月', '5月', '6月', 
  '7月', '8月', '9月', '10月', '11月', '12月'
];

const getPeriodLabel = (year, month, viewType) => {
  if (viewType === 'year') {
    return `${year}年`;
  } else {
    return `${year}年${months[month - 1]}`;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  // overallStats と fetchOverallStats を削除
  const { loading, error, notification, fetchMonthlyData } = useAdmin();
  const [recentKarte, setRecentKarte] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  
  // 期間選択のための状態
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [viewType, setViewType] = useState('month'); // 'month' or 'year'
  
  // 統計データの状態
  const [statsData, setStatsData] = useState({
    totalKarte: 0,
    totalRevenue: 0,
    totalProfit: 0,
    averageProfitRate: 0
  });

  // 期間を変更する関数
  const changePeriod = (direction) => {
    if (viewType === 'month') {
      // 月単位の切り替え
      let newMonth = month + direction;
      let newYear = year;
      
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      
      setMonth(newMonth);
      setYear(newYear);
    } else {
      // 年単位の切り替え
      setYear(year + direction);
    }
  };

  // 表示タイプを切り替える関数
  const toggleViewType = () => {
    setViewType(viewType === 'month' ? 'year' : 'month');
  };

  // 指定期間のデータを取得
  useEffect(() => {
    if (viewType === 'month') {
      fetchPeriodData(year, month);
    } else {
      fetchYearData(year);
    }
    loadRecentKarte();
  }, [year, month, viewType]);

  // 月間データを取得
  const fetchPeriodData = async (year, month) => {
    const data = await fetchMonthlyData(year, month);
    if (data) {
      setStatsData({
        totalKarte: data.karteCount,
        totalRevenue: data.totalRevenue,
        totalProfit: data.totalProfit,
        averageProfitRate: data.averageProfitRate
      });
    }
  };

  // 年間データを取得
  const fetchYearData = async (year) => {
    // 年初と年末の設定
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    
    try {
      // カルテデータを取得
      const q = query(
        collection(db, 'karte'),
        where('lastUpdated', '>=', startDate),
        where('lastUpdated', '<=', endDate)
      );
      
      const querySnapshot = await getDocs(q);
      
      // 集計用の変数
      let totalRevenue = 0;
      let totalExpense = 0;
      let totalProfit = 0;
      
      // カルテデータを処理
      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        // 入金データを集計
        const payments = data.payments || [];
        const revenue = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
        
        // 支払いデータを集計
        const expenses = data.expenses || [];
        const expense = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        
        // 利益を計算
        const profit = revenue - expense;
        
        // 合計に加算
        totalRevenue += revenue;
        totalExpense += expense;
        totalProfit += profit;
      });
      
      // 平均利益率を計算
      const averageProfitRate = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
      
      setStatsData({
        totalKarte: querySnapshot.size,
        totalRevenue,
        totalProfit,
        averageProfitRate
      });
      
    } catch (err) {
      logger.error('年間データ取得エラー:', { error: err });
    }
  };

  // 最近のカルテを取得
  const loadRecentKarte = async () => {
    setRecentLoading(true);
    try {
      // 最終更新日順に並べ替え
      const q = query(
        collection(db, 'karte'), 
        orderBy('lastUpdated', 'desc'), 
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      
      const karteList = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        karteList.push({
          id: doc.id,
          ...data.karteInfo,
          lastUpdated: data.lastUpdated?.toDate()
        });
      });
      
      setRecentKarte(karteList);
    } catch (err) {
      logger.error('最近のカルテ取得エラー:', { error: err });
    } finally {
      setRecentLoading(false);
    }
  };

  return (
    <StyledContainer maxWidth="lg">
      <Header sx={{
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' },
            textAlign: { xs: 'center', sm: 'left' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          管理ダッシュボード
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' },
          gap: 1
        }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/admin/monthly-report')}
            sx={{ 
              mr: { sm: 2 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            月別レポート
          </Button>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/admin/staff')}
              sx={{ 
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              担当者管理
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<BarChartIcon />}
              onClick={() => navigate('/admin/staff-performance')}
              sx={{ 
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              担当者別実績
            </Button>
          </Box>
        </Box>
      </Header>

      {/* 期間選択 */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          width: { xs: '100%', sm: 'auto' },
          justifyContent: { xs: 'center', sm: 'flex-start' }
        }}>
          <IconButton onClick={() => changePeriod(-1)} size="small">
            <NavigateBeforeIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mx: 2, 
              fontWeight: 'bold', 
              minWidth: '150px', 
              textAlign: 'center',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {getPeriodLabel(year, month, viewType)}
          </Typography>
          
          <IconButton onClick={() => changePeriod(1)} size="small">
            <NavigateNextIcon />
          </IconButton>
        </Box>
        
        <ButtonGroup 
          variant="outlined" 
          size="small"
          sx={{
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Tooltip title="月次表示">
            <Button 
              onClick={() => setViewType('month')}
              variant={viewType === 'month' ? 'contained' : 'outlined'}
              startIcon={<CalendarTodayIcon />}
              sx={{ flex: 1 }}
            >
              月次
            </Button>
          </Tooltip>
          <Tooltip title="年次表示">
            <Button 
              onClick={() => setViewType('year')}
              variant={viewType === 'year' ? 'contained' : 'outlined'}
              startIcon={<CalendarViewMonthIcon />}
              sx={{ flex: 1 }}
            >
              年次
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          データの取得に失敗しました: {error.message}
        </Alert>
      ) : (
        <>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <StyledCardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {viewType === 'month' ? '当月カルテ数' : '年間カルテ数'}
                  </Typography>
                  <StatValue variant="h4">
                    {statsData.totalKarte}件
                  </StatValue>
                </StyledCardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate('/karte-list')}>
                    カルテ一覧を見る
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <StyledCardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {viewType === 'month' ? '当月売上' : '年間売上'}
                  </Typography>
                  <StatValue variant="h4">
                    {formatCurrency(statsData.totalRevenue)}
                  </StatValue>
                </StyledCardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <StyledCardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {viewType === 'month' ? '当月利益' : '年間利益'}
                  </Typography>
                  <StatValue variant="h4">
                    {formatCurrency(statsData.totalProfit)}
                  </StatValue>
                </StyledCardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <StyledCardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {viewType === 'month' ? '当月利益率' : '年間利益率'}
                  </Typography>
                  <StatValue variant="h4">
                    {statsData.averageProfitRate.toFixed(1)}%
                  </StatValue>
                </StyledCardContent>
              </StyledCard>
            </Grid>
          </Grid>

          {/* デバッグ設定パネル - 開発・管理者向け */}
          {import.meta.env.DEV && (
            <DebugToggle />
          )}

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                最近の更新カルテ
              </Typography>
              <Tooltip title="最新の情報に更新">
                <IconButton size="small" onClick={loadRecentKarte} disabled={recentLoading}>
                  <UpdateIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {recentLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            ) : recentKarte.length === 0 ? (
              <Typography align="center" color="textSecondary" sx={{ py: 2 }}>
                カルテがありません
              </Typography>
            ) : (
              <List>
                {recentKarte.map((karte) => (
                  <ListItem
                    key={karte.id}
                    button
                    divider
                    onClick={() => navigate(`/karte/${karte.id}`)}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f5f5f5',
                        borderLeft: '3px solid #4472c4'
                      }
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight="bold">
                              {karte.karteNo || '番号なし'}
                            </Typography>
                          }
                          secondary={`担当: ${karte.tantosha || '-'}`}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <ListItemText
                          primary={karte.dantaiName || '団体名なし'}
                          secondary={`行先: ${karte.destination || '-'}`}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <ListItemText
                          primary={`出発日: ${karte.departureDate || '-'}`}
                          secondary={
                            <Typography variant="caption" color="primary" fontWeight="bold">
                              更新: {formatDate(karte.lastUpdated, true) || '-'}
                            </Typography>
                          }
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            )}
            
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/karte-list')}
                startIcon={<ListIcon />}
              >
                すべてのカルテを表示
              </Button>
            </Box>
          </Paper>
        </>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            // 管理画面から新規作成する場合は、強制的にページをリロード
            window.location.href = '/karte/new';
          }}
        >
          新規カルテ作成
        </Button>
      </Box>

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

export default AdminDashboard;