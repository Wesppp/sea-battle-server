const {Schema, model} = require('mongoose')

const gameHistory = new Schema({
  playersNicknames: [{ type: String }],

  player1: {
    nickname: {
      type: String,
      required: true
    },
    actions: [{ type: String }]
  },

  player2: {
    nickname: {
      type: String,
      required: true
    },
    actions: [{ type: String }]
  }
})

gameHistory.methods.start = function() {
  this.player1.actions[0] = 'start'
  this.player2.actions[0] = 'start'

  return this.save()
}

gameHistory.methods.finish = function() {
  this.player1.actions.push('finish')
  this.player2.actions.push('finish')

  return this.save()
}

gameHistory.methods.giveup = function(action1, action2) {
  this.player1.actions.push(action1)
  this.player2.actions.push(action2)

  return this.save()
}

gameHistory.methods.result = function(result1, result2) {
  this.player1.actions.push(result1)
  this.player2.actions.push(result2)

  return this.save()
}

gameHistory.methods.addAction = function(action, playerNickname) {
  if (this.player1.nickname === playerNickname) {
    this.player1.actions.push(action)
  } else if (this.player2.nickname === playerNickname) {
    this.player2.actions.push(action)
  }

  return this.save()
}

module.exports = model('GameHistory', gameHistory)