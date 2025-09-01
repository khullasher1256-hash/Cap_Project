# 🛒 EverCart - Full-Stack E-Commerce Platform

EverCart is a comprehensive e-commerce platform built with **Node.js**, **Express**, **MongoDB**, and **vanilla JavaScript**. It features user authentication, product management, shopping cart functionality, and a complete admin panel.

![EverCart Banner](https://via.placeholder.com/800x200/667eea/ffffff?text=EverCart+E-Commerce+Platform)

## ✨ Features

### 🛍️ **Customer Features**
- **User Registration & Authentication** - Secure account creation and login
- **Product Browsing** - Browse products by categories, brands, ratings
- **Advanced Filtering** - Search, filter by price, availability, ratings
- **Shopping Cart** - Add, update, remove items with quantity controls
- **Responsive Design** - Mobile-friendly interface
- **Real-time Cart Updates** - Dynamic cart count and total calculations
- **Checkout System** - Complete order processing with order confirmation

### 👨‍💼 **Admin Features**
- **Admin Panel** - Dedicated dashboard for product management
- **Product CRUD Operations** - Create, read, update, delete products
- **Inventory Management** - Track availability and stock status
- **User Management** - Admin role-based access control
- **Statistics Dashboard** - Product overview and analytics

### 🔧 **Technical Features**
- **RESTful API** - Clean API endpoints for all operations
- **MongoDB Integration** - NoSQL database with Mongoose ODM
- **Password Security** - Bcrypt hashing for secure authentication
- **Input Validation** - Comprehensive client and server-side validation
- **Error Handling** - Graceful error handling and user feedback
- **Clean Code Structure** - Well-documented and maintainable codebase

## 🚀 Quick Start

### Prerequisites

Before running EverCart, ensure you have:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/evercart/evercart-ecommerce.git
   cd evercart-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   ```bash
   # For local MongoDB installation
   mongod
   
   # Or use MongoDB Atlas (update connection string in server.js)
   ```

4. **Seed the database** (optional - adds sample products)
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-restart
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
evercart-ecommerce/
│
├── 📁 public/                 # Frontend files
│   ├── 📄 home.html          # Homepage
│   ├── 📄 index.html         # Product listing/shop page
│   ├── 📄 cart.html          # Shopping cart page
│   ├── 📄 login.html         # Login/signup page
│   ├── 📄 admin-login.html   # Admin login page
│   ├── 📄 admin-dashboard.html # Admin management panel
│   ├── 📄 about.html         # About page
│   ├── 📄 blog.html          # Blog page
│   ├── 📄 contact.html       # Contact page
│   ├── 📄 faq.html           # FAQ page
│   ├── 📄 styles.css         # Main stylesheet
│   └── 📁 Assets/            # Product images
│
├── 📄 server.js              # Express server and API routes
├── 📄 seed-db.js             # Database seeding script
├── 📄 package.json           # Project configuration and dependencies
├── 📄 IMAGE_REFERENCE_GUIDE.md # Guide for product images
└── 📄 README.md              # This file
```

## 🔌 API Endpoints

### 🛍️ **Public Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products (with filters) |
| `GET` | `/api/categories` | Get all product categories |
| `GET` | `/api/brands` | Get all product brands |
| `GET` | `/api/products/:id` | Get single product by ID |

### 🔐 **Authentication Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/signup` | Register new user |
| `POST` | `/api/login` | User login |

### 🛒 **Cart Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cart` | Get user's cart |
| `POST` | `/api/cart/add` | Add item to cart |
| `POST` | `/api/cart/update` | Update item quantity |
| `POST` | `/api/cart/remove` | Remove item from cart |
| `POST` | `/api/cart/clear` | Clear entire cart |

### 👨‍💼 **Admin Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Admin login |
| `POST` | `/api/admin/create` | Create admin account |
| `POST` | `/api/admin/products` | Create new product |
| `PUT` | `/api/admin/products/:id` | Update product |
| `DELETE` | `/api/admin/products/:id` | Delete product |

## 🛠️ Usage Guide

### 🏪 **Setting Up Your Store**

1. **Create Admin Account**
   - Visit `/admin-login.html`
   - Use admin key: `EVERCART_ADMIN_2025`
   - Create your admin credentials

2. **Add Products**
   - Login to admin dashboard
   - Use "Add Product" to create new items
   - Set categories, prices, descriptions, and images

3. **Manage Inventory**
   - Update product availability
   - Edit product details
   - Delete discontinued items

### 🛍️ **Customer Experience**

1. **Browse Products**
   - Visit homepage for featured items
   - Use shop page for full catalog
   - Filter by category, brand, price, rating

2. **Shopping Cart**
   - Add items to cart
   - Update quantities
   - Proceed to checkout

3. **User Accounts**
   - Register for personalized experience
   - Login to access cart and order history

## 🎨 Customization

### **Adding New Products**
Products can be added through:
- Admin dashboard (recommended)
- Direct database insertion
- Modifying `seed-db.js` for bulk additions

### **Styling**
- Main styles in `public/styles.css`
- Each HTML file has component-specific styles
- Responsive design with mobile-first approach

### **Images**
- Product images stored in `public/Assets/`
- Support for JPG, PNG, WebP formats
- See `IMAGE_REFERENCE_GUIDE.md` for image management

## 🔒 Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **Input Validation** - Server-side validation for all inputs
- **Admin Protection** - Role-based access control
- **Secure Sessions** - Proper authentication flow
- **XSS Prevention** - Input sanitization

## 🧪 Testing

### **Manual Testing**
1. Register/login functionality
2. Product browsing and filtering
3. Cart operations (add, update, remove)
4. Checkout process
5. Admin panel operations

### **Test Admin Account**
```
Admin Key: EVERCART_ADMIN_2025
(Create your own admin credentials)
```

## 🚀 Deployment

### **Local Development**
```bash
npm run dev
```

### **Production**
```bash
npm start
```

### **Database Seeding**
```bash
npm run seed
```

## 📊 Sample Data

The project includes 15 sample products across 8 categories:
- **Electronics** (6 items)
- **Fashion** (2 items)
- **Household** (2 items)
- **Daily Usage** (2 items)
- **Footwear** (1 item)
- **Accessories** (1 item)
- **Fitness** (1 item)
- **Home Appliances** (1 item)
- **Photography** (1 item)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Email**: support@evercart.com
- **Issues**: GitHub Issues
- **Documentation**: This README file

## 📈 Roadmap

### **Planned Features**
- [ ] Order history and tracking
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Product recommendations

### **Technical Improvements**
- [ ] Unit tests
- [ ] API documentation
- [ ] Performance optimization
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

**Built with ❤️ by the EverCart Team**

*Happy Shopping! 🛍️*
