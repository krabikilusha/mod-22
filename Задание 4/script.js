// Вспомогательный объект для формирования URL
const url = {
    baseURL: 'https://api.ipgeolocation.io/timezone',
    apiKey: '32bcd4a6e4b548968e7afcdb682ac679',
    getURL: function (lat, lon) {
        return `${this.baseURL}?apiKey=${this.apiKey}&lat=${lat}&long=${lon}`;
    }
}

// Тупо константа для хранения об ошибке получения местоположения пользователя.
const geoPositionErrorMessage = 'Информация о местоположении недоступна';

const resultDiv = document.querySelector('.result');
const button = document.querySelector('button');

// Callback функция для обработки события нажатия кнопки.
const initAction = _ => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => uploadAndAppendTimezoneDataInView(position.coords), 
            appendErrorGeopositionInfo
        );
    } else {
        appendErrorGeopositionInfo();
    }
}

// Вспомогательный метод для получения текстового контейнера.
const getTextConteiner = message => {
    const result = document.createElement('p');
    result.innerHTML = message;
    return result;
}

// Callback функция для добаления сообщения об ошибки получения координат местоположения пользователя.
const appendErrorGeopositionInfo = _ => {
    const result = getTextConteiner(geoPositionErrorMessage);
    resultDiv.appendChild(result);
}

// Ассинхронный метод для получения данных о времени по координатам.
const uploadAndAppendTimezoneDataInView = async ({ latitude, longitude }) => {
    const data = await fetch(url.getURL(latitude, longitude))
        .then(res => res.json());

    const timezoneView = getTextConteiner(`Ваша временная зона: ${ data.timezone }`);
    const dateAndTimeView = getTextConteiner(`Ваше местное время: ${ data.date_time_txt }`);
    
    resultDiv.appendChild(timezoneView);
    resultDiv.appendChild(dateAndTimeView);
}


// Навешиваем событие на кнопку.
button.addEventListener('click', initAction);