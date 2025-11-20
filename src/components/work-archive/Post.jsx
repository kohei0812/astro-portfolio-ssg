export default function Post({ posts, basePath = "" }) {
    const isEnglish = basePath.startsWith('/en');
    
    return (
        <section className="work-archive-section post" id="work-archive-section">
            <div className="container">
                <h2 className="work-archive-ttl post"><p>{isEnglish ? "General Companies" : "一般企業様"}</p></h2>
                <ul className="work-archive-list post">
                    {posts.map((post, i) => {
                        const thumbnail = post.eyecatch?.url || 'https://via.placeholder.com/400x200';
                        const mc = (url, p) => {
                            try {
                                const u = new URL(url);
                                Object.entries(p).forEach(([k, v]) => u.searchParams.set(k, String(v)));
                                return u.toString();
                            } catch (error) {
                                console.error('Invalid URL:', url);
                                return url; // Return original URL if parsing fails
                            }
                        };
                        const widths = [200, 300, 346, 400, 520, 680];
                        // 幅ベースsrcset（AVIF / WebP / JPEG フォールバック）
                        const srcsetAvif = widths.map(w =>
                            `${mc(thumbnail, { fm: 'avif', w, h: Math.round(w / 2), fit: 'crop', q: 65 })} ${w}w`
                        ).join(', ');
                        const srcsetWebp = widths.map(w =>
                            `${mc(thumbnail, { fm: 'webp', w, h: Math.round(w / 2), fit: 'crop', q: 75 })} ${w}w`
                        ).join(', ');
                        const srcJpg = mc(thumbnail, { fm: 'jpg', w: 300, h: 150, fit: 'crop', q: 75 });
                        // fold内（PCは3枚並び）だけ eager + 高優先度
                        const isATF = i < 3;
                        // CSSに一致するsizes（固定文字列で安全に）
                        const sizes = '(min-width: 1110px) 345px, (min-width: 769px) calc((100vw - 30px) * 0.32), (max-width: 430px) calc(100vw - 30px), 400px';
                        return (
                            <li key={post.id} className="work-archive-item fadeInTrigger">
                                <article>
                                    <a href={`${basePath}/posts/${post.slug}/`}>
                                        <figure className="work-archive-item__thumb">
                                            <picture>
                                                <source type="image/avif" srcSet={srcsetAvif} sizes={sizes} />
                                                <source type="image/webp" srcSet={srcsetWebp} sizes={sizes} />
                                                <img
                                                    src={srcJpg}
                                                    sizes={sizes}
                                                    width="200" height="100"
                                                    loading={isATF ? 'eager' : 'lazy'}
                                                    fetchpriority={isATF ? 'high' : 'auto'}
                                                    decoding="async"
                                                    alt={post.title.replace(/<[^>]*>/g, '') || (isEnglish ? 'Thumbnail image' : 'サムネイル画像')}
                                                />
                                            </picture>
                                            <figcaption className="visually-hidden" dangerouslySetInnerHTML={{ __html: post.title }} />
                                        </figure>
                                        {post.category && (
                                            <div className="work-archive-item__cat">
                                                <small><span>{post.category.name}</span></small>
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