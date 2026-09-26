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
