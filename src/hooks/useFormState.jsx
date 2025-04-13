import { useState, useCallback } from 'react';

/**
 * フォーム状態管理用のカスタムフック
 * 
 * @param {Object} initialState - フォームの初期状態
 * @param {Function} onSubmit - フォーム送信時のコールバック関数（オプション）
 * @param {Function} validate - バリデーション関数（オプション）
 * @returns {Object} フォーム状態管理に必要なメソッドとプロパティ
 */
const useFormState = (initialState = {}, onSubmit, validate) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * フォームフィールドの変更を処理
   * 
   * @param {Event|Object} e - イベントオブジェクトまたは {name, value} を含むオブジェクト
   */
  const handleChange = useCallback((e) => {
    // イベントオブジェクトからname, valueを取得するか、直接オブジェクトから取得
    const { name, value, type, checked } = e.target ? e.target : e;
    
    setFormData(prevState => ({
      ...prevState,
      // チェックボックスの場合はcheckedプロパティを使用
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  }, [errors]);

  /**
   * 複数のフィールドを一度に更新
   * 
   * @param {Object} fields - 更新するフィールドのオブジェクト {fieldName: value}
   */
  const updateFields = useCallback((fields) => {
    setFormData(prevState => ({
      ...prevState,
      ...fields
    }));
  }, []);

  /**
   * フォームをリセット
   * 
   * @param {Object} newData - 新しい初期値（オプション）
   */
  const resetForm = useCallback((newData = initialState) => {
    setFormData(newData);
    setErrors({});
  }, [initialState]);

  /**
   * フォームバリデーション
   * 
   * @returns {boolean} バリデーション結果
   */
  const validateForm = useCallback(() => {
    if (typeof validate !== 'function') return true;
    
    const validationErrors = validate(formData);
    
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }
    
    return true;
  }, [formData, validate]);

  /**
   * フォーム送信処理
   * 
   * @param {Event} e - イベントオブジェクト
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // すでに送信中なら処理しない
    if (isSubmitting) return;
    
    // バリデーションを実行
    const isValid = validateForm();
    if (!isValid) return;
    
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      // エラーハンドリングはonSubmit内で行う想定
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, validateForm, isSubmitting]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    handleChange,
    updateFields,
    resetForm,
    handleSubmit,
    validateForm
  };
};

export default useFormState;