const express = require("express");
const jsonParser = express.json();
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ["GET","POST"]
  }
})

const GameManager = require('./classes/gameManager')
const gameManager = new GameManager()

const port = 3300;

const sessionMiddleware = session({
  secret : 's3Cur3',
  name : 'sessionId',
})

app.set('trust proxy', 1)
app.use(sessionMiddleware);

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
  io.emit('playersCount', io.engine.clientsCount)

  socket.on('disconnect', () => {
    gameManager.disconnect(socket)
    io.emit('playersCount', io.engine.clientsCount)
  })
});