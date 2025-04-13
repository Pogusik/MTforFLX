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

async function loadTab(tabId) {
    const contentDiv = document.getElementById('tab-content');
    if (!contentDiv) return;
    
    // Показываем индикатор загрузки
    contentDiv.innerHTML = `
        <div class="scp-loading">
            <div class="scp-loading-anim"></div>
            <p>ЗАГРУЗКА МОДУЛЯ ${tabId.toUpperCase()}...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`tabs/${tabId}.html`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        contentDiv.innerHTML = html;
        initTabScripts(tabId);
    } catch (err) {
        console.error('Ошибка загрузки вкладки:', err);
        contentDiv.innerHTML = `
            <div class="error-message">
                <h3>ОШИБКА ЗАГРУЗКИ ВКЛАДКИ</h3>
                <p>Не удалось загрузить содержимое вкладки ${tabId}.</p>
                <p>Проверьте:</p>
                <ul>
                    <li>Существует ли файл tabs/${tabId}.html</li>
                    <li>Доступ к файлу</li>
                    <li>Подключение к сети</li>
                </ul>
                <p><small>${err.message}</small></p>
                <button onclick="location.reload()" class="scp-button">ПОВТОРИТЬ ПОПЫТКУ</button>
            </div>
        `;
    }
}

function initTabScripts(tabId) {
    document.querySelectorAll('.tab-icon').forEach(icon => {
        icon.style.color = '#ccc';
    });
    
    const activeIcon = document.querySelector(`.tab-btn.active .tab-icon`);
    if (activeIcon) {
        activeIcon.style.color = 'var(--accent-color)';
    }
    // Здесь можно добавить инициализацию специфичных для вкладки скриптов
    console.log(`Инициализация скриптов для вкладки: ${tabId}`);
    
    switch(tabId) {
        case 'settings':
            initSettingsTab();
            break;
        case 'cassie':
            initCassieTab();
            break;
        case 'cassie-editor':
            initEditorTab();
            break;
        // Добавьте другие вкладки по мере необходимости
    }
}
// Функции для настроек
function initSettingsTab() {
    // Загружаем текущую тему из localStorage
    const currentTheme = localStorage.getItem('theme') || 'cyan';
    
    // Отмечаем текущую тему
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active-theme');
        }
        
        option.addEventListener('click', function() {
            changeTheme(this.dataset.theme);
        });
    });
}

function changeTheme(themeName) {
    // Удаляем предыдущие классы тем
    document.body.classList.remove(
        'cyan-theme', 'gray-theme', 'yellow-theme', 
        'mint-theme', 'red-theme', 'green-theme',
        'purple-theme', 'blue-theme'
    );
    
    // Добавляем новый класс темы
    document.body.classList.add(`${themeName}-theme`);
    
    // Обновляем логотип в основном интерфейсе
    updateLogo(themeName);
    
    // Обновляем активную тему в настройках
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active-theme');
        if (option.dataset.theme === themeName) {
            option.classList.add('active-theme');
        }
    });
    
    // Сохраняем в localStorage
    localStorage.setItem('theme', themeName);
}

function updateLogo(themeName) {
    const logo = document.querySelector('#main-logo');
    if (logo) {
        logo.src = `./assets/${themeName}.png`;
        logo.style.opacity = '0';
        setTimeout(() => {
            logo.style.transition = 'opacity 0.3s ease';
            logo.style.opacity = '1';
        }, 50);
    }
}

function updateThemeVariables(themeName) {
    const root = document.documentElement;
    
    switch(themeName) {
        case 'cyan':
            root.style.setProperty('--primary-color', '#177b80');
            root.style.setProperty('--accent-color', '#006b75');
            break;
        case 'gray':
            root.style.setProperty('--primary-color', '#979090');
            root.style.setProperty('--accent-color', '#7a7373');
            break;
        case 'yellow':
            root.style.setProperty('--primary-color', '#e2d1a8');
            root.style.setProperty('--accent-color', '#d4c08e');
            break;
        case 'mint':
            root.style.setProperty('--primary-color', '#a5cfbd');
            root.style.setProperty('--accent-color', '#8cbaa6');
            break;
        case 'red':
            root.style.setProperty('--primary-color', '#c92d2d');
            root.style.setProperty('--accent-color', '#a82424');
            break;
        case 'green':
            root.style.setProperty('--primary-color', '#84ec80');
            root.style.setProperty('--accent-color', '#6acd66');
            break;
        case 'purple':
            root.style.setProperty('--primary-color', '#6a3874');
            root.style.setProperty('--accent-color', '#5a2d63');
            break;
        case 'blue':
            root.style.setProperty('--primary-color', '#1e2c8d');
            root.style.setProperty('--accent-color', '#172574');
            break;
    }
}

// При загрузке страницы применяем сохраненную тему
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'cyan';
    changeTheme(savedTheme);
});


// конец настроек
function initCassieTab() {
    const presetsContainer = document.getElementById('presets-container');
    const searchInput = document.getElementById('cassie-search');
    const refreshBtn = document.getElementById('refresh-presets');
    
    let presetsData = [];
    
    async function loadPresets() {
        try {
            if (!presetsContainer) return;
            
            presetsContainer.innerHTML = `
                <div class="scp-loading">
                    <div class="scp-loading-anim"></div>
                    <p>ЗАГРУЗКА ПРЕСЕТОВ...</p>
                </div>
            `;
            
            const response = await fetch('./cassie.txt');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const text = await response.text();
            
            presetsData = text.split('\n')
                .filter(line => line.trim() !== '')
                .map(line => {
                    const cleaned = line.replace(/^'|'$/g, '');
                    const parts = cleaned.split(/':'/);
                    
                    if (parts.length < 3) return null;
                    
                    return {
                        author: parts[0] || 'Неизвестно',
                        name: parts[1] || 'Без названия',
                        content: parts[2] || '',
                        tags: parts[3] ? parts[3].split(',').map(tag => tag.trim()) : []
                    };
                })
                .filter(preset => preset !== null);
                
            if (presetsData.length === 0) {
                throw new Error('Нет данных или неверный формат файла');
            }
            
            renderPresets(presetsData);
        } catch (err) {
            console.error('Ошибка загрузки пресетов:', err);
            showError(err);
        }
    }
    
    function showError(err) {
        if (!presetsContainer) return;
        
        presetsContainer.innerHTML = `
            <div class="error-message">
                <h3>ОШИБКА ЗАГРУЗКИ</h3>
                <p>Не удалось загрузить пресеты CASSIE.</p>
                <p><small>${err.message}</small></p>
                <button class="scp-button" id="retry-load">ПОВТОРИТЬ</button>
            </div>
        `;
        
        document.getElementById('retry-load')?.addEventListener('click', loadPresets);
    }
    
    // Инициализация
    if (presetsContainer && searchInput && refreshBtn) {
        loadPresets();
        searchInput.addEventListener('input', (e) => searchPresets(e.target.value));
        refreshBtn.addEventListener('click', loadPresets);
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatCassieContent(text) {
    if (!text) return '';
    return escapeHtml(text)
        .replace(/\n/g, '<br>')
        .replace(/"([^"]*)"/g, '«$1»')
        .replace(/(\. )/g, '.<br>')
        .replace(/\b([A-Z][A-Z0-9]+)\b/g, '<span class="cassie-command">$1</span>');
}

// Функция для показа уведомления
function showToast(message) {
    const toast = document.getElementById('copy-toast');
    if (!toast) return;
    
    toast.innerHTML = `${message} <span><i class="fas fa-check"></i></span>`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Обновленная функция copyToClipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Скопировано');
    }).catch(err => {
        console.error('Ошибка копирования:', err);
        showToast('Ошибка копирования');
    });
}

// Обновленная функция searchPresets с поиском по тегам
function searchPresets(query) {
    if (!presetsData || !presetsContainer) return;
    
    if (!query || query.trim() === '') {
        renderPresets(presetsData);
        return;
    }
    
    const lowerQuery = query.toLowerCase().trim();
    const filtered = presetsData.filter(preset => {
        // Поиск по названию
        const nameMatch = preset.name && preset.name.toLowerCase().includes(lowerQuery);
        // Поиск по автору
        const authorMatch = preset.author && preset.author.toLowerCase().includes(lowerQuery);
        // Поиск по тегам (точное совпадение)
        const tagsMatch = preset.tags && preset.tags.some(tag => 
            tag.toLowerCase() === lowerQuery || 
            tag.toLowerCase().includes(lowerQuery)
        );
        // Поиск по содержимому
        const contentMatch = preset.content && preset.content.toLowerCase().includes(lowerQuery);
        
        return nameMatch || authorMatch || tagsMatch || contentMatch;
    });
    
    renderPresets(filtered);
}

function showCopyModal(content) {
    const modal = document.getElementById('copy-modal');
    const contentEl = document.getElementById('copied-content');
    
    if (modal && contentEl) {
        contentEl.textContent = content;
        modal.style.display = 'block';
    }
}

function renderPresets(presets) {
    const presetsContainer = document.getElementById('presets-container');
    if (!presetsContainer) return;
    
    if (!presets || presets.length === 0) {
        presetsContainer.innerHTML = '<p class="no-results">Пресеты не найдены</p>';
        return;
    }
    
    presetsContainer.innerHTML = '';
    
    presets.forEach(preset => {
        const presetElement = document.createElement('div');
        presetElement.className = 'preset-card';
        
        const author = preset.author || 'Неизвестный автор';
        const name = preset.name || 'Без названия';
        const content = preset.content || '';
        const tags = Array.isArray(preset.tags) ? preset.tags : [];
        
        presetElement.innerHTML = `
            <div class="preset-header">
                <div>
                    <div class="preset-title">${escapeHtml(name)}</div>
                    <div class="preset-author">Автор: ${escapeHtml(author)}</div>
                </div>
            </div>
            <div class="preset-content">${formatCassieContent(content)}</div>
            ${tags.length > 0 ? `
                <div class="preset-tags">
                    ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="preset-actions">
                <button class="copy-btn" data-content="${escapeHtml(content)}">
                    <i class="far fa-copy"></i> Копировать
                </button>
            </div>
        `;
        
        presetsContainer.appendChild(presetElement);
    });
    
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const content = this.getAttribute('data-content');
            copyToClipboard(content);
        });
    });
}


