const { Category } = require('../../models')

const categoryController = {
  getCategories: (req, res, next) => {
    Promise.all([
      Category.findAll({ raw: true }),
      req.params.id
        ? Category.findByPk(req.params.id, {
          raw: true
        })
        : null
    ])
      .then(([categories, category]) => {
        return res.render('admin/categories', { categories, category })
      })
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!!')
    Category.create({
      name
    })
      .then(() => {
        req.flash('success_messages', '成功新增一個分類')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },

  putCategory: (req, res, next) => {
    const { name } = req.body
    Category.findByPk(req.params.id, {
      raw: true
    })
      .then(category => {
        if (!category) {
          throw new Error('Not exsit')
        }
        return category.update({
          name
        })
      })
      .then(() => {
        req.flash('success_messages', '成功編輯一個分類')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  deleteCategory: (req, res, next) => {
    Category.findByPk(req.params.id)
      .then(category => {
        if (!category) {
          throw new Error('Not exsit')
        }
        return category.destroy()
      })
      .then(() => {
        req.flash('success_messages', '成功刪除一個分類')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  }
}

module.exports = categoryController
