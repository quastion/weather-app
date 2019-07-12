const fs = require('fs');

let data = JSON.parse(fs.readFileSync(__rootDir + "/data/weather.json"));
let index = 0;

// Поиск сегодняшнего дня в массиве дней
function init(){
  let found = false;
  let now = new Date();
  while( index < data.length && !found){
    let date = new Date(data[index].date);
    if(date.getFullYear() == now.getFullYear() &&
       date.getMonth() == now.getMonth() &&
       date.getDay() == now.getDay()){
      found = true;
    }
    else
      index++;
  }
  if(!found) index = 0;
}

module.exports.getData = function(request){
  let direction = request.direction;
  let count = request.count;
  let result = {};

  switch (direction) {
    case 'left':
      if(index > 0) index--;
      break;
    case 'right':
      if(index + count < data.length-1) index++;
      break;
    default:
      init();
  }

  result.canLeft = index-1 >= 0;
  result.canRight = index + count < data.length-1;
  if(data.length <= count){
      if(index!=0) result.days = data.slice(index, data.length);
      else result.days = data;
  }
  else if(index + count < data.length)
    result.days = data.slice(index, index + count+1);
  else
    result.days = data.slice(index, data.length-1);

  return result;
}
