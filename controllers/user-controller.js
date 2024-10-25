const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like, Followship } = db
const { localFileHandler } = require('../helpers/file-helper')

const userController = {
  signUpPage: (req, res) => res.render('signup'),
  signUp: (req, res, next) => {
    const { name, email, password, passwordCheck } = req.body
    if (password !== passwordCheck) { throw new Error('Password does not match!') }

    User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('Email already exist!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash =>
        User.create({
          name,
          email,
          password: hash
        })
      )
      .then(() => {
        req.flash('success_messages', '成功註冊帳號!')
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  singInPage: (req, res) => res.render('signin'),
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入!')
    res.redirect('/restaurants')
  },
  signOut: (req, res) => {
    req.flash('success_messages', '成功登出!')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    const id = req.params.id
    User.findByPk(id, {
      include: [{ model: Comment, include: [{ model: Restaurant }] }]
    })
      .then(user => {
        if (!user) throw new Error('Cant find user')
        console.log(user.toJSON())
        const data = user.toJSON()
        return res.render('user', {
          user: data,
          count: data.Comments.length
        })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    const id = req.params.id
    return User.findByPk(id, { raw: true })
      .then(user => {
        if (!user) throw new Error('Cant find user')
        return res.render('edit-user', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const id = req.params.id
    const { name } = req.body
    const { file } = req
    if (!name) throw new Error('Restaurant name is required!')

    Promise.all([User.findByPk(id), localFileHandler(file)])
      .then(([user, filePath]) => {
        if (!user) throw new Error('No this User')
        user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', '成功修改個人資料')
        res.redirect(`/users/${id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) { throw new Error('This restaurant is not exist') }
        if (favorite) { throw new Error('You already like this restaurant') }
        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error('Favorite does not exist')
        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  addLike: (req, res, next) => {
    const { restaurantId } = req.params
    Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) { throw new Error('This restaurant is not exist') }
        if (like) throw new Error('You already like this restaurant')
        return Like.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    const { restaurantId } = req.params
    return Like.findOne({
      where: {
        userId: req.user.id,
        restaurantId
      }
    })
      .then(like => {
        if (!like) throw new Error('Like does not exist')
        return like.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        const result = users
          .map(user => ({
            ...user.toJSON(),
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings.some(
              f => f.id === user.id
            )
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
        return res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    const { userId } = req.params
    Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error('User did not exist!')
        if (followship) throw new Error('You have already followed')
        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    const { userId } = req.params
    Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error('User did not exist!')
        if (!followship) { throw new Error("You haven't followed this user!") }
        return followship.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = userController
