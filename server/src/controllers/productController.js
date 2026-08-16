import Product from '../models/Product.js';
import { isDbConnected } from '../config/db.js';
import {
  buildListingQuery,
  buildSortOption,
  filterInMemoryListings,
  normalizePagination
} from '../services/discoveryService.js';
import { calculateDistance } from '../utils/haversine.js';

// Fallback in-memory map for demo mode if MongoDB is offline
export const inMemoryProducts = new Map();

// @desc    Get all products (Public discovery or Provider filtered)
// @route   GET /api/products
// @access  Public / Provider
export const getProducts = async (req, res) => {
  try {
    const {
      providerId,
      status = 'published',
      category,
      city,
      search,
      minPrice,
      maxPrice,
      deliveryOption,
      sort = 'newest',
      userLat,
      userLon,
      maxDistance,
      page = 1,
      limit = 20
    } = req.query;

    const { pageNum, limitNum, skip } = normalizePagination(page, limit);
    const parsedUserLat = Number(userLat);
    const parsedUserLon = Number(userLon);
    const parsedMaxDistance = Number(maxDistance);
    const hasValidCoordinates = Number.isFinite(parsedUserLat) && Number.isFinite(parsedUserLon);

    const attachDistance = (item) => {
      if (!hasValidCoordinates) return item;

      const itemLocation = item?.location || {};
      const itemLat = Number(itemLocation.latitude ?? itemLocation.lat);
      const itemLon = Number(itemLocation.longitude ?? itemLocation.lon);

      if (!Number.isFinite(itemLat) || !Number.isFinite(itemLon)) return item;

      const distance = calculateDistance(parsedUserLat, parsedUserLon, itemLat, itemLon);
      if (distance == null) return item;

      return { ...item, distance };
    };

    if (isDbConnected) {
      const query = buildListingQuery({
        status: ['published', 'out_of_stock'],
        category,
        city,
        minPrice,
        maxPrice,
        search,
        providerId,
        deliveryMode: deliveryOption
      });

      const sortOption = buildSortOption(sort);

      let products = await Product.find(query)
        .populate('providerId', 'name profileImage age location rating verification skills languages bio')
        .sort(sortOption)
        .lean();

      const productsWithDistance = products.map(attachDistance);
      let filteredProducts = productsWithDistance;

      if (hasValidCoordinates && Number.isFinite(parsedMaxDistance)) {
        filteredProducts = filteredProducts.filter(item => Number.isFinite(item.distance) && item.distance <= parsedMaxDistance);
      }

      if (sort === 'distance_asc' && hasValidCoordinates) {
        filteredProducts.sort((a, b) => (a.distance ?? Number.MAX_SAFE_INTEGER) - (b.distance ?? Number.MAX_SAFE_INTEGER));
      }

      const total = filteredProducts.length;
      const paginated = filteredProducts.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        products: paginated
      });
    } else {
      let list = Array.from(inMemoryProducts.values());

      list = filterInMemoryListings(list, {
        status: ['published', 'out_of_stock'],
        category,
        city,
        minPrice,
        maxPrice,
        search,
        providerId,
        deliveryMode: deliveryOption
      });

      const enriched = list.map(attachDistance);
      let sortedList = [...enriched];

      if (sort === 'distance_asc' && hasValidCoordinates) {
        sortedList.sort((a, b) => (a.distance ?? Number.MAX_SAFE_INTEGER) - (b.distance ?? Number.MAX_SAFE_INTEGER));
      } else if (sort === 'price_asc') {
        sortedList.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        sortedList.sort((a, b) => b.price - a.price);
      } else {
        sortedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      if (hasValidCoordinates && Number.isFinite(parsedMaxDistance)) {
        sortedList = sortedList.filter(item => Number.isFinite(item.distance) && item.distance <= parsedMaxDistance);
      }

      const total = sortedList.length;
      const paginated = sortedList.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        products: paginated
      });
    }
  } catch (error) {
    console.error('[getProducts Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single product by ID (with Provider populated)
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected) {
      const product = await Product.findById(id).populate(
        'providerId',
        'name profileImage age location rating verification skills languages bio'
      );
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product });
    } else {
      const product = inMemoryProducts.get(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product listing
// @route   POST /api/products
// @access  Private (Provider only)
export const createProduct = async (req, res) => {
  try {
    const providerId = req.user._id ? req.user._id.toString() : req.user.id;
    const { name, description, category, price, quantity, unit, images, location, deliveryOptions, status } = req.body;

    if (!name || !description || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name, description, category, price, and quantity.'
      });
    }

    const qty = Math.max(0, Number(quantity));
    let initialStatus = status || 'published';
    if (qty === 0) initialStatus = 'out_of_stock';

    const newProductData = {
      providerId,
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: Number(price),
      quantity: qty,
      unit: unit || 'piece',
      images: images || ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'],
      location: location || { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      deliveryOptions: deliveryOptions || ['Pickup', 'Local Delivery'],
      status: initialStatus
    };

    if (isDbConnected) {
      const product = await Product.create(newProductData);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully!',
        product
      });
    } else {
      const fakeId = 'product_' + Date.now();
      const product = { _id: fakeId, ...newProductData, createdAt: new Date().toISOString() };
      inMemoryProducts.set(fakeId, product);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully (Demo Mode)!',
        product
      });
    }
  } catch (error) {
    console.error('[Create Product Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating product.' });
  }
};

