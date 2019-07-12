'use strict'

// =============================
// Конструктор менеджера погоды (управляющий компонент)
// =============================
function Weather(options) {
  let self = this;
  let root = options.widget;
  let dayFromTitle;
  let cards;
  let controlLeft;
  let controlRight;
  let cardsCount = options.cardsCount;

  function init() {
    if(!root) return;

    dayFromTitle = root.querySelector('span');
    cards = root.querySelectorAll('.weather-card');
    cards = [].map.call(cards, ((card)=>{return new WeatherCard({card: card})}));
    controlLeft = root.querySelector('.control-left');
    controlRight = root.querySelector('.control-right');
  }

  function initEvents() {
     controlLeft.onclick = (event) =>{self.getDays('left', cardsCount-1)};
     controlRight.onclick = (event) =>{self.getDays('right', cardsCount-1)};
  }

  // Получение погоды на текущий и следующие дни
  // direction:
  //    next (получить count дней, начиная со следующиего дня)
  //    prev (получить count дней, начиная с предыдущего дня)
  //    none (получить count дней, начиная с текущего дня)
  // count: количество запрашиваемых следующих дней
  this.getDays = function(direction, count) {
    direction = direction || 'none';
    count = count || (cardsCount-1);
    let callback = (response)=>{
      self.set(response);
    }
    sendRequest('/',
      {
        'direction': direction,
        'count': count,
      },
      callback);
  }

  // Ассинхронный POST запрос на получение данных
  // url: адрес запроса
  // jsonData: параметры, конкретизирущие запрашиваюмые данные
  // callback: действия, выполняемые при успешном получении данных
  function sendRequest(url, jsonData, callback){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.onreadystatechange = () =>{
      if (xhr.readyState != 4) return;
      if (xhr.status == 200) {
         callback(JSON.parse(xhr.responseText));
      }
    }
    xhr.send(JSON.stringify(jsonData));
  }

  this.set = function(data){

    if(data.days.length > 0){
      let currentDay = getInfoOfDay(data.days[0].date);
      dayFromTitle.textContent = 'Самара, ' + currentDay.dayNumber + ', ' + currentDay.dayOfWeak.toLowerCase();
    }
      cards.forEach((card, i)=>{
      card.set(data.days[i]);
    });
    if(!data.canLeft)
      controlLeft.classList.add('hide');
    else
      controlLeft.classList.remove('hide');
    if(!data.canRight)
      controlRight.classList.add('hide');
    else
      controlRight.classList.remove('hide');
  }

  init();
  initEvents();
  this.getDays();
}

// =============================
// Конструктор карточки погоды
// =============================
function WeatherCard(options){
  let self = this;
  let root = options.card;
  let dayOfWeak;
  let dayNumber;
  let weatherIcon;
  let dayTemp;
  let nightTemp;
  let precipitation;

  function init() {
    if(!root) return;
    dayOfWeak = root.querySelector('.weather-card_day-of-week');
    dayNumber = root.querySelector('.weather-card_day-number');
    weatherIcon = root.querySelector('.weather-icon');
    dayTemp = root.querySelector('.weather-card_day-temp');
    nightTemp = root.querySelector('.weather-card_night-temp');
    precipitation = root.querySelector('.weather-card_precipitation');
  }

  // Заполнить карточку данными о погоде
  this.set = function(data) {
    weatherIcon.classList.remove('weather-icon-clear');
    weatherIcon.classList.remove('weather-icon-snow');
    weatherIcon.classList.remove('weather-icon-rain');
    weatherIcon.classList.remove('weather-icon-cloudy');
    weatherIcon.classList.remove('weather-icon-rain-with-snow');
    weatherIcon.classList.remove('weather-icon-no-data');

    if(!data) {
      dayTemp.textContent = "Нет данных";
      dayOfWeak.textContent = "";
      dayNumber.textContent = "";
      nightTemp.textContent = "";
      precipitation.textContent = "";
      weatherIcon.classList.add('weather-icon-no-data');
      return;
    }

    if(!data.date){
      dayOfWeak.textContent = "нет данных";
      dayNumber.textContent = "нет данных";
    }
    else{
      let infoOfDay = getInfoOfDay(data.date);
      dayOfWeak.textContent = infoOfDay.dayOfWeak;
      dayNumber.textContent = infoOfDay.dayNumber;
    }

    dayTemp.textContent = "нет данных";
    nightTemp.textContent = "нет данных";
    precipitation.innerHTML = "нет данных";
    if(data.temperature && data.temperature.day !=undefined)
      dayTemp.textContent = "днем " + (data.temperature.day > 0? "+":"") + data.temperature.day + "°";
    if(data.temperature && data.temperature.night !=undefined)
      nightTemp.textContent = "ночью " + (data.temperature.night > 0? "+":"") + data.temperature.night + "°";
    if(data.cloudiness)
      precipitation.innerHTML = data.cloudiness;
    precipitation.innerHTML += ",<br>" + getPrecipitation(data).precipitation;
    weatherIcon.classList.add(getPrecipitation(data).iconClass);
  }

  // Получить название css-класса иконки погоды и описание осадков
  function getPrecipitation(weatherData) {
    let iconClass = "weather-icon-no-data";
    let precipitation = "нет данных";

    switch (weatherData.cloudiness) {
      case 'Ясно':
        precipitation = 'без осадков';
        iconClass = 'weather-icon-clear';
        break;
      case 'Облачно':
        if(weatherData.rain == true && weatherData.snow == true){
          precipitation = 'дождь со снегом';
          iconClass = 'weather-icon-rain-with-snow';
        }
        else if(weatherData.snow == true){
          precipitation = 'снег';
          iconClass = 'weather-icon-snow';
        }
        else if(weatherData.rain == true){
          precipitation = 'дождь';
          iconClass = 'weather-icon-rain';
        }
        else{
          precipitation = 'без осадков';
          iconClass = 'weather-icon-cloudy';
        }
        break;
      default:
        precipitation = "Нет данных";
    }

    return {
      iconClass: iconClass,
      precipitation: precipitation
    };
  }

  init();
}

// Получить название дня недели и название месяца
function getInfoOfDay(dateTime){
  let info = {};
  let date = new Date(dateTime);
  let now = new Date();
  let days = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];

  if(date.getFullYear() == now.getFullYear() &&
    date.getMonth() == now.getMonth() &&
    date.getDate() == now.getDate())
    info.dayOfWeak = "Сегодня";
  else
    info.dayOfWeak = days[date.getDay()];
  let monthName = date.toLocaleString('ru', { month: 'long' });
  monthName = monthName.substr(0, monthName.length-1) + 'я';
  info.dayNumber = date.getDate() + " " + monthName;

  return info;
}
