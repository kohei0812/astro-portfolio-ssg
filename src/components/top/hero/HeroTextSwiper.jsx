import { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

export default function HeroTextSwiper() {
  const sliderRef = useRef(null);
  const swiperInstance = useRef(null);

  // Swiper初期化処理
  const initSwiper = () => {
    if (!sliderRef.current) return;

    // 既存インスタンス破棄
    if (swiperInstance.current) {
      swiperInstance.current.destroy(true, true);
    }

    // 新規インスタンス作成
    swiperInstance.current = new Swiper(sliderRef.current, {
      direction: 'horizontal',
      loop: true,
      modules: [Autoplay],
      slidesPerView: 'auto',
      spaceBetween: 20,
      speed: 10000,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      },
      freeMode: {
        enabled: true,
        momentum: false,
      },
      allowTouchMove: false,
      centeredSlides: false,
    });
  };

  // 初回マウント時にSwiper初期化
  useEffect(() => {
    initSwiper();
    
    // クリーンアップ
    return () => {
      if (swiperInstance.current) {
        swiperInstance.current.destroy(true, true);
      }
    };
  }, []);

  return (
    <div className="hero-sub-title">
      <div className="swiper hero-text-swiper" ref={sliderRef}>
        <div className="swiper-wrapper">
          <div className="swiper-slide">
            <h1 className="scroll-content">
              フロントエンドエンジニア川端康平のポートフォリオサイトです。 
              <span className="eng">This is the portfolio site of Kohei Kawabata, a front-end engineer.</span>
            </h1>
          </div>
          <div className="swiper-slide">
            <div className="scroll-content">
              フロントエンドエンジニア川端康平のポートフォリオサイトです。 
              <span className="eng">This is the portfolio site of Kohei Kawabata, a front-end engineer.</span>
            </div>
          </div>
          <div className="swiper-slide">
            <div className="scroll-content">
              フロントエンドエンジニア川端康平のポートフォリオサイトです。 
              <span className="eng">This is the portfolio site of Kohei Kawabata, a front-end engineer.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}