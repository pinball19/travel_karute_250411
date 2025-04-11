import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Button, 
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { useKarte } from '../context/KarteContext';

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
}));

const KarteListModal = ({ open, onClose }) => {
  const { getKarteList, loadKarte, deleteKarte, loading } = useKarte();
  const [karteList, setKarteList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open && !loaded) {
      loadKarteData();
    }
  }, [open, loaded]);

  // 検索テキストが変更されたときにリストをフィルタリング
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
    }
  }, [searchText, karteList]);

  const loadKarteData = async () => {
    const list = await getKarteList();
    setKarteList(list);
    setFilteredList(list);
    setLoaded(true);
  };

  const handleEdit = (id) => {
    loadKarte(id);
    onClose();
  };

  const handleDelete = async (id) => {
    if (window.confirm('このカルテを削除しますか？')) {
      await deleteKarte(id);
      loadKarteData(); // 削除後に一覧を再読み込み
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const handleCloseModal = () => {
    setSearchText('');
    setLoaded(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        カルテ一覧
        <IconButton
          aria-label="close"
          onClick={handleCloseModal}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <SearchBox>
          <SearchIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
          <TextField
            variant="standard"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="検索..."
            InputProps={{ disableUnderline: true }}
          />
        </SearchBox>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>カルテNo</TableCell>
                  <TableCell>担当者</TableCell>
                  <TableCell>会社名</TableCell>
                  <TableCell>出発日</TableCell>
                  <TableCell>行先</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {searchText ? 
                        `"${searchText}" に一致するカルテはありません` : 
                        'カルテがありません'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredList.map((karte) => (
                    <TableRow key={karte.id} hover>
                      <TableCell>{karte.karteNo || '-'}</TableCell>
                      <TableCell>{karte.tantosha || '-'}</TableCell>
                      <TableCell>{karte.dantaiName || '-'}</TableCell>
                      <TableCell>{karte.departureDate || '-'}</TableCell>
                      <TableCell>{karte.destination || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(karte.id)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(karte.id)}
                          size="small"
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KarteListModal;