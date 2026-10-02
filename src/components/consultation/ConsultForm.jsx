import { useState, useRef } from 'react';

/*
  初回相談（/consultation）専用の申込フォーム。
  送信先はトップの ContactForm.jsx と同じ Google フォーム（項目は4つ）。
  会社名・電話・希望の形式は専用の項目がないので、本文の先頭にまとめて入れる。
  見た目は _contact.scss（#contact スコープ）をそのまま使うため、section の id は contact にしている。
*/
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeXiuJHv_FYyBJgWE7kPXfCa6T1ZoeJfHqUFT0TWXtE-F4RvQ/formResponse";
const FIELD_IDS = {
  name: "entry.1805615363",
  email: "entry.321316906",
  subject: "entry.29458855",
  message: "entry.1810273391"
};
const SUBJECT = "【初回相談】お申し込み";
const STYLES = ["オンライン", "訪問", "どちらでもよい"];

const initialData = { company: '', name: '', email: '', tel: '', style: STYLES[0], message: '' };

export default function ConsultForm({ heading, lead, submitLabel, doneTitle, doneText, messageLabel = 'ご相談したいこと（任意）', messagePlaceholder = '' }) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const honeypotRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    if (honeypotRef.current && honeypotRef.current.value !== '') return false;

    const newErrors = {};
    if (!formData.company.trim()) newErrors.company = '会社名・屋号をご入力ください';
    if (!formData.name.trim()) newErrors.name = 'お名前をご入力ください';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = '正しいメールアドレスをご入力ください';
    if (formData.tel.trim() && !/^[0-9０-９+\-－() ]{9,16}$/.test(formData.tel.trim())) newErrors.tel = '電話番号の形式をご確認ください';
    if (formData.message.length > 2000) newErrors.message = '2000文字以内でご入力ください';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const body = [
        `会社名・屋号: ${formData.company.trim()}`,
        `電話番号: ${formData.tel.trim() || '（未記入）'}`,
        `希望の形式: ${formData.style}`,
        '',
        formData.message.trim() || '（記入なし）'
      ].join('\n');

      const submitData = new FormData();
      submitData.append(FIELD_IDS.name, formData.name.trim());
      submitData.append(FIELD_IDS.email, formData.email.trim());
      submitData.append(FIELD_IDS.subject, SUBJECT);
      submitData.append(FIELD_IDS.message, body);

      await fetch(GOOGLE_FORM_URL, { method: 'POST', body: submitData, mode: 'no-cors' });

      // GA4：初回相談の申込みをキーイベント（generate_lead）として送る
      if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form: 'consultation', page: location.pathname });

      setIsSubmitted(true);
      setFormData(initialData);
    } catch (error) {
      console.error('送信エラー:', error);
      alert('送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="contact-form" id="contact">
        <div className="container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>{doneTitle}</h2>
            <p>{doneText}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-form" id="contact">
      <div className="container">
        <span className="section-ttl eng">Application</span>
        <div className="form-header">
          <h2 className="contact-form__title">{heading}</h2>
          <p className="contact-form__desc">{lead}</p>
        </div>

        <form className="contact-form__form" onSubmit={handleSubmit} noValidate>
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex="-1"
            autoComplete="off"
            style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}
          />

          <div className="form-group">
            <label htmlFor="company" className="form-label">会社名・屋号 <span className="required">*</span></label>
            <input type="text" id="company" name="company" autoComplete="organization" value={formData.company} onChange={handleChange}
              className={`form-input ${errors.company ? 'error' : ''}`} placeholder="株式会社〇〇" />
            {errors.company && <span className="error-message">{errors.company}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">お名前 <span className="required">*</span></label>
              <input type="text" id="name" name="name" autoComplete="name" value={formData.name} onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`} placeholder="山田 太郎" />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="tel" className="form-label">電話番号（任意）</label>
              <input type="tel" id="tel" name="tel" autoComplete="tel" value={formData.tel} onChange={handleChange}
                className={`form-input ${errors.tel ? 'error' : ''}`} placeholder="090-1234-5678" />
              {errors.tel && <span className="error-message">{errors.tel}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">メールアドレス <span className="required">*</span></label>
            <input type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`} placeholder="example@email.com" />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <fieldset className="form-group consult-style">
            <legend className="form-label">ご希望の形式</legend>
            <div className="consult-style__options">
              {STYLES.map((s) => (
                <label key={s} className="consult-style__option">
                  <input type="radio" name="style" value={s} checked={formData.style === s} onChange={handleChange} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-group">
            <label htmlFor="message" className="form-label">{messageLabel}</label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange}
              className={`form-textarea ${errors.message ? 'error' : ''}`} rows="5"
              placeholder={messagePlaceholder} />
            {errors.message && <span className="error-message">{errors.message}</span>}
          </div>

          <p className="form-privacy">送信いただいた情報は、<a href="/privacy" target="_blank" rel="noopener">プライバシーポリシー</a>に沿って取り扱います。</p>

          <button type="submit" className="form-submit" disabled={isSubmitting}>
            {isSubmitting ? (<><span className="spinner"></span>送信中...</>) : submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
