import Service from '../models/Service.js';
import { isDbConnected } from '../config/db.js';

// Fallback in-memory map for demo mode if MongoDB is offline
export const inMemoryServices = new Map();

// @desc    Get all services (Public or Provider filtered)
// @route   GET /api/services
// @access  Public / Provider
export const getServices = async (req, res) => {
  try {
    const { providerId, status, category, city } = req.query;

    if (isDbConnected) {
      const query = {};
      if (providerId) query.providerId = providerId;
      if (status) query.status = status;
      if (category) query.category = category;
      if (city) query['location.city'] = new RegExp(city, 'i');

      const services = await Service.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: services.length, services });
    } else {
      let list = Array.from(inMemoryServices.values());
      if (providerId) list = list.filter(s => s.providerId === providerId);
      if (status) list = list.filter(s => s.status === status);
      if (category) list = list.filter(s => s.category === category);
      if (city) list = list.filter(s => s.location?.city?.toLowerCase().includes(city.toLowerCase()));
      return res.json({ success: true, count: list.length, services: list });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected) {
      const service = await Service.findById(id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      return res.json({ success: true, service });
    } else {
      const service = inMemoryServices.get(id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      return res.json({ success: true, service });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new service listing
// @route   POST /api/services
// @access  Private (Provider only)
export const createService = async (req, res) => {
  try {
    const providerId = req.user._id ? req.user._id.toString() : req.user.id;
    const { title, description, category, skills, price, priceType, location, availability, deliveryMode, images, status } = req.body;

    if (!title || !description || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and price.'
      });
    }

    const newServiceData = {
      providerId,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      skills: skills || [],
      price: Number(price),
      priceType: priceType || 'Per Item',
      location: location || { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      availability: availability || { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], timePreferences: ['Flexible'] },
      deliveryMode: deliveryMode || ['Home Based'],
      images: images || ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600'],
      status: status || 'published'
    };

    if (isDbConnected) {
      const service = await Service.create(newServiceData);
      return res.status(201).json({
        success: true,
        message: 'Service created successfully!',
        service
      });
    } else {
      const fakeId = 'service_' + Date.now();
      const service = { _id: fakeId, ...newServiceData, createdAt: new Date().toISOString() };
      inMemoryServices.set(fakeId, service);
      return res.status(201).json({
        success: true,
        message: 'Service created successfully (Demo Mode)!',
        service
      });
    }
  } catch (error) {
    console.error('[Create Service Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating service.' });
  }
};

// @desc    Update service details
// @route   PUT /api/services/:id
// @access  Private (Owner Provider only)
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user._id ? req.user._id.toString() : req.user.id;

    if (isDbConnected) {
      const service = await Service.findById(id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

      // Ownership authorization check
      if (service.providerId.toString() !== providerId) {
        return res.status(403).json({ success: false, message: 'Forbidden. You do not own this service listing.' });
      }

      Object.assign(service, req.body);
      await service.save();

      return res.json({ success: true, message: 'Service updated successfully!', service });
    } else {
      const service = inMemoryServices.get(id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      if (service.providerId !== providerId) {
        return res.status(403).json({ success: false, message: 'Forbidden. You do not own this service.' });
      }
      const updated = { ...service, ...req.body, updatedAt: new Date().toISOString() };
      inMemoryServices.set(id, updated);
      return res.json({ success: true, message: 'Service updated (Demo Mode)!', service: updated });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Patch service status (published / paused / draft)
// @route   PATCH /api/services/:id/status
// @access  Private (Owner Provider only)
export const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const providerId = req.user._id ? req.user._id.toString() : req.user.id;

    if (!['draft', 'published', 'paused'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    if (isDbConnected) {
      const service = await Service.findById(id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      if (service.providerId.toString() !== providerId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      service.status = status;
      await service.save();
      return res.json({ success: true, message: `Service ${status} successfully!`, service });
    } else {
      const service = inMemoryServices.get(id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      if (service.providerId !== providerId) return res.status(403).json({ success: false, message: 'Forbidden' });
      service.status = status;
      inMemoryServices.set(id, service);
      return res.json({ success: true, message: `Service ${status} (Demo Mode)!`, service });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Owner Provider only)
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user._id ? req.user._id.toString() : req.user.id;

    if (isDbConnected) {
      const service = await Service.findById(id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      if (service.providerId.toString() !== providerId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      await Service.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Service deleted successfully.' });
    } else {
      const service = inMemoryServices.get(id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      if (service.providerId !== providerId) return res.status(403).json({ success: false, message: 'Forbidden' });
      inMemoryServices.delete(id);
      return res.json({ success: true, message: 'Service deleted successfully (Demo Mode).' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
