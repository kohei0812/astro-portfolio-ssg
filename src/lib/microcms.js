// microCMSクライアント設定
const API_KEY = '9VwmFmBWVdVUhpMqQqg42m7gK72IIJf7VwJm';
const SERVICE_DOMAIN = 'kouhei-portfolio';

// microCMSのベースURL
const BASE_URL = `https://${SERVICE_DOMAIN}.microcms.io/api/v1`;

// APIリクエスト用のヘッダー
const headers = {
  'X-MICROCMS-API-KEY': API_KEY,
  'Content-Type': 'application/json',
};

// すべてのブログ記事を取得
export async function getBlogs(params = {}) {
  const searchParams = new URLSearchParams();
  
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());
  if (params.filters) searchParams.set('filters', params.filters);
  if (params.orders) searchParams.set('orders', params.orders);

  const url = `${BASE_URL}/blogs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch blogs: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// 特定のブログ記事を取得（スラッグで）
export async function getBlogBySlug(slug) {
  try {
    const response = await getBlogs({
      filters: `slug[equals]${slug}`,
      limit: 1
    });
    
    return response.contents[0] || null;
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    return null;
  }
}

// すべての音楽記事を取得
export async function getMusic(params = {}) {
  const searchParams = new URLSearchParams();
  
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());
  if (params.filters) searchParams.set('filters', params.filters);
  if (params.orders) searchParams.set('orders', params.orders);

  const url = `${BASE_URL}/music${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch music: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// 特定の音楽記事を取得（スラッグで）
export async function getMusicBySlug(slug) {
  try {
    const response = await getMusic({
      filters: `slug[equals]${slug}`,
      limit: 1
    });
    
    return response.contents[0] || null;
  } catch (error) {
    console.error('Error fetching music by slug:', error);
    return null;
  }
}