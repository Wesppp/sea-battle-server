module.exports = class Cell {
  x = null
  y = null
  status = null
  ship = null

  constructor(x, y) {
    this.x = x
    this.y = y
    this.status = 'free'
  }
}