import { useEffect, useState } from 'react';
import { getMusic } from '../../lib/microcms.js';

export default function Music() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        getMusic()
            .then(data => setPosts(data.contents))
            .catch(err => console.error(err));
    }, []);
    return (
        <section className="work-archive-section music" id="work-archive-section">
            <div className="container">
                <h2 className="work-archive-ttl music"><p>ライブハウス・バンド様</p></h2>
                <ul className="work-archive-list music">
                    {posts.map(post => {
                        const thumbnail = post.eyecatch?.url || '/default.jpg';
                        // microCMS 画像最適化ヘルパ
                        const mc = (url, p) => {
                            const u = new URL(url);
                            Object.entries(p).forEach(([k, v]) => u.searchParams.set(k, String(v)));
                            return u.toString();
                        };
                        // 幅記述子（CSSに合わせて実表示幅をカバー）
                        const widths = [200, 300, 346, 400, 520, 680];
                        const srcSet = widths.map(w =>
                            `${mc(thumbnail, { w, h: Math.round(w / 2), fit: 'crop', fm: 'webp', q: 75 })} ${w}w`
                        ).join(', ');
                        // 既定src（何でもOK。比率用に200x100を維持）
                        const src = mc(thumbnail, { w: 300, h: 150, fit: 'crop', fm: 'webp', q: 75 });
                        // CSSに一致するsizes
                        const sizes =
                            '(min-width: 1110px) 345px, '
                        '(min-width: 769px) calc((100vw - 30px) * 0.32), '
                        '(max-width: 430px) calc(100vw - 30px), '
                        '400px';
                        return (
                            <li key={post.id} className="work-archive-item">
                                <article>
                                    <a href={`/music/${post.slug}/`}>
                                        <figure className="work-archive-item__thumb">
                                            <img
                                                src={src}
                                                srcSet={srcSet}
                                                sizes={sizes}
                                                width="200"
                                                height="100"
                                                loading="lazy"
                                                decoding="async"
                                                alt={post.title.replace(/<[^>]*>/g, '') || 'サムネイル画像'}
                                            />
                                            <figcaption className="visually-hidden" dangerouslySetInnerHTML={{ __html: post.title }} />
                                        </figure>
                                        {post.category?.length > 0 && (
                                            <div className="work-archive-item__cat">
                                                {post.category.map((cat) => (
                                                    <small key={cat.id}><span>{cat.name}</span></small>
                                                ))}
                                            </div>
                                        )}
                                        <h3
                                            className="work-archive-item__ttl"
                                            dangerouslySetInnerHTML={{ __html: post.title }}
                                        />
                                    </a>
                                </article>
                            </li>
                        );
                    })}

                </ul>
            </div>
        </section>
    );
}