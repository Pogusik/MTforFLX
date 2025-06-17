

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

document.addEventListener('DOMContentLoaded', function() {
    // Загружаем первую вкладку по умолчанию
    loadTab('cassie');
    
    // Обработчики для кнопок вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            loadTab(tabId);
            
            // Обновляем активную кнопку и иконку
            updateActiveTab(this);
        });
    });
    
    // Проверка обновлений каждые 5 минут
    setInterval(checkForUpdates, 300000);
});

function updateActiveTab(activeBtn) {
    // Сбрасываем все кнопки и иконки
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        const icon = b.querySelector('.tab-icon');
        if (icon) icon.style.color = '#ccc';
    });
    
    // Устанавливаем активное состояние для выбранной кнопки
    activeBtn.classList.add('active');
    const activeIcon = activeBtn.querySelector('.tab-icon');
    if (activeIcon) activeIcon.style.color = 'var(--accent-color)';
}

function initTabScripts(tabId) {
    // Обновляем активную вкладку (на случай, если функция вызывается отдельно)
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (activeBtn) updateActiveTab(activeBtn);
    
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
        case 'rpitem':
            initRPTab();
            break;
        case 'converter':
            initConverterTab();
            break;
        case 'kcard':
            initKCardTab();
            break;
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
    
            // Получаем URL аватарки
            const avatarUrl = `https://cdn.discordapp.com/avatars/${data.inviter.id}/${data.inviter.avatar}.webp?size=256`;
            
            // Получаем доминирующий цвет аватарки
            const bannerColor = await getDominantColorFromImage(avatarUrl);
    
            return {
                id: data.inviter.id,
                username: data.inviter.username,
                global_name: data.inviter.global_name || data.inviter.username,
                discriminator: data.inviter.discriminator,
                avatar: data.inviter.avatar,
                banner_color: bannerColor || '#006b75', // Используем полученный цвет или цвет по умолчанию
                isBot: data.inviter.bot || false
            };
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error);
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
    
    async function getDominantColorFromImage(imageUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Для работы с CORS
            img.src = imageUrl;
            
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    // Получаем данные изображения
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    
                    // Анализируем цвета
                    const colorCounts = {};
                    for (let i = 0; i < imageData.length; i += 4) {
                        const r = imageData[i];
                        const g = imageData[i + 1];
                        const b = imageData[i + 2];
                        const a = imageData[i + 3];
                        
                        // Пропускаем прозрачные пиксели
                        if (a < 128) continue;
                        
                        const color = `${r},${g},${b}`;
                        colorCounts[color] = (colorCounts[color] || 0) + 1;
                    }
                    
                    // Находим наиболее часто встречающийся цвет
                    let maxCount = 0;
                    let dominantColor = null;
                    
                    for (const color in colorCounts) {
                        if (colorCounts[color] > maxCount) {
                            maxCount = colorCounts[color];
                            dominantColor = color;
                        }
                    }
                    
                    if (dominantColor) {
                        const [r, g, b] = dominantColor.split(',');
                        resolve(`rgb(${r}, ${g}, ${b})`);
                    } else {
                        resolve('#006b75'); // Цвет по умолчанию
                    }
                } catch (error) {
                    console.error('Ошибка анализа цвета:', error);
                    resolve('#006b75'); // Цвет по умолчанию в случае ошибки
                }
            };
            
            img.onerror = function() {
                console.error('Ошибка загрузки изображения для анализа цвета');
                resolve('#006b75'); // Цвет по умолчанию
            };
        });
    }
    
    // Вспомогательная функция для генерации случайного цвета
    function getRandomColor() {
        const colors = ['#006b75', '#1b5e20', '#552b5e', '#1b355c', '#921212', '#57917c', '#77663d', '#424242'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

// Вспомогательная функция для генерации случайного цвета
function getRandomColor() {
    const colors = ['#006b75', '#1b5e20', '#552b5e', '#1b355c', '#921212', '#57917c', '#77663d', '#424242'];
    return colors[Math.floor(Math.random() * colors.length)];
}
    async function showUserProfile(userData) {
        userModal.classList.add('active');
        userModal.querySelector('.mini-profile-content').innerHTML = `
            <span class="close-mini-profile">&times;</span>
            <div class="profile-banner" style="background-color: ${userData.banner_color}"></div>
            <div class="profile-avatar-container">
                <img src="${getAvatarUrl(userData, 256)}" class="profile-avatar">
            </div>
            <div class="profile-info">
                <div class="profile-name">
                    ${userData.global_name || userData.username}
                    ${userData.isBot ? '<span class="profile-badge"><i class="fas fa-robot"></i> Бот</span>' : ''}
                </div>
                <div class="profile-username">@${userData.username}</div>
                <div class="profile-divider"></div>
                <div class="profile-username">Pogus | «Пульсар» — ведущий разработчик <b>FLX-TOOL</b>, по всем вопросам обращаться к нему:</div>
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

function initConverterTab() {
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const convertBtn = document.getElementById('convertBtn');
    const copyBtn = document.getElementById('copyBtn');
    const outputText = document.getElementById('outputText');
    const textPreview = document.getElementById('textPreview');
    
    let uploadedImage = null;
    
    // Обработчик загрузки изображения
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            imagePreview.src = event.target.result;
            previewImage.src = event.target.result;
            imagePreview.style.display = 'block';
            previewImage.style.display = 'block';
            uploadedImage = imagePreview;
        };
        reader.readAsDataURL(file);
    });
    
    // Счётчики символов
    const itemText = document.getElementById('itemText');
    const itemTextCounter = document.getElementById('itemTextCounter');
    const previewCounter = document.getElementById('previewCounter');
    const outputCounter = document.getElementById('outputCounter');
    
    itemText.addEventListener('input', updateCharCounters);
    outputText.addEventListener('input', updateCharCounters);
    
    function updateCharCounters() {
        // Текст предмета
        const itemTextLength = itemText.value.length;
        itemTextCounter.textContent = itemTextLength;
        itemTextCounter.className = itemTextLength > 240 ? 'error' : 
                                   itemTextLength > 200 ? 'warning' : '';
        
        // Превью и вывод
        const previewText = textPreview.textContent;
        const outputTextValue = outputText.value;
        
        const previewLength = previewText.length;
        const outputLength = outputTextValue.length;
        
        previewCounter.textContent = previewLength;
        previewCounter.className = previewLength > 1900 ? 'error' : 
                                  previewLength > 1500 ? 'warning' : '';
        
        outputCounter.textContent = outputLength;
        outputCounter.className = outputLength > 1900 ? 'error' : 
                                  outputLength > 1500 ? 'warning' : '';
    }
    
    // Обработчик конвертации
    convertBtn.addEventListener('click', function() {
        if (!uploadedImage) {
            showToast('Пожалуйста, загрузите изображение сначала');
            return;
        }
        
        // Получаем параметры RPItem
        const playerId = document.getElementById('playerId').value;
        const itemId = document.getElementById('itemId').value;
        const posX = document.getElementById('posX').value;
        const posY = document.getElementById('posY').value;
        const posZ = document.getElementById('posZ').value;
        const time = document.getElementById('time').value;
        const itemTextValue = document.getElementById('itemText').value;
        
        // Получаем параметры текста
        const fontSize = document.getElementById('fontSize').value;
        const lineHeight = document.getElementById('lineHeight').value;
        const mspace = document.getElementById('mspace').value;
        
        // Генерируем изображение
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = uploadedImage;
        
        // Устанавливаем размеры canvas
        const widthLimit = parseInt(document.getElementById('widthLimit').value);
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        canvas.width = widthLimit;
        canvas.height = Math.floor(widthLimit * aspectRatio);
        
        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Получаем данные пикселей
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Настройки изображения
        const charType = document.getElementById('charType').value;
        const colorPrecision = parseInt(document.getElementById('colorPrecision').value);
        
        // Генерируем текст изображения
        let imageText = `<line-height=${lineHeight}><mspace=${mspace}><size=${fontSize}>`;
        let previewHtml = `<div style="line-height:${lineHeight}; letter-spacing:${mspace}; font-size:${fontSize}px;">`;
        
        // Обрабатываем каждый пиксель
        for (let y = 0; y < canvas.height; y++) {
            let line = '';
            let previewLine = '<div>';
            
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                // Преобразуем RGB в HEX с учетом точности
                const hexColor = rgbToHex(r, g, b, colorPrecision);
                
                // Добавляем символ с цветом
                line += `<color=#${hexColor}>${charType}</color>`;
                previewLine += `<span style="color: #${hexColor};">${charType}</span>`;
            }
            
            imageText += line + '\n';
            previewLine += '</div>';
            previewHtml += previewLine;
        }
        
        imageText += `</size></mspace></line-height>`;
        previewHtml += '</div>';
        
        // Формируем полный код RPItem
        const rpItemCode = `rpi g ${playerId} ${itemId} ${posX} ${posY} ${posZ} ${time}\n${itemTextValue}\n\n${imageText}`;
        
        // Обрезаем если превышен лимит
        outputText.value = rpItemCode.substring(0, 2000);
        textPreview.innerHTML = previewHtml;
        
        updateCharCounters();
    });
    
    // Функция преобразования RGB в HEX
    function rgbToHex(r, g, b, precision) {
        const factor = Math.pow(2, 8 - precision);
        r = Math.floor(r / factor) * factor;
        g = Math.floor(g / factor) * factor;
        b = Math.floor(b / factor) * factor;
        
        const toHex = (c) => {
            const hex = c.toString(16).padStart(2, '0');
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return toHex(r) + toHex(g) + toHex(b);
    }
    
    // Копирование результата
    copyBtn.addEventListener('click', function() {
        if (!outputText.value) {
            showToast('Нет данных для копирования');
            return;
        }
        
        outputText.select();
        document.execCommand('copy');
        showToast('Код RPItem скопирован в буфер обмена');
    });
    
    // Инициализация выпадающего списка
    const defaultItem = document.querySelector('.item');
    if (defaultItem) {
        defaultItem.click();
    }
    
    // Инициализация счётчиков
    updateCharCounters();
}

