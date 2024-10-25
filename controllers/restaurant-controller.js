const { Restaurant, Category, User, Comment } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: (req, res) => {
    const DEFAULT_LIMIT = 9
    const page = +req.query.page || 1
    const limit = +req.query.limit || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    const categoryId = +req.query.categoryId

    return Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        where: categoryId ? { categoryId } : {},
        limit,
        offset,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ]).then(([restaurants, categories]) => {
      const favoritedId = req.user.FavoritedRestaurants.map(
        fr => fr.id
      )
      const isLiked = req.user.LikedRestaurants.map(fr => fr.id)
      const data = restaurants.rows.map(r => ({
        ...r,
        description: r.description.substring(0, 50),
        isFavorited: req.user && favoritedId.includes(r.id),
        isLiked: req.user && isLiked.includes(r.id)
      }))
      return res.render('restaurants', {
        restaurants: data,
        categories,
        categoryId,
        pagination: getPagination(limit, page, restaurants.count)
      })
    })
  },

  getRestaurant: (req, res, next) => {
    const id = req.params.id
    return Restaurant.findByPk(id, {
      include: [
        Category,
        {
          model: Comment,
          include: User
        },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ],
      nest: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant is not exist!')
        return restaurant.increment('view_counts', { by: 1 })
      })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(
          f => f.id === req.user.id
        )
        const isLiked = restaurant.LikedUsers.some(
          f => f.id === req.user.id
        )
        return res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    const id = req.params.id
    return Restaurant.findByPk(id, {
      include: Category,
      nest: true,
      raw: true
    })
      .then(restaurant => {
        return res.render('dashboard', {
          restaurant
        })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        return res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    const favoritedId = req.user.FavoritedRestaurants.map(f => f.id)
    Restaurant.findAll({
      limit: 10,
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        const result = restaurants
          .map(restaurant => {
            console.log(restaurant.toJSON())
            return {
              ...restaurant.toJSON(),
              isFavorited:
                                req.user && favoritedId.includes(restaurant.id),
              followerCount: restaurant.FavoritedUsers.length
            }
          })
          .sort((a, b) => b.followerCount - a.followerCount)
        return res.render('top-restaurants', { restaurants: result })
      })
      .catch(err => next(err))
  }
}

module.exports = restaurantController
