jQuery(function ($) {
  /******************* */
  /* ハンバーガーメニュー*/
  /******************* */
  $("#js-hamburger-menu").on("click", function () {
    $(".sp-nav").toggleClass("active");
    $(".hamburger-menu").toggleClass("hamburger-menu--open");
  });

  /******************* */
  /*  アンカーリンク     */
  /******************* */

  $(function () {
    $("body,html").stop().scrollTop(0);
    var hash = window.location.hash;
    if (hash !== void 0 && hash !== "") {
      // 動的コンテンツの読み込み完了を待つ
      function scrollToHash() {
        var target = $(hash);
        if (target.length > 0) {
          var speed = 800; // ミリ秒
          var position = target.offset().top - 80; // ヘッダーの高さ70pxをずらす
          $("body,html").animate({ scrollTop: position }, speed, "swing");
        } else {
          // 要素が見つからない場合は少し待ってリトライ
          setTimeout(scrollToHash, 100);
        }
      }
      
      // DOM読み込み完了後に実行
      $(window).on('load', function() {
        setTimeout(scrollToHash, 200); // 追加の待機時間
      });
    }
  });
  /******************* */
  /*  ページ内スクロール  */
  /******************* */

  $(function () {
    // #で始まるアンカーをクリックした場合に処理
    $('a[href^="#"]').click(function () {
      // スクロールの速度
      var speed = 600; // ミリ秒
      // アンカーの値取得
      var href = $(this).attr("href");
      // 移動先を取得
      var target = $(href == "#" || href == "" ? "html" : href);
      
      // 動的コンテンツの読み込み完了を待つ
      function scrollToTarget() {
        if (target.length > 0) {
          // 移動先を数値で取得（ヘッダーの高さを考慮）
          var position = target.offset().top - 80;
          // スムーススクロール
          $("body,html").animate({ scrollTop: position }, speed, "swing");
        } else {
          // 要素が見つからない場合は少し待ってリトライ
          setTimeout(scrollToTarget, 50);
        }
      }
      
      scrollToTarget();
      $(".sp-nav").removeClass("active");
      $(".hamburger-menu").removeClass("hamburger-menu--open");
      return false;
    });
  });
  /******************* */
  /* header mix-blend */
  /******************* */
  $(function () {
    var fvHeight = $(".hero").outerHeight();
    var headerHeight = $(".pageheader").outerHeight();

    if ($("#top").length === 0) {
      $(window).on("scroll", function () {
        if ($(this).scrollTop() > headerHeight) {
          $(".header").addClass("active");
          $(".hamburger-menu").addClass("active");
        } else {
          $(".header").removeClass("active");
          $(".hamburger-menu").removeClass("active");
        }
      });
    } else {
      $(window).on("scroll", function () {
        if ($(this).scrollTop() > fvHeight) {
          $(".header").addClass("active");
          $(".hamburger-menu").addClass("active");
          $(".hero-sub-title").addClass("none");
        } else {
          $(".header").removeClass("active");
          $(".hamburger-menu").removeClass("active");
          $(".hero-sub-title").removeClass("none");
        }
      });
    }
  });
  /******************* */
  /* planタブ切り替え */
  /******************* */
  $(function () {
    $(".plan-tab__item").each(function (index) {
      $(this).on("click", function () {
        $(".plan-tab__item").removeClass("active");
        $(this).addClass("active");
        $(".plan-main__item").removeClass("active");
        $(".plan-main__item").eq(index).addClass("active");
      });
    });
  });
});
