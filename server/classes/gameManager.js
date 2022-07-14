const Game = require("./game")
const Player = require("./player")
const { getRandomString } = require('../shared/additional')

module.exports = class GameManager {
  players = []
  games = []

  waitingRandomPlayers = []
  waitingChallenge = new Map

  connection(socket) {
      const player = new Player(socket)
      this.players.push(player)

    const isFree = () => {
      if (this.waitingRandomPlayers.includes(player)) { return false }

      const values = Array.from(this.waitingChallenge.values())
      if (values.includes(player)) { return false }

      if (player.game) { return false }

      return true
    }

    socket.on('shipSet', (playerData) => { 
      if (!isFree()) { return }

      player.nickname = playerData.nickname
      Object.assign(player.field, playerData.shipSet)
    })

    socket.on('findRandomOpponent', () => {
      if (!isFree()) { return }

      socket.emit('statusChange', 'finding')

      this.waitingRandomPlayers.push(player)

      if (this.waitingRandomPlayers.length >= 2) {
        const [player1, player2] = this.waitingRandomPlayers.splice(0, 2)
        const game = new Game(player1, player2)
        this.games.push(game)

        const unsubscribe = game.subscribe(() => {
          unsubscribe()

          this.removeGame(game)
        })
      }
    })

    socket.on('challengeOpponent', (key = '') => {
      if (!isFree()) { return }
        socket.emit('statusChange', 'finding')
        key = getRandomString(20)
        socket.emit('challengeOpponent', key)
  
        this.waitingChallenge.set(key, player)
    })

    socket.on('acceptingFightCall', (key = '') => {
      if (this.waitingChallenge.has(key)) {
        const opponent = this.waitingChallenge.get(key)
        this.waitingChallenge.delete(key)

        const game = new Game(opponent, player)

        this.games.push(game)
      } else {
        socket.emit('acceptingFightCall', false)
      }
    })

    socket.on('giveup', () => {
      if (player.game) {
        player.game.giveup(player)
      }
      
      if (this.waitingRandomPlayers.includes(player)) {
        const index = this.waitingRandomPlayers.indexOf(player)
        this.waitingRandomPlayers.splice(index, 1)
      }

      const values = Array.from(this.waitingChallenge.values())

      if (values.includes.player) {
        const i = values.indexOf(player)
        const keys = Array.from(this.waitingChallenge.keys())
        const key = keys[i]
        this.waitingChallenge.delete(key)
      }
    })

    socket.on('addShot', (shot) => {
      if (player.game) {
        player.game.addShot(shot)
      }
    })

    socket.on('message', (message) => {
      if (player.game) {
        player.game.sendMessage(message, player)
      }
    })
  }

  async disconnect(socket) {
    const player = this.players.find(player => player.socket === socket)
  
    if (!player) {
      return
    }

    if (player.game) {
      await player.game.gameHistory.addAction(player.nickname, 'disconnect')
      player.game.giveup(player)
    }

    if (this.waitingRandomPlayers.includes(player)) {
      const index = this.waitingRandomPlayers.indexOf(player)
      this.waitingRandomPlayers.splice(index, 1)
    }

    const values = Array.from(this.waitingChallenge.values())

    if (values.includes.player) {
      const i = values.indexOf(player)
      const keys = Array.from(this.waitingChallenge.keys())
      const key = keys[i]
      this.waitingChallenge.delete(key)
    }

    this.removePlayer(player)
  }  

  removeGame(game) {
    if (!this.games.includes(game)) { return false }

    const index = this.games.indexOf(game)
    this.games.splice(index, 1)
    
    return true
  }

  removePlayer(player) {
    if (!this.players.includes(player)) { return false }

    const index = this.players.indexOf(player)
    this.players.splice(index, 1)
    
    return true
  }
}