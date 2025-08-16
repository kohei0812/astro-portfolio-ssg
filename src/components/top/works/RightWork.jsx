import { useEffect, useState, useRef } from 'react';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { getMusic } from '../../../lib/microcms.js';

export default function LeftWork() {
    const [posts, setPosts] = useState([]);
    const sliderRef = useRef(null);
    const swiperInstance = useRef(null);
    useEffect(() => {
        getMusic()
            .then(data => setPosts(data.contents))
            .catch(err => console.error(err));
    }, []);

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
                reverseDirection: !isMobile,
            },
        });
    };

    // 初回・リサイズ時に Swiper 再構築
    useEffect(() => {
        if (posts.length > 0) {
            initSwiper();
            window.addEventListener('resize', initSwiper);
            return () => window.removeEventListener('resize', initSwiper);
        }
    }, [posts]);
    return (
        <div className="works-archive__item right swiper" ref={sliderRef}>
            <div className="slider right swiper-wrapper">
                {posts.map(post => {
                    const thumbnail = post.eyecatch?.url || '/default.jpg';
                    return (
                        <div key={post.id} className="slider-item swiper-slide">
                            <a href={`/music/${post.slug}/`} className="slider-link">
                                {post.category?.length > 0 && (
                                    <div className="slider-link__cat">
                                        {post.category.map((cat) => (
                                            <small key={cat.id}><span>{cat.name}</span></small>
                                        ))}
                                    </div>
                                )}
                                <h3
                                    className="slider-link__ttl"
                                    dangerouslySetInnerHTML={{ __html: post.title }}
                                />
                                <div className="slider-link__thumb">
                                    <img src={thumbnail} width="200"
                                        height="100"
                                        loading="lazy"
                                        decoding="async" alt={post.title.replace(/<[^>]*>/g, '') || 'サムネイル画像'} />
                                </div>
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}