import React, { useState, useEffect, useCallback } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Box, 
  Typography, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { clientsService } from '../services/firebase';
import { useAsync } from '../hooks';
import logger from '../utils/logger';

/**
 * クライアント情報入力コンポーネント
 * 
 * 会社名入力で部分一致検索し、会社選択後に担当者を選択できる
 * フォーム送信時に会社/担当者が存在しない場合は自動でFirestoreに追加
 * 
 * @param {Object} props
 * @param {Object} props.value - 現在の入力値 ({ company, contactPerson, phone, email })
 * @param {Function} props.onChange - 値変更時のコールバック
 * @param {Function} props.onSubmit - フォーム送信時のコールバック
 * @param {boolean} props.disabled - 入力無効化フラグ
 * @param {boolean} props.fullWidth - 全幅表示フラグ
 */
const ClientInput = ({ 
  value = { company: '', contactPerson: '', phone: '', email: '' }, 
  onChange, 
  onSubmit,
  disabled = false,
  fullWidth = true,
  required = false
}) => {
  // 状態管理
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  
  // 会社検索の非同期処理
  const { 
    execute: searchCompanies,
    isPending: isSearching
  } = useAsync(clientsService.searchClients);
  
  // 会社選択時の処理
  const handleCompanySelect = useCallback(async (company) => {
    setSelectedCompany(company);
    
    if (company) {
      // 選択された会社の連絡先を設定
      const contacts = company.contacts || [];
      setContacts(contacts);
      
      // 会社名を更新
      if (onChange) {
        onChange({ 
          ...value, 
          company: company.name,
          clientId: company.id
        });
      }
      
      // プライマリー連絡先があれば自動選択
      const primaryContact = contacts.find(c => c.isPrimary);
      if (primaryContact) {
        handleContactSelect(primaryContact);
      } else if (contacts.length === 0) {
        // 連絡先がない場合はフィールドをクリア
        if (onChange) {
          onChange({ 
            ...value, 
            company: company.name,
            clientId: company.id,
            contactPerson: '',
            phone: '',
            email: ''
          });
        }
      }
    } else {
      // 会社の選択がクリアされた場合
      setContacts([]);
      if (onChange) {
        onChange({ 
          ...value, 
          company: '',
          clientId: null,
          contactPerson: '',
          phone: '',
          email: ''
        });
      }
    }
  }, [onChange, value]);
  
  // 連絡先選択時の処理
  const handleContactSelect = useCallback((contact) => {
    if (!contact) {
      // 連絡先がクリアされた場合
      if (onChange) {
        onChange({
          ...value,
          contactPerson: '',
          contactId: null,
          phone: '',
          email: ''
        });
      }
      return;
    }
    
    // 選択された連絡先情報をフォームに設定
    if (onChange) {
      onChange({
        ...value,
        contactPerson: contact.personName || '',
        contactId: contact.id,
        phone: contact.phone || '',
        email: contact.email || ''
      });
    }
  }, [onChange, value]);
  
  // 直接入力された場合の処理
  const handleDirectInput = useCallback((field, fieldValue) => {
    if (onChange) {
      onChange({
        ...value,
        [field]: fieldValue
      });
    }
  }, [onChange, value]);
  
  // 会社名変更時の検索処理
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.length < 1) {
        setSuggestions([]);
        return;
      }
      
      try {
        const results = await searchCompanies(inputValue);
        setSuggestions(results);
      } catch (error) {
        logger.error('会社検索エラー:', { error });
        setSuggestions([]);
      }
    };
    
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [inputValue, searchCompanies]);
  
  // フォーム送信時の処理（onSubmitがある場合のみ）
  useEffect(() => {
    const saveClientData = async () => {
      if (!onSubmit || !value.company) return;
      
      try {
        // 入力された会社が存在するか確認
        let clientId = value.clientId;
        
        // 会社が存在しない場合は新規作成
        if (!clientId && value.company) {
          // 新規会社データを作成
          const newClientData = {
            name: value.company,
            contacts: []
          };
          
          // 会社情報を保存
          clientId = await clientsService.saveClient(newClientData);
          
          // 連絡先情報が入力されている場合は連絡先も追加
          if (value.contactPerson) {
            const contactData = {
              personName: value.contactPerson,
              phone: value.phone || '',
              email: value.email || '',
              isPrimary: true
            };
            
            // 連絡先を追加
            await clientsService.addContact(clientId, contactData);
          }
        } 
        // 会社は存在するが連絡先情報が新規の場合
        else if (clientId && value.contactPerson && !value.contactId) {
          const contactData = {
            personName: value.contactPerson,
            phone: value.phone || '',
            email: value.email || '',
            isPrimary: contacts.length === 0 // 初めての連絡先ならプライマリに
          };
          
          // 連絡先を追加
          await clientsService.addContact(clientId, contactData);
        }
      } catch (error) {
        logger.error('クライアント情報保存エラー:', { error });
      }
    };
    
    // onSubmit実行時にクライアントデータを保存
    if (onSubmit) {
      onSubmit(saveClientData);
    }
  }, [onSubmit, value, contacts.length]);
  
  // インターフェースのレンダリング
  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {/* 会社名入力 (Autocomplete) */}
      <Autocomplete
        freeSolo
        disabled={disabled}
        fullWidth={fullWidth}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          handleDirectInput('company', newInputValue);
        }}
        value={value.company ? { name: value.company } : null}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            // 文字列入力の場合
            handleDirectInput('company', newValue);
          } else if (newValue && newValue.name) {
            // オブジェクト選択の場合
            handleCompanySelect(newValue);
          } else {
            // nullの場合はクリア
            handleCompanySelect(null);
          }
        }}
        options={suggestions}
        getOptionLabel={(option) => {
          // 文字列またはオブジェクト
          if (typeof option === 'string') return option;
          return option.name || '';
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="会社名"
            placeholder="会社名を入力..."
            required={required}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          // Fix React key warning by extracting key from props
          const { key, ...otherProps } = props;
          return (
            <li key={key} {...otherProps}>
              <Typography>{option.name}</Typography>
              {option.contacts?.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({option.contacts.length}件の連絡先)
                </Typography>
              )}
            </li>
          );
        }}
      />
      
      {/* 担当者選択 (セレクトボックス) */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <FormControl 
          fullWidth={fullWidth} 
          disabled={disabled || contacts.length === 0}
        >
          <InputLabel id="contact-select-label">担当者</InputLabel>
          <Select
            labelId="contact-select-label"
            id="contact-select"
            value={value.contactId || ''}
            label="担当者"
            onChange={(e) => {
              const contactId = e.target.value;
              if (!contactId) {
                handleContactSelect(null);
              } else {
                const selectedContact = contacts.find(c => c.id === contactId);
                if (selectedContact) {
                  handleContactSelect(selectedContact);
                }
              }
            }}
          >
            <MenuItem value="">
              <em>担当者を選択してください</em>
            </MenuItem>
            {contacts.map((contact) => (
              <MenuItem key={contact.id} value={contact.id}>
                {contact.personName}
                {contact.isPrimary && (
                  <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                    (主担当)
                  </Typography>
                )}
              </MenuItem>
            ))}
          </Select>
          {!value.contactId && contacts.length > 0 && (
            <FormHelperText>
              担当者を選択するか、下の欄に直接入力してください
            </FormHelperText>
          )}
        </FormControl>
      </Box>
      
      {/* 直接入力フィールド */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 担当者名 */}
        <TextField
          fullWidth={fullWidth}
          disabled={disabled}
          label="担当者名"
          value={value.contactPerson || ''}
          onChange={(e) => handleDirectInput('contactPerson', e.target.value)}
          placeholder={
            contacts.length > 0 
              ? "担当者を選択するか、直接入力してください" 
              : "担当者名を入力"
          }
        />
        
        {/* 電話番号 */}
        <TextField
          fullWidth={fullWidth}
          disabled={disabled}
          label="電話番号"
          value={value.phone || ''}
          onChange={(e) => handleDirectInput('phone', e.target.value)}
          placeholder="電話番号を入力"
        />
        
        {/* メールアドレス */}
        <TextField
          fullWidth={fullWidth}
          disabled={disabled}
          label="メールアドレス"
          value={value.email || ''}
          onChange={(e) => handleDirectInput('email', e.target.value)}
          placeholder="メールアドレスを入力"
          type="email"
        />
      </Box>
    </Box>
  );
};

export default ClientInput;