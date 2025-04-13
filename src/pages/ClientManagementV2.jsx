import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Switch,
  InputAdornment,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

import { clientsService } from '../services/firebase';
import { useAsync } from '../hooks';
import { useLoading } from '../context/LoadingContext';
import logger from '../utils/logger';

/**
 * クライアント管理画面 (バージョン2)
 * 
 * Firestoreに保存されたクライアント情報を管理するためのページ
 * - クライアント情報の一覧表示
 * - クライアント情報の検索（会社名、担当者名、電話、メール）
 * - クライアント情報の編集、削除
 * - 担当者の追加、編集、削除
 */
const ClientManagementV2 = () => {
  // ローディング状態管理
  const { withLoading, showNotification } = useLoading();
  
  // ローカル状態
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClientId, setExpandedClientId] = useState(null);
  
  // モーダル関連の状態
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [currentContact, setCurrentContact] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' または 'edit'
  
  // フォーム状態
  const [clientFormData, setClientFormData] = useState({
    name: '',
    address: '',
    notes: ''
  });
  
  const [contactFormData, setContactFormData] = useState({
    personName: '',
    phone: '',
    email: '',
    isPrimary: false,
    notes: ''
  });
  
  // 非同期処理の設定
  const { 
    execute: fetchClients,
    status: fetchStatus,
    error: fetchError
  } = useAsync(clientsService.getAllClients);
  
  // 初期データの読み込み
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await withLoading(
          () => fetchClients(), 
          'クライアント情報を読み込み中...'
        );
        setClients(data);
        setFilteredClients(data);
      } catch (error) {
        logger.error('クライアント読み込みエラー:', { error });
        showNotification('クライアント情報の読み込みに失敗しました', 'error');
      }
    };
    
    loadClients();
  }, [fetchClients, withLoading, showNotification]);
  
  // 検索処理
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }
    
    const search = async () => {
      try {
        const results = await clientsService.searchClientsByQuery(searchQuery);
        setFilteredClients(results);
      } catch (error) {
        logger.error('検索エラー:', { error });
        showNotification('検索中にエラーが発生しました', 'error');
      }
    };
    
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, clients, showNotification]);
  
  // クライアント情報の保存
  const saveClient = async (clientData, clientId = null) => {
    try {
      await withLoading(async () => {
        const savedId = await clientsService.saveClient(clientData, clientId);
        
        // 再読み込み
        const updatedClients = await fetchClients();
        setClients(updatedClients);
        setFilteredClients(searchQuery ? 
          await clientsService.searchClientsByQuery(searchQuery) : 
          updatedClients
        );
        
        return savedId;
      }, clientId ? 'クライアント情報を更新中...' : 'クライアント情報を保存中...');
      
      showNotification(
        clientId ? 'クライアント情報を更新しました' : 'クライアント情報を保存しました',
        'success'
      );
      setClientDialogOpen(false);
    } catch (error) {
      logger.error('クライアント保存エラー:', { error });
      showNotification('クライアント情報の保存に失敗しました', 'error');
    }
  };
  
  // 連絡先の保存
  const saveContact = async () => {
    if (!currentClient) {
      showNotification('クライアントが選択されていません', 'error');
      return;
    }
    
    try {
      await withLoading(async () => {
        if (formMode === 'add') {
          await clientsService.addContact(currentClient.id, contactFormData);
        } else if (formMode === 'edit' && currentContact) {
          await clientsService.updateContact(
            currentClient.id, 
            currentContact.id, 
            contactFormData
          );
        }
        
        // 再読み込み
        const updatedClients = await fetchClients();
        setClients(updatedClients);
        setFilteredClients(searchQuery ? 
          await clientsService.searchClientsByQuery(searchQuery) : 
          updatedClients
        );
      }, formMode === 'add' ? '連絡先を追加中...' : '連絡先を更新中...');
      
      showNotification(
        formMode === 'add' ? '連絡先を追加しました' : '連絡先を更新しました',
        'success'
      );
      setContactDialogOpen(false);
    } catch (error) {
      logger.error('連絡先保存エラー:', { error });
      showNotification('連絡先の保存に失敗しました', 'error');
    }
  };
  
  // 連絡先の削除
  const deleteContact = async (clientId, contactId) => {
    if (!clientId || !contactId) return;
    
    if (!window.confirm('この連絡先を削除してもよろしいですか？')) {
      return;
    }
    
    try {
      await withLoading(async () => {
        await clientsService.deleteContact(clientId, contactId);
        
        // 再読み込み
        const updatedClients = await fetchClients();
        setClients(updatedClients);
        setFilteredClients(searchQuery ? 
          await clientsService.searchClientsByQuery(searchQuery) : 
          updatedClients
        );
      }, '連絡先を削除中...');
      
      showNotification('連絡先を削除しました', 'success');
    } catch (error) {
      logger.error('連絡先削除エラー:', { error });
      showNotification('連絡先の削除に失敗しました', 'error');
    }
  };
  
  // クライアント新規追加ダイアログを開く
  const openAddClientDialog = () => {
    setCurrentClient(null);
    setClientFormData({
      name: '',
      address: '',
      notes: ''
    });
    setFormMode('add');
    setClientDialogOpen(true);
  };
  
  // クライアント編集ダイアログを開く
  const openEditClientDialog = (client) => {
    setCurrentClient(client);
    setClientFormData({
      name: client.name || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setFormMode('edit');
    setClientDialogOpen(true);
  };
  
  // 連絡先追加ダイアログを開く
  const openAddContactDialog = (client) => {
    setCurrentClient(client);
    setCurrentContact(null);
    setContactFormData({
      personName: '',
      phone: '',
      email: '',
      isPrimary: false,
      notes: ''
    });
    setFormMode('add');
    setContactDialogOpen(true);
  };
  
  // 連絡先編集ダイアログを開く
  const openEditContactDialog = (client, contact) => {
    setCurrentClient(client);
    setCurrentContact(contact);
    setContactFormData({
      personName: contact.personName || '',
      phone: contact.phone || '',
      email: contact.email || '',
      isPrimary: contact.isPrimary || false,
      notes: contact.notes || ''
    });
    setFormMode('edit');
    setContactDialogOpen(true);
  };
  
  // アコーディオンの展開/折りたたみ処理
  const handleAccordionChange = (clientId) => (event, isExpanded) => {
    setExpandedClientId(isExpanded ? clientId : null);
  };
  
  // クライアント一覧のレンダリング
  const renderClientsList = () => {
    if (filteredClients.length === 0) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery ? '検索条件に一致するクライアントが見つかりません' : 'クライアントデータがありません'}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={openAddClientDialog}
            sx={{ mt: 2 }}
          >
            クライアントを追加
          </Button>
        </Box>
      );
    }
    
    return filteredClients.map(client => (
      <Accordion 
        key={client.id}
        expanded={expandedClientId === client.id}
        onChange={handleAccordionChange(client.id)}
        TransitionProps={{ unmountOnExit: true }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography sx={{ flexGrow: 1 }}>
              {client.name}
            </Typography>
            <Chip 
              size="small" 
              label={`連絡先: ${client.contacts?.length || 0}件`} 
              sx={{ mr: 2 }}
            />
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                openEditClientDialog(client);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {/* 会社情報 */}
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader
                title="会社情報"
                action={
                  <IconButton 
                    onClick={() => openEditClientDialog(client)}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">会社名</Typography>
                    <Typography>{client.name || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">住所</Typography>
                    <Typography>{client.address || '-'}</Typography>
                  </Grid>
                  {client.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">備考</Typography>
                      <Typography>{client.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
            
            {/* 連絡先一覧 */}
            <Card variant="outlined">
              <CardHeader
                title="連絡先リスト"
                action={
                  <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => openAddContactDialog(client)}
                  >
                    連絡先を追加
                  </Button>
                }
              />
              <CardContent>
                {client.contacts && client.contacts.length > 0 ? (
                  <List>
                    {client.contacts.map(contact => (
                      <ListItem
                        key={contact.id}
                        divider
                        sx={{ 
                          bgcolor: contact.isPrimary ? 'action.selected' : 'inherit',
                          borderRadius: 1
                        }}
                      >
                        <Avatar sx={{ bgcolor: contact.isPrimary ? 'primary.main' : 'grey.400', mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {contact.personName}
                              {contact.isPrimary && (
                                <Chip 
                                  size="small" 
                                  label="主担当" 
                                  color="primary" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              {contact.phone && (
                                <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                                  <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                  {contact.phone}
                                </Typography>
                              )}
                              {contact.email && (
                                <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                                  <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                  {contact.email}
                                </Typography>
                              )}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => openEditContactDialog(client, contact)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            onClick={() => deleteContact(client.id, contact.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      連絡先が登録されていません
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => openAddContactDialog(client)}
                      sx={{ mt: 2 }}
                    >
                      連絡先を追加
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        クライアント管理
      </Typography>
      
      {/* 検索・追加バー */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="会社名・担当者名・電話番号・メールアドレスで検索..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddClientDialog}
          >
            新規クライアント
          </Button>
        </Box>
        {fetchStatus === 'pending' && <LinearProgress sx={{ mt: 1 }} />}
      </Paper>
      
      {/* エラーメッセージ */}
      {fetchStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          クライアント情報の読み込み中にエラーが発生しました
        </Alert>
      )}
      
      {/* クライアント一覧 */}
      <Box sx={{ mt: 3 }}>
        {renderClientsList()}
      </Box>
      
      {/* クライアント編集ダイアログ */}
      <Dialog open={clientDialogOpen} onClose={() => setClientDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formMode === 'add' ? 'クライアント情報の新規登録' : 'クライアント情報の編集'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="会社名"
              value={clientFormData.name}
              onChange={(e) => setClientFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="住所"
              value={clientFormData.address}
              onChange={(e) => setClientFormData(prev => ({ ...prev, address: e.target.value }))}
            />
            <TextField
              margin="normal"
              fullWidth
              label="備考"
              value={clientFormData.notes}
              onChange={(e) => setClientFormData(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClientDialogOpen(false)}>キャンセル</Button>
          <Button 
            onClick={() => saveClient(clientFormData, currentClient?.id || null)} 
            variant="contained" 
            color="primary"
            disabled={!clientFormData.name}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 連絡先編集ダイアログ */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formMode === 'add' ? '連絡先の新規登録' : '連絡先の編集'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="担当者名"
              value={contactFormData.personName}
              onChange={(e) => setContactFormData(prev => ({ ...prev, personName: e.target.value }))}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="電話番号"
              value={contactFormData.phone}
              onChange={(e) => setContactFormData(prev => ({ ...prev, phone: e.target.value }))}
              type="tel"
            />
            <TextField
              margin="normal"
              fullWidth
              label="メールアドレス"
              value={contactFormData.email}
              onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
              type="email"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Switch
                checked={contactFormData.isPrimary}
                onChange={(e) => setContactFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                color="primary"
              />
              <Typography>主担当に設定する</Typography>
            </Box>
            <TextField
              margin="normal"
              fullWidth
              label="備考"
              value={contactFormData.notes}
              onChange={(e) => setContactFormData(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>キャンセル</Button>
          <Button 
            onClick={saveContact} 
            variant="contained" 
            color="primary"
            disabled={!contactFormData.personName}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClientManagementV2;