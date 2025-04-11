import React from 'react';

import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const Title = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
}));

/**
 * 管理画面共通ヘッダーコンポーネント
 * 
 * @param {Object} props
 * @param {string} props.title - ページタイトル
 * @param {boolean} props.showBackButton - 戻るボタンを表示するかどうか
 * @param {React.ReactNode} props.actions - 右側に表示するアクション
 */
const AdminHeader = ({ 
  title = '管理画面', 
  showBackButton = false,
  actions
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNavigate = (path) => {
    handleMenuClose();
    navigate(path);
  };
  
  return (
    <StyledAppBar position="static">
      <Toolbar>
        {showBackButton ? (
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/admin')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Title variant="h6">
          {title}
        </Title>
        
        {actions && (
          <Box>
            {actions}
          </Box>
        )}
        
        <Button
          color="inherit"
          onClick={() => navigate('/karte/new')}
          startIcon={<NoteAddIcon />}
          sx={{ ml: 2 }}
        >
          新規カルテ
        </Button>
        
        {/* 管理メニュー */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleNavigate('/admin')}>
            <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
            ダッシュボード
          </MenuItem>
          <MenuItem onClick={() => handleNavigate('/admin/monthly-report')}>
            <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
            月別レポート
          </MenuItem>
          <MenuItem onClick={() => handleNavigate('/admin/staff')}>
            <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
            担当者管理
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleNavigate('/karte-list')}>
            カルテ一覧
          </MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default AdminHeader;