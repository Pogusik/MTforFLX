const contentDiv = document.getElementById('content');
const navButtons = document.querySelectorAll('nav button');

async function loadTab(tabName) {
    try {
        const response = await fetch(`tabs/${tabName}.html`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки вкладки: ${response.status}`);
        }
        const html = await response.text();
        contentDiv.innerHTML = html;
    } catch (error) {
        console.error('Ошибка загрузки вкладки:', error);
        contentDiv.innerHTML = `<p>Ошибка загрузки вкладки ${tabName}</p>`;
    }
}

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        loadTab(tabName);
    });
});

// Загрузка вкладки настроек по умолчанию (или любой другой)
loadTab('settings');

// Функция для проверки обновлений файлов и перезагрузки страницы
async function checkForUpdates() {
    try {
        const response = await fetch('index.html', { cache: 'no-cache' }); // Проверяем index.html
        if (!response.ok) {
            console.warn('Не удалось проверить обновление index.html');
            return;
        }
        const newContent = await response.text();
        
        // Сравнение текущего контента с новым (можно использовать hash, если контент большой)
        if (document.documentElement.outerHTML !== newContent) {
            console.log('Обновление обнаружено! Перезагрузка страницы...');
            location.reload();
        }
    } catch (error) {
        console.error('Ошибка при проверке обновлений:', error);
    }
}

// Запускаем проверку обновлений каждые 5 секунд (или другой интервал)
setInterval(checkForUpdates, 5000);