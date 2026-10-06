import { useState, useRef } from 'react';

/*
  資料請求（/document）のフォーム（2026-10-05）。
  送信先は ConsultForm.jsx と同じ Google フォーム。項目が足りない分は本文の先頭にまとめる。
  送信後は資料ページ（/document/materials）へ移る。業種・人数は、資料と料金の出し分けに使う。
  見た目は _contact.scss（#contact スコープ）をそのまま使う。
*/
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeXiuJHv_FYyBJgWE7kPXfCa6T1ZoeJfHqUFT0TWXtE-F4RvQ/formResponse";
const FIELD_IDS = {
  name: "entry.1805615363",
  email: "entry.321316906",
  subject: "entry.29458855",
  message: "entry.1810273391"
};
const SUBJECT = "【資料請求】";
const MATERIALS_URL = "/document/materials";
const COURSES = ["一騎当千コース（一人を強化）", "AI軍師コース（組織で活用）", "まだ決めていない"];
const SIZES = ["1名（個人・一人企業）", "2〜5名", "6〜30名", "31〜100名", "101名以上"];
const SOURCES = ["X", "Instagram", "Facebook", "名刺", "BNI", "セミナー・研修", "検索", "ご紹介", "その他"];

const initialData = { company: '', name: '', email: '', industry: '', size: '', course: COURSES[2], source: '' };

export default function DocumentForm() {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const honeypotRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    if (honeypotRef.current && honeypotRef.current.value !== '') return false;
    const e = {};
    if (!formData.company.trim()) e.company = '会社名・屋号をご入力ください';
    if (!formData.name.trim()) e.name = 'お名前をご入力ください';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) e.email = '正しいメールアドレスをご入力ください';
    if (!formData.size) e.size = '人数をお選びください';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const body = [
        `会社名・屋号: ${formData.company.trim()}`,
        `業種: ${formData.industry.trim() || '（未記入）'}`,
        `人数: ${formData.size}`,
        `関心のあるコース: ${formData.course}`,
        `どこで知ったか: ${formData.source || '（未選択）'}`,
      ].join('\n');
      const submitData = new FormData();
      submitData.append(FIELD_IDS.name, formData.name.trim());
      submitData.append(FIELD_IDS.email, formData.email.trim());
      submitData.append(FIELD_IDS.subject, SUBJECT);
      submitData.append(FIELD_IDS.message, body);
      await fetch(GOOGLE_FORM_URL, { method: 'POST', body: submitData, mode: 'no-cors' });
      // GA4：資料請求をキーイベント（generate_lead）として送る
      if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form: 'document', page: location.pathname, course: formData.course, size: formData.size, heard_from: formData.source || 'unknown' });
      location.href = MATERIALS_URL;
    } catch (error) {
      console.error('送信エラー:', error);
      alert('送信に失敗しました。時間をおいて再度お試しください。');
      setIsSubmitting(false);
    }
  };

  const err = (k) => errors[k] && <span className="error-message">{errors[k]}</span>;

  return (
    <section className="contact-form" id="contact">
      <div className="container">
        <span className="section-ttl eng">Document</span>
        <div className="form-header">
          <h2 className="contact-form__title">資料を受け取る</h2>
          <p className="contact-form__desc">送信後すぐに、コースの詳しい中身と料金をご覧いただけます。</p>
        </div>

        <form className="contact-form__form" onSubmit={handleSubmit} noValidate>
          <input ref={honeypotRef} type="text" name="website" tabIndex="-1" autoComplete="off"
            style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }} />

          <div className="form-group">
            <label htmlFor="company" className="form-label">会社名・屋号 <span className="required">*</span></label>
            <input type="text" id="company" name="company" autoComplete="organization" value={formData.company} onChange={handleChange}
              className={`form-input ${errors.company ? 'error' : ''}`} placeholder="株式会社〇〇" />
            {err('company')}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">お名前 <span className="required">*</span></label>
              <input type="text" id="name" name="name" autoComplete="name" value={formData.name} onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`} placeholder="山田 太郎" />
              {err('name')}
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">メールアドレス <span className="required">*</span></label>
              <input type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`} placeholder="example@email.com" />
              {err('email')}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="industry" className="form-label">業種（任意）</label>
              <input type="text" id="industry" name="industry" value={formData.industry} onChange={handleChange}
                className="form-input" placeholder="例：Web制作、不動産、福祉" />
            </div>
            <div className="form-group">
              <label htmlFor="size" className="form-label">AIを使う人数 <span className="required">*</span></label>
              <select id="size" name="size" value={formData.size} onChange={handleChange} className={`form-input ${errors.size ? 'error' : ''}`}>
                <option value="">選択してください</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {err('size')}
            </div>
          </div>

          <fieldset className="form-group consult-style">
            <legend className="form-label">関心のあるコース</legend>
            <div className="consult-style__options">
              {COURSES.map((c) => (
                <label key={c} className="consult-style__option">
                  <input type="radio" name="course" value={c} checked={formData.course === c} onChange={handleChange} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-group">
            <label htmlFor="source" className="form-label">どこで知りましたか（任意）</label>
            <select id="source" name="source" value={formData.source} onChange={handleChange} className="form-input">
              <option value="">選択してください</option>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <p className="form-privacy">送信いただいた情報は、<a href="/privacy" target="_blank" rel="noopener">プライバシーポリシー</a>に沿って取り扱います。</p>

          <button type="submit" className="form-submit" disabled={isSubmitting}>
            {isSubmitting ? (<><span className="spinner"></span>送信中...</>) : '資料を見る'}
          </button>
        </form>
      </div>
    </section>
  );
}
