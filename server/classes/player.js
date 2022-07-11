const Field = require('./field')

module.exports = class Player {
  socket = null
  status = null
  field = null
  shipsArray = []
  game = null
  nickname = null

  constructor(socket) {
    this.field = new Field()
    this.shipsArray = []
    this.socket = socket
    this.status = 0
  }

  resetField() {
    this.field = new Field()
    this.shipsArray = []
    this.status = 0
  }

  get ready() {
    return this.status === 2 && !this.game && this.socket
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