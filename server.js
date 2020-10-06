require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require('helmet');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
//app.use(helmet.noCache());

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Set up server and tests
const portNum = process.env.PORT || 3000;
const server = http.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// Set up socket
var userArr = [];
var collect = null;
var foundIndex;

// On new user connection, emit new count and user array to all users
io.on('connection', (socket) => {
  console.log('A user has connected');
  socket.on('error', (error) => {
    console.log(error);
  });
  
  // On receiving updated player info object from a user, update user array
  socket.on('player update', (data) => {
    foundIndex = userArr.findIndex(elm => elm.id == data.player.id);
    if (foundIndex == -1) { 
      userArr.push(data.player);
    } else {
      userArr[foundIndex].x = data.player.x;
      userArr[foundIndex].y = data.player.y;
      userArr[foundIndex].score = data.player.score;
    };
    if (collect == null || collect.x != data.collect.x || collect.y != data.collect.y) { collect = data.collect };
    console.log(userArr, collect);
  });

  // Emit updated user array every 0.1 seconds
  var updateEmit = setInterval(() => {
    userArr.forEach((elm) => {
      elm.deltax = elm.x - elm.oldx;
      elm.deltay = elm.y - elm.oldy;
    });
    io.emit('player update', {
      userArr,
      collect
    });
    userArr.forEach((elm) => {
      elm.oldx = elm.x;
      elm.oldy = elm.y;
    });
  }, 100);

  // On user disconnect, emit new count to all users
  socket.on('disconnect', () => {
    console.log('A user has disconnected');
    foundIndex = userArr.findIndex(x => x.id == socket.id);
    userArr.splice(foundIndex, 1);
    console.log(userArr, collect);
    if (userArr.length == 0) clearInterval(updateEmit);
  });

});

module.exports = app; // For testing
