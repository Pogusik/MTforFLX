document.addEventListener('DOMContentLoaded', function() {
    // Загружаем первую вкладку по умолчанию
    loadTab('cassie');
    
    // Назначаем обработчики для вкладок
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', function() {
            // Удаляем активный класс у всех вкладок
            document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            // Добавляем активный класс текущей вкладке
            this.classList.add('active');
            // Загружаем содержимое вкладки
            loadTab(this.dataset.tab);
        });
    });
    
    // Инициализация системы обновления
    initUpdateChecker();
});

// Функция загрузки содержимого вкладки
function loadTab(tabName) {
    const contentArea = document.getElementById('content-area');
    
    // Показываем индикатор загрузки
    contentArea.innerHTML = '<div class="loading">Загрузка...</div>';
    
    // Загружаем содержимое вкладки
    fetch(`tabs/${tabName}.html`)
        .then(response => response.text())
        .then(html => {
            contentArea.innerHTML = html;
            
            // Если загружена вкладка настроек, инициализируем её
            if (tabName === 'settings') {
                initSettings();
            }
        })
        .catch(error => {
            contentArea.innerHTML = `<div class="error">Ошибка загрузки вкладки: ${error.message}</div>`;
        });
}

// Инициализация настроек
function initSettings() {
    // Загрузка сохраненных настроек
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedScale = localStorage.getItem('scale') || '100';
    
    // Применение сохраненных настроек
    applyTheme(savedTheme);
    applyScale(savedScale);
    
    // Назначение обработчиков для выбора темы
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            localStorage.setItem('theme', theme);
            applyTheme(theme);
            
            // Обновляем выбранную тему
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Назначение обработчика для масштаба
    const scaleSlider = document.getElementById('scale-slider');
    if (scaleSlider) {
        scaleSlider.value = savedScale;
        scaleSlider.addEventListener('input', function() {
            const scale = this.value;
            localStorage.setItem('scale', scale);
            applyScale(scale);
        });
    }
    
    // Отмечаем выбранную тему
    document.querySelector(`.theme-option[data-theme="${savedTheme}"]`)?.classList.add('selected');
}

// Применение темы
function applyTheme(theme) {
    const root = document.documentElement;
    
    switch(theme) {
        case 'dark':
            root.style.setProperty('--primary-color', '#3d9ca9');
            root.style.setProperty('--secondary-color', '#333333');
            root.style.setProperty('--background-color', '#1a1a1a');
            root.style.setProperty('--text-color', '#ffffff');
            break;
        case 'light':
            root.style.setProperty('--primary-color', '#2c7be5');
            root.style.setProperty('--secondary-color', '#f8f9fa');
            root.style.setProperty('--background-color', '#ffffff');
            root.style.setProperty('--text-color', '#212529');
            break;
        case 'custom':
            // Можно добавить кастомные цвета из localStorage
            break;
    }
    
    // Обновляем цвет логотипа
    updateLogoColor();
}

// Применение масштаба
function applyScale(scale) {
    document.body.style.fontSize = `${scale}%`;
}

// Обновление цвета логотипа в соответствии с темой
function updateLogoColor() {
    const logo = document.getElementById('logo');
    if (logo) {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        logo.style.filter = `hue-rotate(0deg) drop-shadow(0 0 5px ${primaryColor})`;
    }
}

// Система проверки обновлений
function initUpdateChecker() {
    const version = '1.0.0'; // Текущая версия приложения
    const checkInterval = 30000; // Проверка каждые 30 секунд
    
    function checkForUpdates() {
        fetch(`version.json?t=${new Date().getTime()}`)
            .then(response => response.json())
            .then(data => {
                if (data.version !== version) {
                    notifyUpdate();
                }
            })
            .catch(error => console.error('Ошибка проверки обновлений:', error));
    }
    
    function notifyUpdate() {
        if (confirm('Доступна новая версия приложения. Перезагрузить страницу для обновления?')) {
            location.reload();
        }
    }
    
    // Начинаем проверку обновлений
    setInterval(checkForUpdates, checkInterval);
    checkForUpdates();
}