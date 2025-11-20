import { useState, useRef } from 'react';

export default function ContactForm() {
  // 現在の言語を判定
  const isEnglish = typeof window !== 'undefined' && window.location.pathname.startsWith('/en');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const honeypotRef = useRef(null);

  // Google FormのURLとフィールドID
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeXiuJHv_FYyBJgWE7kPXfCa6T1ZoeJfHqUFT0TWXtE-F4RvQ/formResponse";
  const FIELD_IDS = {
    name: "entry.1805615363",
    email: "entry.321316906", 
    subject: "entry.29458855",
    message: "entry.1810273391"
  };

  // 入力値の変更ハンドラー
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // バリデーション
  const validateForm = () => {
    const newErrors = {};
    
    // ハニーポットチェック
    if (honeypotRef.current && honeypotRef.current.value !== '') {
      alert(isEnglish ? 'Possible spam detected. Submission cancelled.' : 'スパムの可能性があります。送信を中止しました。');
      return false;
    }
    
    // 名前チェック
    if (!formData.name.trim()) {
      newErrors.name = isEnglish ? 'Name is required' : 'お名前は必須です';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
      newErrors.name = isEnglish ? 'Name must be between 2 and 50 characters' : 'お名前は2文字以上50文字以内で入力してください';
    }
    
    // メールチェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = isEnglish ? 'Email is required' : 'メールアドレスは必須です';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = isEnglish ? 'Please enter a valid email address' : '正しいメールアドレスを入力してください';
    }
    
    // 件名チェック
    if (!formData.subject.trim()) {
      newErrors.subject = isEnglish ? 'Subject is required' : '件名は必須です';
    } else if (formData.subject.trim().length < 5 || formData.subject.trim().length > 100) {
      newErrors.subject = isEnglish ? 'Subject must be between 5 and 100 characters' : '件名は5文字以上100文字以内で入力してください';
    }
    
    // メッセージチェック
    if (!formData.message.trim()) {
      newErrors.message = isEnglish ? 'Message is required' : 'お問い合わせ内容は必須です';
    } else if (formData.message.trim().length < 10 || formData.message.trim().length > 2000) {
      newErrors.message = isEnglish ? 'Message must be between 10 and 2000 characters' : 'お問い合わせ内容は10文字以上2000文字以内で入力してください';
    }
    
    // 送信回数制限チェック
    const lastSubmission = localStorage.getItem('lastFormSubmission');
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (lastSubmission && (now - parseInt(lastSubmission)) < oneDay) {
      alert(isEnglish ? 'You can submit once per day. Please try again later.' : '1日に1回まで送信可能です。時間をおいて再度お試しください。');
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // FormDataを作成
      const submitData = new FormData();
      submitData.append(FIELD_IDS.name, formData.name.trim());
      submitData.append(FIELD_IDS.email, formData.email.trim());
      submitData.append(FIELD_IDS.subject, formData.subject.trim());
      submitData.append(FIELD_IDS.message, formData.message.trim());
      
      // Google Formに送信
      await fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        body: submitData,
        mode: 'no-cors'
      });
      
      // 送信時刻を記録
      localStorage.setItem('lastFormSubmission', new Date().getTime().toString());
      
      // 成功処理
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
    } catch (error) {
      console.error('送信エラー:', error);
      alert(isEnglish ? 'Submission failed. Please try again later.' : '送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 成功画面
  if (isSubmitted) {
    return (
      <section className="contact-form">
        <div className="container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>{isEnglish ? 'Submission Complete' : '送信完了'}</h2>
            <p>
              {isEnglish ? (
                <>
                  Thank you for your inquiry.<br />
                  We will usually reply within 24 hours.
                </>
              ) : (
                <>
                  お問い合わせありがとうございました。<br />
                  通常24時間以内にご返信いたします。
                </>
              )}
            </p>
            <button 
              className="back-button"
              onClick={() => setIsSubmitted(false)}
            >
              {isEnglish ? 'New Inquiry' : '新しいお問い合わせ'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-form" id="contact">
      <div className="container">
        <span className="section-ttl eng">Contact</span>
        <div className="form-header">
          <h2 className="contact-form__title">{isEnglish ? 'Contact' : 'お問い合わせ'}</h2>
          <p className="contact-form__desc">
            {isEnglish 
              ? 'Please feel free to contact us. We will usually reply within 24 hours.' 
              : 'お気軽にお問い合わせください。通常24時間以内にご返信いたします。'
            }
          </p>
        </div>
        
        <form className="contact-form__form" onSubmit={handleSubmit}>
          {/* ハニーポットフィールド */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex="-1"
            autoComplete="off"
            style={{
              position: 'absolute',
              left: '-9999px',
              visibility: 'hidden'
            }}
          />
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                {isEnglish ? 'Name' : 'お名前'} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder={isEnglish ? 'Taro Yamada' : '山田太郎'}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {isEnglish ? 'Email Address' : 'メールアドレス'} <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="example@email.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="subject" className="form-label">
              {isEnglish ? 'Subject' : '件名'} <span className="required">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`form-input ${errors.subject ? 'error' : ''}`}
              placeholder={isEnglish ? 'Please enter the subject of your inquiry' : 'お問い合わせの件名をご入力ください'}
            />
            {errors.subject && <span className="error-message">{errors.subject}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              {isEnglish ? 'Message' : 'お問い合わせ内容'} <span className="required">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`form-textarea ${errors.message ? 'error' : ''}`}
              rows="6"
              placeholder={isEnglish ? 'Please provide details about your inquiry' : 'お問い合わせ内容を詳しくご記入ください'}
            />
            {errors.message && <span className="error-message">{errors.message}</span>}
            <div className="character-count">
              {formData.message.length}/2000{isEnglish ? ' characters' : '文字'}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="form-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                {isEnglish ? 'Sending...' : '送信中...'}
              </>
            ) : (
              isEnglish ? 'Send' : '送信する'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}