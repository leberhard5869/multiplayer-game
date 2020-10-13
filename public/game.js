import Player from './Player.js';
import Collectible from './Collectible.js';

let player;
let collect;
let userArr = [];
let rankStr = "";
let speed = 20;
const margin = 20;
const playerWidth = 20;

// Canvas setup
const canvas1 = document.getElementById('score-window');
const ctx1 = canvas1.getContext('2d');
const canvas2 = document.getElementById('game-window');
const ctx2 = canvas2.getContext('2d');
const width = canvas2.width;
const height = canvas2.height;
const player_ava = new Image();
player_ava.src = "../assets/dizzy-solid.svg";
const opponent_ava = new Image();
opponent_ava.src = "../assets/dizzy-regular.svg";
const collect_ava = document.getElementById('collect');
const title = 'BEER QUEST';

// Canvas redraw (with movement smoothing)
let redraw = function(userArr, collect) {
  var smooth = 1;
  var smoothMove = setInterval(() => {
    if (smooth == 11) {
      clearInterval(smoothMove);
    } else {
      var xCoord, yCoord;
      ctx1.clearRect(0, 0, width, height);
      ctx1.font = '24px arial';
      const textMetrics = ctx1.measureText(title);
      ctx1.fillText(title, width / 2 - textMetrics.width / 2, 30);
      ctx1.font = '18px arial';
      ctx1.fillText('Score: ' + player.score, 50, 30);
      ctx1.fillText(rankStr, 500, 30);
      ctx2.clearRect(0, 0, width, height);
      ctx2.strokeStyle = 'green';
      ctx2.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);
      ctx2.drawImage(collect_ava, collect.x, collect.y, 20, 25);
      userArr.forEach((elm) => {
        xCoord = elm.oldx + elm.deltax / 10 * smooth;
        yCoord = elm.oldy + elm.deltay / 10 * smooth;
        //console.log(xCoord, yCoord);
        player.id == elm.id ? ctx2.drawImage(player_ava, xCoord, yCoord, playerWidth, playerWidth) : ctx2.drawImage(opponent_ava, xCoord, yCoord, playerWidth, playerWidth);
      });
    };
    smooth++;
  }, 10);       // 100 movements per second (2px every 10ms @ speed = 20)
};

// Handle player movement and collision
document.addEventListener('keydown', function(event) {
  let collision = false;

  if (event.defaultPrevented) {
    return;
  }
  switch (event.key) {
    case ('ArrowUp'):
    case ('w'):
      player.movePlayer("up", speed, width, height, margin, playerWidth);
      break;
    case ('ArrowDown'):
    case ('s'):
      player.movePlayer("down", speed, width, height, margin, playerWidth);
      break;
    case ('ArrowLeft'):
    case ('a'):
      player.movePlayer("left", speed, width, height, margin, playerWidth);
      break;
    case ('ArrowRight'):
    case ('d'):
      player.movePlayer("right", speed, width, height, margin, playerWidth);
      break;
    default:
      return;
  }
  event.preventDefault();

  collision = player.collision(collect);
  if (collision == true) { collect = new Collectible(width, height, margin, speed, socket.id) };

  emit(player, collect);

}, true);

// Set up socket
const socket = io();

// On connection, assign socket id to player and emit to server
socket.on('connect', () => {
  player = new Player(width, height, margin, speed, socket.id);
  collect = new Collectible(width, height, margin, speed, socket.id);
  emit(player, collect);
});

// On receiving player update, update user array and collectible and redraw
socket.on('player update', (data) => {
  userArr = data.userArr;
  collect = data.collect;
  rankStr = player.calculateRank(userArr);
  document.getElementById('num-users').innerHTML = userArr.length;
  redraw(userArr, collect);
});

// On player movement, emit info to server
function emit(player, collect) {
  socket.emit('player update', {
    player,
    collect
  });
};

window.onerror = function(msg, source, lineNo, columnNo, error) {
  socket.emit('client error', {
    msg,
    source,
    lineNo,
    columnNo,
    error
  });
  return false;
};
