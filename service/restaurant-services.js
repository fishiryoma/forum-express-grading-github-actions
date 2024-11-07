const { Restaurant, Category, User, Comment } = require("../models");
const { getOffset, getPagination } = require("../helpers/pagination-helper");

const restaurantServices = {
    getRestaurants: (req, cb) => {
        const DEFAULT_LIMIT = 9;
        const page = +req.query.page || 1;
        const limit = +req.query.limit || DEFAULT_LIMIT;
        const offset = getOffset(limit, page);
        const categoryId = +req.query.categoryId;

        return Promise.all([
            Restaurant.findAndCountAll({
                include: Category,
                where: categoryId ? { categoryId } : {},
                limit,
                offset,
                nest: true,
                raw: true,
            }),
            Category.findAll({ raw: true }),
        ])
            .then(([restaurants, categories]) => {
                const favoritedId = req.user?.FavoritedRestaurants
                    ? req.user.FavoritedRestaurants.map((fr) => fr.id)
                    : [];
                const isLiked = req.user?.LikedRestaurants
                    ? req.user.LikedRestaurants.map((fr) => fr.id)
                    : [];
                const data = restaurants.rows.map((r) => ({
                    ...r,
                    description: r.description.substring(0, 50),
                    isFavorited: req.user && favoritedId.includes(r.id),
                    isLiked: req.user && isLiked.includes(r.id),
                }));
                return cb(null, {
                    restaurants: data,
                    categories,
                    categoryId,
                    pagination: getPagination(limit, page, restaurants.count),
                });
            })
            .catch((err) => cb(err));
    },
};

module.exports = restaurantServices;
