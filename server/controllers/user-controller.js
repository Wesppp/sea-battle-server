const userService = require('../services/user-service')

exports.login = async function(req, res) {  
  try {
    const userJWT = await userService.login(req.body)
    res.send(userJWT)
  } catch(e) {
    res.send(e)
  }
}

exports.registration = async function(req, res) {
  try {
      const user = await userService.registration(req.body)
      res.send(user)
  } catch(e) {
      console.log(e)
      res.send(e)
  }
}

exports.getGameHistories = async function(req, res) {
  try {
      const gameHistories = await userService.getGameHistories(req.params.id)
      res.send(gameHistories)
  } catch(e) {
      console.log(e)
      res.send(e)
  }
}

exports.getGameHistoriesChunk = async function(req, res) {
  try {
    const gameHistoriesChunk = await userService.getGameHistoriesChunk(req.params.userId, req.params.historyId)
    res.send(gameHistoriesChunk)
  } catch(e) {
    console.log(e);
    res.send(e)
  }
}