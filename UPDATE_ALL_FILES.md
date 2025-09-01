# Complete List of Files Updated for Dynamic API Configuration

## ✅ Files Already Updated:
1. **index.html** - ✅ Config script added, API calls updated to use `window.CONFIG.API.*`
2. **login.html** - ✅ Config script added, API calls updated to use `window.CONFIG.API.*`
3. **cart.html** - ✅ Config script added, API calls updated to use `window.CONFIG.API.*`

## 📋 Files That Still Need Config Script Added:

### Core HTML Files:
1. **home.html** - Needs config script + API updates
2. **admin-login.html** - Needs config script + API updates
3. **admin-dashboard.html** - Needs config script + API updates

### Static Pages (May not need API calls):
4. **about.html** - Needs config script (just in case)
5. **blog.html** - Needs config script (just in case)
6. **contact.html** - Needs config script (just in case)
7. **faq.html** - Needs config script (just in case)

## 🔧 Required Changes for Each File:

### Step 1: Add Config Script to `<head>` section
```html
<script src="/config.js"></script>
```

### Step 2: Replace Hardcoded API URLs
Replace all instances of:
- `http://localhost:3000/api/login` → `window.CONFIG.API.LOGIN`
- `http://localhost:3000/api/signup` → `window.CONFIG.API.SIGNUP`
- `http://localhost:3000/api/products` → `window.CONFIG.API.PRODUCTS`
- `http://localhost:3000/api/categories` → `window.CONFIG.API.CATEGORIES`
- `http://localhost:3000/api/brands` → `window.CONFIG.API.BRANDS`
- `http://localhost:3000/api/cart` → `window.CONFIG.API.CART_GET`
- `http://localhost:3000/api/cart/add` → `window.CONFIG.API.CART_ADD`
- `http://localhost:3000/api/cart/update` → `window.CONFIG.API.CART_UPDATE`
- `http://localhost:3000/api/cart/remove` → `window.CONFIG.API.CART_REMOVE`
- `http://localhost:3000/api/cart/clear` → `window.CONFIG.API.CART_CLEAR`
- `http://localhost:3000/api/admin/login` → `window.CONFIG.API.ADMIN_LOGIN`
- `http://localhost:3000/api/admin/create` → `window.CONFIG.API.ADMIN_CREATE`
- `http://localhost:3000/api/admin/products` → `window.CONFIG.API.ADMIN_PRODUCTS`

## 🔄 Backend Configuration System:

### Server.js Updates Made:
1. Added environment variable support with `dotenv`
2. Added dynamic `/config.js` endpoint that serves configuration based on environment
3. Updated MongoDB connection to use `MONGODB_URI` environment variable
4. Updated admin key to use `ADMIN_KEY` environment variable
5. Updated bcrypt salt rounds to use `BCRYPT_SALT_ROUNDS` environment variable

### Environment Files:
1. `.env` - Main environment file (configured with AWS IP: 44.204.20.146:3000)
2. `.env.production` - Production-specific environment file
3. `public/config.js` - Static fallback config file

## 🌐 How It Works:

### Dynamic Configuration:
1. Server reads `API_BASE_URL` from environment variables
2. `/config.js` endpoint dynamically generates JavaScript configuration
3. Frontend loads `/config.js` and uses `window.CONFIG.API.*` for all API calls
4. This allows the same code to work on:
   - Local development: `http://localhost:3000`
   - AWS deployment: `http://44.204.20.146:3000`
   - Any other environment: Just update the `API_BASE_URL` in `.env`

### Deployment Process:
1. Copy files to AWS EC2 instance
2. Update `.env` file with correct `API_BASE_URL`
3. Install dependencies: `npm install dotenv`
4. Start server: `npm start`
5. Application automatically works with new IP address

## 🚀 Benefits of This Approach:

1. **Environment Agnostic**: Same code works everywhere
2. **Easy Deployment**: Just update one environment variable
3. **No Code Changes**: Frontend automatically adapts to backend URL
4. **Future Proof**: Easy to switch between environments
5. **Security**: Environment variables keep configuration secure

## ⚡ Quick Deployment Commands:

```bash
# On AWS EC2 instance
cd /path/to/your/project

# Install missing dependency
npm install dotenv

# Update environment file
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
API_BASE_URL=http://44.204.20.146:3000
MONGODB_URI=mongodb://localhost:27017/evercart
ADMIN_KEY=EVERCART_ADMIN_2025
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=*
EOF

# Start MongoDB
sudo systemctl start mongod

# Start application
npm start
```

Your application should now work on any IP address by simply updating the `API_BASE_URL` environment variable!
