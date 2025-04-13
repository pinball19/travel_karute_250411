import React from 'react';
import { useKarte } from '../context/KarteContext';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  FormHelperText, 
  Grid, 
  Paper, 
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ClientInput from './ClientInput';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  backgroundColor: '#4472c4',
  color: 'white',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const ClientFieldsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 0, 2, 0),
}));

const BasicInfo = () => {
  const { 
    karteData, 
    updateField,
    saveKarte
  } = useKarte();
  
  // 都道府県のリスト
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];
  
  // 国内主要空港の3レターコード
  const domesticAirports = [
    { code: 'HND', name: '東京/羽田 (HND)' },
    { code: 'NRT', name: '東京/成田 (NRT)' },
    { code: 'KIX', name: '大阪/関西 (KIX)' },
    { code: 'ITM', name: '大阪/伊丹 (ITM)' },
    { code: 'NGO', name: '名古屋/中部 (NGO)' },
    { code: 'FUK', name: '福岡 (FUK)' },
    { code: 'CTS', name: '札幌/新千歳 (CTS)' },
    { code: 'OKA', name: '沖縄/那覇 (OKA)' },
    { code: 'KOJ', name: '鹿児島 (KOJ)' },
    { code: 'HIJ', name: '広島 (HIJ)' },
    { code: 'KMJ', name: '熊本 (KMJ)' },
    { code: 'SDJ', name: '仙台 (SDJ)' }
  ];
  
  // 海外主要都市の3レターコード
  const internationalCities = [
    { code: 'JFK', name: 'ニューヨーク (JFK)' },
    { code: 'LAX', name: 'ロサンゼルス (LAX)' },
    { code: 'LHR', name: 'ロンドン (LHR)' },
    { code: 'CDG', name: 'パリ (CDG)' },
    { code: 'SIN', name: 'シンガポール (SIN)' },
    { code: 'BKK', name: 'バンコク (BKK)' },
    { code: 'HKG', name: '香港 (HKG)' },
    { code: 'PVG', name: '上海 (PVG)' },
    { code: 'PEK', name: '北京 (PEK)' },
    { code: 'ICN', name: 'ソウル (ICN)' },
    { code: 'TPE', name: '台北 (TPE)' },
    { code: 'SYD', name: 'シドニー (SYD)' }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);

    // 旅行タイプが変更されたときの特別処理
    if (name === 'travelType') {
      const prefix = value === 'domestic' ? 'D' : 'I';
      // カルテ番号から既存の接頭辞を取り除く
      const numericPart = karteData.karteNo.replace(/^[DI]-/, '');
      updateField('karteNo', `${prefix}-${numericPart}`);
      
      // 出発地と行き先をリセット
      updateField('departurePlace', '');
      updateField('destination', '');
      updateField('destinationOther', '');
    }

    // 行き先が「その他」の場合の処理
    if (name === 'destination' && value === 'other') {
      // その他の入力欄を表示する処理は親コンポーネントで処理
    }
  };
  
  // 不要な関数やコンポーネントをすべて削除

  return (
    <FormPaper elevation={2}>
      <SectionTitle variant="h6">◆ 基本情報</SectionTitle>
      
      {/* クライアント関連のダイアログは削除 */}
      
      <Grid container spacing={3}>
        {/* 国内/海外 */}
        <Grid size={{xs: 12}}>
          <FormControl fullWidth>
            <InputLabel id="travel-type-label">国内/海外</InputLabel>
            <Select
              labelId="travel-type-label"
              id="travel-type"
              name="travelType"
              value={karteData.travelType || 'domestic'}
              label="国内/海外"
              onChange={handleChange}
            >
              <MenuItem value="domestic">国内</MenuItem>
              <MenuItem value="international">海外</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* カルテ番号 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="karte-no"
            name="karteNo"
            label="カルテ番号"
            value={karteData.karteNo || ''}
            onChange={handleChange}
            placeholder="カルテ番号（国内はD、海外はIから始まる）"
          />
        </Grid>

        {/* 自社担当者 */}
        <Grid size={{xs: 12}}>
          <FormControl fullWidth>
            <InputLabel id="company-person-label">自社担当者</InputLabel>
            <Select
              labelId="company-person-label"
              id="company-person"
              name="companyPerson"
              value={karteData.companyPerson || ''}
              label="自社担当者"
              onChange={handleChange}
            >
              <MenuItem value="">選択してください</MenuItem>
              <MenuItem value="青木">青木</MenuItem>
              <MenuItem value="石井">石井</MenuItem>
              <MenuItem value="白木">白木</MenuItem>
              <MenuItem value="山口">山口</MenuItem>
              <MenuItem value="原">原</MenuItem>
              <MenuItem value="その他">その他</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* クライアント情報グループ */}
        <Grid item xs={12}>
          <ClientFieldsContainer>
            <Typography variant="subtitle2" gutterBottom>クライアント情報</Typography>
            
            {/* 新しいClientInputコンポーネントを使用 */}
            <ClientInput 
              value={{
                company: karteData.clientCompany || '',
                contactPerson: karteData.clientPerson || '',
                phone: karteData.clientPhone || '',
                email: karteData.clientEmail || ''
              }}
              onChange={(clientData) => {
                updateField('clientCompany', clientData.company || '');
                updateField('clientPerson', clientData.contactPerson || '');
                updateField('clientPhone', clientData.phone || '');
                updateField('clientEmail', clientData.email || '');
              }}
              onSubmit={(saveClientData) => {
                // フォーム送信時にデータを保存
                return saveKarte().then(success => {
                  if (success) {
                    saveClientData();
                  }
                  return success;
                });
              }}
            />
          </ClientFieldsContainer>
        </Grid>

        {/* 出発日 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="departure-date"
            name="departureDate"
            label="出発日"
            type="date"
            value={karteData.departureDate || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ input: { cursor: 'pointer' } }}
            inputProps={{ 
              min: "2020-01-01", 
              max: "2030-12-31"
            }}
          />
        </Grid>

        {/* 帰着日 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="return-date"
            name="returnDate"
            label="帰着日"
            type="date"
            value={karteData.returnDate || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ input: { cursor: 'pointer' } }}
            inputProps={{ 
              min: "2020-01-01", 
              max: "2030-12-31"
            }}
          />
        </Grid>

        {/* 泊数 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="nights"
            name="nights"
            label="泊数"
            type="number"
            value={karteData.nights || ''}
            onChange={handleChange}
            InputProps={{ readOnly: true }}
            helperText="出発日と帰着日から自動計算されます"
          />
        </Grid>

        {/* 出発地 */}
        <Grid size={{xs: 12}}>
          <FormControl fullWidth>
            <InputLabel id="departure-place-label">出発地</InputLabel>
            {karteData.travelType === 'domestic' ? (
              <Select
                labelId="departure-place-label"
                id="departure-place"
                name="departurePlace"
                value={karteData.departurePlace || ''}
                label="出発地"
                onChange={handleChange}
              >
                <MenuItem value="">選択してください</MenuItem>
                {prefectures.map((prefecture) => (
                  <MenuItem key={prefecture} value={prefecture}>
                    {prefecture}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <Select
                labelId="departure-place-label"
                id="departure-place"
                name="departurePlace"
                value={karteData.departurePlace || ''}
                label="出発地"
                onChange={handleChange}
              >
                <MenuItem value="">選択してください</MenuItem>
                {domesticAirports.map((airport) => (
                  <MenuItem key={airport.code} value={airport.code}>
                    {airport.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
        </Grid>

        {/* 行き先 */}
        <Grid size={{xs: 12}}>
          <FormControl fullWidth>
            <InputLabel id="destination-label">行き先</InputLabel>
            {karteData.travelType === 'domestic' ? (
              <Select
                labelId="destination-label"
                id="destination"
                name="destination"
                value={karteData.destination || ''}
                label="行き先"
                onChange={handleChange}
              >
                <MenuItem value="">選択してください</MenuItem>
                {prefectures.map((prefecture) => (
                  <MenuItem key={prefecture} value={prefecture}>
                    {prefecture}
                  </MenuItem>
                ))}
                <MenuItem value="other">その他</MenuItem>
              </Select>
            ) : (
              <Select
                labelId="destination-label"
                id="destination"
                name="destination"
                value={karteData.destination || ''}
                label="行き先"
                onChange={handleChange}
              >
                <MenuItem value="">選択してください</MenuItem>
                {internationalCities.map((city) => (
                  <MenuItem key={city.code} value={city.code}>
                    {city.name}
                  </MenuItem>
                ))}
                <MenuItem value="other">その他</MenuItem>
              </Select>
            )}
          </FormControl>
        </Grid>

        {/* その他の行き先（条件付き表示） */}
        {karteData.destination === 'other' && (
          <Grid size={{xs: 12}}>
            <TextField
              fullWidth
              id="destination-other"
              name="destinationOther"
              label="その他の行き先"
              value={karteData.destinationOther || ''}
              onChange={handleChange}
              placeholder="その他の行き先"
            />
          </Grid>
        )}

        {/* 旅行内容 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="travel-content"
            name="travelContent"
            label="旅行内容"
            value={karteData.travelContent || ''}
            onChange={handleChange}
            placeholder="旅行内容の詳細"
            multiline
            rows={4}
          />
        </Grid>

        {/* 合計人数 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="total-persons"
            name="totalPersons"
            label="合計人数"
            type="number"
            value={karteData.totalPersons || ''}
            onChange={handleChange}
            placeholder="合計人数"
          />
        </Grid>

        {/* 金額 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="total-amount"
            name="totalAmount"
            label="金額"
            type="number"
            value={karteData.totalAmount || ''}
            onChange={handleChange}
            placeholder="旅行総額"
            InputProps={{
              endAdornment: <Typography variant="body1" sx={{ ml: 1 }}>円</Typography>,
            }}
          />
        </Grid>

        {/* 単価 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="unit-price"
            name="unitPrice"
            label="単価"
            type="number"
            value={karteData.unitPrice || ''}
            onChange={handleChange}
            InputProps={{ readOnly: true }}
            helperText="人数と金額から自動計算されます"
          />
        </Grid>

        {/* 支払い先 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="payment-to"
            name="paymentTo"
            label="支払い先"
            value={karteData.paymentTo || ''}
            onChange={handleChange}
            placeholder="支払い先"
          />
        </Grid>

        {/* 手配状況 */}
        <Grid size={{xs: 12}}>
          <FormControl fullWidth>
            <InputLabel id="arrangement-status-label">手配状況</InputLabel>
            <Select
              labelId="arrangement-status-label"
              id="arrangement-status"
              name="arrangementStatus"
              value={karteData.arrangementStatus || 'not-started'}
              label="手配状況"
              onChange={handleChange}
            >
              <MenuItem value="not-started">未着手</MenuItem>
              <MenuItem value="in-progress">手配中</MenuItem>
              <MenuItem value="completed">手配完了</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </FormPaper>
  );
};

export default BasicInfo;