import React, { useState, useEffect } from 'react';
import { useKarte } from '../context/KarteContext';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Card,
  Divider,
  Grid,
  Chip,
  InputAdornment,
  Fab,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Popover
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ja from 'date-fns/locale/ja';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  backgroundColor: '#4a86e8',
  color: 'white',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  overflowX: 'auto',
  '& .MuiTable-root': {
    minWidth: 950,
  },
  borderRadius: theme.shape.borderRadius,
  border: '1px solid #e0e0e0',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.2),
  fontSize: '0.875rem',
  height: 'auto',
  verticalAlign: 'middle',
  borderBottom: '1px solid #e0e0e0',
  '&.MuiTableCell-root': {
    overflow: 'visible',
    whiteSpace: 'normal',
    wordWrap: 'break-word'
  }
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  padding: theme.spacing(1),
  fontWeight: 'bold',
  fontSize: '0.875rem',
  verticalAlign: 'middle',
  height: '40px',
  '&.MuiTableCell-root': {
    overflow: 'visible',
    whiteSpace: 'normal',
    wordWrap: 'break-word'
  }
}));

const StyledTableRow = styled(TableRow)(({ theme, isEditing }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:nth-of-type(even)': {
    backgroundColor: isEditing ? '#e3f2fd' : '#fafafa', // 編集中は薄い青色
  },
  backgroundColor: isEditing ? '#e3f2fd' : 'inherit', // 編集中は薄い青色
  '& > td': {
    padding: isEditing ? theme.spacing(2) : theme.spacing(1.2), // 編集中は余白を増やす
    height: isEditing ? '60px' : 'auto', // 編集中は高さを確保
  }
}));

const StyledSelect = styled(Select)(({ theme, editing }) => ({
  '& .MuiSelect-select': {
    paddingTop: editing ? 12 : 8,
    paddingBottom: editing ? 12 : 8,
    fontSize: editing ? '1rem' : 'inherit',
  },
  '& .MuiInputBase-root': {
    backgroundColor: editing ? 'white' : 'inherit',
    minHeight: editing ? '48px' : 'auto',
  }
}));

const EditingTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: 'white',
    minHeight: '48px',
    fontSize: '1rem',
    padding: theme.spacing(1),
  },
  '& .MuiInputBase-input': {
    padding: '8px 12px',
    fontSize: '1rem',
  }
}));

const StyledChip = styled(Chip)(({ theme, color }) => ({
  backgroundColor: color,
  fontWeight: 500,
  '& .MuiChip-label': {
    padding: '0 8px',
  }
}));

const ArrangedChip = styled(StyledChip)({
  backgroundColor: '#d9ead3', // 緑色 - 手配済
  color: '#333',
});

const InProgressChip = styled(StyledChip)({
  backgroundColor: '#fce5cd', // オレンジ色 - 予約中
  color: '#333',
});

const PaidChip = styled(StyledChip)({
  backgroundColor: '#c9daf8', // 青色 - 支払済
  color: '#333',
});

const UnpaidChip = styled(StyledChip)({
  backgroundColor: '#f4cccc', // 赤色 - 未払い
  color: '#333',
});

const CategoryChip = styled(StyledChip)({
  backgroundColor: '#d0e0e3', // 薄い青緑色
  color: '#333',
});

const TotalCard = styled(Card)(({ theme }) => ({
  maxWidth: 250,
  marginLeft: 'auto',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
}));

const AddItemButton = styled(Fab)(({ theme }) => ({
  margin: '0 auto',
  display: 'flex',
  backgroundColor: '#4a86e8',
  color: 'white',
  '&:hover': {
    backgroundColor: '#3a76d8',
  }
}));

const TotalAmount = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#4a86e8', // 青色
  textAlign: 'right',
}));

// 各項目のラベル
const FieldLabel = styled(Typography)(({ theme }) => ({
  color: 'rgba(0, 0, 0, 0.6)',
  fontSize: '0.75rem',
  marginBottom: theme.spacing(0.5),
}));


