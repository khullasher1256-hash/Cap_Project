/**
 * Frontend Configuration for EverCart E-Commerce
 * 
 * This file contains configuration values using relative paths
 * for cross-platform compatibility and Linux hosting
 */

// API Configuration using relative paths
window.CONFIG = {
    // Environment information
    NODE_ENV: 'production',
    
    // API endpoints using relative paths
    API: {
        // Authentication endpoints
        LOGIN: '/api/login',
        SIGNUP: '/api/signup',
        ADMIN_LOGIN: '/api/admin/login',
        ADMIN_CREATE: '/api/admin/create',
        
        // Product endpoints
        PRODUCTS: '/api/products',
        CATEGORIES: '/api/categories',
        BRANDS: '/api/brands',
        
        // Cart endpoints
        CART_GET: '/api/cart',
        CART_ADD: '/api/cart/add',
        CART_UPDATE: '/api/cart/update',
        CART_REMOVE: '/api/cart/remove',
        CART_CLEAR: '/api/cart/clear',
        
        // Admin product management endpoints
        ADMIN_PRODUCTS: '/api/admin/products'
    }
};

// Helper function to get API URL (now returns relative paths)
window.getApiUrl = function(endpoint) {
    return endpoint.startsWith('/') ? endpoint : '/' + endpoint;
};

console.log('EverCart Config Loaded:', window.CONFIG);
