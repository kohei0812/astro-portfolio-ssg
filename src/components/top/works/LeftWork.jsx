import { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

// iOS Safari 判定
const isIOSSafari = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
};

export default function LeftWork({ posts, basePath = "" }) {
  const sliderRef = useRef(null);
  const swiperInstance = useRef(null);

  // Swiper初期化処理（direction変更対応）
  const initSwiper = () => {
    if (!sliderRef.current) return;

    const isMobile = window.innerWidth <= 768;
    // 既存インスタンス破棄
    if (swiperInstance.current) {
      swiperInstance.current.destroy(true, true);
    }

    // 新規インスタンス作成
    swiperInstance.current = new Swiper(sliderRef.current, {
      direction: isMobile ? 'horizontal' : 'vertical',
      loop: true,
      modules: [Autoplay],
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
    });
  };

  // Debounced resize handler to prevent excessive re-initialization
  const handleResize = useRef(null);
  
  // 初回・リサイズ時に Swiper 再構築
  useEffect(() => {
    if (posts.length > 0) {
      initSwiper();
      
      // Debounce resize to prevent layout shifts
      const debouncedResize = () => {
        if (handleResize.current) clearTimeout(handleResize.current);
        handleResize.current = setTimeout(initSwiper, 150);
      };
      
      window.addEventListener('resize', debouncedResize);
      return () => {
        window.removeEventListener('resize', debouncedResize);
        if (handleResize.current) clearTimeout(handleResize.current);
      };
    }
  }, [posts]);

  return (
    <div className="works-archive__item left swiper" ref={sliderRef}>
      <div className="slider left swiper-wrapper">
        {posts.map(post => {
          const thumbnail = post.eyecatch?.url || 'https://via.placeholder.com/400x200';

          return (
            <div key={post.id} className="slider-item swiper-slide">
              <a href={`${basePath}/posts/${post.slug}/`} className="slider-link">
                {post.category && (
                  <div className="slider-link__cat sp_only">
                    <small><span>{post.category.name}</span></small>
                  </div>
                )}
                <h3
                  className="slider-link__ttl sp_only"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
                <div className="slider-link__thumb">
                  <img src={thumbnail} width="200"
                    height="200"
                    loading={isIOSSafari() ? 'eager' : 'lazy'}
                    decoding="async" alt={post.title.replace(/<[^>]*>/g, '') || 'サムネイル画像'} />
                </div>
                {post.category && (
                  <div className="slider-link__cat pc_only">
                    <small><span>{post.category.name}</span></small>
                  </div>
                )}
                <h3
                  className="slider-link__ttl pc_only"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