// 日付フォーマット（コンポーネント外で定義して共有）
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  // yyyy/MM/dd 形式でフォーマット
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// カテゴリーオプション
const CATEGORY_OPTIONS = [
  { value: 'accommodation', label: '宿泊' },
  { value: 'transportation', label: '交通' },
  { value: 'meals', label: '食事' },
  { value: 'others', label: 'その他' }
];

// 支払い先オプション
const PAYMENT_OPTIONS = [
  { value: 'zenryoku', label: '全旅行' },
  { value: 'oata', label: 'OATA' },
  { value: 'cash', label: '現金' },
  { value: 'other', label: 'その他' }
];

// 支払い状況オプション
const PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: '支払済' },
  { value: 'scheduled', label: '支払期日' }
];

// 手配状況オプション
const ARRANGEMENT_STATUS_OPTIONS = [
  { value: 'arranged', label: '手配済' },
  { value: 'not-arranged', label: '手配未' }
];

// 支払い情報モーダルコンポーネント
const PaymentInfoModal = ({
  open,
  onClose,
  item,
  onSave
}) => {
  // 現在の支払い情報の状態
  const [paymentInfo, setPaymentInfo] = useState({
    paymentStatus: item.paymentStatus || 'scheduled',
    paymentDate: item.paymentDate || '',
    paymentTo: item.paymentTo || '',
    paymentContactPerson: item.paymentContactPerson || '',
    paymentContact: item.paymentContact || ''
  });

  // マウント時に値を更新
  useEffect(() => {
    setPaymentInfo({
      paymentStatus: item.paymentStatus || 'scheduled',
      paymentDate: item.paymentDate || '',
      paymentTo: item.paymentTo || '',
      paymentContactPerson: item.paymentContactPerson || '',
      paymentContact: item.paymentContact || ''
    });
  }, [item]);

  // フィールド変更ハンドラ
  const handleFieldChange = (field, value) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 保存して閉じる
  const handleSave = () => {
    onSave(paymentInfo);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          p: 2,
          borderRadius: '8px',
          maxWidth: '500px',
          backgroundColor: 'white'
        }
      }}
    >
      <DialogTitle sx={{ p: 1, fontWeight: 'bold' }}>
        支払い情報
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* 支払い状況 */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              支払い状況
            </Typography>
            <Select
              value={paymentInfo.paymentStatus}
              onChange={(e) => handleFieldChange('paymentStatus', e.target.value)}
              sx={{ backgroundColor: 'white', width: '100%' }}
            >
              {PAYMENT_STATUS_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* 支払い期日 (支払い状態が期日の場合のみ表示) */}
          {paymentInfo.paymentStatus === 'scheduled' && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                支払い期日
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                <DatePicker
                  value={paymentInfo.paymentDate ? new Date(paymentInfo.paymentDate) : null}
                  onChange={(newDate) => {
                    if (newDate) {
                      handleFieldChange('paymentDate', formatDate(newDate));
                    }
                  }}
                  format="yyyy/MM/dd"
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      sx: { 
                        '& .MuiInputBase-root': { 
                          minHeight: '48px',
                          backgroundColor: 'white'
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          )}

          {/* 支払先 */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              支払い方法
            </Typography>
            <Select
              value={paymentInfo.paymentTo}
              onChange={(e) => handleFieldChange('paymentTo', e.target.value)}
              sx={{ backgroundColor: 'white', width: '100%' }}
            >
              {PAYMENT_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* 支払先担当者 */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              支払先担当者
            </Typography>
            <TextField
              fullWidth
              value={paymentInfo.paymentContactPerson}
              onChange={(e) => handleFieldChange('paymentContactPerson', e.target.value)}
              placeholder="担当者名"
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>

          {/* 連絡先 */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              連絡先
            </Typography>
            <TextField
              fullWidth
              value={paymentInfo.paymentContact}
              onChange={(e) => handleFieldChange('paymentContact', e.target.value)}
              placeholder="電話番号など"
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={onClose}
          startIcon={<CancelIcon />}
        >
          キャンセル
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSave}
          startIcon={<CheckIcon />}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// セル編集用のポップアップコンポーネント
const CellEditPopup = ({ 
  anchorEl, 
  open, 
  onClose, 
  fieldType, 
  fieldValue, 
  fieldName, 
  options, 
  onSave 
}) => {
  const [value, setValue] = useState(fieldValue);
  
  // マウント時に値を更新（props変更時に反映させるため）
  useEffect(() => {
    setValue(fieldValue);
  }, [fieldValue]);
  
  // 値を保存して閉じる
  const handleSave = () => {
    onSave(value);
    onClose();
  };
  
  // フィールドタイプに応じた入力コンポーネントをレンダリング
  const renderInputField = () => {
    switch (fieldType) {
      case 'select':
        return (
          <FormControl fullWidth>
            <StyledSelect
              value={value}
              onChange={(e) => setValue(e.target.value)}
              editing={true}
              autoFocus
            >
              {options && options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>
        );
        
      case 'date':
        return (
          <DatePicker
            value={value ? new Date(value) : null}
            onChange={(newDate) => setValue(newDate ? formatDate(newDate) : '')}
            format="yyyy/MM/dd"
            slotProps={{ 
              textField: { 
                fullWidth: true,
                autoFocus: true,
                sx: { 
                  '& .MuiInputBase-root': { 
                    minHeight: '48px',
                    backgroundColor: 'white'
                  }
                }
              }
            }}
          />
        );
        
      case 'number':
        return (
          <EditingTextField
            fullWidth
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            InputProps={{
              endAdornment: fieldName.includes('price') || fieldName.includes('sales') 
                ? <InputAdornment position="end">円</InputAdornment>
                : fieldName.includes('count')
                  ? <InputAdornment position="end">人</InputAdornment>
                  : null,
              inputProps: { 
                min: 0, 
                style: { 
                  textAlign: 'right',
                  fontWeight: fieldName.includes('sales') ? 'bold' : 'normal'
                } 
              }
            }}
          />
        );
        
      case 'text':
      default:
        return (
          <EditingTextField
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
            multiline={fieldName === 'content'}
            rows={fieldName === 'content' ? 5 : 1}
            autoFocus
            sx={{
              ...(fieldName === 'content' && { 
                minWidth: '300px',
                '& .MuiInputBase-root': { minHeight: '120px' }
              })
            }}
          />
        );
    }
  };
  
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      sx={{
        '& .MuiPopover-paper': {
          padding: 2,
          minWidth: '280px',
          maxWidth: fieldName === 'content' ? '400px' : '300px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }
      }}
    >
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          {(() => {
            switch(fieldName) {
              case 'arrangementStatus': return '手配状況';
              case 'usageDate': return '利用日';
              case 'category': return 'カテゴリー';
              case 'content': return '内容';
              case 'unitPrice': return '単価';
              case 'personCount': return '人数';
              case 'totalSales': return '販売総額';
              case 'paymentStatus': return '支払状況';
              case 'paymentTo': return '支払先';
              default: return fieldName;
            }
          })()}
        </Typography>
        
        {renderInputField()}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
          <Button 
            variant="outlined" 
            color="inherit" 
            size="small" 
            onClick={onClose}
            startIcon={<CancelIcon />}
          >
            キャンセル
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={handleSave}
            startIcon={<CheckIcon />}
          >
            保存
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

// デバッグログ用フラグ - 問題のデバッグに使用
const debugMode = true;

const SalesDetails = () => {
  const { salesDetails, updateSalesDetails } = useKarte();
  
  // デフォルトの値を定義（定数として）
  const DEFAULT_ITEM = Object.freeze({
    arrangementStatus: 'not-arranged',
    category: '',
    content: '',
    usageDate: '',
    unitPrice: '0',
    personCount: '0',
    totalSales: '0',
    paymentStatus: 'scheduled',
    paymentTo: '',
    paymentDate: '',
    paymentContactPerson: '',
    paymentContact: ''
  });
  
  // 表形式のデータ構造に変換
  const [salesItems, setSalesItems] = useState([]);
  // 売上明細全体のメモ
  const [salesMemo, setSalesMemo] = useState('');
  
  // 従来の行全体の編集モードは削除し、ポップアップでの編集に変更
  
  // メニュー関連の状態
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);
  
  // 削除確認ダイアログの状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  
  // セル編集用のポップアップの状態
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupAnchorEl, setPopupAnchorEl] = useState(null);
  const [editingCellInfo, setEditingCellInfo] = useState({
    itemId: null,
    fieldName: null,
    fieldValue: null,
    fieldType: null,
    options: null
  });
  
  // 支払い情報モーダルの状態
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState(null);
  
  // 支払い状況セルクリック時の処理
  const handlePaymentStatusClick = (event, item) => {
    setSelectedPaymentItem(item);
    setPaymentModalOpen(true);
  };
  
  // 支払い情報モーダルを閉じる
  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
    setSelectedPaymentItem(null);
  };
  
  // 支払い情報を保存
  const handleSavePaymentInfo = (paymentInfo) => {
    if (!selectedPaymentItem) return;
    
    // 行のデータをアップデート
    setSalesItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === selectedPaymentItem.id) {
          return {
            ...item,
            paymentStatus: paymentInfo.paymentStatus,
            paymentDate: paymentInfo.paymentDate,
            paymentTo: paymentInfo.paymentTo,
            paymentContactPerson: paymentInfo.paymentContactPerson,
            paymentContact: paymentInfo.paymentContact
          };
        }
        return item;
      });
    });
  };
  
  // メニューを開く
  const handleMenuOpen = (event, itemId) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuItemId(itemId);
  };
  
  // メニューを閉じる
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuItemId(null);
  };
  
  // インライン編集用のstate
  const [inlineEditingItemId, setInlineEditingItemId] = useState(null);
  const [inlineEditingField, setInlineEditingField] = useState(null);
  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState(null);
  const [selectAnchorEl, setSelectAnchorEl] = useState(null);
  
  // セルクリック時のアクション
  const handleCellClick = (event, item, fieldName) => {
    // 1. プルダウン項目の場合：直接プルダウンを表示
    if (
      fieldName === 'arrangementStatus' || 
      fieldName === 'category' || 
      fieldName === 'paymentStatus' || 
      fieldName === 'paymentTo'
    ) {
      let options = null;
      switch(fieldName) {
        case 'arrangementStatus':
          options = ARRANGEMENT_STATUS_OPTIONS;
          break;
        case 'category':
          options = CATEGORY_OPTIONS;
          break;
        case 'paymentStatus':
          options = PAYMENT_STATUS_OPTIONS;
          break;
        case 'paymentTo':
          options = PAYMENT_OPTIONS;
          break;
        default:
          break;
      }
      
      // インライン編集情報をセット
      setInlineEditingItemId(item.id);
      setInlineEditingField(fieldName);
      setEditingCellInfo({
        itemId: item.id,
        fieldName,
        fieldValue: item[fieldName],
        fieldType: 'select',
        options
      });
      
      // セレクトメニューのアンカー要素をセット
      setSelectAnchorEl(event.currentTarget);
    } 
    // 2. 日付項目の場合：直接日付ピッカーを表示
    else if (fieldName === 'usageDate') {
      setInlineEditingItemId(item.id);
      setInlineEditingField(fieldName);
      setEditingCellInfo({
        itemId: item.id,
        fieldName,
        fieldValue: item[fieldName],
        fieldType: 'date'
      });
      
      // 日付ピッカーのアンカー要素をセット
      setDatePickerAnchorEl(event.currentTarget);
    }
    // 3. それ以外：通常のポップアップ表示
    else {
      let fieldType = 'text';
      
      if (fieldName === 'unitPrice' || fieldName === 'personCount' || fieldName === 'totalSales') {
        fieldType = 'number';
      }
      
      setEditingCellInfo({
        itemId: item.id,
        fieldName,
        fieldValue: item[fieldName],
        fieldType
      });
      
      setPopupAnchorEl(event.currentTarget);
      setPopupOpen(true);
    }
  };
  
  // ポップアップを閉じる
  const handlePopupClose = () => {
    setPopupOpen(false);
    setPopupAnchorEl(null);
  };
  
  // セレクトメニューを閉じる
  const handleSelectClose = () => {
    setSelectAnchorEl(null);
    setInlineEditingItemId(null);
    setInlineEditingField(null);
  };
  
  // 日付ピッカーを閉じる
  const handleDatePickerClose = () => {
    setDatePickerAnchorEl(null);
    setInlineEditingItemId(null);
    setInlineEditingField(null);
  };
  
  // セレクトメニューの選択肢を選んだときの処理
  const handleSelectChange = (newValue) => {
    const { itemId, fieldName } = editingCellInfo;
    
    if (!itemId || !fieldName) return;
    
    // 値を更新
    handleCellValueSave(newValue);
    
    // セレクトメニューを閉じる
    handleSelectClose();
  };
  
  // 日付選択時の処理
  const handleDateChange = (newDate) => {
    const { itemId, fieldName } = editingCellInfo;
    
    if (!itemId || !fieldName) return;
    
    // 日付をフォーマットして値を更新
    const formattedDate = formatDate(newDate);
    handleCellValueSave(formattedDate);
    
    // 日付ピッカーを閉じる
    handleDatePickerClose();
  };
  
  // セルの値を保存（共通処理）
  const handleCellValueSave = (newValue) => {
    const { itemId, fieldName } = editingCellInfo;
    
    if (!itemId || !fieldName) return;
    
    if (debugMode) {
      console.log('セル値を保存:', itemId, fieldName, newValue);
    }
    
    // 行のデータをアップデート
    setSalesItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === itemId) {
          // 数値フィールドの場合は確実に文字列の数値として保存
          let processedValue = newValue;
          if (fieldName === 'unitPrice' || fieldName === 'personCount' || fieldName === 'totalSales') {
            processedValue = String(newValue || '0');
          }
          
          const updatedItem = { ...item, [fieldName]: processedValue };
          
          // 単価か人数が変更された場合は販売総額を自動計算
          if (fieldName === 'unitPrice' || fieldName === 'personCount') {
            const unitPrice = fieldName === 'unitPrice' 
              ? parseFloat(newValue) || 0 
              : parseFloat(item.unitPrice) || 0;
              
            const personCount = fieldName === 'personCount'
              ? parseFloat(newValue) || 0
              : parseFloat(item.personCount) || 0;
              
            updatedItem.totalSales = (unitPrice * personCount).toString();
          }
          
          if (debugMode) {
            console.log('更新後のアイテム:', updatedItem);
          }
          
          return updatedItem;
        }
        return item;
      });
      
      if (debugMode) {
        console.log('更新後のアイテム一覧:', updatedItems);
      }
      
      return updatedItems;
    });
  };

  // デバッグログのフラグは上部で定義済み
  // 初期データのロード
  useEffect(() => {
    // 既存のカテゴリ別データを表形式に変換
    if (salesDetails && Object.keys(salesDetails).length > 0) {
      // 前のデータと比較して変更がある場合のみ更新
      const flattenedItems = [];
      
      // 各カテゴリのアイテムを統合
      Object.entries(salesDetails).forEach(([category, items]) => {
        if (Array.isArray(items)) {
          items.forEach(item => {
            flattenedItems.push({
              id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
              arrangementStatus: item.arrangementStatus || 'not-arranged',
              category: category,
              content: item.content || '',
              usageDate: item.usageDate || '',
              unitPrice: String(item.unitPrice || '0'),
              personCount: String(item.personCount || '0'),
              totalSales: String(item.totalSales || '0'),
              paymentStatus: item.paymentStatus === 'unpaid' ? 'scheduled' : (item.paymentStatus || 'scheduled'),
              paymentTo: item.paymentTo || '',
              paymentDate: item.paymentDate || '',
              paymentContactPerson: item.paymentContactPerson || '',
              paymentContact: item.paymentContact || ''
            });
          });
        }
      });
      
      // 現在の配列と同じでない場合のみ更新
      const currentIds = salesItems.map(item => item.id).sort().join(',');
      const newIds = flattenedItems.map(item => item.id).sort().join(',');
      
      if (currentIds !== newIds) {
        setSalesItems(flattenedItems);
      }
      
      // メモも読み込む
      if (salesDetails.memo !== undefined && salesDetails.memo !== salesMemo) {
        setSalesMemo(salesDetails.memo || '');
      }
    } else if (Object.keys(salesDetails).length === 0 && salesItems.length > 0) {
      // salesDetailsがリセットされた場合、salesItemsも空にする
      setSalesItems([]);
      setSalesMemo('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesDetails]);

  // データが更新されたらコンテキストを更新
  useEffect(() => {
    if (salesItems.length > 0) {
      // データをカテゴリ別に整理
      const categorizedData = {
        accommodation: [],
        transportation: [],
        meals: [],
        others: [],
        memo: salesMemo // メモ情報も保存
      };
      
      salesItems.forEach(item => {
        if (categorizedData[item.category]) {
          categorizedData[item.category].push(item);
        } else {
          // 未知のカテゴリの場合はその他に分類
          categorizedData.others.push(item);
        }
      });
      
      // コンテキストを更新
      updateSalesDetails(categorizedData);
    } else {
      // 項目がない場合でもメモだけは保存
      updateSalesDetails({
        accommodation: [],
        transportation: [],
        meals: [],
        others: [],
        memo: salesMemo
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesItems, salesMemo]);

  // 新しい行を追加（シンプルに修正）
  const addRow = () => {
    // シンプルに新しい行を追加
    const newItem = {
      id: Date.now().toString(),
      arrangementStatus: 'not-arranged',
      category: '',
      content: '',
      usageDate: '',
      unitPrice: '0',
      personCount: '0',
      totalSales: '0',
      paymentStatus: 'scheduled',
      paymentTo: '',
      paymentDate: '',
      paymentContactPerson: '',
      paymentContact: ''
    };
    
    // 行を追加
    setSalesItems(prevItems => [...prevItems, newItem]);
  };

  // 行を削除（関数型更新を使用）
  const deleteRow = (id) => {
    setSalesItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // 行の値を更新（最適化バージョン）
  const updateRow = (id, field, value) => {
    // 変更がある場合のみ更新処理を実行
    setSalesItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          // 既存の値と同じ場合は更新しない
          if (item[field] === value) {
            return item;
          }
          
          const updatedItem = { ...item, [field]: value };
          
          // 単価か人数が変更された場合は販売総額を自動計算
          if (field === 'unitPrice' || field === 'personCount') {
            const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(item.unitPrice) || 0;
            const personCount = field === 'personCount' ? parseFloat(value) || 0 : parseFloat(item.personCount) || 0;
            updatedItem.totalSales = (unitPrice * personCount).toString();
          }
          
          return updatedItem;
        }
        return item;
      });
    });
  };

  // 削除の確認ダイアログを表示
  const handleDeleteRequest = (id) => {
    setItemToDeleteId(id);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // 削除を確定
  const confirmDelete = () => {
    if (itemToDeleteId) {
      deleteRow(itemToDeleteId);
      setItemToDeleteId(null);
    }
    setDeleteDialogOpen(false);
  };

  // 削除をキャンセル
  const cancelDelete = () => {
    setItemToDeleteId(null);
    setDeleteDialogOpen(false);
  };

  // これらの編集関連の関数は、セル単位の編集に置き換えたため削除

  // 合計金額を計算
  const calculateTotal = () => {
    return salesItems.reduce((sum, item) => {
      return sum + (parseFloat(item.totalSales) || 0);
    }, 0);
  };

  // formatDate関数はコンポーネント外に移動

  return (
    <FormPaper elevation={2}>
      <SectionTitle variant="h6">売上明細</SectionTitle>
      
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
        {/* 明細一覧 */}
        <StyledTableContainer>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <StyledTableHeaderCell width="70px">手配状況</StyledTableHeaderCell>
                <StyledTableHeaderCell width="90px">利用日</StyledTableHeaderCell>
                <StyledTableHeaderCell width="70px">カテゴリー</StyledTableHeaderCell>
                <StyledTableHeaderCell width="240px">内容</StyledTableHeaderCell>
                <StyledTableHeaderCell width="70px">単価</StyledTableHeaderCell>
                <StyledTableHeaderCell width="45px">人数</StyledTableHeaderCell>
                <StyledTableHeaderCell width="80px">販売総額</StyledTableHeaderCell>
                <StyledTableHeaderCell width="70px">支払状況</StyledTableHeaderCell>
                <StyledTableHeaderCell width="35px">操作</StyledTableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* データがない場合のメッセージ */}
              {salesItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      明細データがありません。下の追加ボタンをクリックして明細を追加してください。
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              
              {/* 明細行データ */}
              {salesItems.map((item) => (
                <StyledTableRow key={item.id}>
                  {/* 表示モード - クリック可能なセル */}
                  <StyledTableCell 
                    onClick={(event) => handleCellClick(event, item, 'arrangementStatus')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f0f7ff' } }}
                  >
                    {item.arrangementStatus === 'arranged' ? (
                      <ArrangedChip label="手配済" size="small" />
                    ) : (
                      <InProgressChip label="手配未" size="small" />
                    )}
                  </StyledTableCell>
                  
                  <StyledTableCell 
                    onClick={(event) => handleCellClick(event, item, 'usageDate')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f0f7ff' } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {item.usageDate || <Typography variant="body2" color="text.secondary">クリックして日付を選択</Typography>}
                    </Box>
                  </StyledTableCell>
                  
                  <StyledTableCell 
                    onClick={(event) => handleCellClick(event, item, 'category')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f0f7ff' } }}
                  >
                    <CategoryChip 
                      label={item.category ? CATEGORY_OPTIONS.find(opt => opt.value === item.category)?.label || '' : '選択してください'} 
                      size="small"
                    />
                  </StyledTableCell>
                  
                  <StyledTableCell 
                    onClick={(event) => handleCellClick(event, item, 'content')}
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { backgroundColor: '#f0f7ff' },
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      verticalAlign: 'top',
                      minHeight: '50px'
                    }}
                  >
                    {item.content ? (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}
                      >
                        {item.content}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">クリックして入力</Typography>
                    )}
                  </StyledTableCell>
                  
                  <StyledTableCell 
                    align="right"
                    onClick={(event) => handleCellClick(event, item, 'unitPrice')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f0f7ff' } }}
                  >
                    {parseInt(item.unitPrice || 0).toLocaleString()}円
                  </StyledTableCell>
                  
                  <StyledTableCell 
                    align="right"
                    onClick={(event) => handleCellClick(event, item, 'personCount')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f0f7ff' } }}
                  >
                    {item.personCount}人
                  </StyledTableCell>
                  
                  <StyledTableCell 
                    align="right" 
                    onClick={(event) => handleCellClick(event, item, 'totalSales')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f0f7ff' }, fontWeight: 'bold' }}
                  >
                    {parseInt(item.totalSales || 0).toLocaleString()}円
                  </StyledTableCell>
                  
                  <StyledTableCell 
                    onClick={(event) => handlePaymentStatusClick(event, item)}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f0f7ff' } }}
                  >
                    {item.paymentStatus === 'paid' ? (
                      <PaidChip label="支払済" size="small" />
                    ) : (
                      <UnpaidChip 
                        label={item.paymentDate ? `期日:${item.paymentDate.replace(/^\d{4}\//, '')}` : "支払期日"} 
                        size="small" 
                      />
                    )}
                  </StyledTableCell>
                  
                  <StyledTableCell>
                    <IconButton 
                      size="small" 
                      onClick={(event) => handleMenuOpen(event, item.id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
        
        {/* Fab ボタンをフォーム内に配置 */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          marginY: 2
        }}>
          <Tooltip title="行を追加">
            <Fab
              color="primary"
              aria-label="行を追加"
              onClick={addRow}
              size="medium"
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        
        {/* アクションメニュー */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (menuItemId) handleDeleteRequest(menuItemId);
          }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            削除
          </MenuItem>
        </Menu>
        
        {/* セル編集用ポップアップ（テキストと数値フィールド用） */}
        <CellEditPopup
          anchorEl={popupAnchorEl}
          open={popupOpen}
          onClose={handlePopupClose}
          fieldType={editingCellInfo.fieldType}
          fieldValue={editingCellInfo.fieldValue}
          fieldName={editingCellInfo.fieldName}
          options={editingCellInfo.options}
          onSave={handleCellValueSave}
        />

        {/* 支払い情報モーダル */}
        {selectedPaymentItem && (
          <PaymentInfoModal
            open={paymentModalOpen}
            onClose={handlePaymentModalClose}
            item={selectedPaymentItem}
            onSave={handleSavePaymentInfo}
          />
        )}
        
        {/* セレクトメニュー（プルダウン直接表示） */}
        <Menu
          anchorEl={selectAnchorEl}
          open={Boolean(selectAnchorEl)}
          onClose={handleSelectClose}
          sx={{
            '& .MuiPaper-root': {
              maxHeight: 300,
              minWidth: 180,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }
          }}
        >
          {editingCellInfo.options && editingCellInfo.options.map((option) => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              onClick={() => handleSelectChange(option.value)}
              selected={editingCellInfo.fieldValue === option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
        
        {/* カレンダーダイアログ */}
        <Dialog
          open={Boolean(datePickerAnchorEl)}
          onClose={handleDatePickerClose}
          PaperProps={{
            sx: {
              p: 2,
              borderRadius: '8px',
              maxWidth: '350px',
              backgroundColor: 'white'
            }
          }}
        >
          <DialogTitle sx={{ p: 1, pb: 0 }}>
            利用日を選択
          </DialogTitle>
          <DialogContent sx={{ p: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={editingCellInfo.fieldValue ? new Date(editingCellInfo.fieldValue) : null}
                onChange={(date) => {
                  if (date) {
                    handleDateChange(date);
                  }
                }}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleDatePickerClose}
            >
              キャンセル
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* 削除確認ダイアログ */}
        <Dialog
          open={deleteDialogOpen}
          onClose={cancelDelete}
        >
          <DialogTitle>明細の削除</DialogTitle>
          <DialogContent>
            <DialogContentText>
              この明細を削除してもよろしいですか？この操作は元に戻せません。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete} color="primary">
              キャンセル
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              削除
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* 合計欄 */}
        <TotalCard>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" fontWeight="bold">合計:</Typography>
            </Grid>
            <Grid item xs={6}>
              <TotalAmount variant="subtitle2">
                {calculateTotal().toLocaleString()} 円
              </TotalAmount>
            </Grid>
          </Grid>
        </TotalCard>
        
      </LocalizationProvider>
      
      {/* 売上明細メモ欄 */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          明細メモ:
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="売上明細に関するメモを入力してください"
          value={salesMemo}
          onChange={(e) => setSalesMemo(e.target.value)}
          sx={{ backgroundColor: '#fafafa' }}
        />
      </Box>
    </FormPaper>
  );
};

export default SalesDetails;