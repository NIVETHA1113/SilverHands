import Service from '../models/Service.js';
import { isDbConnected } from '../config/db.js';
import {
  buildListingQuery,
  buildSortOption,
  filterInMemoryListings,
  normalizePagination
} from '../services/discoveryService.js';

// Fallback in-memory map for demo mode if MongoDB is offline
export const inMemoryServices = new Map();

// @desc    Get all services (Public discovery or Provider filtered)
// @route   GET /api/services
// @access  Public / Provider
export const getServices = async (req, res) => {
  try {
    const {
      providerId,
      status = 'published',
      category,
      city,
      search,
      minPrice,
      maxPrice,
      deliveryMode,
      skills,
      availableDays,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const { pageNum, limitNum, skip } = normalizePagination(page, limit);

    if (isDbConnected) {
      // Build query using discovery service
      const query = buildListingQuery({
        status,
        category,
        city,
        minPrice,
        maxPrice,
        search,
        providerId,
        skills: skills ? (Array.isArray(skills) ? skills : [skills]) : null,
        deliveryMode,
        availabilityDays: availableDays ? (Array.isArray(availableDays) ? availableDays : [availableDays]) : null
      });

      // Build sort option
      const sortOption = buildSortOption(sort);

      // Execute query
      const total = await Service.countDocuments(query);
      const services = await Service.find(query)
        .populate('providerId', 'name profileImage age location rating verification skills languages bio')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

      return res.json({
        success: true,
        count: services.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        services
      });
    } else {
      // Fallback: in-memory filtering
      let list = Array.from(inMemoryServices.values());

      list = filterInMemoryListings(list, {
        status,
        category,
        city,
        minPrice,
        maxPrice,
        search,
        providerId,
        skills: skills ? (Array.isArray(skills) ? skills : [skills]) : null,
        deliveryMode,
        availabilityDays: availableDays ? (Array.isArray(availableDays) ? availableDays : [availableDays]) : null
      });

      // Sort
      if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const total = list.length;
      const paginated = list.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        services: paginated
      });
    }
  } catch (error) {
    console.error('[getServices Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single service by ID (with Provider populated)
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected) {
      const service = await Service.findById(id).populate(
        'providerId',
        'name profileImage age location rating verification skills languages bio experienceYears'
      );
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

// @desc    Patch service status
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
