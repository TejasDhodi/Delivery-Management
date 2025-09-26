const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Partner = sequelize.define("Partner",{
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('available', 'unavailable', 'assigned'),
        defaultValue: 'available',
    },
    detailsFilled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
});

module.exports = Partner;