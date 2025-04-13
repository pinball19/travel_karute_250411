import React, { useState, useRef } from 'react';
import { useKarte } from '../context/KarteContext';
import { Paper, Typography, TextField, Button, Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

const ImageUploadButton = styled('input')({
  display: 'none',
});

const CommentImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: '200px',
  marginTop: theme.spacing(1),
  borderRadius: theme.spacing(1),
}));

const CommentImagesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const ThumbnailImage = styled('img')(({ theme }) => ({
  width: '80px',
  height: '80px',
  objectFit: 'cover',
  borderRadius: theme.spacing(0.5),
  cursor: 'pointer',
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
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim() || selectedImages.length > 0) {
      addComment(commentText, selectedImages);
      setCommentText('');
      setSelectedImages([]);
      setPreviewImages([]);
    }
  };
  
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // 画像ファイルをBase64エンコードして、プレビュー表示用とアップロード用に保存
      const imagePromises = filesArray.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(imagePromises).then(results => {
        setPreviewImages(prevImages => [...prevImages, ...results]);
        setSelectedImages(prevImages => [...prevImages, ...results]); // ファイルの代わりにBase64データを保存
      });
    }
  };
  
  const handleRemoveImage = (index) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
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
        <Box sx={{ width: '100%' }}>
          <TextField
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="コメントを入力してください"
            multiline
            rows={2}
            variant="outlined"
          />
          
          {previewImages.length > 0 && (
            <CommentImagesContainer>
              {previewImages.map((image, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <ThumbnailImage
                    src={image}
                    alt={`Preview ${index}`}
                    onClick={() => handleRemoveImage(index)}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                    }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    ✕
                  </IconButton>
                </Box>
              ))}
            </CommentImagesContainer>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <label htmlFor="image-upload">
            <ImageUploadButton
              accept="image/*"
              id="image-upload"
              type="file"
              multiple
              onChange={handleImageChange}
              ref={fileInputRef}
            />
            <Button
              component="span"
              variant="outlined"
              startIcon={<ImageIcon />}
              sx={{ height: '100%' }}
            >
              画像
            </Button>
          </label>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!commentText.trim() && previewImages.length === 0} 
            endIcon={<SendIcon />}
          >
            投稿
          </Button>
        </Box>
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
              
              {comment.images && comment.images.length > 0 && (
                <CommentImagesContainer>
                  {comment.images.map((image, idx) => (
                    <ThumbnailImage
                      key={idx}
                      src={image}
                      alt={`Comment image ${idx}`}
                      onClick={() => window.open(image, '_blank')}
                    />
                  ))}
                </CommentImagesContainer>
              )}
            </CommentItem>
          ))
        )}
      </CommentList>
    </FormPaper>
  );
};

export default CommentSection;