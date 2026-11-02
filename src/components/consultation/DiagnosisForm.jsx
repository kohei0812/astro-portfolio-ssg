import { useState, useRef } from 'react';

/*
  PHPチェッカー（/security）の簡易診断フォーム。2026-11-03 本人指示（Shido 鈴木様たちの助言、録音 2026-11-02 2:00〜2:04）。
  - 入力は4つ（会社名・お名前・URL・メール）、PC は2列で1画面に収める。「申し込み」という語は使わない（構えさせない）。
  - ボタンを押したら、その場で簡易結果を出す（メールで後から送ると離脱する）。15秒ほどの進み具合を見せる。
  - 見せるのは3項目だけ。本診断は所有者確認をメールで行い、結果は川端が持参して説明する（営業のアポにつなげる）。
  簡易診断は Mozilla HTTP Observatory の公開 API（CORS 可）を使う。外から誰でも見られる通信の設定だけを見る。
  受付は ConsultForm と同じ Google フォームへ送る（結果は入れない。川端が本診断の前に同じ点検を自分で回す）。
*/
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeXiuJHv_FYyBJgWE7kPXfCa6T1ZoeJfHqUFT0TWXtE-F4RvQ/formResponse";
const FIELD_IDS = {
  name: "entry.1805615363",
  email: "entry.321316906",
  subject: "entry.29458855",
  message: "entry.1810273391"
};
const SUBJECT = "【PHPチェッカー】簡易診断";
const OBSERVATORY = "https://observatory-api.mdn.mozilla.net/api/v2";
const MIN_WAIT_MS = 15000;
const STEPS = ["サイトに接続しています", "通信の暗号化を確認しています", "サーバーが外に出している情報を確認しています", "画面の乗っ取り対策を確認しています", "結果をまとめています"];

const initialData = { company: '', name: '', url: '', email: '' };

// API の結果から、外に見せる3項目を作る。status は ok / warn / ng
function summarize(data) {
  const tests = data.tests || {};
  const headers = data.scan?.response_headers || {};
  const items = [];

  const redirect = tests.redirection;
  items.push(redirect?.pass
    ? { status: 'ok', name: '通信の暗号化（https）', txt: 'http で来た人も、暗号化された https に案内されています。' }
    : { status: 'ng', name: '通信の暗号化（https）', txt: '暗号化されていない http のまま見られる状態です。入力内容が途中で読まれるおそれがあります。' });

  // Server / X-Powered-By に版の番号（PHP/8.1 など）が出ていると、狙われる弱点を絞り込まれやすい
  const exposed = ['server', 'x-powered-by'].map((k) => headers[k]).filter((v) => v && /\d/.test(v));
  items.push(exposed.length
    ? { status: 'ng', name: 'ソフトの版の露出', txt: `サーバーが「${exposed.join(' / ')}」と版の番号を外に出しています。古い版だと、狙う弱点を絞り込まれます。` }
    : { status: 'ok', name: 'ソフトの版の露出', txt: 'サーバーは、使っているソフトの版の番号を外に出していません。' });

  const frame = tests['x-frame-options'];
  items.push(frame?.pass
    ? { status: 'ok', name: '画面の乗っ取り対策', txt: '他のサイトに画面を埋め込まれて、だましのクリックに使われる対策が入っています。' }
    : { status: 'warn', name: '画面の乗っ取り対策', txt: '他のサイトに画面を埋め込まれて、だましのクリックに使われる対策が入っていません。' });

  return { grade: data.scan?.grade || '-', score: data.scan?.score ?? null, items };
}

