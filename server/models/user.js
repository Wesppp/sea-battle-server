const {Schema, model} = require('mongoose')

const user = new Schema({
  nickname: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  gameHistories: {
    items: [
      {
        gameHistoryId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'GameHistory'
        }
      }
    ]
  }
})

user.methods.addGameHistory = function(gameHistory) {
  const items = [...this.gameHistories.items]
  items.push({
    gameHistoryId: gameHistory._id
  })

  this.gameHistories = {items}
  return this.save()
}

module.exports = model('User', user)