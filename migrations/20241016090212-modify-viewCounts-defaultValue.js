"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("Restaurants", "view_counts", {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn("Restaurants", "view_counts", {
            type: Sequelize.INTEGER,
        });
    },
};
