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
                        return (
                            <li key={post.id} className="work-archive-item">
                                <article>
                                    <a href={`/music/${post.slug}/`}>
                                        <figure className="work-archive-item__thumb">
                                            <img src={thumbnail}
                                                width="200"
                                                height="100"
                                                loading="lazy"
                                                decoding="async"
                                                alt={post.title.replace(/<[^>]*>/g, '') || 'サムネイル画像'} />
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