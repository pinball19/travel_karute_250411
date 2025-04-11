import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKarte } from '../context/KarteContext';
import {
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Box,
  Toolbar,
  AppBar,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { formatDate } from '../utils/helpers';

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

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 'calc(100vh - 250px)',
}));

const KarteList = () => {
  const navigate = useNavigate();
  const { getKarteList, deleteKarte, loading, notification } = useKarte();
  
  const [karteList, setKarteList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  useEffect(() => {
    loadKarteList();
  }, []);
  
  useEffect(() => {
    if (karteList.length > 0) {
      const text = searchText.toLowerCase();
      if (!text) {
        setFilteredList(karteList);
      } else {
        const filtered = karteList.filter(karte => 
          (karte.karteNo && karte.karteNo.toLowerCase().includes(text)) ||
          (karte.tantosha && karte.tantosha.toLowerCase().includes(text)) ||
          (karte.dantaiName && karte.dantaiName.toLowerCase().includes(text)) ||
          (karte.destination && karte.destination.toLowerCase().includes(text))
        );
        setFilteredList(filtered);
      }
      setPage(0);
    }
  }, [searchText, karteList]);
  
  const loadKarteList = async () => {
    const list = await getKarteList();
    setKarteList(list);
    setFilteredList(list);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleEditKarte = (id) => {
    navigate(`/karte/${id}`);
  };
  
  const handleOpenDeleteConfirm = (id) => {
    setConfirmDelete(id);
  };
  
  const handleDeleteKarte = async () => {
    if (confirmDelete) {
      await deleteKarte(confirmDelete);
      setConfirmDelete(null);
      loadKarteList();
    }
  };
  
  const handleCreateNew = () => {
    // リスト画面から新規作成する場合も、強制的にページをリロード
    window.location.href = '/karte/new';
  };
  
  // 表示するレコードの計算
  const emptyRows = page > 0 
    ? Math.max(0, (1 + page) * rowsPerPage - filteredList.length) 
    : 0;
  
  const visibleRows = filteredList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ 
          flexDirection: { xs: 'column', sm: 'row' },
          padding: { xs: 1, sm: 2 },
          alignItems: 'center'
        }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              mb: { xs: 1, sm: 0 },
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            団体ナビ成約カルテ一覧
          </Typography>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              py: { xs: 0.5, sm: 1 },
              px: { xs: 1, sm: 2 }
            }}
          >
            新規カルテ作成
          </Button>
        </Toolbar>
      </AppBar>
      
      <StyledContainer>
        <Paper elevation={3} sx={{ p: 3 }}>
          <HeaderBox>
            <Typography variant="h5" component="h1">
              カルテ一覧
            </Typography>
          </HeaderBox>
          
          <SearchBox>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="検索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </SearchBox>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <StyledTableContainer component={Paper}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>カルテNo</TableCell>
                      <TableCell>担当者</TableCell>
                      <TableCell>クライアント</TableCell>
                      <TableCell>出発日</TableCell>
                      <TableCell>行先</TableCell>
                      <TableCell>最終更新</TableCell>
                      <TableCell align="center">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          {searchText ? 
                            `"${searchText}" に一致するカルテはありません` : 
                            'カルテがありません'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map((karte) => (
                        <TableRow key={karte.id} hover>
                          <TableCell>{karte.karteNo || '-'}</TableCell>
                          <TableCell>{karte.tantosha || '-'}</TableCell>
                          <TableCell>{karte.dantaiName || '-'}</TableCell>
                          <TableCell>{karte.departureDate || '-'}</TableCell>
                          <TableCell>{karte.destination || '-'}</TableCell>
                          <TableCell>
                            {karte.lastUpdated ? formatDate(karte.lastUpdated, true) : '-'}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleEditKarte(karte.id)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => handleOpenDeleteConfirm(karte.id)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={7} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="件数:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
              />
            </>
          )}
        </Paper>
      </StyledContainer>
      
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
      
      {/* 削除確認ダイアログ */}
      <Dialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
      >
        <DialogTitle>カルテの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            このカルテを削除しますか？この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>キャンセル</Button>
          <Button onClick={handleDeleteKarte} color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KarteList;