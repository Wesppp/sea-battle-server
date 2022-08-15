const express = require("express");
const jsonParser = express.json();
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http, 
  { 
    withCredentials: true,
    cookie: true,
    cors: {
      origin: 'http://localhost:4200',
      methods: ["GET","POST"],
      credentials: true
    },
  }
)

const userController = require('./controllers/user-controller')
const GameManager = require('./classes/gameManager')
const gameManager = new GameManager()

const port = 3300;

const sessionMiddleware = session({
  secret : 'my_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {httpOnly: false}
})

app.set('trust proxy', 1);
app.use(sessionMiddleware);

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

app.post("/api/users/login", jsonParser, userController.login);
app.post("/api/users/registration", jsonParser, userController.registration);
app.get("/api/users/getGameHistory/:id", jsonParser, userController.getGameHistories);
app.get("/api/users/getGameHistoryChunk/:userId/:historyId", jsonParser, userController.getGameHistoriesChunk);

async function start() {
  try {
    await mongoose.connect('mongodb+srv://Misha:1234qwer@cluster0.8cynq.mongodb.net/sea-battle', {
      useNewUrlParser: true
    }).then(res => console.log('connect to DB'))

    app.use(cors())
    const server = http.listen(port, (error) => {
      if (error) return console.log(`Error: ${error}`);
      console.log(`Server listening on port ${server.address().port}`);
    });

  } catch(e) {
    console.log(e)
  }
}
start()

io.on('connection', (socket) => {
  gameManager.connection(socket)
  io.emit('playersCount', gameManager.playersOnline)

  socket.on('disconnect', () => {
    gameManager.disconnect(socket)
    io.emit('playersCount', gameManager.playersOnline)
  })
});