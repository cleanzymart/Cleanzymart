const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Service = require('../models/Service');

class OrderController {
  // Create new order
  static async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const orderData = {
        userId,
        ...req.body
      };

      // Validate service exists
      const service = await Service.findById(orderData.serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      const orderId = await Order.create(orderData);
      const order = await Order.findById(orderId);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order }
      });

    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating order'
      });
    }
  }

  // Get order by ID
  static async getOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Check if user has access to this order
      if (req.user.role !== 'owner' && order.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Get tracking history
      const tracking = await Order.getTrackingHistory(id);

      res.json({
        success: true,
        data: { 
          order,
          tracking,
          payment: await Payment.findByOrderId(id)
        }
      });

    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching order'
      });
    }
  }

  // Get user orders
  static async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;

      const orders = await Order.findByUserId(userId);

      res.json({
        success: true,
        data: { 
          orders,
          count: orders.length
        }
      });

    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching orders'
      });
    }
  }

  // Get all orders (for owner)
  static async getAllOrders(req, res) {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Owner only.'
        });
      }

      const { status, userId, page = 1, limit = 20 } = req.query;

      const result = await Order.findAll({
        status,
        userId,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching orders'
      });
    }
  }

  // Update order status
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Owner only.'
        });
      }

      const updated = await Order.updateStatus(id, status, notes);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      const order = await Order.findById(id);

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { order }
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating order status'
      });
    }
  }

  // Delete order
  static async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user is owner or order belongs to user
      const order = await Order.findById(id);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      if (req.user.role !== 'owner' && order.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const deleted = await Order.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      res.json({
        success: true,
        message: 'Order deleted successfully'
      });

    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting order'
      });
    }
  }

  // Get order statistics
  static async getOrderStats(req, res) {
    try {
      let stats;
      
      if (req.user.role === 'owner') {
        stats = await Order.getDashboardStats();
      } else {
        stats = await Order.getStatistics(req.user.id);
      }

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching statistics'
      });
    }
  }

  // Get recent orders
  static async getRecentOrders(req, res) {
    try {
      let orders;
      
      if (req.user.role === 'owner') {
        orders = await Order.findRecent(10);
      } else {
        orders = await Order.findByUserId(req.user.id);
      }

      res.json({
        success: true,
        data: { orders }
      });

    } catch (error) {
      console.error('Get recent orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching recent orders'
      });
    }
  }
}

module.exports = OrderController;