// @desc    Update product details & inventory quantity
// @route   PUT /api/products/:id
// @access  Private (Owner Provider only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user._id ? req.user._id.toString() : req.user.id;

    if (isDbConnected) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (product.providerId.toString() !== providerId) {
        return res.status(403).json({ success: false, message: 'Forbidden. You do not own this product.' });
      }

      Object.assign(product, req.body);

      // Auto update status if quantity is zero
      if (product.quantity === 0) {
        product.status = 'out_of_stock';
      } else if (product.status === 'out_of_stock' && product.quantity > 0) {
        product.status = 'published';
      }

      await product.save();
      return res.json({ success: true, message: 'Product updated successfully!', product });
    } else {
      const product = inMemoryProducts.get(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (product.providerId !== providerId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      const updated = { ...product, ...req.body, updatedAt: new Date().toISOString() };
      if (updated.quantity === 0) updated.status = 'out_of_stock';
      else if (updated.status === 'out_of_stock' && updated.quantity > 0) updated.status = 'published';

      inMemoryProducts.set(id, updated);
      return res.json({ success: true, message: 'Product updated (Demo Mode)!', product: updated });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Patch product status
// @route   PATCH /api/products/:id/status
// @access  Private (Owner Provider only)
export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, quantity } = req.body;
    const providerId = req.user._id ? req.user._id.toString() : req.user.id;

    if (isDbConnected) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (product.providerId.toString() !== providerId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      if (quantity !== undefined) {
        product.quantity = Math.max(0, Number(quantity));
        if (product.quantity === 0) product.status = 'out_of_stock';
        else if (product.status === 'out_of_stock' && product.quantity > 0) product.status = 'published';
      }

      if (status && ['draft', 'published', 'out_of_stock', 'paused'].includes(status)) {
        product.status = status;
      }

      await product.save();
      return res.json({ success: true, message: 'Product status updated!', product });
    } else {
      const product = inMemoryProducts.get(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (product.providerId !== providerId) return res.status(403).json({ success: false, message: 'Forbidden' });

      if (quantity !== undefined) {
        product.quantity = Math.max(0, Number(quantity));
        if (product.quantity === 0) product.status = 'out_of_stock';
        else if (product.status === 'out_of_stock' && product.quantity > 0) product.status = 'published';
      }

      if (status) product.status = status;
      inMemoryProducts.set(id, product);
      return res.json({ success: true, message: 'Product status updated (Demo Mode)!', product });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Owner Provider only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user._id ? req.user._id.toString() : req.user.id;

    if (isDbConnected) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (product.providerId.toString() !== providerId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      await Product.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Product deleted successfully.' });
    } else {
      const product = inMemoryProducts.get(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      if (product.providerId !== providerId) return res.status(403).json({ success: false, message: 'Forbidden' });
      inMemoryProducts.delete(id);
      return res.json({ success: true, message: 'Product deleted successfully (Demo Mode).' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
