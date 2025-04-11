import React from 'react';

import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatDate } from '../../utils/helpers';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

/**
 * 最近のカルテ一覧コンポーネント
 * 
 * @param {Object} props
 * @param {Array} props.karteList - カルテのリスト
 * @param {boolean} props.loading - ローディング状態
 * @param {string} props.title - タイトル
 * @param {number} props.maxItems - 表示する最大件数（デフォルト: 5）
 */
const RecentKarteList = ({ karteList = [], loading = false, title = '最近のカルテ', maxItems = 5 }) => {
  const navigate = useNavigate();
  
  // 表示件数を制限
  const displayList = karteList.slice(0, maxItems);
  
  const handleViewKarte = (id) => {
    navigate(`/karte/${id}`);
  };
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      ) : displayList.length === 0 ? (
        <Typography align="center" color="textSecondary" sx={{ py: 2 }}>
          カルテがありません
        </Typography>
      ) : (
        <List disablePadding>
          {displayList.map((karte, index) => (
            <React.Fragment key={karte.id}>
              {index > 0 && <Divider />}
              <StyledListItem>
                <ListItemText
                  primary={karte.karteNo || 'カルテ番号なし'}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {karte.dantaiName || '団体名なし'}
                      </Typography>
                      {` — ${karte.tantosha || '担当者なし'} | ${karte.departureDate || '出発日なし'}`}
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
                    {karte.lastUpdated ? formatDate(karte.lastUpdated, true) : '-'}
                  </Typography>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleViewKarte(karte.id)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </StyledListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default RecentKarteList;