

const CATEGORIES = [
    { id: "all", label: "Все" },
    { id: "music", label: "Музыка" },
    { id: "gaming", label: "Игры" },
    { id: "sport", label: "Спорт" },
    { id: "news", label: "Новости" },
    { id: "other", label: "Другое" },
];

function getThumbnail(id) {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function findVideo(id) {
    return VIDEO_LIST.find(v => v.id === id);
}

// Форматирует число просмотров в стиле "1,2 млн просмотров"
function formatViews(count) {
    const n = Number(count);
    if (!n && n !== 0) return '';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.0', '').replace('.', ',') + ' млрд просмотров';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',') + ' млн просмотров';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '').replace('.', ',') + ' тыс. просмотров';
    return n + ' просмотров';
}

// Форматирует дату публикации в стиле "3 дня назад"
function formatRelativeDate(isoString) {
    const then = new Date(isoString).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'сегодня';
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
    return `${Math.floor(diffDays / 365)} г. назад`;
}

// Ищет видео через YouTube Data API v3. Возвращает массив в том же формате, что VIDEO_LIST.
async function searchYouTube(query, maxResults = 16) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${YT_API_KEY}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error(`YouTube API вернул ошибку: ${searchRes.status}`);
    const searchData = await searchRes.json();

    const ids = searchData.items.map(item => item.id.videoId).filter(Boolean);
    if (ids.length === 0) return [];

    // Отдельный запрос за статистикой (просмотры), т.к. search.list её не отдаёт
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids.join(',')}&key=${YT_API_KEY}`;
    const statsRes = await fetch(statsUrl);
    const statsData = statsRes.ok ? await statsRes.json() : { items: [] };
    const statsById = {};
    statsData.items.forEach(item => { statsById[item.id] = item.statistics; });

    return searchData.items.map(item => {
        const id = item.id.videoId;
        const stats = statsById[id] || {};
        return {
            id,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            views: formatViews(stats.viewCount),
            uploaded: formatRelativeDate(item.snippet.publishedAt),
            category: 'search',
        };
    });
}

// Получает данные одного видео через YouTube Data API v3 (для watch.html, если id не найден в VIDEO_LIST)
async function fetchYouTubeVideo(id) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=${YT_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API вернул ошибку: ${res.status}`);
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0];
    return {
        id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        views: formatViews(item.statistics.viewCount),
        uploaded: formatRelativeDate(item.snippet.publishedAt),
        category: 'search',
    };
}

// ID категорий YouTube (используются для вкладок с трендами)
const YT_CATEGORY_IDS = {
    music: '10',
    gaming: '20',
    sport: '17',
    news: '25',
};

// Тренды YouTube по категории (или общие, если categoryId не передан). regionCode влияет на то, какой страны тренды.
async function fetchTrending(categoryId, regionCode = 'US', maxResults = 16) {
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=${maxResults}&regionCode=${regionCode}&key=${YT_API_KEY}`;
    if (categoryId) url += `&videoCategoryId=${categoryId}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API вернул ошибку: ${res.status}`);
    const data = await res.json();

    return (data.items || []).map(item => ({
        id: item.id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        views: formatViews(item.statistics.viewCount),
        uploaded: formatRelativeDate(item.snippet.publishedAt),
        category: 'trending',
    }));
}

// "Похожие видео" — т.к. YouTube убрал честный related-эндпоинт, ищем по названию текущего видео
async function fetchRelated(title, excludeId, maxResults = 8) {
    const results = await searchYouTube(title, maxResults + 1);
    return results.filter(v => v.id !== excludeId).slice(0, maxResults);
}
