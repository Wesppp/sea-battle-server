const {Schema, model} = require('mongoose')
const User = require('./user')

const gameHistory = new Schema({
  playersNicknames: [{ type: String }],
  gameDate: {
    type: String,
    required: true
  },
  actions: [ {type: Object} ]
})

gameHistory.methods.start = function(player1, player2) {
  this.actions[0] = {nickname: player1, action: 'start'}
  this.actions[1] = {nickname: player2, action: 'start'}
}

gameHistory.methods.giveup = function(action1, action2) {
  this.actions.push({nickname: action1.player, action: action1.act})
  this.actions.push({nickname: action2.player, action: action2.act})
}

gameHistory.methods.finish = function(result1, result2) {
  this.actions.push({nickname: result1.player, action: result1.act})
  this.actions.push({nickname: result2.player, action: result2.act})
}

gameHistory.methods.addAction = function(playerNickname, action) {
  this.actions.push({nickname: playerNickname, action: action})
}

gameHistory.methods.addHistiryToUsers = async function(nickname1, nickname2) {
  const user1 = await User.find({nickname: nickname1})
  const user2 = await User.find({nickname: nickname2})
  await user1[0].addGameHistory(this)
  await user2[0].addGameHistory(this)
}

module.exports = model('GameHistory', gameHistory)