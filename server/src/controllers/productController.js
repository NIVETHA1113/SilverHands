import Product from '../models/Product.js';
import { isDbConnected } from '../config/db.js';

// Fallback in-memory map for demo mode if MongoDB is offline
export const inMemoryProducts = new Map();

// @desc    Get all products (Public discovery or Provider filtered)
// @route   GET /api/products
// @access  Public / Provider
export const getProducts = async (req, res) => {
  try {
    const {
      providerId,
      status,
      category,
      city,
      search,
      minPrice,
      maxPrice,
      deliveryOption,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    if (isDbConnected) {
      const query = {};
      if (providerId) query.providerId = providerId;
      if (status) query.status = status;
      if (category && category !== 'all' && category !== 'All') query.category = category;
      if (city) query['location.city'] = new RegExp(city, 'i');

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (deliveryOption) {
        query.deliveryOptions = deliveryOption;
      }

      if (search) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: regex },
          { description: regex },
          { category: regex },
          { 'location.city': regex }
        ];
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'price_asc') sortOption = { price: 1 };
      if (sort === 'price_desc') sortOption = { price: -1 };
      if (sort === 'newest') sortOption = { createdAt: -1 };

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .populate('providerId', 'name profileImage age location rating verification skills languages bio')
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.json({
        success: true,
        count: products.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        products
      });
    } else {
      let list = Array.from(inMemoryProducts.values());
      if (providerId) list = list.filter(p => p.providerId === providerId);
      if (status) list = list.filter(p => p.status === status);
      if (category && category !== 'all' && category !== 'All') list = list.filter(p => p.category === category);
      if (city) list = list.filter(p => p.location?.city?.toLowerCase().includes(city.toLowerCase()));
      if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
      if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
      }

      if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const total = list.length;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = list.slice(startIndex, startIndex + limitNum);

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
