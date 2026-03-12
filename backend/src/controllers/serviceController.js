const Service = require('../models/Service');

class ServiceController {
  // Get all services
  static async getAllServices(req, res) {
    try {
      const services = await Service.findAll(true);

      res.json({
        success: true,
        data: { services }
      });

    } catch (error) {
      console.error('Get services error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching services'
      });
    }
  }

  // Get service by ID
  static async getService(req, res) {
    try {
      const { id } = req.params;
      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      res.json({
        success: true,
        data: { service }
      });

    } catch (error) {
      console.error('Get service error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching service'
      });
    }
  }

  // Get services by category
  static async getServicesByCategory(req, res) {
    try {
      const { category } = req.params;
      const services = await Service.findByCategory(category);

      res.json({
        success: true,
        data: { services }
      });

    } catch (error) {
      console.error('Get services by category error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching services'
      });
    }
  }

  // Create service (owner only)
  static async createService(req, res) {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Owner only.'
        });
      }

      const serviceId = await Service.create(req.body);
      const service = await Service.findById(serviceId);

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: { service }
      });

    } catch (error) {
      console.error('Create service error:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating service'
      });
    }
  }

  // Update service (owner only)
  static async updateService(req, res) {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Owner only.'
        });
      }

      const { id } = req.params;
      const updated = await Service.update(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      const service = await Service.findById(id);

      res.json({
        success: true,
        message: 'Service updated successfully',
        data: { service }
      });

    } catch (error) {
      console.error('Update service error:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating service'
      });
    }
  }

  // Delete service (owner only)
  static async deleteService(req, res) {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Owner only.'
        });
      }

      const { id } = req.params;
      const deleted = await Service.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      res.json({
        success: true,
        message: 'Service deleted successfully'
      });

    } catch (error) {
      console.error('Delete service error:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting service'
      });
    }
  }

  // Get service statistics (owner only)
  static async getServiceStats(req, res) {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Owner only.'
        });
      }

      const stats = await Service.getStatistics();

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Get service stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching service statistics'
      });
    }
  }
}

module.exports = ServiceController;