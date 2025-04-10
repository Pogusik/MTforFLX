document.addEventListener('DOMContentLoaded', function() {
    // Загружаем первую вкладку по умолчанию
    loadTab('cassie');
    
    // Обработчики для кнопок вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            loadTab(tabId);
            
            // Обновляем активную кнопку
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Проверка обновлений каждые 5 минут
    setInterval(checkForUpdates, 300000);
});

function loadTab(tabId) {
    const contentDiv = document.getElementById('tab-content');
    
    // Показываем индикатор загрузки
    contentDiv.innerHTML = '<div class="loading">ЗАГРУЗКА...<div class="scp-loading-anim"></div></div>';
    
    // Загружаем содержимое вкладки
    fetch(`tabs/${tabId}.html`)
        .then(response => response.text())
        .then(html => {
            contentDiv.innerHTML = html;
            
            // Инициализируем специфичные для вкладки скрипты
            initTabScripts(tabId);
        })
        .catch(err => {
            console.error('Ошибка загрузки вкладки:', err);
            contentDiv.innerHTML = `
                <div class="error-message">
                    <h3>ОШИБКА ЗАГРУЗКИ</h3>
                    <p>Не удалось загрузить содержимое вкладки. Проверьте подключение к сети.</p>
                    <p>${err.message}</p>
                </div>
            `;
        });
}

function initTabScripts(tabId) {
    // Здесь можно добавить инициализацию специфичных для вкладки скриптов
    console.log(`Инициализация скриптов для вкладки: ${tabId}`);
    
    switch(tabId) {
        case 'cassie':
            initCassieTab();
            break;
        case 'cassie-editor':
            initEditorTab();
            break;
        // Добавьте другие вкладки по мере необходимости
    }
}

function initCassieTab() {
    // Инициализация вкладки CASSIE
    console.log('Инициализация вкладки CASSIE');
    
    // Здесь будет код для загрузки пресетов с GitHub и отображения их
}

function initEditorTab() {
    // Инициализация редактора CASSIE
    console.log('Инициализация редактора CASSIE');
    
    // Здесь будет код для редактора
}

function checkForUpdates() {
    // Проверяем, изменился ли файл на сервере
    fetch('version.txt?t=' + new Date().getTime())
        .then(response => response.text())
        .then(version => {
            const currentVersion = localStorage.getItem('appVersion');
            
            if (currentVersion && currentVersion !== version) {
                // Версия изменилась - перезагружаем страницу
                localStorage.setItem('appVersion', version);
                window.location.reload();
            } else if (!currentVersion) {
                // Первая загрузка - сохраняем версию
                localStorage.setItem('appVersion', version);
            }
        })
        .catch(err => console.error('Ошибка проверки обновлений:', err));
}

// Инициализируем проверку версии при загрузке
checkForUpdates();