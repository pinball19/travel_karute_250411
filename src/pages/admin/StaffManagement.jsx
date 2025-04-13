import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useAdmin } from '../../context/AdminContext';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const StaffManagement = () => {
  const navigate = useNavigate();
  const { 
    staffList, 
    loading, 
    error, 
    notification,
    showNotification,
    fetchMonthlyData,
    fetchStaffList, 
    addStaff, 
    updateStaff, 
    deleteStaff 
  } = useAdmin();
  
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editStaff, setEditStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  
  // 担当者一覧を取得
  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);
  
  // ダイアログを開く
  const handleOpenDialog = (staff = null) => {
    if (staff) {
      setEditStaff(staff);
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || ''
      });
    } else {
      setEditStaff(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: ''
      });
    }
    setOpen(true);
  };
  
  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setOpen(false);
  };
  
  // フォーム入力の処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 担当者の保存
  const handleSaveStaff = async () => {
    if (editStaff) {
      await updateStaff(editStaff.id, formData);
    } else {
      await addStaff(formData);
    }
    handleCloseDialog();
  };
  
  // 削除確認ダイアログを開く
  const handleOpenDeleteConfirm = (staff) => {
    setConfirmDelete(staff);
  };
  
  // 担当者の削除
  const handleDeleteStaff = async () => {
    if (confirmDelete) {
      await deleteStaff(confirmDelete.id);
      setConfirmDelete(null);
    }
  };
  
  // 担当者別実績CSVエクスポート
  const exportStaffStats = async () => {
    try {
      // 月間データを取得（現在年月）
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      
      const monthlySummary = await fetchMonthlyData(year, month);
      
      // 担当者ごとのデータを集計
      const staffStats = {};
      
      // 初期化
      staffList.forEach(staff => {
        staffStats[staff.name] = {
          name: staff.name,
          karteCount: 0,
          totalRevenue: 0,
          totalProfit: 0,
          avgProfitRate: 0
        };
      });
      
      // データ集計
      if (monthlySummary && monthlySummary.karteList) {
        monthlySummary.karteList.forEach(karte => {
          const staffName = karte.tantosha || 'Unknown';
          if (!staffStats[staffName]) {
            staffStats[staffName] = {
              name: staffName,
              karteCount: 0,
              totalRevenue: 0,
              totalProfit: 0,
              avgProfitRate: 0
            };
          }
          
          staffStats[staffName].karteCount++;
          staffStats[staffName].totalRevenue += karte.revenue || 0;
          staffStats[staffName].totalProfit += karte.profit || 0;
        });
      }
      
      // 平均利益率計算
      Object.keys(staffStats).forEach(name => {
        const stat = staffStats[name];
        if (stat.totalRevenue > 0) {
          stat.avgProfitRate = (stat.totalProfit / stat.totalRevenue * 100).toFixed(1);
        }
      });
      
      // CSVデータを作成
      let csvContent = "担当者,カルテ数,売上合計,利益合計,平均利益率\n";
      
      Object.values(staffStats).forEach(stat => {
        csvContent += `${stat.name},${stat.karteCount},${stat.totalRevenue},${stat.totalProfit},${stat.avgProfitRate}%\n`;
      });
      
      // CSVファイルをダウンロード
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = `${year}${String(month).padStart(2, '0')}`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", `staff_stats_${date}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('CSVファイルをエクスポートしました', 'success');
      
    } catch (error) {
      console.error('CSV出力エラー:', error);
      showNotification('CSVファイルの出力に失敗しました', 'error');
    }
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
          <Typography variant="h5" component="h1">担当者管理</Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={exportStaffStats}
            startIcon={<FileDownloadIcon />}
          >
            CSV出力
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            担当者を追加
          </Button>
        </Box>
      </HeaderBox>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          データの取得に失敗しました: {error.message}
        </Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>名前</TableCell>
                  <TableCell>メールアドレス</TableCell>
                  <TableCell>電話番号</TableCell>
                  <TableCell>役割</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      担当者がいません
                    </TableCell>
                  </TableRow>
                ) : (
                  staffList.map((staff) => (
                    <TableRow key={staff.id} hover>
                      <TableCell>{staff.name || '-'}</TableCell>
                      <TableCell>{staff.email || '-'}</TableCell>
                      <TableCell>{staff.phone || '-'}</TableCell>
                      <TableCell>{staff.role || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(staff)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleOpenDeleteConfirm(staff)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* 担当者追加/編集ダイアログ */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editStaff ? '担当者を編集' : '担当者を追加'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="名前"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="メールアドレス"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="電話番号"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="役割"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            placeholder="例: 営業担当、手配担当など"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button 
            onClick={handleSaveStaff} 
            variant="contained" 
            color="primary"
            disabled={!formData.name}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 削除確認ダイアログ */}
      <Dialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
      >
        <DialogTitle>担当者の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDelete?.name || ''}を担当者リストから削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>キャンセル</Button>
          <Button onClick={handleDeleteStaff} color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default StaffManagement;