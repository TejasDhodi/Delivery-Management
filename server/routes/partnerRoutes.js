const express = require('express');
const { registerPartner, getPartnerProfile, getPartners, updateStatus, getAvailablePartners, completeRegistration } = require('../controller/partnerController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/auth', registerPartner);

router.get('/profile', authMiddleware, getPartnerProfile);
router.get('/allPartners', getPartners);
router.get('/available', getAvailablePartners);

router.patch('/updateStatus', authMiddleware, updateStatus);
router.put('/completeRegistration', authMiddleware, completeRegistration);

module.exports = router;