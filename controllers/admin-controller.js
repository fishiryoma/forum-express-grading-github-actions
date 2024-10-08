const { Restaurant } = require('../models')

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true
    })
      .then((restaurants) => res.render('admin/restaurants', { restaurants }))
      .catch((err) => next(err))
  },
  createRestaurant: (req, res, next) => {
    return res.render('admin/create-restaurant')
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    Restaurant.create({
      name,
      tel,
      address,
      openingHours,
      description
    })
      .then(() => {
        req.flash('success_messages', '成功新增一間餐廳')
        res.redirect('/admin/restaurants')
      })
      .catch((err) => next(err))
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, { raw: true })
      .then((restaurant) => {
        if (!restaurant) throw new Error('This Reataurant is not exist')
        res.render('admin/restaurant', { restaurant })
      })
      .catch((err) => next(err))
  },
  editRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, { raw: true })
      .then((restaurant) => {
        if (!restaurant) throw new Error('This Reataurant is not exist')
        res.render('admin/edit-restaurant', { restaurant })
      })
      .catch((err) => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        if (!restaurant) throw new Error('No this restaurant')
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description
        })
      })
      .then(() => {
        req.flash('success_messages', '成功編輯一間餐廳')
        res.redirect('/admin/restaurants')
      })
      .catch((err) => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        if (!restaurant) throw new Error('No this restaurant')
        return restaurant.destroy()
      })
      .then(() => {
        req.flash('success_messages', '成功刪除一間餐廳')
        res.redirect('/admin/restaurants')
      })
      .catch((err) => next(err))
  }
}

module.exports = adminController
