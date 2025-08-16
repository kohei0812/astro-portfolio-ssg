import { useEffect, useState } from 'react';
import { getBlogs } from '../../lib/microcms.js';

export default function Post() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        getBlogs()
            .then(data => setPosts(data.contents))
            .catch(err => console.error(err));
    }, []);
    return (
        <section className="work-archive-section post" id="work-archive-section">
            <div className="container">
                <h2 className="work-archive-ttl post"><p>一般企業様</p></h2>
                <ul className="work-archive-list post">
                    {posts.map(post => {
                        const thumbnail = post.eyecatch?.url || '/default.jpg';
                        return (
                            <li key={post.id} className="work-archive-item">
                                <article>
                                    <a href={`/posts/${post.slug}/`}>
                                        <figure className="work-archive-item__thumb">
                                            <img
                                                width="200"
                                                height="100"
                                                loading="lazy"
                                                decoding="async"
                                                src={thumbnail} alt={post.title.replace(/<[^>]*>/g, '') || 'サムネイル画像'} />
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