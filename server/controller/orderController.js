const Order = require("../model/Order");
const Partner = require("../model/Partner");

const createOrder = async (req, res) => {
  try {
    const { customerName, product, pickupAddress, deliveryAddress, priority, contactNumber } = req.body;

    if (!customerName || !product || !pickupAddress || !deliveryAddress || !contactNumber) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newOrder = await Order.create({
      customerName,
      product,
      pickupAddress, 
      deliveryAddress,
      priority,
      contactNumber
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [["createdAt", "DESC"]] });
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();
    if(status === "delivered" && order.partnerId){
      const partner = await Partner.findByPk(order.partnerId);
      if(partner){
        partner.status = "available";
        await partner.save();
      }
    }
    return res
      .status(200)
      .json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const assignOrderToPartner = async (req, res) => {
  try {
    const { orderId, partnerName, partnerId } = req.body;

    const order = await Order.findByPk(orderId);
    const partner = await Partner.findByPk(partnerId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (!partner) {
      return res
        .status(404)
        .json({ success: false, message: "Partner not found" });
    }

    order.partner = partnerName;
    order.partnerId = partnerId;
    order.status = "assigned";
    partner.status = "assigned";
    
    await order.save();
    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Order assigned to partner",
      data: order,
    });
  } catch (error) {
    console.error("Assign Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getPartnersPendingOrders = async (req, res) => {
  try {
    const {id} = req.user;
    console.log(id);
    const orders = await Order.findAll({ where: { partnerId: id} });

    return res.status(200).json({
      success: true,
      message: "Partner Orders Fetch",
      data: orders

    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  assignOrderToPartner,
  getPartnersPendingOrders
};
