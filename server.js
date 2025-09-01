/**
 * EverCart - E-commerce Backend Server
 * 
 * A full-stack e-commerce application built with Node.js, Express, MongoDB, and vanilla JavaScript.
 * Features include user authentication, product management, shopping cart functionality,
 * and admin panel for product CRUD operations.
 * 
 * @author EverCart Team
 * @version 1.0.0
 */

// ============================================================================
// DEPENDENCIES & CONFIGURATION
// ============================================================================

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');        // Web framework for Node.js
const mongoose = require('mongoose');      // MongoDB object modeling tool
const cors = require('cors');              // Cross-Origin Resource Sharing middleware
const bcrypt = require('bcryptjs');        // Password hashing library
const path = require('path');              // Node.js path utilities

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evercart';
const ADMIN_KEY = process.env.ADMIN_KEY || 'EVERCART_ADMIN_2025';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Enable Cross-Origin Resource Sharing for frontend-backend communication
app.use(cors());

// Parse JSON bodies for API requests
app.use(express.json());

// Serve static files (HTML, CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// DATABASE CONNECTION & CONFIGURATION
// ============================================================================

/**
 * Connect to MongoDB database
 * Database: evercart (configurable via environment variables)
 */
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ============================================================================
// DATABASE SCHEMAS & MODELS
// ============================================================================

/**
 * Product Schema - Defines the structure for product documents
 * 
 * @field {String} name - Product name/title
 * @field {String} category - Product category (Electronics, Fashion, etc.)
 * @field {Number} price - Product price in dollars
 * @field {String} brand - Product brand/manufacturer
 * @field {Number} rating - Product rating (1-5 stars)
 * @field {Boolean} availability - Product stock availability
 * @field {String} description - Product description
 * @field {String} image - Product image URL or path
 */
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  brand: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  availability: { type: Boolean, default: true },
  description: { type: String, required: true },
  image: { type: String, required: true }
}, {
  timestamps: true  // Automatically add createdAt and updatedAt fields
});

const Product = mongoose.model('Product', productSchema);

/**
 * User Schema - Defines the structure for user accounts
 * 
 * @field {String} name - User's full name
 * @field {String} email - User's email address (unique identifier)
 * @field {String} password - Hashed password using bcrypt
 * @field {String} role - User role: 'user' (default) or 'admin'
 */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

/**
 * Cart Schema - Defines the structure for shopping carts
 * 
 * @field {String} userEmail - User's email (cart owner)
 * @field {Array} items - Array of cart items with product references and quantities
 */
const cartSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',  // Reference to Product model
      required: true 
    },
    quantity: { type: Number, default: 1, min: 1 }
  }]
}, {
  timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

/**
 * Order Schema - Defines the structure for order documents
 * 
 * @field {String} userEmail - User's email (order owner)
 * @field {Array} items - Array of ordered items with product references, quantities, and prices
 * @field {Number} totalAmount - Total order amount in dollars
 * @field {String} status - Order status: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
 * @field {Object} deliveryAddress - Delivery address information
 * @field {String} paymentMethod - Payment method used
 * @field {Date} orderDate - Date when order was placed
 */
const orderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true 
    },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  deliveryAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: { 
    type: String, 
    enum: ['card', 'cash_on_delivery', 'upi'], 
    default: 'cash_on_delivery' 
  },
  orderDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

// ============================================================================
// STATIC FILE SERVING & ROOT ROUTE
// ============================================================================

/**
 * Dynamic Configuration Endpoint
 * Serves frontend configuration based on environment variables
 */
