const Field = require('./field')

module.exports = class Player {
  socket = null
  field = null
  shipsArray = []
  game = null
  nickname = null

  constructor(socket) {
    this.field = new Field()
    this.shipsArray = []
    this.socket = socket
  }

  resetField() {
    this.field = new Field()
    this.shipsArray = []
  }

  get ready() {
    return !this.game && this.socket
  }

  get loser() {
    for (const ship of this.field.ships) {
      if (!ship.killed) {
        return false
      }
    }
    return true
  }
}