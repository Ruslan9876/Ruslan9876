// Получаем ссылки на элементы DOM
const chatForm = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt-input');
const chatMessages = document.getElementById('chat-messages');
const sendButton = chatForm.querySelector('button');

/**
 * Добавляет сообщение в окно чата.
 * @param {string} text - Текст сообщения.
 * @param {'user' | 'ai'} sender - Отправитель ('user' или 'ai').
 * @param {boolean} isLoading - Если true, показывает индикатор загрузки.
 * @returns {HTMLElement} - Элемент созданного сообщения.
 */
function addMessage(text, sender, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const iconDiv = document.createElement('div');
    iconDiv.className = 'message-icon';
    iconDiv.textContent = sender === 'user' ? '👤' : '🤖';

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';

    if (isLoading) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        textDiv.appendChild(spinner);
    } else {
        // Преобразуем текст, чтобы сохранить переносы строк
        textDiv.textContent = text;
    }

    messageDiv.appendChild(iconDiv);
    messageDiv.appendChild(textDiv);
    chatMessages.appendChild(messageDiv);

    // Автоматическая прокрутка вниз
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

/**
 * Обработчик отправки формы.
 * @param {Event} event - Событие отправки формы.
 */
async function handleFormSubmit(event) {
    event.preventDefault(); // Предотвращаем перезагрузку страницы

    const promptText = promptInput.value.trim();
    if (!promptText) return;

    // Блокируем форму на время запроса
    promptInput.value = '';
    promptInput.disabled = true;
    sendButton.disabled = true;

    // 1. Отображаем сообщение пользователя
    addMessage(promptText, 'user');

    // 2. Отображаем индикатор загрузки ответа AI
    const loadingMessage = addMessage('', 'ai', true);

    try {
        // 3. Отправляем запрос на наш API
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: promptText }),
        });

        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status}`);
        }

        const data = await response.json();

        // 4. Заменяем индикатор загрузки на реальный ответ
        const aiTextElement = loadingMessage.querySelector('.message-text');
        aiTextElement.innerHTML = ''; // Очищаем спиннер
        aiTextElement.textContent = data.response_text;

    } catch (error) {
        console.error('Ошибка при обращении к API:', error);
        const aiTextElement = loadingMessage.querySelector('.message-text');
        aiTextElement.innerHTML = '';
        aiTextElement.textContent = 'Произошла ошибка. Пожалуйста, попробуйте снова.';
    } finally {
        // 5. Разблокируем форму
        promptInput.disabled = false;
        sendButton.disabled = false;
        promptInput.focus();
    }
}

// Назначаем обработчик на форму
chatForm.addEventListener('submit', handleFormSubmit);

// Фокусируемся на поле ввода при загрузке страницы
promptInput.focus();
