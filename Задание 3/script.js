// Тупо константа для хранения об ошибке получения местоположения пользователя.
const geoPositionErrorMessage = 'Информация о местоположении недоступна';

// Получаем доступ к результативному контейнеру и кнопочке на страничке.
const resultDiv = document.querySelector('.result');
const button = document.querySelector('button');

// Callback функция записывающая результат в результирующий контейнер.
const appendResultMessage = _ => {
    resultDiv.appendChild(getWindowSizeView());
    getClientPositionView();
}

// Вспомогательный метод для получения текстового контейнера.
const getTextConteiner = message => {
    const result = document.createElement('p');
    result.classList.add('important-message');
    result.innerHTML = message;
    return result;
}

// Метод для получения представления с информацие о размерах экрана
const getWindowSizeView = _ => {
    const { width, height } = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
    };
    // TODO тут различные действия, если надо...
    return getTextConteiner(`Ваши размеры экрана: ${width}x${height}`);
}

// Метод для получения представления с информацие о позиции пользователя.
const getClientPositionView = _ => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(appendCurrentGeopositionInfo, appendErrorGeopositionInfo);
    } else {
        appendErrorGeopositionInfo();
    }
}

// Callback функция для полложительного сценария выполнения получения координат местоположения пользователя.
const appendCurrentGeopositionInfo = position => {
    const { coords } = position;
    const result = getTextConteiner(`Ваши координаты: ${coords.latitude}:${coords.longitude}`);
    resultDiv.appendChild(result);
}

// Callback функция для добаления сообщения об ошибки получения координат местоположения пользователя.
const appendErrorGeopositionInfo = _ => {
    const result = getTextConteiner(geoPositionErrorMessage);
    resultDiv.appendChild(result);
}


// навешиваем событие на кнопочку.
button.addEventListener('click', appendResultMessage);