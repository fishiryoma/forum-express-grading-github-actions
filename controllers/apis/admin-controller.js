const adminService = require("../../service/admin-service");

const adminController = {
    getRestaurants: (req, res, next) => {
        adminService.getRestaurants(req, (err, data) =>
            err ? next(err) : res.json({ status: "success", data })
        );
    },
    createRestaurant: (req, res, next) => {
        adminService.createRestaurant(req, (err, data) =>
            err ? next(err) : res.json({ status: "success", data })
        );
    },
    postRestaurant: (req, res, next) => {
        adminService.postRestaurant(req, (err, data) =>
            err ? next(err) : res.json({ status: "success", data })
        );
    },
    getRestaurant: (req, res, next) => {
        adminService.getRestaurant(req, (err, data) =>
            err ? next(err) : res.json({ status: "success", data })
        );
    },
    editRestaurant: (req, res, next) => {
        adminService.editRestaurant(req, (err, data) =>
            err ? next(err) : res.json({ status: "success", data })
        );
    },
    putRestaurant: (req, res, next) => {
        adminService.putRestaurant(req, res, next);
    },
    deleteRestaurant: (req, res, next) => {
        adminService.deleteRestaurant(req, (err, data) =>
            err
                ? next(err)
                : res.json({
                      status: "success",
                      data,
                  })
        );
    },
    getUsers: (req, res, next) => {
        adminService.getUsers(req, (err, data) =>
            err
                ? next(err)
                : res.json({
                      status: "success",
                      data,
                  })
        );
    },
    patchUser: (req, res, next) => {
        adminService.patchUser(req, res, next);
    },
};
module.exports = adminController;
