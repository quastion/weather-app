const express = require('express');
const path = require('path');
global.__rootDir = path.resolve(__dirname);

const dataService = require('./modules/data-service');
const app = express();

app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + '/public'));
app.use(express.json());

app.get('/', (req, res)=>{
  res.render('index.ejs');
});

app.post('/', (req, res)=>{
  let data = dataService.getData(req.body);
  res.send(data);
});

app.listen(3000);
