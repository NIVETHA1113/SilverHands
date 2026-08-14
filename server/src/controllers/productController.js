import Product from '../models/Product.js';
import { isDbConnected } from '../config/db.js';

// Fallback in-memory map for demo mode if MongoDB is offline
export const inMemoryProducts = new Map();

// @desc    Get all products (Public or Provider filtered)
// @route   GET /api/products
// @access  Public / Provider
export const getProducts = async (req, res) => {
  try {
    const { providerId, status, category, city } = req.query;

    if (isDbConnected) {
      const query = {};
      if (providerId) query.providerId = providerId;
      if (status) query.status = status;
      if (category) query.category = category;
      if (city) query['location.city'] = new RegExp(city, 'i');

      const products = await Product.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: products.length, products });
    } else {
      let list = Array.from(inMemoryProducts.values());
      if (providerId) list = list.filter(p => p.providerId === providerId);
      if (status) list = list.filter(p => p.status === status);
      if (category) list = list.filter(p => p.category === category);
      if (city) list = list.filter(p => p.location?.city?.toLowerCase().includes(city.toLowerCase()));
      return res.json({ success: true, count: list.length, products: list });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected) {
      const product = await Product.findById(id);
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

// @desc    Patch product status (published / paused / out_of_stock / draft)
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
