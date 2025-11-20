export default function Music({ posts, basePath = "" }) {
    const isEnglish = basePath.startsWith('/en');
    
    return (
        <section className="work-archive-section music" id="work-archive-section">
            <div className="container">
                <h2 className="work-archive-ttl music"><p>{isEnglish ? "App Development" : "アプリ開発"}</p></h2>
                <ul className="work-archive-list music">
                    {posts.map((post, i) => {
                        const thumbnail = post.eyecatch?.url || 'https://via.placeholder.com/400x200';
                        // microCMS 画像最適化ヘルパ
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
                        // 幅記述子（CSSに合わせて実表示幅をカバー）
                        // 幅記述子（CSSに合わせて実表示幅をカバー）
                        const widths = [200, 300, 346, 400, 520, 680];
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
                                    <a href={`${basePath}/music/${post.slug}/`}>
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