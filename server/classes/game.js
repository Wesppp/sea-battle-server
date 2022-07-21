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
      player.socket.emit('statusChange', 'play')
    }

    this.gameHistory = new GameHistory({
      playersNicknames: [player1.nickname, player2.nickname],
      gameDate: new Date().toLocaleString(),
      actions: []
    })    
    this.gameHistory.start(player1.nickname, player2.nickname)

    this.turnPlayer = player1

    this.toggleTurn()
  }

  toggleTurn() {
    this.player1.socket.emit('turnUpdate', this.player1 === this.turnPlayer)
    this.player2.socket.emit('turnUpdate', this.player2 === this.turnPlayer)
  }

  async stop() {
    await this.gameHistory.save()
    await this.gameHistory.addHistiryToUsers(this.player1.nickname, this.player2.nickname)

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

    await this.gameHistory.giveup({player: player1.nickname, act: player === player1 ? 'giveup' : 'winner'},
      {player: player2.nickname, act: player === player2 ? 'giveup' : 'winner'})

    this.stop()
  }

  async addShot(shot) {
    const result = this.nextPlayer.field.addShot(shot)
    const {player1, player2} = this

    if (result) {
        player1.socket.emit('updateField', this.nextPlayer.field)
        player2.socket.emit('updateField', this.nextPlayer.field)

        if (result === 'hit') {
          await this.gameHistory.addAction(this.turnPlayer.nickname, 'hit')
        } else if (result === 'kill') {
          await this.gameHistory.addAction(this.turnPlayer.nickname, 'kill')
        }

      if (result === 'miss') {
        await this.gameHistory.addAction(this.turnPlayer.nickname, 'miss')
        this.turnPlayer = this.nextPlayer
        this.toggleTurn()
      }
    }

    if (player1.loser || player2.loser) {
      player1.socket.emit('statusChange', player1.loser ? 'loser' : 'winner')
      player2.socket.emit('statusChange', player2.loser ? 'loser' : 'winner')

      this.player1.socket.emit('showShips')
      this.player2.socket.emit('showShips')

      await this.gameHistory.finish({player: player1.nickname, act: player1.loser ? 'loser' : 'winner'},
      {player: player2.nickname, act: player2.loser ? 'loser' : 'winner'})

      this.stop()
    }
  }

  async sendMessage(message, player) {
    const {player1, player2} = this

    await this.gameHistory.addAction(player.nickname, `${message}(message)`)
    message = `${new Date().toLocaleTimeString()}: ${message}`

    player1.socket.emit('message', message)
    player2.socket.emit('message', message)
  }
}

module.exports = Game