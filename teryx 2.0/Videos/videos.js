// Список видео. Просто добавляй новые объекты — id это часть ссылки youtube.com/watch?v=ВОТ_ЭТО
// category: "music" | "gaming" | "sport" | "news" | "other" — используется для вкладок на главной
const VIDEO_LIST = [
    { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE", channel: "officialpsy", views: "5,3 млрд просмотров", uploaded: "13 лет назад", category: "music" },
    { id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito ft. Daddy Yankee", channel: "Luis Fonsi", views: "8,7 млрд просмотров", uploaded: "8 лет назад", category: "music" },
    { id: "XqZsoesa55w", title: "Baby Shark Dance", channel: "Pinkfong Baby Shark", views: "15 млрд просмотров", uploaded: "9 лет назад", category: "music" },
    { id: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You", channel: "Ed Sheeran", views: "6,2 млрд просмотров", uploaded: "8 лет назад", category: "music" },
    { id: "OPf0YbXqDm0", title: "Mark Ronson - Uptown Funk ft. Bruno Mars", channel: "Mark Ronson", views: "5,4 млрд просмотров", uploaded: "10 лет назад", category: "music" },
    { id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again ft. Charlie Puth", channel: "Wiz Khalifa", views: "6,4 млрд просмотров", uploaded: "10 лет назад", category: "music" },
    { id: "DyDfgMOUjCI", title: "Billie Eilish - bad guy", channel: "Billie Eilish", views: "1,4 млрд просмотров", uploaded: "6 лет назад", category: "music" },
    { id: "60ItHLz5WEA", title: "Alan Walker - Faded", channel: "Alan Walker", views: "3,7 млрд просмотров", uploaded: "9 лет назад", category: "music" },
];

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
