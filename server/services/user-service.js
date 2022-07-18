const User = require('../models/user')
const jwt = require('jsonwebtoken');
const JWT_Secret = 'secret_key'

function mapUserItems(arr, field) {
  return arr.items.map(el => ({
      ...el[field]._doc
  }))
}

exports.login = async function (loginUser) {
  const existUser = await User.find({
    nickname: loginUser.nickname,
    password: loginUser.password
  });
  
  try {
    if (existUser.length) {
      let token = jwt.sign(existUser[0].toJSON(), JWT_Secret, {expiresIn: '1h'})
      return {signed_user: existUser[0], token: token}
    } else {
      throw new ReferenceError('There is no such user')
    }
  } catch (e) {
    throw e.message
  }

}

exports.registration = async function (newUser) {
  const repeatUser = await User.find({nickname: newUser.nickname});
  
  try {
    if (!repeatUser.length) {
      const user = new User({
        nickname: newUser.nickname,
        password: newUser.password,
        gameHistories: {items: []}
      })
      await user.save()
      return user
    } else {
      throw new SyntaxError('This nickname is already occupied')
    }
  } catch (e) {
    throw e.message
  }
}

exports.getGameHistories = async function(id) {
  const user = await User.findById(id)
    .populate('gameHistories.items.gameHistoryId')

  let gameHistories = mapUserItems(user.gameHistories, 'gameHistoryId')
  return gameHistories
}