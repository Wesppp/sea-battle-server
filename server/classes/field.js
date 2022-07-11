const Cell = require('./cell')

module.exports = class Field {
  shots = []
  ships = []

  constructor() {
    const shots = []

    for (let i = 0; i < 10; i++) {
      shots[i] = []
      for (let j = 0; j < 10; j++) {
        shots[i][j] = new Cell(i, j)
      }
    }

    this.shots = shots
    this.ships = []
  }

  addShot(shot) {
    const cell = this.shots[shot.x][shot.y]

    if (cell.status === 0 || cell.status === 1) {
      cell.status = 3
      return 'miss'
    }

    if (cell.status === 2) {
      cell.status = 4
      cell.ship.hit++

      const dy = cell.ship.direction === 'row'
      const dx = cell.ship.direction === 'column'

      for (let i = 0; i < cell.ship.size; i++) {
        const cx = cell.ship.x + dx * i
        const cy = cell.ship.y + dy * i
        const ship = this.shots[cx][cy].ship 

        if (ship.hit === 0) {
          return 'hit'
        }
      }

      this.killShip(cell.ship)
      return 'kill'
    }
  }

  inField(x, y) {
    return 0 <= x && x < 10 && 0 <= y && y < 10
  }

  killShip(ship) {
    const dy = ship.direction === 'row'
    const dx = ship.direction === 'column'

    for (let x = ship.x - 1; x < ship.x + ship.size * dx + dy + 1; x++) {
      for (let y = ship.y - 1; y < ship.y + ship.size * dy + dx + 1; y++) {
        if (this.inField(x, y)) {
          this.shots[x][y].status = 3
        }
      }
    }

    for (let i = 0; i < ship.size; i++) {
      this.shots[ship.x + dx * i][ship.y + dy * i].status = 4
    }

    for (let i = 0; i < ship.size; i++) {
      const cx = ship.x + dx * i
      const cy = ship.y + dy * i
      this.shots[cx][cy].ship.killed = true
    }

    this.ships = this.ships.filter(s => {
      if (ship.x === s.x && ship.y === s.y) {
        s.killed = true
        return s
      }
      return s
    })
  }
}