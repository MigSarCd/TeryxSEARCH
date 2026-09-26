document.addEventListener('DOMContentLoaded', () => {
    const queryInput = document.getElementById('queryInput');
    const urlInput = document.getElementById('urlInput');
    const dropdownTrigger = document.getElementById('dropdownTrigger');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const historyDropdown = document.getElementById('historyDropdown');

    const MAX_HISTORY_ITEMS = 8;

    function getHistory() {
        return JSON.parse(localStorage.getItem('teryx_history')) || [];
    }

    function saveHistory(history) {
        localStorage.setItem('teryx_history', JSON.stringify(history));
    }

    function addToHistory(term) {
        let history = getHistory().filter(item => item.toLowerCase() !== term.toLowerCase());
        history.unshift(term);
        if (history.length > 50) history = history.slice(0, 50);
        saveHistory(history);
    }

    function removeFromHistory(term) {
        const history = getHistory().filter(item => item !== term);
        saveHistory(history);
    }

    function renderHistory(filterText) {
        const filter = (filterText || '').trim().toLowerCase();
        let history = getHistory();

        if (filter !== '') {
            history = history.filter(item => item.toLowerCase().includes(filter));
        }
        history = history.slice(0, MAX_HISTORY_ITEMS);

        historyDropdown.innerHTML = '';

        if (history.length === 0) {
            historyDropdown.classList.remove('visible');
            return;
        }

        history.forEach(term => {
            const item = document.createElement('div');
            item.className = 'history-item';

            const text = document.createElement('span');
            text.className = 'history-text';
            text.textContent = term;
            item.appendChild(text);

            const remove = document.createElement('span');
            remove.className = 'history-remove';
            remove.textContent = '✕';
            remove.addEventListener('click', (event) => {
                event.stopPropagation();
                removeFromHistory(term);
                renderHistory(queryInput.value);
            });
            item.appendChild(remove);

            item.addEventListener('click', () => {
                queryInput.value = term;
                historyDropdown.classList.remove('visible');
                performAction();
            });

            historyDropdown.appendChild(item);
        });

        const clearAll = document.createElement('div');
        clearAll.className = 'history-clear';
        clearAll.textContent = 'Очистить историю';
        clearAll.addEventListener('click', (event) => {
            event.stopPropagation();
            saveHistory([]);
            renderHistory(queryInput.value);
        });
        historyDropdown.appendChild(clearAll);

        historyDropdown.classList.add('visible');
    }

    // Переменная для хранения текущего поисковика (по умолчанию google)
    let currentEngine = localStorage.getItem('teryx_engine') || 'google';
    
    function updateDropdownText(engine) {
        const text = engine === 'yandex' ? 'Яндекс' : 'Google';
        dropdownTrigger.textContent = `Искать в: ${text}`;
    }

    // Инициализация текста кнопки при загрузке страницы
    updateDropdownText(currentEngine);

    // Переключение поисковой системы в меню
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            currentEngine = item.getAttribute('data-engine');
            localStorage.setItem('teryx_engine', currentEngine);
            updateDropdownText(currentEngine);
            queryInput.focus();
        });
    });

    // Функция выполнения действий при нажатии Enter
    function performAction() {
        var querySearch = queryInput.value.trim();
        var urlSearch = urlInput.value.trim();

        // 1. ПРИОРИТЕТ URL: Если заполнено поле для прямой ссылки
        if (urlSearch !== '') {
            // Добавляем https://, если пользователь забыл его ввести
            if (!/^https?:\/\//i.test(urlSearch)) {
                urlSearch = 'https://' + urlSearch;
            }
            window.location.href = urlSearch;
            return; // Завершаем выполнение, чтобы не сработал обычный поиск
        }

        // 2. ПОИСКОВЫЙ ЗАПРОС: Если поле URL пустое, но есть поисковый запрос
        if (querySearch !== '') {
            
            // СОХРАНЕНИЕ: Записываем введенный текст в историю (без дублей, самые свежие сверху)
            addToHistory(querySearch);

            // Твой switch-case с исправленным window.location.href и полными ссылками
            switch (currentEngine) {
                case 'google':
                    // Код для гугла с твоими параметрами сжатия и трекинга выдачи
                    window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(querySearch) + "&sca_esv=8971b996c47cdb49&sxsrf=APpeQnvt7Q3x-GfbjwovCqm0HCMTV1Ej4Q%3A1785728616832&ei=aA5wavOtMr6pwPAPpvCg0Qw&biw=604&bih=791&ved=0ahUKEwjzgfy-xYOWAxW-FBAIHSY4KMoQ4dUDCBA&uact=5&oq=bugugug&gs_lp=Egxnd3Mtd2l6LXNlcnAiB2J1Z3VndWcyBRAAGO8FMgUQABjvBTIIEAAYgAQYogQyBRAAGO8FSIMZUNoOWMkScAF4AJABAJgBT6ABuAOqAQE3uAEDyAEA-AEBmAIIoAKCBKgCCsICEBAjGPAFGJ4GGKIHGOoCGCfCAgcQIxjqAhgnwgIHEC4Y6gIYJ8ICDRAjGPAFGMkCGOoCGCfCAg4QABiABBiKBRixAxiDAcICFBAuGIAEGIoFGLEDGIMBGMcBGNEDwgIIEAAYgAQYsQPCAgsQLhiABBixAxiDAcICDhAuGIAEGLEDGMcBGNEDwgILEAAYgAQYsQMYgwHCAgsQLhiABBjHARjRA8ICCBAuGIAEGLEDwgIFEAAYgATCAgUQLhiABMICCBAuGMsBGIAEwgIKEAAYgAQYywEYCsICCBAAGIAEGMsBwgIEEAAYHsICBhAAGAUYHpgDFPEFJkmw2FA_kaaSBwE4oAeWM7IHATe4B-0DwgcFMi02LjLIBzmACAE&sclient=gws-wiz-serp";
                    break;
                case 'yandex':
                    // Код для яндекса с редиректом на ya.ru и твоими метриками саджеста
                    window.location.href = "https://ya.ru/search/?text=" + encodeURIComponent(querySearch) + "&lr=213&clid=2255400-225&win=688&search_source=yaru_desktop_common&search_domain=yaru&src=suggest_Pers";
                    break;
                default:
                    console.log('Поисковик по умолчанию');
            }
        }
    }

    // Вешаем глобальный слушатель Enter на оба поля ввода
    queryInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') performAction();
        if (event.key === 'Escape') historyDropdown.classList.remove('visible');
    });

    urlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') performAction();
    });

    // Показ истории при фокусе и фильтрация по мере ввода
    queryInput.addEventListener('focus', () => renderHistory(queryInput.value));
    queryInput.addEventListener('input', () => renderHistory(queryInput.value));

    // Скрываем выпадашку истории при клике вне поля/списка
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-box-wrapper')) {
            historyDropdown.classList.remove('visible');
        }
    });
});



