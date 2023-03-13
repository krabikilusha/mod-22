const openStreetAPI = {
    baseURL: 'https://www.openstreetmap.org',
    getURL: function (lat, lon) {
        return `${ this.baseURL }/#map=18/${ lat }/${ lon }`
    }
}

const classNameSendMessage = 'chat-box__message--send';
const classNameInputMessage = 'chat-box__message--input';

// Для того, что бы работала данная ссылка необходимо поднять докер контейнер из дериктории server.
// И работать оно естественно будет только локально на машине.
const echoServerULR = 'ws://localhost:10000/';
const titleMessage = user => `<span class="chat-box__message-title">${ user }:</span><br />`;


const chatBox = document.querySelector('.chat-box');
const inputMessageBox = document.querySelector('.message-input');
const buttonMessageBox = document.querySelector('.message-button');
const errorMessage = document.querySelector('.error-message');

const buttonConnectServer = document.querySelector('.button-connect');
const buttonDisconnectServer = document.querySelector('.button-disconnect');
const buttonLocation = document.querySelector('.button-location');

let websocket;

// Вспомогательный метод для получения текстового контейнера.
const getMessageConteiner = (message, className) => {
    const result = document.createElement('p');
    result.classList.add(className);
    result.innerHTML = message;
    return result;
}

// Вспомогательный метод позволяющий запустить WebSocket с сервером.
const init = _ => {
    // Заглушка, что если у нас нет соединения. то создаем его.
    if (!websocket) {
        websocket = new WebSocket(echoServerULR);
        // Возможно есть фабрика использования сего чуда, но не разобрался пока.
        websocket.onopen = wsConnect;
        websocket.onclose = wsClose;
        websocket.onerror = wsError;
        websocket.onmessage = wsMessage;
    }
}

// Вспомогательный метод для обработки события подключения к WebSocket
const wsConnect = evt => {
    const systemMessage = getMessageConteiner('CONNECTED', 'system-message')
    chatBox.appendChild(systemMessage);
}
// Вспомогательный метод для обработки события отключения от WebSocket
const wsClose = evt => {
    const systemMessage = getMessageConteiner('DISCONNECTED', 'system-message')
    chatBox.appendChild(systemMessage);
};
// Вспомогательный метод для обработки ошибок связанных с WebSocket
const wsError = evt => {
    const systemMessage = getMessageConteiner('ERROR: ' + evt.data, 'system-message')
    chatBox.appendChild(systemMessage);
};
// Вспомогательный метод для обработки событий с поступающими сообщениями от WebSocket
const wsMessage = evt => {
    const serverMessage = evt.data;
    console.log(serverMessage);
    if (!serverMessage.includes(openStreetAPI.baseURL)) {
        var sendMessage = `${titleMessage('Сервер')}${ serverMessage }`;
        const systemMessage = getMessageConteiner(sendMessage, classNameInputMessage)
        // Иметируем процесс задержки ответа клиент-сервер.
        setTimeout(() => {
            chatBox.appendChild(systemMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1500);
    }
};


// Callback функция для отработки события нажатия на кнопку "Отправить сообщение".
const buttonSendMessageAction = _ => {
    const message = inputMessageBox.value;
    
    // Если пользователь не ввел сообщения и пытается отправить сообщение показываем сообщение об ошибке.
    // Если сообщение уже показано, и текст введен, то скрываем сообщение об ошибке.
    if (!errorMessage.classList.contains('opacity'))
        errorMessage.classList.add('opacity');
    if (message.length === 0) 
        errorMessage.classList.remove('opacity');

    else {
        inputMessageBox.value = '';
        var sendMessage = `${titleMessage('Пользователь')}${message}`;
        var sendMessageContainer = getMessageConteiner(sendMessage, classNameSendMessage);
        chatBox.appendChild(sendMessageContainer);

        chatBox.scrollTop = chatBox.scrollHeight;
        websocket.send(message);
    }
}

// Callback функция соединения с EchoServer
const buttonConnectEchoServer = _ => {
    if (!websocket) init();
    else {
        const systemMessage = getMessageConteiner('Вы уже подключенны к серверу.', 'system-message')
        chatBox.appendChild(systemMessage);
    }
}

// Callback функция для отключения связи с EchoServer
const buttonDisconnectEchoServer = _ => {
    if (websocket) {
        websocket.close(1000, 'работа с сервером завершена');
        websocket = null;
    }
    else {
        const systemMessage = getMessageConteiner('Вы уже отключенны от сервера.', 'system-message')
        chatBox.appendChild(systemMessage);
    }
}

// Callback функция для отправки сообщения со своей геолокацией
const buttonGeoLocationAction = _ => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(geolocationGetURL, geolocationError);
    } else {
        geolocationError()
    }
}

// Получаем текущие координаты и получаем сслку на ресурс
const geolocationGetURL = position => {
    const { latitude, longitude } = position.coords;

    const resultURI = openStreetAPI.getURL(latitude, longitude);
    const messageContainer = getMessageConteiner(`<a href="${resultURI} target="_blank">Гео-локация</a>`, classNameSendMessage);
    chatBox.appendChild(messageContainer);

    websocket.send(resultURI);
}

// Ошибка при получении геолокации в API браузера
const geolocationError = _ => {
    const systemMessage = getMessageConteiner('Для вашего браузера даная функция не доступна', 'system-message')
    chatBox.appendChild(systemMessage);
}


// При старте приложеня запуская инициализацию, с ней и WebSocket
document.addEventListener('DOMContentLoaded', init);

// Добавляем слушатель события нажатия на кнопку отправки сообщения.
buttonMessageBox.addEventListener('click', buttonSendMessageAction);

// Добавляем слушатель события нажатия на кнопку подключения к серверу.
buttonConnectServer.addEventListener('click', buttonConnectEchoServer);

// Добавляем слушатель события нажатия на кнопку отключения от сервера.
buttonDisconnectServer.addEventListener('click', buttonDisconnectEchoServer);

// Добавляем слушатель события нажатия на кнопку отправки координат.
buttonLocation.addEventListener('click', buttonGeoLocationAction);