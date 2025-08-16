document.addEventListener('DOMContentLoaded', function() {
  /******************* */
  /* ハンバーガーメニュー*/
  /******************* */
  const hamburgerMenu = document.getElementById('js-hamburger-menu');
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', function() {
      const spNav = document.querySelector('.sp-nav');
      const hamburgerMenuEl = document.querySelector('.hamburger-menu');
      
      if (spNav) spNav.classList.toggle('active');
      if (hamburgerMenuEl) hamburgerMenuEl.classList.toggle('hamburger-menu--open');
    });
  }

  /******************* */
  /*  アンカーリンク     */
  /******************* */

  // ページトップにスクロール
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  
  const hash = window.location.hash;
  if (hash && hash !== '') {
    // 動的コンテンツの読み込み完了を待つ
    function scrollToHash() {
      const target = document.querySelector(hash);
      if (target) {
        const position = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: position,
          behavior: 'smooth'
        });
      } else {
        setTimeout(scrollToHash, 100);
      }
    }
    
    window.addEventListener('load', function() {
      setTimeout(scrollToHash, 200);
    });
  }
  /******************* */
  /*  ページ内スクロール  */
  /******************* */

  // #で始まるアンカーをクリックした場合に処理
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const href = this.getAttribute('href');
      const target = href === '#' || href === '' ? document.documentElement : document.querySelector(href);
      
      function scrollToTarget() {
        if (target) {
          const rect = target.getBoundingClientRect();
          const position = rect.top + window.pageYOffset - 80;
          
          window.scrollTo({
            top: position,
            behavior: 'smooth'
          });
        } else {
          setTimeout(scrollToTarget, 50);
        }
      }
      
      scrollToTarget();
      
      // ハンバーガーメニューを閉じる
      const spNav = document.querySelector('.sp-nav');
      const hamburgerMenu = document.querySelector('.hamburger-menu');
      if (spNav) spNav.classList.remove('active');
      if (hamburgerMenu) hamburgerMenu.classList.remove('hamburger-menu--open');
    });
  });
  /******************* */
  /* header mix-blend */
  /******************* */
  
  const heroEl = document.querySelector('.hero');
  const pageheaderEl = document.querySelector('.pageheader');
  const topEl = document.getElementById('top');
  const headerEl = document.querySelector('.header');
  const hamburgerMenuEl = document.querySelector('.hamburger-menu');
  const heroSubTitleEl = document.querySelector('.hero-sub-title');
  
  const fvHeight = heroEl ? heroEl.offsetHeight : 0;
  const headerHeight = pageheaderEl ? pageheaderEl.offsetHeight : 0;
  
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (!topEl) {
      // topページ以外
      if (scrollTop > headerHeight) {
        if (headerEl) headerEl.classList.add('active');
        if (hamburgerMenuEl) hamburgerMenuEl.classList.add('active');
      } else {
        if (headerEl) headerEl.classList.remove('active');
        if (hamburgerMenuEl) hamburgerMenuEl.classList.remove('active');
      }
    } else {
      // topページ
      if (scrollTop > fvHeight) {
        if (headerEl) headerEl.classList.add('active');
        if (hamburgerMenuEl) hamburgerMenuEl.classList.add('active');
        if (heroSubTitleEl) heroSubTitleEl.classList.add('none');
      } else {
        if (headerEl) headerEl.classList.remove('active');
        if (hamburgerMenuEl) hamburgerMenuEl.classList.remove('active');
        if (heroSubTitleEl) heroSubTitleEl.classList.remove('none');
      }
    }
  }
  
  window.addEventListener('scroll', handleScroll);
  /******************* */
  /* planタブ切り替え */
  /******************* */
  
  const planTabItems = document.querySelectorAll('.plan-tab__item');
  const planMainItems = document.querySelectorAll('.plan-main__item');
  
  planTabItems.forEach(function(item, index) {
    item.addEventListener('click', function() {
      // すべてのタブからactiveクラスを削除
      planTabItems.forEach(function(tab) {
        tab.classList.remove('active');
      });
      
      // クリックしたタブにactiveクラスを追加
      this.classList.add('active');
      
      // すべてのメインアイテムからactiveクラスを削除
      planMainItems.forEach(function(mainItem) {
        mainItem.classList.remove('active');
      });
      
      // 対応するメインアイテムにactiveクラスを追加
      if (planMainItems[index]) {
        planMainItems[index].classList.add('active');
      }
    });
  });
});
