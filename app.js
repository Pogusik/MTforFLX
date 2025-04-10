// Конфигурация приложения
const CONFIG = {
    tabs: {
        'cassie': 'tabs/cassie.html',
        'cassie-editor': 'tabs/cassie-editor.html',
        'cassie-checker': 'tabs/cassie-checker.html',
        'clscript': 'tabs/clscript.html',
        'rpitem': 'tabs/rpitem.html',
        'settings': 'tabs/settings.html'
    },
    version: '1.0.0',
    updateCheckInterval: 30000 // 30 секунд
};

// Система динамической загрузки вкладок
class TabLoader {
    constructor() {
        this.currentTab = null;
        this.cache = {};
        this.initTabs();
        this.setupAutoUpdate();
    }

    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => this.loadTab(button.dataset.tab));
        });

        // Загружаем первую вкладку по умолчанию
        this.loadTab('cassie');
    }

    async loadTab(tabName) {
        if (this.currentTab === tabName) return;
        
        const contentArea = document.getElementById('tab-content');
        contentArea.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Загрузка...</p></div>';
        
        // Обновляем активную кнопку
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        try {
            let content;
            
            // Проверяем кэш
            if (this.cache[tabName] && this.cache[tabName].timestamp + 600000 > Date.now()) {
                content = this.cache[tabName].content;
            } else {
                const response = await fetch(CONFIG.tabs[tabName]);
                if (!response.ok) throw new Error('Ошибка загрузки');
                content = await response.text();
                
                // Кэшируем контент
                this.cache[tabName] = {
                    content,
                    timestamp: Date.now()
                };
            }
            
            contentArea.innerHTML = content;
            this.currentTab = tabName;
            
            // Инициализируем специфичные для вкладки скрипты
            this.initTabScripts(tabName);
            
        } catch (error) {
            contentArea.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Не удалось загрузить вкладку "${tabName}"</p>
                    <button onclick="location.reload()">Обновить</button>
                </div>
            `;
            console.error(`Ошибка загрузки вкладки ${tabName}:`, error);
        }
    }

    initTabScripts(tabName) {
        // Здесь можно добавить инициализацию специфичных скриптов для каждой вкладки
        switch(tabName) {
            case 'cassie':
                this.initCassieTab();
                break;
            case 'cassie-editor':
                this.initCassieEditor();
                break;
            // ... другие вкладки
        }
    }

    initCassieTab() {
        // Инициализация вкладки CASSIE
        console.log('Инициализация вкладки CASSIE');
        // Здесь будет код для работы с CASSIE
    }

    // ... другие методы инициализации

    setupAutoUpdate() {
        // Проверяем обновления каждые 30 секунд
        setInterval(() => this.checkForUpdates(), CONFIG.updateCheckInterval);
    }

    async checkForUpdates() {
        try {
            const response = await fetch('version.txt?t=' + Date.now());
            const newVersion = await response.text();
            
            if (newVersion !== CONFIG.version) {
                this.notifyUpdate();
            }
        } catch (error) {
            console.error('Ошибка проверки обновлений:', error);
        }
    }

    notifyUpdate() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <p>Доступна новая версия! Перезагрузите страницу для обновления.</p>
            <button onclick="location.reload()">Обновить сейчас</button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }
}

// Запуск приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new TabLoader();
    
    // Инициализация темы
    const savedTheme = localStorage.getItem('flx-theme') || 'dark';
    document.body.className = savedTheme + '-theme';
});
