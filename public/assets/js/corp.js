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
