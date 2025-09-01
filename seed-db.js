/**
 * EverCart Database Seeder
 * 
 * This script populates the MongoDB database with sample product data.
 * It's designed to run once during initial setup to provide demo data.
 * 
 * Features:
 * - Checks if database is already populated
 * - Adds 15 sample products across different categories
 * - Provides detailed statistics after seeding
 * - Graceful error handling and cleanup
 * 
 * Usage:
 *   node seed-db.js
 *   or
 *   npm run seed
 * 
 * @author EverCart Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config();

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

/**
 * Connect to the MongoDB database
 * Uses the same connection string as the main server
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evercart';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB for seeding'))
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1);
});

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

/**
 * Product Schema - Must match the schema in server.js
 * 
 * Note: Using simplified schema here for seeding purposes.
 * The main server.js has enhanced validation rules.
 */
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  availability: { type: Boolean, default: true },
  description: { type: String, required: true },
  image: { type: String, required: true }
}, {
  timestamps: true // Add createdAt and updatedAt fields
});

const Product = mongoose.model('Product', productSchema);

// ============================================================================
// SAMPLE DATA
// ============================================================================

/**
 * Sample product data for seeding the database
 * 
 * This data includes:
 * - 15 products across 8 different categories
 * - Mix of available and out-of-stock items
 * - Realistic prices, ratings, and descriptions
 * - Image paths pointing to assets in the public folder
 * 
 * Categories included:
 * - Electronics (6 items)
 * - Footwear (1 item)
 * - Accessories (1 item)
 * - Fitness (1 item)
 * - Fashion (1 item)
 * - Home Appliances (1 item)
 * - Photography (1 item)
 * - Household (2 items)
 * - Daily Usage (2 items)
 */
