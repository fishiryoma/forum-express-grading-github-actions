const { Restaurant, Category } = require("../models");
const { getOffset, getPagination } = require("../helpers/pagination-helper");

const restaurantController = {
    getRestaurants: (req, res) => {
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
        ]).then(([restaurants, categories]) => {
            const data = restaurants.rows.map((r) => ({
                ...r,
                description: r.description.substring(0, 50),
            }));
            return res.render("restaurants", {
                restaurants: data,
                categories,
                categoryId,
                pagination: getPagination(limit, page, restaurants.count),
            });
        });
    },

    getRestaurant: (req, res, next) => {
        const id = req.params.id;
        return Restaurant.findByPk(id, {
            include: Category,
            nest: true,
        })
            .then((restaurant) => {
                if (!restaurant) throw new Error("Restaurant is not exist!");
                console.log(restaurant);
                return restaurant.increment("view_counts", { by: 1 });
            })
            .then((restaurant) => {
                return res.render("restaurant", {
                    restaurant: restaurant.toJSON(),
                });
            })
            .catch((err) => next(err));
    },
    getDashboard: (req, res, next) => {
        const id = req.params.id;
        return Restaurant.findByPk(id, {
            include: Category,
            nest: true,
            raw: true,
        })
            .then((restaurant) => {
                return res.render("dashboard", {
                    restaurant,
                });
            })
            .catch((err) => next(err));
    },
};

module.exports = restaurantController;
