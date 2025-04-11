import React from 'react';

import { useKarte } from '../context/KarteContext';
import { TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const FormSection = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  backgroundColor: '#4472c4',
  color: 'white',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const BasicInfo = () => {
  const { karteData, updateField } = useKarte();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);

    // 旅行タイプが変更されたときの特別処理
    if (name === 'travelType') {
      const prefix = value === 'domestic' ? 'D' : 'I';
      // カルテ番号から既存の接頭辞を取り除く
      const numericPart = karteData.karteNo.replace(/^[DI]-/, '');
      updateField('karteNo', `${prefix}-${numericPart}`);
    }

    // 行き先が「その他」の場合の処理
    if (name === 'destination' && value === 'other') {
      // その他の入力欄を表示する処理は親コンポーネントで処理
    }
  };

  return (
    <FormPaper elevation={2}>
      <SectionTitle variant="h6">◆ 基本情報</SectionTitle>
      
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
          <TextField
            fullWidth
            id="company-person"
            name="companyPerson"
            label="自社担当者"
            value={karteData.companyPerson || ''}
            onChange={handleChange}
            placeholder="自社担当者名"
          />
        </Grid>

        {/* クライアント会社名 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="client-company"
            name="clientCompany"
            label="クライアント会社名"
            value={karteData.clientCompany || ''}
            onChange={handleChange}
            placeholder="クライアント会社名"
          />
        </Grid>

        {/* クライアント担当者 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="client-person"
            name="clientPerson"
            label="クライアント担当者"
            value={karteData.clientPerson || ''}
            onChange={handleChange}
            placeholder="担当者名"
          />
        </Grid>

        {/* 電話番号 */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="client-phone"
            name="clientPhone"
            label="電話番号"
            value={karteData.clientPhone || ''}
            onChange={handleChange}
            placeholder="電話番号"
            type="tel"
          />
        </Grid>

        {/* メールアドレス */}
        <Grid size={{xs: 12}}>
          <TextField
            fullWidth
            id="client-email"
            name="clientEmail"
            label="メールアドレス"
            value={karteData.clientEmail || ''}
            onChange={handleChange}
            placeholder="メールアドレス"
            type="email"
          />
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
          <TextField
            fullWidth
            id="departure-place"
            name="departurePlace"
            label="出発地"
            value={karteData.departurePlace || ''}
            onChange={handleChange}
            placeholder="出発地"
          />
        </Grid>

        {/* 行き先 */}
        <Grid size={{xs: 12}}>
          <FormControl fullWidth>
            <InputLabel id="destination-label">行き先</InputLabel>
            <Select
              labelId="destination-label"
              id="destination"
              name="destination"
              value={karteData.destination || ''}
              label="行き先"
              onChange={handleChange}
            >
              <MenuItem value="">選択してください</MenuItem>
              <MenuItem value="北海道">北海道</MenuItem>
              <MenuItem value="青森県">青森県</MenuItem>
              <MenuItem value="岩手県">岩手県</MenuItem>
              <MenuItem value="宮城県">宮城県</MenuItem>
              <MenuItem value="秋田県">秋田県</MenuItem>
              <MenuItem value="山形県">山形県</MenuItem>
              <MenuItem value="福島県">福島県</MenuItem>
              <MenuItem value="茨城県">茨城県</MenuItem>
              <MenuItem value="栃木県">栃木県</MenuItem>
              <MenuItem value="群馬県">群馬県</MenuItem>
              <MenuItem value="埼玉県">埼玉県</MenuItem>
              <MenuItem value="千葉県">千葉県</MenuItem>
              <MenuItem value="東京都">東京都</MenuItem>
              <MenuItem value="神奈川県">神奈川県</MenuItem>
              <MenuItem value="新潟県">新潟県</MenuItem>
              <MenuItem value="富山県">富山県</MenuItem>
              <MenuItem value="石川県">石川県</MenuItem>
              <MenuItem value="福井県">福井県</MenuItem>
              <MenuItem value="山梨県">山梨県</MenuItem>
              <MenuItem value="長野県">長野県</MenuItem>
              <MenuItem value="岐阜県">岐阜県</MenuItem>
              <MenuItem value="静岡県">静岡県</MenuItem>
              <MenuItem value="愛知県">愛知県</MenuItem>
              <MenuItem value="三重県">三重県</MenuItem>
              <MenuItem value="滋賀県">滋賀県</MenuItem>
              <MenuItem value="京都府">京都府</MenuItem>
              <MenuItem value="大阪府">大阪府</MenuItem>
              <MenuItem value="兵庫県">兵庫県</MenuItem>
              <MenuItem value="奈良県">奈良県</MenuItem>
              <MenuItem value="和歌山県">和歌山県</MenuItem>
              <MenuItem value="鳥取県">鳥取県</MenuItem>
              <MenuItem value="島根県">島根県</MenuItem>
              <MenuItem value="岡山県">岡山県</MenuItem>
              <MenuItem value="広島県">広島県</MenuItem>
              <MenuItem value="山口県">山口県</MenuItem>
              <MenuItem value="徳島県">徳島県</MenuItem>
              <MenuItem value="香川県">香川県</MenuItem>
              <MenuItem value="愛媛県">愛媛県</MenuItem>
              <MenuItem value="高知県">高知県</MenuItem>
              <MenuItem value="福岡県">福岡県</MenuItem>
              <MenuItem value="佐賀県">佐賀県</MenuItem>
              <MenuItem value="長崎県">長崎県</MenuItem>
              <MenuItem value="熊本県">熊本県</MenuItem>
              <MenuItem value="大分県">大分県</MenuItem>
              <MenuItem value="宮崎県">宮崎県</MenuItem>
              <MenuItem value="鹿児島県">鹿児島県</MenuItem>
              <MenuItem value="沖縄県">沖縄県</MenuItem>
              <MenuItem value="other">その他（海外など）</MenuItem>
            </Select>
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