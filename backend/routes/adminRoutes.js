const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/users', [verifyToken, isAdmin], adminController.createUser);
router.get('/pending-users', [verifyToken, isAdmin], adminController.getPendingUsers);
router.put('/approve-user/:userId', [verifyToken, isAdmin], adminController.approveUser);

module.exports = router;