// Функции для работы выпадающего списка
function toggleDropdown() {
    const dropdown = document.getElementById('itemDropdown');
    const header = document.querySelector('.select-header');
    dropdown.classList.toggle('show');
    header.classList.toggle('active');
}

function selectItem(name, id, scale) {
    document.getElementById('selectedItem').textContent = `«${name}» (ID: ${id || 'Нет'})`;
    document.getElementById('itemId').value = id;
    toggleDropdown();
    
    // Автоматически обновляем текст предмета если он стандартный
    const itemText = document.getElementById('itemText');
    if (itemText.value.includes('Потёртая фотография')) {
        itemText.value = itemText.value.replace('Потёртая фотография', name);
        itemText.dispatchEvent(new Event('input'));
    }
}

// Закрытие выпадающего списка при клике вне его
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('itemDropdown');
    const header = document.querySelector('.select-header');
    
    if (dropdown && header && !e.target.closest('.custom-select') && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        header.classList.remove('active');
    }
});



function changeTheme(themeName) {
    // Удаляем предыдущие классы тем
    document.body.classList.remove(
        'cyan-theme', 'gray-theme', 'yellow-theme', 
        'mint-theme', 'red-theme', 'green-theme',
        'purple-theme', 'blue-theme'
    );
    
    // Добавляем новый класс темы
    document.body.classList.add(`${themeName}-theme`);
    
    // Обновляем favicon
    const favicon = document.getElementById('favicon');
    if (favicon) {
        favicon.href = `./assets/${themeName}.png`;
        // Принудительно обновляем favicon в браузере
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = `./assets/${themeName}.png`;
        newFavicon.id = 'favicon';
        newFavicon.type = 'image/x-icon';
        
        const oldFavicon = document.getElementById('favicon');
        if (oldFavicon) {
            document.head.removeChild(oldFavicon);
        }
        document.head.appendChild(newFavicon);
    }
    
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
    // Устанавливаем favicon до вызова changeTheme
    const favicon = document.getElementById('favicon');
    if (favicon) {
        favicon.href = `./assets/${savedTheme}.png`;
    }
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

// K-card codeeeeeeeeeeeeeee


function initKCardTab() {
    // Сохранение данных в localStorage
    const saveData = () => {
        const inputs = document.querySelectorAll('#tab-content input, #tab-content select');
        inputs.forEach(input => {
            if (input.type !== 'color') {
                localStorage.setItem(input.id, input.value);
            }
        });
    };

    // Загрузка данных из localStorage
const loadData = () => {
    const inputs = document.querySelectorAll('#tab-content input, #tab-content select');
    inputs.forEach(input => {
        if (input && input.type !== 'color') { // Добавлена проверка на input
            const savedValue = localStorage.getItem(input.id);
            if (savedValue !== null) {
                input.value = savedValue;
                // Триггерим событие change для цветов
                if (input.id.includes('hex-code')) {
                    const colorPickerId = input.id.replace('-hex-code', '-picker');
                    const picker = document.getElementById(colorPickerId);
                    if (picker) { // Добавлена проверка на существование picker
                        picker.value = savedValue;
                    }
                }
            }
        }
    });
    updateVisibility();
};
    // Генерация случайного серийного номера
    const generateSerialNumber = () => {
        return Math.floor(1000000000 + Math.random() * 9000000000).toString().slice(0, 10);
    };

    // Обновление видимости полей в зависимости от типа карты
    const updateVisibility = () => {
        const type = document.getElementById('keycard-type').value;
        const serialCircleRow = document.getElementById('serial-circle-row');
        const serialInput = document.getElementById('serial-number');
        
        if (type === 'обычная' || type === 'админская') {
            serialCircleRow.style.display = 'none';
        } else {
            serialCircleRow.style.display = 'flex';
            if (!serialInput.value) {
                serialInput.value = generateSerialNumber();
            }
        }

        // Автоматическая установка цветов по типу карты
        setDefaultColors(type);
    };

    // Установка цветов по умолчанию в зависимости от типа карты
    const setDefaultColors = (type) => {
        const colors = {
            'обычная': { circle: '#008000', border: '#008000', label: '#008000' },
            'админская': { circle: '#ff0000', border: '#ff0000', label: '#ff0000' },
            'оперативника': { circle: '#0000ff', border: '#0000ff', label: '#ffffff' },
            'металлическая': { circle: '#ffa500', border: '#ffa500', label: '#000000' }
        };

        if (colors[type]) {
            document.getElementById('circle-color-picker').value = colors[type].circle;
            document.getElementById('circle-hex-code').value = colors[type].circle;
            document.getElementById('border-color-picker').value = colors[type].border;
            document.getElementById('border-hex-code').value = colors[type].border;
            document.getElementById('label-color-picker').value = colors[type].label;
            document.getElementById('label-hex-code').value = colors[type].label;
        }
    };

    // Синхронизация цветовых полей
    const syncColorInputs = (pickerId, hexId) => {
        const picker = document.getElementById(pickerId);
        const hexInput = document.getElementById(hexId);

        // Установка начальных значений
        hexInput.value = picker.value;

        picker.addEventListener('input', () => {
            hexInput.value = picker.value;
        });

        hexInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/i.test(value)) {
                picker.value = value;
            }
        });
    };

    // Инициализация синхронизации для всех цветовых полей
    syncColorInputs('circle-color-picker', 'circle-hex-code');
    syncColorInputs('border-color-picker', 'border-hex-code');
    syncColorInputs('label-color-picker', 'label-hex-code');

    
    document.getElementById('keycard-type').addEventListener('change', updateVisibility);
    document.getElementById('serial-number').addEventListener('focus', function() {
        if (!this.value) {
            this.value = generateSerialNumber();
        }
    });

    // Генерация команды
    document.getElementById('btn-generate').addEventListener('click', () => {
        const type = document.getElementById('keycard-type').value;
        const idPlayer = document.getElementById('player-id').value.trim();
        const inventoryName = document.getElementById('inventory-name').value.trim().replace(/\s+/g, '_');
        const position = document.getElementById('position').value.trim().replace(/\s+/g, '_');
        const keycardName = document.getElementById('keycard-name').value.trim().replace(/\s+/g, '_');
        const scpAccess = document.getElementById('scp-access').value;
        const weaponAccess = document.getElementById('weapon-access').value;
        const adminAccess = document.getElementById('admin-access').value;
        const circleColor = document.getElementById('circle-hex-code').value.toUpperCase();
        const borderColor = document.getElementById('border-hex-code').value.toUpperCase();
        const labelColor = document.getElementById('label-hex-code').value.toUpperCase();
        const serialNumber = document.getElementById('serial-number').value.trim();
        const circleCount = document.getElementById('circle-count').value;

        // Валидация
        if (!idPlayer || !/^\d{1,5}$/.test(idPlayer)) {
            showToast('Введите корректный ID игрока (1-5 цифр)');
            return;
        }
        if (!inventoryName) {
            showToast('Введите название в инвентаре');
            return;
        }
        if (!keycardName) {
            showToast('Введите имя на ключ-карте');
            return;
        }

        let command = '';
        const circleCountMap = { '0': '0', '1': '3', '2': '2', '3': '1' };

        switch (type) {
            case 'обычная':
                command = `ckeycard ${idPlayer} KeycardCustomSite02 ${inventoryName} ${scpAccess} ${weaponAccess} ${adminAccess} ${circleColor} ${borderColor} ${position} ${labelColor} ${keycardName} 1`;
                break;
            case 'админская':
                command = `ckeycard ${idPlayer} keycardcustommanagement ${inventoryName} ${scpAccess} ${weaponAccess} ${adminAccess} ${circleColor} ${borderColor} ${position} ${labelColor} ${keycardName} 1`;
                break;
            case 'металлическая':
                if (!serialNumber) {
                    showToast('Введите серийный номер');
                    return;
                }
                command = `ckeycard ${idPlayer} KeycardCustomMetalCase ${inventoryName} ${scpAccess} ${weaponAccess} ${adminAccess} ${circleColor} ${borderColor} ${position} ${labelColor} ${keycardName} ${serialNumber}1`;
                break;
            case 'оперативника':
                if (!serialNumber) {
                    showToast('Введите серийный номер');
                    return;
                }
                command = `ckeycard ${idPlayer} keycardcustomtaskforce ${inventoryName} ${scpAccess} ${weaponAccess} ${adminAccess} ${circleColor} ${borderColor} ${keycardName} ${serialNumber} ${circleCountMap[circleCount] || '0'}`;
                break;
            default:
                command = 'Неизвестный тип ключ-карты';
        }

        document.getElementById('output-box').textContent = command;
        saveData();
    });

    // Копирование в буфер обмена
    document.getElementById('btn-copy').addEventListener('click', () => {
        const output = document.getElementById('output-box').textContent;
        if (!output) {
            showToast('Сначала сгенерируйте команду');
            return;
        }
        copyToClipboard(output);
    });

    // Загрузка сохраненных данных
    loadData();
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