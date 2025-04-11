import React, { useState } from 'react';
import { useKarte } from '../context/KarteContext';
import { Paper, Typography, TextField, Button, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  backgroundColor: '#4bacc6',
  color: 'white',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const CommentForm = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const CommentList = styled(Box)(({ theme }) => ({
  maxHeight: '400px',
  overflow: 'auto',
}));

const CommentItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f8f8f8',
}));

const CommentMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}));

const CommentSection = () => {
  const { comments, addComment, karteData } = useKarte();
  const [commentText, setCommentText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(commentText);
      setCommentText('');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <FormPaper elevation={2}>
      <SectionTitle variant="h6">◆ コメント欄</SectionTitle>
      
      <CommentForm component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="コメントを入力してください"
          multiline
          rows={2}
          variant="outlined"
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={!commentText.trim()} 
          endIcon={<SendIcon />}
          sx={{ alignSelf: 'flex-end' }}
        >
          投稿
        </Button>
      </CommentForm>
      
      <CommentList>
        {comments.length === 0 ? (
          <Typography color="textSecondary" align="center">
            コメントはありません
          </Typography>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} elevation={1}>
              <CommentMeta>
                {/* 投稿者名が空の場合は表示しない */}
                {comment.author && (
                  <Typography component="span" fontWeight="bold">
                    {comment.author}
                  </Typography>
                )}
                <Typography component="span">
                  {formatDate(comment.date)}
                </Typography>
              </CommentMeta>
              <Typography>{comment.text}</Typography>
            </CommentItem>
          ))
        )}
      </CommentList>
    </FormPaper>
  );
};

export default CommentSection;