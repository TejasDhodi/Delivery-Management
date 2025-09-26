const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Order = sequelize.define("Order", {
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  product: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pickupAddress: {
    type: DataTypes.JSON, 
    allowNull: false,
  },
  deliveryAddress: {
    type: DataTypes.JSON, 
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high"),
    defaultValue: "low",
  },
  status: {
    type: DataTypes.ENUM("pending", "in-transit", "assigned", "delivered"),
    defaultValue: "pending",
  },
  partner: {
    type: DataTypes.STRING,
    defaultValue: "unassigned",
  },
  partnerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  contactNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Order;
