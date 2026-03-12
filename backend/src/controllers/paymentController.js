const Payment = require('../models/Payment');
const Order = require('../models/Order');

class PaymentController {
  // Create payment
  static async createPayment(req, res) {
    try {
      const userId = req.user.id;
      const { orderId, amount, paymentMethod, transactionId } = req.body;

      // Verify order exists and belongs to user
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      if (order.user_id !== userId && req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const paymentData = {
        orderId,
        userId,
        amount,
        paymentMethod,
        transactionId
      };

      const paymentId = await Payment.create(paymentData);
      const payment = await Payment.findById(paymentId);

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: { payment }
      });

    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating payment'
      });
    }
  }

  // Get payment by ID
  static async getPayment(req, res) {
    try {
      const { id } = req.params;
      const payment = await Payment.findById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      // Check access
      if (payment.user_id !== req.user.id && req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: { payment }
      });

    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching payment'
      });
    }
  }

  // Get user payments
  static async getUserPayments(req, res) {
    try {
      const userId = req.user.id;
      const payments = await Payment.findByUserId(userId);

      res.json({
        success: true,
        data: { payments }
      });

    } catch (error) {
      console.error('Get user payments error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching payments'
      });
    }
  }

  // Get payments by order ID
  static async getOrderPayments(req, res) {
    try {
      const { orderId } = req.params;
      const payments = await Payment.findByOrderId(orderId);

      // Check if user has access to this order
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      if (order.user_id !== req.user.id && req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: { payments }
      });

    } catch (error) {
      console.error('Get order payments error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching payments'
      });
    }
  }

  // Update payment status (owner only)
  static async updatePaymentStatus(req, res) {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Owner only.'
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      const updated = await Payment.updateStatus(id, status);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      const payment = await Payment.findById(id);

      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: { payment }
      });

    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating payment status'
      });
    }
  }

  // Get payment statistics (owner only)
  static async getPaymentStats(req, res) {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Owner only.'
        });
      }

      const stats = await Payment.getStatistics();

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching payment statistics'
      });
    }
  }
}

module.exports = PaymentController;