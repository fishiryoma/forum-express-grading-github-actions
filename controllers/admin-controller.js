const { Restaurant, User } = require('../models');
const { localFileHandler } = require('../helpers/file-helper');

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true,
    })
      .then((restaurants) => res.render('admin/restaurants', { restaurants }))
      .catch((err) => next(err));
  },
  createRestaurant: (req, res, next) => {
    return res.render('admin/create-restaurant');
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body;
    const { file } = req;
    if (!name) throw new Error('Restaurant name is required!');

    localFileHandler(file)
      .then((filePath) => {
        Restaurant.create({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null,
        });
      })
      .then(() => {
        req.flash('success_messages', '成功新增一間餐廳');
        res.redirect('/admin/restaurants');
      })
      .catch((err) => next(err));
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, { raw: true })
      .then((restaurant) => {
        if (!restaurant) {
          throw new Error('This Reataurant is not exist');
        }
        res.render('admin/restaurant', { restaurant });
      })
      .catch((err) => next(err));
  },
  editRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, { raw: true })
      .then((restaurant) => {
        if (!restaurant) {
          throw new Error('This Reataurant is not exist');
        }
        res.render('admin/edit-restaurant', { restaurant });
      })
      .catch((err) => next(err));
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body;
    const { file } = req;
    if (!name) throw new Error('Restaurant name is required!');

    Promise.all([Restaurant.findByPk(req.params.id), localFileHandler(file)])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error('No this restaurant');
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
        });
      })
      .then(() => {
        req.flash('success_messages', '成功編輯一間餐廳');
        res.redirect('/admin/restaurants');
      })
      .catch((err) => next(err));
  },
  deleteRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        if (!restaurant) throw new Error('No this restaurant');
        return restaurant.destroy();
      })
      .then(() => {
        req.flash('success_messages', '成功刪除一間餐廳');
        res.redirect('/admin/restaurants');
      })
      .catch((err) => next(err));
  },
  getUsers: (req, res, next) => {
    return User.findAll({ raw: true })
      .then((users) => res.render('admin/users', { users }))
      .catch((err) => next(err));
  },
  patchUser: (req, res, next) => {
    const id = req.params.id;
    return User.findByPk(id)
      .then((users) => {
        if (!users) throw new Error('No this user');
        if (users.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限');
          return res.redirect('back');
        }
        return users.update({ isAdmin: !users.isAdmin });
      })
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功');
        return res.redirect('/admin/users');
      })
      .catch((err) => next(err));
  },
};
module.exports = adminController;
