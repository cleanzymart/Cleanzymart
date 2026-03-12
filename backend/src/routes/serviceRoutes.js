const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', ServiceController.getAllServices);
router.get('/:id', ServiceController.getService);
router.get('/category/:category', ServiceController.getServicesByCategory);

// Protected routes
router.use(authMiddleware.protect);

// Owner only routes
router.post('/', ServiceController.createService);
router.put('/:id', ServiceController.updateService);
router.delete('/:id', ServiceController.deleteService);
router.get('/stats/all', ServiceController.getServiceStats);

module.exports = router;