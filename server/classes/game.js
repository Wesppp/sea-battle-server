const Observer = require('./observer')
const GameHistory = require('../models/game-history')

class Game extends Observer {
  player1 = null
  player2 = null

  turnPlayer = null
  gameHistory = null

  get nextPlayer() {
    return this.turnPlayer === this.player1 ? this.player2: this.player1
  }

  constructor(player1, player2) {
    super()
    Object.assign(this, {player1, player2})

    for (const player of [player1, player2]) {
      player.game = this
      player.status = 1
      player.socket.emit('statusChange', 'play')
    }

    this.gameHistory = new GameHistory({
      playersNicknames: [player1.nickname, player2.nickname],
      player1: {
        nickname: player1.nickname
      },
      player2: {
        nickname: player2.nickname
      }
    })    
    this.gameHistory.start()

    this.turnPlayer = player1

    this.toggleTurn()
  }

  toggleTurn() {
    this.player1.socket.emit('turnUpdate', this.player1 === this.turnPlayer)
    this.player2.socket.emit('turnUpdate', this.player2 === this.turnPlayer)
  }

  async stop() {
    await this.gameHistory.finish()
    this.dispatch()

    this.player1.game = null
    this.player2.game = null

    this.player1 = null
    this.player2 = null
  }

  async giveup(player) {
    const {player1, player2} = this

    player1.socket.emit('statusChange', player === player1 ? 'loser' : 'winner')
    player2.socket.emit('statusChange', player === player2 ? 'loser' : 'winner')

    await this.gameHistory.giveup(player === player1 ? 'giveup' : 'win', player === player2 ? 'giveup' : 'win')

    this.stop()
  }

  async addShot(shot) {
    const result = this.nextPlayer.field.addShot(shot)
    const {player1, player2} = this

    if (result) {
        player1.socket.emit('updateField', this.nextPlayer.field)
        player2.socket.emit('updateField', this.nextPlayer.field)

        if (result === 'hit') {
          await this.gameHistory.addAction('hit', this.turnPlayer.nickname)
        } else if (result === 'kill') {
          await this.gameHistory.addAction('kill', this.turnPlayer.nickname)
        }

      if (result === 'miss') {
        await this.gameHistory.addAction('miss', this.turnPlayer.nickname)
        this.turnPlayer = this.nextPlayer
        this.toggleTurn()
      }
    }

    if (player1.loser || player2.loser) {
      player1.socket.emit('statusChange', player1.loser ? 'loser' : 'winner')
      player2.socket.emit('statusChange', player2.loser ? 'loser' : 'winner')

      await this.gameHistory.result(player1.loser ? 'loser' : 'winner', player2.loser ? 'loser' : 'winner')

      player1.status = 0
      player2.status = 0

      this.stop()
    }
  }

  sendMessage(message, player) {
    const {player1, player2} = this

    message = `${new Date().toLocaleTimeString()}: ${message}`

    this.gameHistory.addAction('send message', player.nickname)

    player1.socket.emit('message', message)
    player2.socket.emit('message', message)
  }
}

module.exports = Game