export default function DiagnosisForm() {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('input'); // input / checking / result / failed
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [checkedUrl, setCheckedUrl] = useState('');
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
    if (!/^https?:\/\/[^\s.]+\.[^\s]+$/.test(formData.url.trim())) newErrors.url = 'https:// から始まるURLをご入力ください';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = '正しいメールアドレスをご入力ください';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const runCheck = async (host) => {
    // scan で新しく点検させ、analyze で項目ごとの結果を読む
    await fetch(`${OBSERVATORY}/scan?host=${encodeURIComponent(host)}`, { method: 'POST' });
    const res = await fetch(`${OBSERVATORY}/analyze?host=${encodeURIComponent(host)}`);
    const data = await res.json();
    if (!data.scan || data.scan.error) throw new Error(data.scan?.error || 'scan failed');
    return summarize(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const url = formData.url.trim();
    const host = new URL(url).hostname;
    setCheckedUrl(url);
    setPhase('checking');
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), MIN_WAIT_MS / STEPS.length);

    // 受付（Google フォーム）は先に送る。待ち時間の途中で閉じられても取りこぼさない
    const submitData = new FormData();
    submitData.append(FIELD_IDS.name, formData.name.trim());
    submitData.append(FIELD_IDS.email, formData.email.trim());
    submitData.append(FIELD_IDS.subject, SUBJECT);
    submitData.append(FIELD_IDS.message, [`診断するサイト: ${url}`, `会社名・屋号: ${formData.company.trim()}`].join('\n'));
    fetch(GOOGLE_FORM_URL, { method: 'POST', body: submitData, mode: 'no-cors' }).catch((err) => console.error('送信エラー:', err));

    // 点検が速く終わっても、最低 MIN_WAIT_MS は進み具合を見せる
    const wait = new Promise((r) => setTimeout(r, MIN_WAIT_MS));
    let summary = null;
    try {
      summary = await runCheck(host);
    } catch (err) {
      console.error('簡易診断エラー:', err);
    }
    await wait;
    clearInterval(timer);

    // GA4：簡易診断の実行をキーイベント（generate_lead）として送る
    if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form: 'diagnosis', page: location.pathname });

    setResult(summary);
    setPhase(summary ? 'result' : 'failed');
  };

  if (phase === 'checking') {
    return (
      <section className="contact-form diag-form" id="contact">
        <div className="container">
          <div className="diag-form__checking" aria-live="polite">
            <p className="diag-form__checking-ttl">{checkedUrl} を点検しています</p>
            <div className="diag-form__bar"><span style={{ animationDuration: `${MIN_WAIT_MS}ms` }}></span></div>
            <p className="diag-form__step">{STEPS[step]}…</p>
          </div>
        </div>
      </section>
    );
  }

  if (phase === 'result' || phase === 'failed') {
    return (
      <section className="contact-form diag-form" id="contact">
        <div className="container">
          <div className="diag-form__result" aria-live="polite">
            <p className="diag-form__result-url">{checkedUrl}</p>
            {result ? (
              <>
                <div className="diag-form__grade">
                  <span className="diag-form__grade-label">簡易診断の評価</span>
                  <span className="diag-form__grade-val eng">{result.grade}</span>
                </div>
                <ul className="diag-form__items">
                  {result.items.map((i) => (
                    <li key={i.name} className={`is-${i.status}`}><b>{i.name}</b>{i.txt}</li>
                  ))}
                </ul>
                <p className="diag-form__rest">ここまでは、外から誰でも見られる範囲の一部です。PHP・WordPress の版と既知の弱点、公開されたままのファイル、管理画面の露出、なりすまし対策は、本診断で確かめます。</p>
              </>
            ) : (
              <p className="diag-form__rest">このサイトは、自動の簡易診断ができませんでした（サイトが応答しない、または点検を断る設定の可能性があります）。受付は済んでいるので、本診断のご案内をメールでお送りします。</p>
            )}
            <div className="diag-form__next">
              <h3>本診断のご案内</h3>
              <p>ご入力のメールアドレスに、川端から所有者確認のご案内をお送りします。確認が取れたら外から本診断を行い、結果は川端がお持ちして、対策の優先順位と一緒にご説明します。</p>
            </div>
            {/* 結果の直下に相談の入口（2026-11-03 Shido 鈴木様の助言 #3。初回相談 LP へ） */}
            <div className="diag-form__consult">
              <p>気になる項目があれば、対応の優先順位からご相談いただけます。</p>
              <a href="/consultation?from=php-checker" className="diag-form__consult-btn">改善・対策を相談する</a>
            </div>
            <p className="diag-form__note">簡易診断は Mozilla HTTP Observatory の公開ツールで、通信の設定だけを見ています。ログインの試行や攻撃にあたる検査は行っていません。すべての穴を見つける保証ではありません。</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-form diag-form" id="contact">
      <div className="container">
        <span className="section-ttl eng">Free check</span>
        <div className="form-header">
          <h2 className="contact-form__title">PHPチェッカーで、いますぐ簡易診断</h2>
          <p className="contact-form__desc">4つ入れるだけで、この画面に結果が出ます（無料）。</p>
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

          <div className="diag-form__grid">
            <div className="form-group">
              <label htmlFor="company" className="form-label">会社名・屋号 <span className="required">*</span></label>
              <input type="text" id="company" name="company" autoComplete="organization" value={formData.company} onChange={handleChange}
                className={`form-input ${errors.company ? 'error' : ''}`} placeholder="株式会社〇〇" />
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="name" className="form-label">お名前 <span className="required">*</span></label>
              <input type="text" id="name" name="name" autoComplete="name" value={formData.name} onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`} placeholder="山田 太郎" />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="url" className="form-label">サイトのURL <span className="required">*</span></label>
              <input type="url" id="url" name="url" inputMode="url" autoComplete="url" value={formData.url} onChange={handleChange}
                className={`form-input ${errors.url ? 'error' : ''}`} placeholder="https://example.com" />
              {errors.url && <span className="error-message">{errors.url}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">メールアドレス <span className="required">*</span></label>
              <input type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`} placeholder="example@email.com" />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <p className="form-privacy">ご入力の情報は、<a href="/privacy" target="_blank" rel="noopener">プライバシーポリシー</a>に沿って取り扱います。</p>

          <button type="submit" className="form-submit">無料で簡易診断する</button>
        </form>
      </div>
    </section>
  );
}