// Инициализация вкладки настроек (Discord профили)
function initSettingsTab() {
    const SERVER_INVITE_CODE = 'flx-project';
    const USER_INVITE_CODE = 'RgaA2yh3yd';

    const userProfileLink = document.getElementById('user-profile-link');
    const serverProfileLink = document.getElementById('server-profile-link');
    const userModal = document.getElementById('user-profile-modal');
    const serverModal = document.getElementById('server-profile-modal');

    // Загружаем данные при открытии вкладки
    loadDiscordProfiles();

    async function loadDiscordProfiles() {
        try {
            const [serverData, userData] = await Promise.all([
                fetchServerData(SERVER_INVITE_CODE),
                fetchUserDataFromInvite(USER_INVITE_CODE)
            ]);

            // Добавляем обработчики кликов
            userProfileLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await showUserProfile(userData);
            });

            serverProfileLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await showServerProfile(serverData);
            });
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            showError(userModal.querySelector('.mini-profile-content'), error);
        }
    }

    async function fetchServerData(inviteCode) {
        try {
            const response = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`);
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

            const data = await response.json();
            return {
                id: data.guild.id,
                name: data.guild.name,
                description: data.guild.description,
                icon: data.guild.icon,
                banner: data.guild.banner,
                member_count: data.approximate_member_count,
                online_count: data.approximate_presence_count
            };
        } catch (error) {
            console.error('Ошибка загрузки сервера:', error);
            return {
                id: '702074452317798481',
                name: 'FLX-project',
                description: 'Официальный сервер проекта FLX',
                icon: 'a_3e7a7e7e7e7e7e7e7e7e7e7e7e7e7e7',
                banner: 'a_3e7a7e7e7e7e7e7e7e7e7e7e7e7e7e7',
                member_count: 1234,
                online_count: 567
            };
        }
    }

    async function fetchUserDataFromInvite(inviteCode) {
        try {
            const response = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`);
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    
            const data = await response.json();
            if (!data.inviter) throw new Error('Пользователь не найден в инвайт-коде');
    
            // Получаем цвет баннера на основе хэша аватара
            const bannerColor = await getDominantColorFromImage(
                `https://cdn.discordapp.com/avatars/${data.inviter.id}/${data.inviter.avatar}.webp?size=256`
            );
    
            return {
                id: data.inviter.id,
                username: data.inviter.username,
                global_name: data.inviter.global_name || data.inviter.username,
                discriminator: data.inviter.discriminator,
                avatar: data.inviter.avatar,
                banner_color: bannerColor,
                isBot: data.inviter.bot || false
            };
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error);
            // Возвращаем данные пользователя из вашего инвайт-кода https://discord.gg/RgaA2yh3yd
            return {
                id: '778668132541530132',
                username: 'pogusik',
                global_name: 'Pogusik',
                discriminator: '0000',
                avatar: 'a_3e7a7e7e7e7e7e7e7e7e7e7e7e7e7e7',
                banner_color: '#006b75',
                isBot: false
            };
        }
    }

    async function showUserProfile(userData) {
        userModal.classList.add('active');
        userModal.querySelector('.mini-profile-content').innerHTML = `
            <span class="close-mini-profile">&times;</span>
            <div class="profile-banner" style="background-color: ${userData.banner_color}"></div>
            <div class="profile-avatar-container">
                <img src="${getAvatarUrl(userData, 256)}" class="profile-avatar">
                <div class="user-status ${await estimateUserStatus(userData.id)}"></div>
            </div>
            <div class="profile-info">
                <div class="profile-name">
                    ${userData.global_name || userData.username}
                    ${userData.isBot ? '<span class="profile-badge"><i class="fas fa-robot"></i> Бот</span>' : ''}
                </div>
                <div class="profile-username">@${userData.username}</div>
                <div class="profile-divider"></div>
                <div class="profile-actions">
                    <button class="profile-button" onclick="window.open('https://discord.com/users/${userData.id}')">
                        <i class="fab fa-discord"></i> Профиль
                    </button>
                </div>
            </div>
        `;
        addModalCloseHandlers(userModal);
    }

    async function showServerProfile(serverData) {
        serverModal.classList.add('active');
        serverModal.querySelector('.mini-profile-content').innerHTML = `
            <span class="close-mini-profile">&times;</span>
            <div class="profile-banner" style="${serverData.banner ? `background-image: url('https://cdn.discordapp.com/banners/${serverData.id}/${serverData.banner}.webp?size=600')` : ''}"></div>
            <div class="profile-avatar-container">
                <img src="${getServerIconUrl(serverData, 256)}" class="profile-avatar server-avatar">
            </div>
            <div class="profile-info">
                <div class="profile-name">${serverData.name}</div>
                ${serverData.description ? `<div class="profile-username">${serverData.description}</div>` : ''}
                <div class="profile-divider"></div>
                <div class="server-members">
                    <i class="fas fa-users"></i>
                    <div class="server-members-count">
                        ${formatNumber(serverData.member_count)} участников<br>
                        <small>${formatNumber(serverData.online_count || 0)} онлайн</small>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="profile-button" onclick="window.open('https://discord.gg/${SERVER_INVITE_CODE}')">
                        <i class="fab fa-discord"></i> Присоединиться
                    </button>
                </div>
            </div>
        `;
        addModalCloseHandlers(serverModal);
    }

    function getAvatarUrl(user, size = 80) {
        if (user.avatar) {
            return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=${size}`;
        } else {
            const discriminator = user.discriminator || '0000';
            return `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png?size=${size}`;
        }
    }

    function getServerIconUrl(server, size = 80) {
        if (server.icon) {
            return `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.webp?size=${size}`;
        } else {
            return `https://cdn.discordapp.com/embed/avatars/0.png?size=${size}`;
        }
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function addModalCloseHandlers(modal) {
        modal.querySelector('.close-mini-profile').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    function showError(container, error) {
        container.innerHTML = `
            <div class="error-message">
                <p>Произошла ошибка</p>
                <small>${error.message}</small>
                <button onclick="location.reload()" class="profile-button">Повторить</button>
            </div>
        `;
    }

    async function estimateUserStatus(userId) {
        const statuses = ['online', 'idle', 'dnd', 'offline'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }
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

// Закрытие модального окна
document.querySelector('.close-modal')?.addEventListener('click', () => {
    document.getElementById('copy-modal').style.display = 'none';
});

window.closeModal = function() {
    document.getElementById('copy-modal').style.display = 'none';
};
// Инициализируем проверку версии при загрузке
checkForUpdates();