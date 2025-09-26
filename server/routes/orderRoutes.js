const express = require("express");
const { createOrder, getOrders, updateOrderStatus, assignOrderToPartner, getPartnersPendingOrders } = require("../controller/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", createOrder);

router.get("/", getOrders);
router.get("/pendingOrdersPartner", authMiddleware, getPartnersPendingOrders);

router.patch("/:id/status", authMiddleware, updateOrderStatus);
router.patch("/assignPartner", assignOrderToPartner);

module.exports = router;
