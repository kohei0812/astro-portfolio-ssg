// コーポレートサイトの動き（スクロールで現れる・SPメニュー）。
// 値は調査メモ（営業/サイト研究_コーポレートサイト改修_20261002.md）の目安どおり。
// 「動きを減らす」設定の人には、CSS 側で移動を止めて不透明度だけにしている。
document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target); // 1回だけ
        });
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("is-in"));
  }

  // 一本の筋の縦線：スクロール位置に合わせて伸ばす
  const chain = document.querySelector("[data-chain]");
  if (chain && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const update = () => {
      const r = chain.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      chain.style.setProperty("--chain-progress", p.toFixed(3));
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  } else if (chain) {
    chain.style.setProperty("--chain-progress", "1");
  }

  // ヘッダー：スクロールしたら影を付ける
  const header = document.getElementById("corp-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 10);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // SPメニュー
  const btn = document.getElementById("js-corp-menu");
  const sp = document.getElementById("corp-sp-nav");
  if (btn && sp) {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      sp.classList.toggle("is-open", open);
      document.body.classList.toggle("is-menu-open", open);
    });
    sp.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        btn.setAttribute("aria-expanded", "false");
        sp.classList.remove("is-open");
        document.body.classList.remove("is-menu-open");
      })
    );
  }
});

// 孤立文字（最後の行が「す。」だけ等）をなくす。text-wrap: pretty だけでは日本語で残るため。
// 1) 文の切れ目（。→、）で手前に改行を入れる 2) 切れ目が無い一文は text-wrap: balance で行をならす。
// 幅が変わったら元に戻して測り直す。アイコンや画像を含む要素は触らない。
(() => {
  const SEL = "#corp-page p, #corp-page dd, #corp-page li, #corp-page h3, #corp-page summary > span:last-child, #corp-page .cs-detail__goal > span";
  const lastLineWidth = (el) => {
    const r = document.createRange();
    r.selectNodeContents(el);
    const rects = [...r.getClientRects()].filter((x) => x.width > 0);
    if (rects.length < 2) return Infinity;
    const bottom = Math.max(...rects.map((x) => x.bottom));
    const last = rects.filter((x) => Math.abs(x.bottom - bottom) < 2);
    return Math.max(...last.map((x) => x.right)) - Math.min(...last.map((x) => x.left));
  };
  const fix = () => {
    document.querySelectorAll(SEL).forEach((el) => {
      if (el.dataset.orig !== undefined) {
        el.innerHTML = el.dataset.orig;
        el.style.textWrap = "";
      }
      if (el.querySelector("svg, img, picture, ul, ol, p")) return;
      const em = parseFloat(getComputedStyle(el).fontSize) || 16;
      const short = () => lastLineWidth(el) <= em * 3.5;
      if (!short()) return;
      const html = el.innerHTML;
      el.dataset.orig = html;
      const from = Math.max(html.lastIndexOf("<br"), 0);
      const end = html.trimEnd().length - 2;
      const cands = [];
      for (const mark of ["。", "、"]) {
        for (let k = html.lastIndexOf(mark, end); k > from; k = html.lastIndexOf(mark, k - 1)) cands.push(k);
      }
      for (const k of cands.slice(0, 6)) {
        el.innerHTML = html.slice(0, k + 1) + '<br class="orphan-br" />' + html.slice(k + 1);
        if (!short()) return;
      }
      el.innerHTML = html;
      el.style.textWrap = "balance";
      if (short()) el.style.textWrap = "";
    });
  };
  let t;
  addEventListener("load", () => setTimeout(fix, 300));
  addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(fix, 200);
  });
})();