const sampleProducts = [
  { name: 'Wireless Headphones', category: 'Electronics', price: 99.99, brand: 'AudioX', rating: 4.5, availability: true, description: 'High-quality wireless headphones with noise cancellation, superior sound, and comfortable ear cups for extended listening.', image: 'https://plus.unsplash.com/premium_photo-1677158265072-5d15db9e23b2?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Smartwatch', category: 'Electronics', price: 199.99, brand: 'TechGear', rating: 4.2, availability: true, description: 'Track your fitness and receive notifications on the go. Features heart rate monitoring, GPS, and long battery life.', image: 'https://images.unsplash.com/photo-1660844817855-3ecc7ef21f12?q=80&w=786&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Running Shoes', category: 'Footwear', price: 75.00, brand: 'SportFit', rating: 4.8, availability: false, description: 'Comfortable and durable running shoes for all terrains. Engineered for maximum shock absorption and breathability.', image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Leather Wallet', category: 'Accessories', price: 45.50, brand: 'LuxuryCraft', rating: 4.0, availability: true, description: 'Genuine leather wallet with multiple card slots and a coin pouch. Handcrafted for durability and style.', image: 'https://plus.unsplash.com/premium_photo-1681589453747-53fd893fa420?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 59.99, brand: 'SoundBlast', rating: 4.6, availability: true, description: 'Compact and powerful speaker for on-the-go music. Delivers rich, clear sound with deep bass.', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Yoga Mat', category: 'Fitness', price: 25.00, brand: 'ZenLife', rating: 4.3, availability: true, description: 'Non-slip yoga mat for comfortable workouts. Made from eco-friendly materials, perfect for all levels.', image: 'https://plus.unsplash.com/premium_photo-1667739346017-fbc9cd35d666?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Designer Handbag', category: 'Fashion', price: 120.00, brand: 'ChicStyle', rating: 4.7, availability: true, description: 'Elegant handbag for everyday use and special occasions. Features a spacious interior and stylish metallic accents.', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Gaming Mouse', category: 'Electronics', price: 35.00, brand: 'GamePro', rating: 4.1, availability: true, description: 'Ergonomic gaming mouse with customizable DPI settings and programmable buttons for competitive play.', image: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Coffee Maker', category: 'Home Appliances', price: 85.00, brand: 'BrewMaster', rating: 4.4, availability: true, description: 'Programmable coffee maker for fresh brews every morning. Includes a reusable filter and a pause-and-serve function.', image: 'https://images.unsplash.com/photo-1608354580875-30bd4168b351?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Smartphone Tripod', category: 'Photography', price: 18.00, brand: 'CaptureIt', rating: 3.9, availability: true, description: 'Adjustable tripod for stable smartphone photography. Lightweight and portable, perfect for vlogging and selfies.', image: 'https://images.unsplash.com/photo-1576299090369-9067e4adca28?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Robot Vacuum', category: 'Household', price: 299.99, brand: 'CleanBot', rating: 4.7, availability: true, description: 'Automated vacuum cleaner for effortless floor cleaning. Smart navigation and app control.', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Organic Cotton Towels', category: 'Household', price: 35.00, brand: 'EcoComfort', rating: 4.6, availability: true, description: 'Soft and absorbent organic cotton towels for your bathroom. Sustainable and luxurious.', image: 'https://images.unsplash.com/photo-1523471826770-c437b4636fe6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Reusable Water Bottle', category: 'Daily Usage', price: 15.99, brand: 'HydrateEco', rating: 4.9, availability: true, description: 'Durable and eco-friendly stainless steel water bottle. Perfect for daily hydration on the go.', image: 'https://images.unsplash.com/photo-1544003484-3cd181d17917?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Bamboo Toothbrush Set', category: 'Daily Usage', price: 8.50, brand: 'GreenSmile', rating: 4.8, availability: true, description: 'Biodegradable bamboo toothbrushes for a sustainable oral care routine. Pack of 4.', image: 'https://images.unsplash.com/photo-1589365252845-092198ba5334?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Noise-Cancelling Earbuds', category: 'Electronics', price: 129.99, brand: 'SoundPod', rating: 4.3, availability: true, description: 'Compact noise-cancelling earbuds with crystal clear audio and comfortable fit.', image: 'https://images.unsplash.com/photo-1615281612781-4b972bd4e3fe?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
];

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

/**
 * Main seeding function that populates the database with sample data
 * 
 * Process:
 * 1. Check if database already has products
 * 2. Insert sample data if database is empty
 * 3. Display comprehensive statistics
 * 4. List all categories and brands
 * 5. Close database connection
 * 
 * @async
 * @function seedDatabase
 * @returns {Promise<void>}
 */
async function seedDatabase() {
  try {
    console.log('\n🚀 Starting EverCart database seeding process...');
    
    // Check if products already exist to avoid duplicates
    const existingProducts = await Product.countDocuments();
    
    if (existingProducts === 0) {
      console.log('📦 Database is empty. Adding sample products...');
      
      // Insert all sample products in a single batch operation
      await Product.insertMany(sampleProducts);
      console.log(`✅ Successfully added ${sampleProducts.length} sample products to the database.`);
    } else {
      console.log(`📦 Database already has ${existingProducts} products. Skipping seed operation.`);
      console.log('💡 To re-seed, please clear the database first.');
    }

    // Generate and display database statistics
    console.log('\n📊 Current database statistics:');
    
    // Use MongoDB aggregation to get comprehensive stats
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: { $sum: { $cond: ['$availability', 1, 0] } },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' }
        }
      }
    ]);
    
    if (stats.length > 0) {
      const { total, available, avgPrice, avgRating, maxPrice, minPrice } = stats[0];
      console.log(`   📦 Total Products: ${total}`);
      console.log(`   ✅ Available Products: ${available}`);
      console.log(`   ❌ Out of Stock: ${total - available}`);
      console.log(`   💰 Price Range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`);
      console.log(`   📊 Average Price: $${avgPrice.toFixed(2)}`);
      console.log(`   ⭐ Average Rating: ${avgRating.toFixed(1)} stars`);
    }

    // Get unique categories and brands for filter options
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');
    
    console.log(`\n🏷️  Available Categories (${categories.length}):`);
    categories.sort().forEach((category, index) => {
      console.log(`   ${index + 1}. ${category}`);
    });
    
    console.log(`\n🏢 Available Brands (${brands.length}):`);
    brands.sort().forEach((brand, index) => {
      console.log(`   ${index + 1}. ${brand}`);
    });

    // Close database connection cleanly
    await mongoose.disconnect();
    console.log('\n✅ Database seeding completed successfully!');
    console.log('🌐 You can now start the server and begin shopping!');
    
  } catch (error) {
    console.error('\n❌ Error during database seeding:', error);
    
    // Ensure clean disconnection even on error
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('❌ Error disconnecting from database:', disconnectError);
    }
    
    process.exit(1);
  }
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

/**
 * Execute the seeding process
 * This runs immediately when the script is executed
 */
seedDatabase();
