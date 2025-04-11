import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKarte } from '../context/KarteContext';
import { 
  Container, 
  Box, 
  Button, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import * as XLSX from 'xlsx';

// コンポーネントのインポート
import BasicInfo from '../components/BasicInfo';
import PaymentInfo from '../components/PaymentInfo';
import ExpenseInfo from '../components/ExpenseInfo';
import SummaryInfo from '../components/SummaryInfo';
import MemoSection from '../components/MemoSection';
import CommentSection from '../components/CommentSection';
import KarteListModal from '../modals/KarteListModal';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
  maxWidth: '1200px',
  width: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: theme.spacing(2),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1),
    fontSize: '0.75rem',
    '& .MuiButton-startIcon': {
      marginRight: 4
    }
  }
}));

const StatusBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const KarteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentId,
    karteData,
    payments,
    expenses,
    comments,
    hasChanges,
    lastSaved,
    loading,
    notification,
    createNew,
    loadKarte,
    saveKarte,
    calculateSummary,
    resetAllState // 強制リセット関数を追加
  } = useKarte();
  
  const [showKarteList, setShowKarteList] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  
  // 初期化済みフラグの参照
  const isInitializedRef = React.useRef(false);
  const debugId = React.useRef(`EDIT_${Math.random().toString(36).substring(2, 9)}`).current;
  
  // ページマウント/アンマウント時のデバッグログ
  useEffect(() => {
    console.log(`[${debugId}] KarteEdit マウント - id: ${id}, currentId: ${currentId}`);
    return () => {
      console.log(`[${debugId}] KarteEdit アンマウント`);
      isInitializedRef.current = false;
    };
  }, []);
  
  // 重要: ページがマウントされるたびに適切な初期化を実行
  useEffect(() => {
    const initializePage = async () => {
      console.log(`[${debugId}] initializePage 開始 - id: ${id}, currentId: ${currentId}, isInitialized: ${isInitializedRef.current}`);
      
      // 初期化済みの場合は二重実行を防止
      if (isInitializedRef.current) {
        console.log(`[${debugId}] ページ既に初期化済み - 処理スキップ`);
        return;
      }
      
      try {
        // 新規作成ページの場合
        if (id === 'new') {
          console.log(`[${debugId}] 新規カルテページ - 完全リセット開始`);
          
          // まず状態を強制的にリセット
          await resetAllState();
          
          // 次に新規カルテを作成（カルテ番号生成など）
          await createNew();
          
          console.log(`[${debugId}] 新規カルテページ - 初期化完了`);
        }
        // 既存のカルテを読み込む場合
        else if (id && id !== currentId) {
          console.log(`[${debugId}] 既存カルテ読み込み開始 - id: ${id}`);
          await loadKarte(id);
          console.log(`[${debugId}] 既存カルテ読み込み完了 - id: ${id}`);
        }
        
        // 初期化完了をマーク
        isInitializedRef.current = true;
      } catch (error) {
        console.error(`[${debugId}] 初期化エラー:`, error);
        // エラー時も初期化完了としてマーク（無限ループ防止）
        isInitializedRef.current = true;
      }
    };
    
    initializePage();
  }, [id, createNew, loadKarte, resetAllState]); // 必要な依存関係を全て含める
  
  // ページ離脱時に未保存の変更がある場合に確認
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '保存されていない変更があります。ページを離れますか？';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges]);
  
  const handleSave = async () => {
    const success = await saveKarte();
    if (success && id === 'new') {
      navigate(`/karte/${currentId}`, { replace: true });
    }
  };
  
  const handleNew = () => {
    if (hasChanges) {
      setConfirmClose(true);
    } else {
      navigateToNew();
    }
  };
  
  const navigateToNew = async () => {
    try {
      // 状態を完全にリセット（処理完了を待つ）
      await resetAllState();
      
      // キャッシュをクリアしてから新しいページへ遷移
      // ブラウザの強制リロードと同等の効果を得る
      window.location.href = '/karte/new?t=' + new Date().getTime();
    } catch (error) {
      console.error('ナビゲーションエラー:', error);
      // エラーが発生した場合でも強制的に新しいページへ
      window.location.href = '/karte/new';
    }
  };
  
  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // 基本情報シート
      const basicData = [
        ['◆ 基本情報', ''],
        ['国内/海外', karteData.travelType === 'domestic' ? '国内' : '海外'],
        ['カルテ番号', karteData.karteNo || ''],
        ['自社担当者', karteData.companyPerson || ''],
        ['クライアント会社名', karteData.clientCompany || ''],
        ['クライアント担当者', karteData.clientPerson || ''],
        ['電話番号', karteData.clientPhone || ''],
        ['メールアドレス', karteData.clientEmail || ''],
        ['出発日', karteData.departureDate || ''],
        ['帰着日', karteData.returnDate || ''],
        ['泊数', karteData.nights || ''],
        ['出発地', karteData.departurePlace || ''],
        ['行き先', karteData.destination === 'other' ? karteData.destinationOther : karteData.destination || ''],
        ['旅行内容', karteData.travelContent || ''],
        ['合計人数', karteData.totalPersons || ''],
        ['金額', karteData.totalAmount || ''],
        ['単価', karteData.unitPrice || ''],
        ['支払い先', karteData.paymentTo || ''],
        ['手配状況', karteData.arrangementStatus || '']
      ];
      
      // 入金情報シート
      const paymentData = [['◆ 入金情報', '', '', '', '']];
      paymentData.push(['入金予定日', '入金日', '入金額', '入金場所', '備考']);
      payments.forEach(payment => {
        paymentData.push([
          payment.dueDate || '',
          payment.date || '',
          payment.amount || 0,
          payment.place || '',
          payment.notes || ''
        ]);
      });
      
      // 支払情報シート
      const expenseData = [['◆ 支払情報', '', '', '', '', '', '', '']];
      expenseData.push(['利用日', '手配先名', '電話/FAX', '担当者', '支払予定日', '支払金額', '手配状況', '備考']);
      expenses.forEach(expense => {
        expenseData.push([
          expense.date || '',
          expense.vendor || '',
          expense.phone || '',
          expense.person || '',
          expense.dueDate || '',
          expense.amount || 0,
          expense.status || '',
          expense.notes || ''
        ]);
      });
      
      // 収支情報シート
      const summary = calculateSummary();
      const summaryData = [
        ['◆ 収支情報', ''],
        ['総入金額', summary.totalPayment],
        ['総支払額', summary.totalExpense],
        ['利益額', summary.profit],
        ['利益率', summary.profitRate + '%'],
        ['一人あたり利益', summary.profitPerPerson]
      ];
      
      // メモ欄シート
      const memoData = [
        ['◆ メモ欄', ''],
        [karteData.memo || '', '']
      ];
      
      // コメントシート
      const commentData = [['◆ コメント欄', '', '']];
      commentData.push(['投稿者', '日時', 'コメント']);
      comments.forEach(comment => {
        const date = new Date(comment.date);
        const formattedDate = date.toLocaleString();
        commentData.push([comment.author || '', formattedDate, comment.text || '']);
      });
      
      // シートを追加
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(basicData), '基本情報');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(paymentData), '入金情報');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(expenseData), '支払情報');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), '収支情報');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(memoData), 'メモ');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(commentData), 'コメント');
      
      // ファイル名を設定して出力
      const karteNo = karteData.karteNo || '';
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const filename = `${karteNo || 'カルテ'}_${y}${m}${d}.xlsx`;
      
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('エクスポートエラー:', error);
    }
  };
  
  const formatLastSaved = () => {
    if (!lastSaved) return '-';
    return new Date(lastSaved).toLocaleString('ja-JP');
  };
  
  // カルテ番号または「新規カルテ」を表示
  const getKarteTitle = () => {
    if (loading) return '読み込み中...';
    if (currentId) {
      return `No. ${karteData.karteNo || 'Unknown'}`;
    }
    return '新規カルテ';
  };
  
  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#4472c4' }}>
        <Toolbar sx={{ 
          flexDirection: { xs: 'column', sm: 'row' },
          padding: { xs: 1, sm: 2 },
          alignItems: 'center'
        }}>
          {/* Header Title and Back Button - First Row */}
          <Box sx={{ 
            display: 'flex', 
            width: '100%', 
            alignItems: 'center',
            mb: { xs: 1, sm: 0 }
          }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/karte-list')}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 'bold', 
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              団体ナビ成約カルテ
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => navigate('/admin')}
              title="管理者画面"
            >
              <PeopleIcon />
            </IconButton>
          </Box>
          
          {/* Action Buttons - Second Row */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%'
          }}>
            <ActionButton
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading || !hasChanges}
              sx={{ 
                backgroundColor: '#4caf50', 
                '&:hover': { backgroundColor: '#388e3c' },
                m: { xs: 0.5, sm: 1 },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              保存
            </ActionButton>
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={async () => {
                console.log(`[${debugId}] 新規ボタン クリック - 変更あり: ${hasChanges}`);
                
                if (hasChanges) {
                  setConfirmClose(true);
                } else {
                  try {
                    // カルテデータを直接強制的にクリア（即時反映）
                    setKarteData({
                      travelType: 'domestic',
                      karteNo: '',
                      companyPerson: '',
                      clientCompany: '',
                      clientPerson: '',
                      clientPhone: '',
                      clientEmail: '',
                      departureDate: '',
                      returnDate: '',
                      nights: '',
                      departurePlace: '',
                      destination: '',
                      destinationOther: '',
                      travelContent: '',
                      totalPersons: '',
                      totalAmount: '',
                      unitPrice: '',
                      paymentTo: '',
                      arrangementStatus: 'not-started',
                      memo: ''
                    });
                    
                    // 他のデータもクリア
                    setPayments([]);
                    setExpenses([]);
                    setComments([]);
                    setHasChanges(false);
                    
                    console.log(`[${debugId}] 状態を直接クリア完了`);
                    
                    // セッションストレージもクリア
                    sessionStorage.clear();
                    
                    // キャッシュ回避のためにタイムスタンプを付与
                    const timestamp = new Date().getTime();
                    
                    // 完全な新規ページへ強制リロード
                    window.location.href = `/karte/new?force=${timestamp}`;
                  } catch (error) {
                    console.error(`[${debugId}] 状態リセットエラー:`, error);
                    // エラーが発生した場合でも強制的に新しいページへ
                    window.location.reload();
                  }
                }
              }}
              sx={{ 
                backgroundColor: '#2196f3', 
                '&:hover': { backgroundColor: '#1976d2' },
                m: { xs: 0.5, sm: 1 },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              新規
            </ActionButton>
            <ActionButton
              variant="contained"
              startIcon={<ListIcon />}
              onClick={() => setShowKarteList(true)}
              sx={{ 
                backgroundColor: '#ff9800', 
                '&:hover': { backgroundColor: '#f57c00' },
                m: { xs: 0.5, sm: 1 },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              一覧
            </ActionButton>
            <ActionButton
              variant="contained"
              color="secondary"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              disabled={loading || currentId === null}
              sx={{ 
                backgroundColor: '#9c27b0', 
                '&:hover': { backgroundColor: '#7b1fa2' },
                m: { xs: 0.5, sm: 1 },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              エクスポート
            </ActionButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <StyledContainer maxWidth="lg">
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', m: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        <StatusBar>
          <Typography variant="h6" color="primary">
            {getKarteTitle()}
          </Typography>
          <Box>
            <Typography variant="body2" color="textSecondary">
              最終更新: {formatLastSaved()}
            </Typography>
            {hasChanges && (
              <Typography variant="body2" color="error">
                変更*
              </Typography>
            )}
          </Box>
        </StatusBar>
        
        <BasicInfo />
        <Divider sx={{ my: 3 }} />
        
        <PaymentInfo />
        <ExpenseInfo />
        <SummaryInfo />
        
        <Divider sx={{ my: 3 }} />
        
        <MemoSection />
        <CommentSection />
      </StyledContainer>
      
      {/* カルテ一覧モーダル */}
      <KarteListModal
        open={showKarteList}
        onClose={() => setShowKarteList(false)}
      />
      
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
      
      {/* 未保存確認ダイアログ */}
      <Dialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
      >
        <DialogTitle>未保存の変更</DialogTitle>
        <DialogContent>
          <DialogContentText>
            保存されていない変更があります。変更を破棄して新規カルテを作成しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(false)}>キャンセル</Button>
          <Button 
            onClick={async () => {
              try {
                console.log(`[${debugId}] 変更破棄ボタン クリック`);
                
                // ダイアログを閉じる
                setConfirmClose(false);
                
                // カルテデータを直接強制的にクリア（即時反映）
                setKarteData({
                  travelType: 'domestic',
                  karteNo: '',
                  companyPerson: '',
                  clientCompany: '',
                  clientPerson: '',
                  clientPhone: '',
                  clientEmail: '',
                  departureDate: '',
                  returnDate: '',
                  nights: '',
                  departurePlace: '',
                  destination: '',
                  destinationOther: '',
                  travelContent: '',
                  totalPersons: '',
                  totalAmount: '',
                  unitPrice: '',
                  paymentTo: '',
                  arrangementStatus: 'not-started',
                  memo: ''
                });
                
                // 他のデータもクリア
                setPayments([]);
                setExpenses([]);
                setComments([]);
                setHasChanges(false);
                
                console.log(`[${debugId}] 状態を直接クリア完了`);
                
                // キャッシュ回避のためにセッションストレージも一旦クリア
                sessionStorage.clear();
                
                // 新しいタイムスタンプを生成
                const timestamp = new Date().getTime();
                
                // 完全な新規ページへ強制リロード
                window.location.href = `/karte/new?force=${timestamp}`;
              } catch (error) {
                console.error(`[${debugId}] 状態リセットエラー:`, error);
                // エラーが発生した場合でも強制的に新しいページへ
                window.location.reload();
              }
            }} 
            color="primary"
            sx={{ fontWeight: 'bold' }}
          >
            変更を破棄して新規作成
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KarteEdit;