app.get('/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  const config = `
/**
 * Frontend Configuration for EverCart E-Commerce
 * This file is dynamically generated by the server for relative path usage
 */
window.CONFIG = {
  NODE_ENV: '${process.env.NODE_ENV || 'development'}',
  API: {
    LOGIN: '/api/login',
    SIGNUP: '/api/signup',
    ADMIN_LOGIN: '/api/admin/login',
    ADMIN_CREATE: '/api/admin/create',
    PRODUCTS: '/api/products',
    CATEGORIES: '/api/categories',
    BRANDS: '/api/brands',
    CART_GET: '/api/cart',
    CART_ADD: '/api/cart/add',
    CART_UPDATE: '/api/cart/update',
    CART_REMOVE: '/api/cart/remove',
    CART_CLEAR: '/api/cart/clear',
    ADMIN_PRODUCTS: '/api/admin/products'
  }
};

// Helper function to get API URL (now returns relative paths)
window.getApiUrl = function(endpoint) {
  return endpoint.startsWith('/') ? endpoint : '/' + endpoint;
};

console.log('EverCart Config Loaded:', window.CONFIG);
`;
  res.send(config);
});

/**
 * Root route - Redirect to home page
 * Serves the main homepage when users visit the root URL
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
// ============================================================================
// PUBLIC API ROUTES - PRODUCT BROWSING
// ============================================================================

/**
 * GET /api/products
 * Retrieve all products with optional filtering
 * 
 * Query Parameters:
 * @param {string} search - Search term for product name/description
 * @param {string} category - Filter by product category
 * @param {string} brand - Filter by product brand
 * @param {number} rating - Minimum rating filter
 * @param {number} price - Maximum price filter
 * @param {string} availability - 'true' to show only available products
 * 
 * @returns {Array} Array of product objects matching the criteria
 */
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, brand, rating, price, availability } = req.query;
    
    // Build dynamic filter object based on query parameters
    let filter = {};
    
    // Text search in product name (case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    // Exact match filters
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    
    // Numeric range filters
    if (rating) filter.rating = { $gte: Number(rating) };
    if (price) filter.price = { $lte: Number(price) };
    
    // Boolean filter for availability
    if (availability === 'true') filter.availability = true;
    
    // Execute query and return results
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
    
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

/**
 * GET /api/categories
 * Get all unique product categories
 * Used for populating category filter dropdowns
 * 
 * @returns {Array} Array of unique category strings
 */
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort()); // Return sorted categories
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

/**
 * GET /api/brands
 * Get all unique product brands
 * Used for populating brand filter dropdowns
 * 
 * @returns {Array} Array of unique brand strings
 */
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands.sort()); // Return sorted brands
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Failed to fetch brands', error: error.message });
  }
});

// ============================================================================
// USER AUTHENTICATION ROUTES
// ============================================================================

/**
 * POST /api/signup
 * Register a new user account
 * 
 * @body {string} name - User's full name
 * @body {string} email - User's email address
 * @body {string} password - User's password (will be hashed)
 * 
 * @returns {Object} Success response with user data (excluding password)
 */
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash password for secure storage
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    
    // Create new user
    const newUser = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: hashedPassword 
    });
    
    // Return user data (excluding password)
    res.status(201).json({ 
      message: 'User registered successfully',
      user: { 
        name: newUser.name, 
        email: newUser.email,
        role: newUser.role
      } 
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/login
 * Authenticate user login
 * 
 * @body {string} email - User's email address
 * @body {string} password - User's password
 * 
 * @returns {Object} Success response with user data (excluding password)
 */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Return user data (excluding password)
    res.json({ 
      message: 'Login successful',
      user: { 
        name: user.name, 
        email: user.email,
        role: user.role
      } 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// ============================================================================
// SHOPPING CART MANAGEMENT ROUTES
// ============================================================================

/**
 * POST /api/cart/add
 * Add a product to user's shopping cart
 * 
 * @body {string} userEmail - User's email address
 * @body {string} productId - MongoDB ObjectId of the product
 * @body {number} quantity - Quantity to add (default: 1)
 * 
 * @returns {Object} Success message
 */
app.post('/api/cart/add', async (req, res) => {
  try {
    const { userEmail, productId, quantity } = req.body;
    
    // Input validation
    if (!userEmail || !productId) {
      return res.status(400).json({ message: 'User email and product ID are required' });
    }
    
    const quantityToAdd = quantity || 1;
    if (quantityToAdd <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }
    
    // Find or create user's cart
    let cart = await Cart.findOne({ userEmail });
    if (!cart) {
      cart = new Cart({ userEmail, items: [] });
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.equals(productId)
    );
    
    if (existingItemIndex > -1) {
      // Product exists - increase quantity
      cart.items[existingItemIndex].quantity += quantityToAdd;
    } else {
      // Product doesn't exist - add new item
      cart.items.push({ productId, quantity: quantityToAdd });
    }
    
    await cart.save();
    res.json({ message: 'Product added to cart successfully' });
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add product to cart' });
  }
});

/**
 * GET /api/cart
 * Get user's cart with populated product details
 * 
 * @query {string} userEmail - User's email address
 * 
 * @returns {Object} Cart object with populated product information
 */
app.get('/api/cart', async (req, res) => {
  try {
    const { userEmail } = req.query;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }
    
    // Find cart and populate product details
    const cart = await Cart.findOne({ userEmail }).populate('items.productId');
    
    if (!cart) {
      return res.json({ items: [] }); // Return empty cart if none exists
    }
    
    res.json(cart);
    
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

/**
 * POST /api/cart/remove
 * Remove a specific product from user's cart
 * 
 * @body {string} userEmail - User's email address
 * @body {string} productId - MongoDB ObjectId of the product to remove
 * 
 * @returns {Object} Success message
 */
app.post('/api/cart/remove', async (req, res) => {
  try {
    const { userEmail, productId } = req.body;
    
    // Input validation
    if (!userEmail || !productId) {
      return res.status(400).json({ message: 'User email and product ID are required' });
    }
    
    const cart = await Cart.findOne({ userEmail });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Filter out the specified product
    const initialCount = cart.items.length;
    cart.items = cart.items.filter(item => !item.productId.equals(productId));
    
    if (cart.items.length === initialCount) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    
    await cart.save();
    res.json({ message: 'Product removed from cart successfully' });
    
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove product from cart' });
  }
});

/**
 * POST /api/cart/update
 * Update quantity of a specific product in user's cart
 * 
 * @body {string} userEmail - User's email address
 * @body {string} productId - MongoDB ObjectId of the product
 * @body {number} quantity - New quantity (0 or less will remove the item)
 * 
 * @returns {Object} Success message
 */
app.post('/api/cart/update', async (req, res) => {
  try {
    const { userEmail, productId, quantity } = req.body;
    
    // Input validation
    if (!userEmail || !productId || quantity === undefined) {
      return res.status(400).json({ message: 'User email, product ID, and quantity are required' });
    }
    
    const cart = await Cart.findOne({ userEmail });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cart.save();
    res.json({ message: 'Cart updated successfully' });
    
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

/**
 * POST /api/cart/clear
 * Clear all items from user's cart (used after successful checkout)
 * 
 * @body {string} userEmail - User's email address
 * 
 * @returns {Object} Success message with item count information
 */
app.post('/api/cart/clear', async (req, res) => {
  try {
    const { userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }
    
    let cart = await Cart.findOne({ userEmail });
    if (!cart) {
      // Create empty cart if none exists
      cart = new Cart({ userEmail, items: [] });
      await cart.save();
      return res.json({ message: 'Cart not found, created empty cart', previousItemCount: 0 });
    }
    
    const previousItemCount = cart.items.length;
    cart.items = [];
    await cart.save();
    
    console.log(`Cart cleared for ${userEmail}. Removed ${previousItemCount} items.`);
    res.json({ 
      message: 'Cart cleared successfully', 
      previousItemCount,
      newItemCount: 0
    });
    
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
});

// ============================================================================
// ORDER MANAGEMENT ROUTES
// ============================================================================

/**
 * POST /api/orders
 * Create a new order from cart items
 * 
 * @body {string} userEmail - User's email address
 * @body {Object} deliveryAddress - Delivery address information
 * @body {string} paymentMethod - Payment method ('card', 'cash_on_delivery', 'upi')
 * 
 * @returns {Object} Created order object
 */
app.post('/api/orders', async (req, res) => {
  try {
    const { userEmail, deliveryAddress, paymentMethod } = req.body;
    
    // Input validation
    if (!userEmail || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({ message: 'User email, delivery address, and payment method are required' });
    }
    
    // Validate delivery address fields
    const { fullName, address, city, state, zipCode, phone } = deliveryAddress;
    if (!fullName || !address || !city || !state || !zipCode || !phone) {
      return res.status(400).json({ message: 'Complete delivery address is required' });
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ userEmail }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate total amount and prepare order items
    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const itemTotal = item.productId.price * item.quantity;
      totalAmount += itemTotal;
      
      return {
        productId: item.productId._id,
        productName: item.productId.name,
        productImage: item.productId.image,
        quantity: item.quantity,
        price: item.productId.price
      };
    });
    
    // Create order
    const order = await Order.create({
      userEmail,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
      deliveryAddress,
      paymentMethod,
      status: 'pending'
    });
    
    // Clear the user's cart
    cart.items = [];
    await cart.save();
    
    res.status(201).json({ 
      message: 'Order placed successfully',
      order 
    });
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

/**
 * GET /api/orders
 * Get user's order history
 * 
 * @query {string} userEmail - User's email address
 * 
 * @returns {Array} Array of user's orders
 */
app.get('/api/orders', async (req, res) => {
  try {
    const { userEmail } = req.query;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }
    
    // Find orders for the user, sorted by creation date (newest first)
    const orders = await Order.find({ userEmail })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name category brand');
    
    res.json(orders);
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/:id
 * Get a specific order by ID
 * 
 * @param {string} id - Order ID
 * @query {string} userEmail - User's email address for authorization
 * 
 * @returns {Object} Order details
 */
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }
    
    const order = await Order.findOne({ _id: id, userEmail })
      .populate('items.productId', 'name category brand');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
    
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// ============================================================================
// ADMIN PANEL ROUTES & MIDDLEWARE
// ============================================================================

/**
 * Admin Authentication Middleware
 * Verifies that the requesting user has admin privileges
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required for admin verification' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    req.user = user; // Attach user to request object
    next();
    
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ message: 'Server error during admin verification' });
  }
};

/**
 * POST /api/admin/login
 * Admin-specific login endpoint with role verification
 * 
 * @body {string} email - Admin's email address
 * @body {string} password - Admin's password
 * 
 * @returns {Object} Admin user data with role information
 */
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    res.json({ 
      message: 'Admin login successful',
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

/**
 * POST /api/admin/create
 * Create a new admin user account (protected by admin key)
 * 
 * @body {string} name - Admin's full name
 * @body {string} email - Admin's email address
 * @body {string} password - Admin's password
 * @body {string} adminKey - Secret key for admin creation (EVERCART_ADMIN_2025)
 * 
 * @returns {Object} Success message with admin data
 */
app.post('/api/admin/create', async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;
    
    // Admin key verification for security
    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({ message: 'Invalid admin key' });
    }
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    
    // Create admin user
    const admin = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: hashedPassword, 
      role: 'admin' 
    });
    
    res.status(201).json({ 
      message: 'Admin created successfully', 
      admin: { name: admin.name, email: admin.email, role: admin.role } 
    });
    
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ message: 'Failed to create admin account' });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by its MongoDB ObjectId
 * 
 * @param {string} id - Product's MongoDB ObjectId
 * 
 * @returns {Object} Product object
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
    
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

/**
 * POST /api/admin/products
 * Create a new product (Admin only)
 * 
 * @body {string} email - Admin's email for verification
 * @body {string} name - Product name
 * @body {string} category - Product category
 * @body {number} price - Product price
 * @body {string} brand - Product brand
 * @body {number} rating - Product rating (1-5)
 * @body {boolean} availability - Product availability
 * @body {string} description - Product description
 * @body {string} image - Product image URL
 * 
 * @returns {Object} Created product object
 */
app.post('/api/admin/products', async (req, res) => {
  try {
    const { email, name, category, price, brand, rating, availability, description, image } = req.body;
    
    // Admin verification
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Input validation
    if (!name || !category || !price || !brand || !rating || !description || !image) {
      return res.status(400).json({ message: 'All product fields are required' });
    }
    
    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      brand: brand.trim(),
      rating: Number(rating),
      availability: Boolean(availability),
      description: description.trim(),
      image: image.trim()
    });
    
    res.status(201).json({ 
      message: 'Product created successfully', 
      product 
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

/**
 * PUT /api/admin/products/:id
 * Update an existing product (Admin only)
 * 
 * @param {string} id - Product's MongoDB ObjectId
 * @body {string} email - Admin's email for verification
 * @body {Object} productData - Updated product information
 * 
 * @returns {Object} Updated product object
 */
app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, category, price, brand, rating, availability, description, image } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    // Admin verification
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name?.trim(),
        category: category?.trim(),
        price: price ? Number(price) : undefined,
        brand: brand?.trim(),
        rating: rating ? Number(rating) : undefined,
        availability: availability !== undefined ? Boolean(availability) : undefined,
        description: description?.trim(),
        image: image?.trim()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ 
      message: 'Product updated successfully', 
      product: updatedProduct 
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

/**
 * DELETE /api/admin/products/:id
 * Delete a product (Admin only)
 * 
 * @param {string} id - Product's MongoDB ObjectId
 * @header {string} email - Admin's email for verification
 * 
 * @returns {Object} Success message
 */
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.headers;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    // Admin verification
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ 
      message: 'Product deleted successfully',
      deletedProduct: {
        id: deletedProduct._id,
        name: deletedProduct.name
      }
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

/**
 * GET /api/admin/users
 * Get all users (Admin only)
 * 
 * @header {string} email - Admin's email for verification
 * 
 * @returns {Array} Array of user objects (excluding passwords)
 */
app.get('/api/admin/users', async (req, res) => {
  try {
    const { email } = req.headers;
    
    // Admin verification
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Get all users excluding passwords
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    res.json(users);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user details (Admin only)
 * 
 * @param {string} id - User's MongoDB ObjectId
 * @body {string} email - Admin's email for verification
 * @body {Object} userData - Updated user information
 * 
 * @returns {Object} Updated user object
 */
app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, userEmail, role } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Admin verification
    const admin = await User.findOne({ email: email?.toLowerCase() });
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: name?.trim(),
        email: userEmail?.toLowerCase().trim(),
        role: role
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'User updated successfully', 
      user: updatedUser 
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Failed to update user' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (Admin only)
 * 
 * @param {string} id - User's MongoDB ObjectId
 * @header {string} email - Admin's email for verification
 * 
 * @returns {Object} Success message
 */
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.headers;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Admin verification
    const admin = await User.findOne({ email: email?.toLowerCase() });
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Prevent admin from deleting themselves
    if (id === admin._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }
    
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

/**
 * GET /api/admin/orders
 * Get all orders (Admin only)
 * 
 * @header {string} email - Admin's email for verification
 * @query {string} status - Filter by order status (optional)
 * 
 * @returns {Array} Array of all orders
 */
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { email } = req.headers;
    const { status } = req.query;
    
    // Admin verification
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Build filter
    let filter = {};
    if (status) {
      filter.status = status;
    }
    
    // Get all orders
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name category brand');
    
    res.json(orders);
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

/**
 * PUT /api/admin/orders/:id
 * Update order status (Admin only)
 * 
 * @param {string} id - Order's MongoDB ObjectId
 * @body {string} email - Admin's email for verification
 * @body {string} status - New order status
 * 
 * @returns {Object} Updated order object
 */
app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, status } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    // Admin verification
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    
    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('items.productId', 'name category brand');
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ 
      message: 'Order status updated successfully', 
      order: updatedOrder 
    });
    
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start the Express server
 * Listen on the specified PORT and log server information
 */
app.listen(PORT, () => {
  console.log('\n🚀 EverCart Server Started Successfully!');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌐 Frontend available at: http://localhost:${PORT}`);
  console.log(`🔧 API endpoints available at: /api/*`);
  console.log(`👨‍💼 Admin panel: /admin-login.html`);
  console.log('\n📊 Available API Routes:');
  console.log('   🛍️  Product browsing: GET /api/products, /api/categories, /api/brands');
  console.log('   🔐 Authentication: POST /api/login, /api/signup');
  console.log('   🛒 Cart management: GET|POST /api/cart/*');
  console.log('   👨‍💼 Admin operations: POST|PUT|DELETE /api/admin/*');
  console.log('\n💡 Tip: Use the admin key "EVERCART_ADMIN_2025" to create admin accounts\n');
});
