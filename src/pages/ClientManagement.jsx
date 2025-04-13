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
  DialogTitle,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Badge,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContactsIcon from '@mui/icons-material/Contacts';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { collection, getDocs, query, orderBy, limit, where, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, clientsService } from '../services/firebase';

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

// 新しいスタイル付きコンポーネント
const ContactChip = styled(Chip)(({ theme, isPrimary }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: isPrimary ? theme.palette.primary.light : theme.palette.grey[100],
  '&:hover': {
    backgroundColor: isPrimary ? theme.palette.primary.main : theme.palette.grey[200],
  },
}));

const PrimaryBadge = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(0.2, 0.8),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.65rem',
  marginLeft: theme.spacing(1),
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  '&.Mui-expanded': {
    margin: theme.spacing(1, 0, 2, 0),
  },
}));

const ContactList = styled(List)(({ theme }) => ({
  maxHeight: '300px',
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

// CSVインポート/エクスポート用のユーティリティ関数
const exportToCSV = (data, filename) => {
  // ヘッダー行
  const headers = [
    '会社名',
    '住所',
    '担当者名',
    '電話番号',
    'メールアドレス',
    'プライマリー連絡先',
    '最終更新日'
  ];
  
  // データ行の作成
  const rows = data.map(client => {
    // プライマリー連絡先を取得
    const primaryContact = client.contacts?.find(c => c.isPrimary) || {};
    const lastUpdated = client.lastUpdated instanceof Date 
      ? client.lastUpdated.toISOString().split('T')[0]
      : '';
    
    return [
      client.name || '',
      client.address || '',
      primaryContact.personName || '',
      primaryContact.phone || '',
      primaryContact.email || '',
      primaryContact.isPrimary ? '1' : '0',
      lastUpdated
    ];
  });
  
  // CSVフォーマットに変換
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => 
      // カンマやダブルクォートを含む場合は引用符で囲む
      typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
        ? `"${cell.replace(/"/g, '""')}"` 
        : cell
    ).join(','))
  ].join('\n');
  
  // ファイルのダウンロード
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ClientManagement = () => {
  const navigate = useNavigate();
  const { 
    notification, 
    showNotification, 
    saveClient, 
    addClientContact, 
    updateClientContact, 
    deleteClientContact 
  } = useKarte();
  
  // クライアントリスト関連のステート
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  
  // 選択中のクライアント関連
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  
  // ダイアログ関連のステート
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteContact, setConfirmDeleteContact] = useState(null);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // タブ関連
  const [tabValue, setTabValue] = useState(0);
  
  // フォームデータ
  const [clientFormData, setClientFormData] = useState({
    name: '',
    address: '',
    notes: ''
  });
  
  const [contactFormData, setContactFormData] = useState({
    personName: '',
    phone: '',
    email: '',
    position: '',
    department: '',
    notes: '',
    isPrimary: false
  });
  
  // インポート関連
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importValidation, setImportValidation] = useState({ valid: true, message: '' });
  
  // クライアント一覧を取得
  useEffect(() => {
    loadClients();
  }, []);
  
  // 検索フィルタリング
  useEffect(() => {
    if (clients.length > 0) {
      const text = searchText.toLowerCase();
      if (!text) {
        setFilteredClients(clients);
      } else {
        const filtered = clients.filter(client => {
          // 会社名での検索
          if (client.name && client.name.toLowerCase().includes(text)) {
            return true;
          }
          
          // 連絡先情報での検索
          if (client.contacts && client.contacts.length > 0) {
            return client.contacts.some(contact => 
              (contact.personName && contact.personName.toLowerCase().includes(text)) ||
              (contact.phone && contact.phone.toLowerCase().includes(text)) ||
              (contact.email && contact.email.toLowerCase().includes(text)) ||
              (contact.department && contact.department.toLowerCase().includes(text)) ||
              (contact.position && contact.position.toLowerCase().includes(text))
            );
          }
          
          // 住所やメモでの検索
          if (
            (client.address && client.address.toLowerCase().includes(text)) ||
            (client.notes && client.notes.toLowerCase().includes(text))
          ) {
            return true;
          }
          
          return false;
        });
        
        setFilteredClients(filtered);
      }
      setPage(0);
    }
  }, [searchText, clients]);
  
  // クライアント一覧取得
  const loadClients = async () => {
    setLoading(true);
    try {
      // 新しいclientsコレクションからデータを取得
      const clientQ = query(
        collection(db, 'clients'),
        orderBy('nameIndex', 'asc')
      );
      
      const clientSnapshot = await getDocs(clientQ);
      const clientList = [];
      
      // クライアントリストを作成
      clientSnapshot.forEach(doc => {
        const data = doc.data();
        const client = {
          id: doc.id,
          name: data.name || '',
          nameIndex: data.nameIndex || '',
          address: data.address || '',
          notes: data.notes || '',
          contacts: Array.isArray(data.contacts) ? data.contacts : [],
          lastUpdated: data.lastUpdated?.toDate() || null
        };
        
        // カルテ数を集計（後で実装）
        client.karteCount = 0;
        
        clientList.push(client);
      });
      
      // 既存のカルテからカルテ数を集計
      const karteQ = query(
        collection(db, 'karte'),
        orderBy('lastUpdated', 'desc')
      );
      
      const karteSnapshot = await getDocs(karteQ);
      const clientNameCount = new Map();
      
      karteSnapshot.forEach(doc => {
        const data = doc.data();
        const clientCompany = data.clientCompany;
        
        if (clientCompany) {
          const lowerName = clientCompany.toLowerCase();
          clientNameCount.set(lowerName, (clientNameCount.get(lowerName) || 0) + 1);
        }
      });
      
      // カルテ数を対応するクライアントに関連付ける
      clientList.forEach(client => {
        const lowerName = (client.name || '').toLowerCase();
        if (clientNameCount.has(lowerName)) {
          client.karteCount = clientNameCount.get(lowerName);
        }
      });
      
      // クライアント情報をセット
      setClients(clientList);
      setFilteredClients(clientList);
      
    } catch (error) {
      console.error('クライアント一覧取得エラー:', error);
      showNotification('クライアント一覧の取得に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // ページ変更
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // 1ページあたりの行数変更
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  
  // クライアントの選択
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSelectedContactId(null);
  };
  
  // タブの切り替え
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // クライアント編集ダイアログを開く
  const handleOpenClientDialog = (client = null) => {
    if (client) {
      setClientFormData({
        name: client.name || '',
        address: client.address || '',
        notes: client.notes || ''
      });
    } else {
      setClientFormData({
        name: '',
        address: '',
        notes: ''
      });
    }
    setClientDialogOpen(true);
  };
  
  // クライアント編集ダイアログを閉じる
  const handleCloseClientDialog = () => {
    setClientDialogOpen(false);
  };
  
  // クライアントフォーム入力処理
  const handleClientInputChange = (e) => {
    const { name, value } = e.target;
    setClientFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // クライアント保存
  const handleSaveClient = async () => {
    if (!clientFormData.name.trim()) {
      showNotification('会社名は必須です', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // 新しいクライアントデータ
      const clientData = {
        name: clientFormData.name.trim(),
        address: clientFormData.address.trim(),
        notes: clientFormData.notes
      };
      
      // クライアントIDとして選択中のIDを使用、なければnull（新規作成）
      const clientId = selectedClient ? selectedClient.id : null;
      
      // KarteContextのsaveClient関数を使用
      const savedId = await saveClient(clientData, clientId);
      
      showNotification(selectedClient ? 'クライアント情報を更新しました' : 'クライアントを追加しました', 'success');
      setClientDialogOpen(false);
      
      // 選択中のクライアントが変更されている場合は更新
      if (selectedClient) {
        const updatedClient = {
          ...selectedClient,
          ...clientData
        };
        setSelectedClient(updatedClient);
      }
      
      loadClients();
    } catch (error) {
      console.error('クライアント保存エラー:', error);
      showNotification('クライアントの保存に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // クライアント削除確認ダイアログを開く
  const handleOpenDeleteConfirm = (client) => {
    setConfirmDelete(client);
  };
  
  // クライアント削除
  const handleDeleteClient = async () => {
    if (confirmDelete) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'clients', confirmDelete.id));
        showNotification('クライアントを削除しました', 'success');
        
        if (selectedClient && selectedClient.id === confirmDelete.id) {
          setSelectedClient(null);
        }
        
        setConfirmDelete(null);
        loadClients();
      } catch (error) {
        console.error('クライアント削除エラー:', error);
        showNotification('クライアントの削除に失敗しました', 'error');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 連絡先編集ダイアログを開く
  const handleOpenContactDialog = (contact = null) => {
    if (!selectedClient) {
      showNotification('クライアントが選択されていません', 'error');
      return;
    }
    
    if (contact) {
      setContactFormData({
        personName: contact.personName || '',
        phone: contact.phone || '',
        email: contact.email || '',
        position: contact.position || '',
        department: contact.department || '',
        notes: contact.notes || '',
        isPrimary: contact.isPrimary || false
      });
      setSelectedContactId(contact.id);
    } else {
      setContactFormData({
        personName: '',
        phone: '',
        email: '',
        position: '',
        department: '',
        notes: '',
        isPrimary: false
      });
      setSelectedContactId(null);
    }
    
    setContactDialogOpen(true);
  };
  
  // 連絡先編集ダイアログを閉じる
  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
    setSelectedContactId(null);
  };
  
  // 連絡先フォーム入力処理
  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // チェックボックス変更処理
  const handleContactCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setContactFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // 連絡先保存
  const handleSaveContact = async () => {
    if (!selectedClient) {
      showNotification('クライアントが選択されていません', 'error');
      return;
    }
    
    if (!contactFormData.personName.trim()) {
      showNotification('担当者名は必須です', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const contactData = {
        personName: contactFormData.personName.trim(),
        phone: contactFormData.phone.trim(),
        email: contactFormData.email.trim(),
        position: contactFormData.position.trim(),
        department: contactFormData.department.trim(),
        notes: contactFormData.notes,
        isPrimary: contactFormData.isPrimary
      };
      
      if (selectedContactId) {
        // 既存連絡先の更新
        await updateClientContact(selectedClient.id, selectedContactId, contactData);
        showNotification('連絡先を更新しました', 'success');
      } else {
        // 新規連絡先の追加
        await addClientContact(selectedClient.id, contactData);
        showNotification('連絡先を追加しました', 'success');
      }
      
      setContactDialogOpen(false);
      setSelectedContactId(null);
      
      // 選択中のクライアントを再読込
      const updatedClient = await clientsService.getClient(selectedClient.id);
      if (updatedClient) {
        setSelectedClient(updatedClient);
      }
      
      loadClients();
    } catch (error) {
      console.error('連絡先保存エラー:', error);
      showNotification('連絡先の保存に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // 連絡先削除確認ダイアログを開く
  const handleOpenDeleteContactConfirm = (contactId) => {
    setConfirmDeleteContact(contactId);
  };
  
  // 連絡先削除
  const handleDeleteContact = async () => {
    if (!selectedClient || !confirmDeleteContact) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteClientContact(selectedClient.id, confirmDeleteContact);
      showNotification('連絡先を削除しました', 'success');
      
      // 選択中の連絡先が削除された場合はリセット
      if (selectedContactId === confirmDeleteContact) {
        setSelectedContactId(null);
      }
      
      // 選択中のクライアントを再読込
      const updatedClient = await clientsService.getClient(selectedClient.id);
      if (updatedClient) {
        setSelectedClient(updatedClient);
      }
      
      setConfirmDeleteContact(null);
      loadClients();
    } catch (error) {
      console.error('連絡先削除エラー:', error);
      showNotification('連絡先の削除に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // 連絡先選択
  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
  };
  
  // CSVエクスポート
  const handleExportCSV = () => {
    try {
      exportToCSV(clients, `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
      showNotification('CSVエクスポートが完了しました', 'success');
    } catch (error) {
      console.error('CSVエクスポートエラー:', error);
      showNotification('CSVエクスポートに失敗しました', 'error');
    }
  };
  
  // インポートダイアログを開く
  const handleOpenImportDialog = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportValidation({ valid: true, message: '' });
    setImportDialogOpen(true);
  };
  
  // インポートダイアログを閉じる
  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
  };
  
  // ファイル選択時の処理
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportFile(file);
    
    // CSVファイルのプレビュー表示
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        // ヘッダーの検証
        const requiredHeaders = ['会社名'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          setImportValidation({
            valid: false,
            message: `必須ヘッダーが不足しています: ${missingHeaders.join(', ')}`
          });
          return;
        }
        
        // データ行の変換
        const previewData = [];
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const row = {};
          headers.forEach((header, index) => {
            if (index < values.length) {
              row[header] = values[index];
            }
          });
          
          previewData.push(row);
        }
        
        setImportPreview(previewData);
        setImportValidation({ valid: true, message: '' });
        
      } catch (error) {
        console.error('CSV解析エラー:', error);
        setImportValidation({
          valid: false,
          message: 'CSVファイルの解析に失敗しました'
        });
      }
    };
    
    reader.readAsText(file);
  };
  
  // CSVインポート実行
  const handleImportCSV = async () => {
    if (!importFile || !importValidation.valid) return;
    
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csv = event.target.result;
          const lines = csv.split('\n');
          const headers = lines[0].split(',');
          
          // インデックス取得
          const nameIndex = headers.indexOf('会社名');
          const addressIndex = headers.indexOf('住所');
          const personNameIndex = headers.indexOf('担当者名');
          const phoneIndex = headers.indexOf('電話番号');
          const emailIndex = headers.indexOf('メールアドレス');
          const isPrimaryIndex = headers.indexOf('プライマリー連絡先');
          
          // 各行を処理
          let importCount = 0;
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',');
            
            // 会社名は必須
            const companyName = values[nameIndex]?.trim();
            if (!companyName) continue;
            
            // クライアントデータ
            const clientData = {
              name: companyName,
              nameIndex: companyName.toLowerCase(),
              address: addressIndex >= 0 && values[addressIndex] ? values[addressIndex].trim() : '',
              lastUpdated: serverTimestamp()
            };
            
            // 連絡先データ（あれば）
            let contactData = null;
            if (personNameIndex >= 0 && values[personNameIndex]) {
              contactData = {
                personName: values[personNameIndex].trim(),
                phone: phoneIndex >= 0 && values[phoneIndex] ? values[phoneIndex].trim() : '',
                email: emailIndex >= 0 && values[emailIndex] ? values[emailIndex].trim() : '',
                isPrimary: isPrimaryIndex >= 0 && values[isPrimaryIndex] === '1'
              };
            }
            
            // クライアント保存
            const clientId = await saveClient(clientData);
            
            // 連絡先があれば追加
            if (contactData && clientId) {
              await addClientContact(clientId, contactData);
            }
            
            importCount++;
          }
          
          showNotification(`${importCount}件のクライアントをインポートしました`, 'success');
          setImportDialogOpen(false);
          loadClients();
        } catch (error) {
          console.error('インポート処理エラー:', error);
          showNotification('インポート処理に失敗しました', 'error');
        } finally {
          setLoading(false);
        }
      };
      
      reader.readAsText(importFile);
    } catch (error) {
      console.error('ファイル読み込みエラー:', error);
      showNotification('ファイルの読み込みに失敗しました', 'error');
      setLoading(false);
    }
  };
  
  // 表示するレコードの計算
  const emptyRows = page > 0 
    ? Math.max(0, (1 + page) * rowsPerPage - filteredClients.length) 
    : 0;
  
  const visibleRows = filteredClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // タブベースのレイアウトでクライアント一覧と詳細を表示
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ 
          flexDirection: { xs: 'column', sm: 'row' },
          padding: { xs: 1, sm: 2 },
          alignItems: 'center'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: '100%'
          }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate(-1)}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              クライアント管理
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                startIcon={<ImportExportIcon />}
                onClick={() => setTabValue(1)}
                size="small"
              >
                インポート/エクスポート
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <StyledContainer>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="クライアント一覧" />
          <Tab label="インポート/エクスポート" />
        </Tabs>
        
        {/* タブ1: クライアント一覧 */}
        {tabValue === 0 && (
          <Box>
            <Grid container spacing={3}>
              {/* 左側: クライアントリスト */}
              <Grid item xs={12} md={selectedClient ? 6 : 12}>
                <HeaderBox>
                  <Typography variant="h5" component="h1">
                    クライアント一覧
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedClient(null);
                      handleOpenClientDialog();
                    }}
                  >
                    クライアント追加
                  </Button>
                </HeaderBox>
                
                <SearchBox>
                  <TextField
                    variant="outlined"
                    fullWidth
                    placeholder="会社名・担当者名で検索..."
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
                
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                )}
                
                {!loading && (
                  <>
                    <StyledTableContainer component={Paper}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>会社名</TableCell>
                            <TableCell>主要担当者</TableCell>
                            <TableCell>連絡先</TableCell>
                            <TableCell>カルテ数</TableCell>
                            <TableCell align="center">操作</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visibleRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                {searchText ? 
                                  `"${searchText}" に一致するクライアントはありません` : 
                                  'クライアントがありません'}
                              </TableCell>
                            </TableRow>
                          ) : (
                            visibleRows.map((client) => {
                              // プライマリー連絡先を取得
                              const primaryContact = client.contacts?.find(c => c.isPrimary) || {};
                              // 最終更新日をフォーマット
                              const lastUpdated = client.lastUpdated 
                                ? new Date(client.lastUpdated).toLocaleDateString() 
                                : '-';
                              
                              return (
                                <TableRow 
                                  key={client.id} 
                                  hover
                                  onClick={() => handleSelectClient(client)}
                                  selected={selectedClient && selectedClient.id === client.id}
                                  sx={{ cursor: 'pointer' }}
                                >
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography variant="body1">{client.name || '-'}</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    {primaryContact.personName ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                        <Typography variant="body2">{primaryContact.personName}</Typography>
                                      </Box>
                                    ) : '未設定'}
                                  </TableCell>
                                  <TableCell>
                                    {primaryContact.phone && (
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                        <Typography variant="body2">{primaryContact.phone}</Typography>
                                      </Box>
                                    )}
                                    {!primaryContact.phone && primaryContact.email && (
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                        <Typography variant="body2">{primaryContact.email}</Typography>
                                      </Box>
                                    )}
                                    {!primaryContact.phone && !primaryContact.email && '未設定'}
                                  </TableCell>
                                  <TableCell>
                                    {client.karteCount > 0 ? (
                                      <Chip 
                                        size="small" 
                                        label={`${client.karteCount}件`} 
                                        color="primary" 
                                        variant="outlined"
                                      />
                                    ) : '0'}
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton 
                                      color="primary" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenClientDialog(client);
                                      }}
                                      size="small"
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                      color="error" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenDeleteConfirm(client);
                                      }}
                                      size="small"
                                      disabled={client.karteCount > 0}
                                      title={client.karteCount > 0 ? 'カルテに関連付けられているため削除できません' : '削除'}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                          {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                              <TableCell colSpan={5} />
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </StyledTableContainer>
                    
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      component="div"
                      count={filteredClients.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      labelRowsPerPage="件数:"
                      labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                    />
                  </>
                )}
              </Grid>
              
              {/* 右側: クライアント詳細 */}
              {selectedClient && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" component="h2">
                        <BusinessIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        {selectedClient.name}
                      </Typography>
                      <Box>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenClientDialog(selectedClient)}
                          size="small"
                          startIcon={<EditIcon />}
                          sx={{ mr: 1 }}
                        >
                          編集
                        </Button>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          住所
                        </Typography>
                        <Typography variant="body1">
                          {selectedClient.address || '未設定'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          最終更新日
                        </Typography>
                        <Typography variant="body1">
                          {selectedClient.lastUpdated 
                            ? new Date(selectedClient.lastUpdated).toLocaleDateString() 
                            : '未設定'}
                        </Typography>
                      </Grid>
                      {selectedClient.notes && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">
                            備考
                          </Typography>
                          <Typography variant="body1">
                            {selectedClient.notes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                    
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" component="h3">
                        <ContactsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        連絡先一覧
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenContactDialog()}
                        size="small"
                      >
                        連絡先追加
                      </Button>
                    </Box>
                    
                    {selectedClient.contacts && selectedClient.contacts.length > 0 ? (
                      <ContactList>
                        {selectedClient.contacts.map((contact) => (
                          <ListItem
                            key={contact.id}
                            selected={selectedContactId === contact.id}
                            onClick={() => handleSelectContact(contact.id)}
                            sx={{
                              cursor: 'pointer',
                              borderBottom: '1px solid #eee',
                              '&:last-child': { borderBottom: 'none' }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: contact.isPrimary ? 'primary.main' : 'grey.400' }}>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                  {contact.personName}
                                  {contact.isPrimary && (
                                    <PrimaryBadge>優先</PrimaryBadge>
                                  )}
                                </Box>
                              }
                              secondary={
                                <React.Fragment>
                                  {contact.department && (
                                    <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                                      {contact.department}
                                      {contact.position && ` / ${contact.position}`}
                                    </Typography>
                                  )}
                                  
                                  {contact.phone && (
                                    <Box component="span" sx={{ display: 'block' }}>
                                      <PhoneIcon sx={{ fontSize: '0.9rem', verticalAlign: 'middle', mr: 0.5 }} />
                                      {contact.phone}
                                    </Box>
                                  )}
                                  
                                  {contact.email && (
                                    <Box component="span" sx={{ display: 'block' }}>
                                      <EmailIcon sx={{ fontSize: '0.9rem', verticalAlign: 'middle', mr: 0.5 }} />
                                      {contact.email}
                                    </Box>
                                  )}
                                </React.Fragment>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" onClick={() => handleOpenContactDialog(contact)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton edge="end" onClick={() => handleOpenDeleteContactConfirm(contact.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </ContactList>
                    ) : (
                      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                          連絡先が登録されていません。「連絡先追加」ボタンから登録してください。
                        </Typography>
                      </Paper>
                    )}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
        
        {/* タブ2: インポート/エクスポート */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              インポート/エクスポート
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StyledAccordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FileDownloadIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">エクスポート</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography paragraph>
                      現在登録されているクライアント情報をCSVファイルとしてエクスポートします。
                      各クライアントのプライマリー連絡先が含まれます。
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleExportCSV}
                      startIcon={<FileDownloadIcon />}
                    >
                      CSVエクスポート
                    </Button>
                  </AccordionDetails>
                </StyledAccordion>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StyledAccordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FileUploadIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">インポート</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography paragraph>
                      CSVファイルからクライアント情報をインポートします。
                      「会社名」列は必須です。連絡先情報も含めることができます。
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleOpenImportDialog}
                      startIcon={<FileUploadIcon />}
                    >
                      CSVインポート
                    </Button>
                  </AccordionDetails>
                </StyledAccordion>
              </Grid>
            </Grid>
          </Box>
        )}
      </StyledContainer>
      
      {/* クライアント編集ダイアログ */}
      <Dialog 
        open={clientDialogOpen} 
        onClose={handleCloseClientDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedClient ? 'クライアント情報の編集' : 'クライアントの追加'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="会社名"
            name="name"
            value={clientFormData.name}
            onChange={handleClientInputChange}
            disabled={selectedClient && selectedClient.karteCount > 0}
            helperText={selectedClient && selectedClient.karteCount > 0 ? 'カルテに関連付けられているため変更できません' : ''}
          />
          <TextField
            margin="normal"
            fullWidth
            label="住所"
            name="address"
            value={clientFormData.address}
            onChange={handleClientInputChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="備考"
            name="notes"
            value={clientFormData.notes}
            onChange={handleClientInputChange}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClientDialog}>キャンセル</Button>
          <Button 
            onClick={handleSaveClient} 
            variant="contained" 
            color="primary"
            disabled={!clientFormData.name.trim()}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 連絡先編集ダイアログ */}
      <Dialog 
        open={contactDialogOpen} 
        onClose={handleCloseContactDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedContactId ? '連絡先の編集' : '連絡先の追加'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="担当者名"
            name="personName"
            value={contactFormData.personName}
            onChange={handleContactInputChange}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                label="部署"
                name="department"
                value={contactFormData.department}
                onChange={handleContactInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                label="役職"
                name="position"
                value={contactFormData.position}
                onChange={handleContactInputChange}
              />
            </Grid>
          </Grid>
          <TextField
            margin="normal"
            fullWidth
            label="電話番号"
            name="phone"
            value={contactFormData.phone}
            onChange={handleContactInputChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="メールアドレス"
            name="email"
            type="email"
            value={contactFormData.email}
            onChange={handleContactInputChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="備考"
            name="notes"
            value={contactFormData.notes}
            onChange={handleContactInputChange}
            multiline
            rows={2}
          />
          <FormControlLabel
            control={
              <Switch
                checked={contactFormData.isPrimary}
                onChange={(e) => handleContactCheckboxChange(e)}
                name="isPrimary"
                color="primary"
              />
            }
            label="優先連絡先に設定する（カルテ入力時にデフォルト表示）"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactDialog}>キャンセル</Button>
          <Button 
            onClick={handleSaveContact} 
            variant="contained" 
            color="primary"
            disabled={!contactFormData.personName.trim()}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* インポートダイアログ */}
      <Dialog 
        open={importDialogOpen} 
        onClose={handleCloseImportDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>CSVインポート</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              CSVファイルフォーマット
            </Typography>
            <Typography variant="body2">
              1行目にヘッダー行が必要です。「会社名」列は必須です。
              連絡先情報を含める場合は「担当者名」「電話番号」「メールアドレス」列を追加してください。
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              component="label"
              color="primary"
            >
              CSVファイルを選択
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            
            {importFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                選択ファイル: {importFile.name}
              </Typography>
            )}
          </Box>
          
          {importValidation.valid === false && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {importValidation.message}
            </Alert>
          )}
          
          {importPreview.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                インポートプレビュー (最初の{Math.min(importPreview.length, 5)}件)
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(importPreview[0]).map((header, index) => (
                        <TableCell key={index}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importPreview.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.values(row).map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog}>キャンセル</Button>
          <Button 
            onClick={handleImportCSV} 
            variant="contained" 
            color="primary"
            disabled={!importFile || !importValidation.valid}
          >
            インポート実行
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* クライアント削除確認ダイアログ */}
      <Dialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
      >
        <DialogTitle>クライアントの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            「{confirmDelete?.name || ''}」を削除してもよろしいですか？
            この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>キャンセル</Button>
          <Button onClick={handleDeleteClient} color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 連絡先削除確認ダイアログ */}
      <Dialog
        open={confirmDeleteContact !== null}
        onClose={() => setConfirmDeleteContact(null)}
      >
        <DialogTitle>連絡先の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            この連絡先を削除してもよろしいですか？
            この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteContact(null)}>キャンセル</Button>
          <Button onClick={handleDeleteContact} color="error">
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
    </>
  );
};

export default ClientManagement;