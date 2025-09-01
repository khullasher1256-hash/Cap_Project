# Deploy EverCart to AWS EC2 (44.204.20.146)

## Quick Fix Commands for Your Server

### 1. Connect to Your AWS Instance
```bash
ssh -i your-key.pem ec2-user@44.204.20.146
```

### 2. Navigate to Your Project Directory
```bash
cd /path/to/your/evercart-project
```

### 3. Install Missing Dependencies
```bash
npm install dotenv
npm install
```

### 4. Create/Update Environment File
```bash
cat > .env << 'EOF'
# EverCart AWS Production Environment
PORT=3000
NODE_ENV=production
API_BASE_URL=http://44.204.20.146:3000
MONGODB_URI=mongodb://localhost:27017/evercart
DB_NAME=evercart
ADMIN_KEY=EVERCART_ADMIN_2025
JWT_SECRET=aws-production-secret-key-2025
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=*
EOF
```

### 5. Update Frontend HTML Files
You need to add the dynamic configuration script to your HTML files. Add this line to the `<head>` section of ALL HTML files:

```html
<script src="/config.js"></script>
```

**Files to update:**
- `public/home.html`
- `public/index.html` 
- `public/login.html`
- `public/cart.html`
- `public/admin-login.html`
- `public/admin-dashboard.html`

**Example for login.html:**
```bash
# Add script tag to head section
sed -i '/<head>/a\    <script src="/config.js"></script>' public/login.html
```

### 6. Replace Hardcoded API URLs in JavaScript

Find and replace all hardcoded `localhost:3000` URLs in your HTML files:

```bash
# Replace in all HTML files
find public/ -name "*.html" -type f -exec sed -i 's|http://localhost:3000/api/|window.CONFIG.API_BASE_URL + "/api/|g' {} \;

# Or manually replace specific patterns:
# fetch('http://localhost:3000/api/login') -> fetch(window.CONFIG.API.LOGIN)
# fetch('http://localhost:3000/api/signup') -> fetch(window.CONFIG.API.SIGNUP)
```

### 7. Start MongoDB Service
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 8. Seed Database (if needed)
```bash
npm run seed
```

### 9. Start Application
```bash
# Kill any existing processes
pkill node

# Start application
npm start

# Or run in background
nohup npm start > app.log 2>&1 &
```

### 10. Test Your Application
```bash
# Test server
curl http://44.204.20.146:3000

# Test API endpoints
curl http://44.204.20.146:3000/api/products
curl http://44.204.20.146:3000/config.js
```

## Browser Testing

1. Open your browser and go to: `http://44.204.20.146:3000`
2. Check browser developer tools (F12) to see if there are any CORS or connection errors
3. Try signing up for a new account
4. Try browsing products

## Security Group Configuration

Make sure your EC2 security group has these inbound rules:
- **SSH**: Port 22, Source: Your IP
- **HTTP**: Port 80, Source: 0.0.0.0/0  
- **Custom TCP**: Port 3000, Source: 0.0.0.0/0
- **HTTPS**: Port 443, Source: 0.0.0.0/0 (if using SSL)

## Manual Frontend Updates (Alternative Method)

If the automated replacements don't work, manually update these files:

### login.html - Update API calls:
Replace:
```javascript
fetch('http://localhost:3000/api/login', {
```
With:
```javascript
fetch('http://44.204.20.146:3000/api/login', {
```

### index.html - Update API calls:
Replace:
```javascript
const url = new URL('http://localhost:3000/api/products');
```
With:
```javascript
const url = new URL('http://44.204.20.146:3000/api/products');
```

### cart.html - Update API calls:
Replace:
```javascript
fetch('http://localhost:3000/api/cart', {
```
With:
```javascript
fetch('http://44.204.20.146:3000/api/cart', {
```

## Troubleshooting

### If you get "Connection Refused":
1. Check if server is running: `ps aux | grep node`
2. Check if port 3000 is listening: `netstat -tlnp | grep 3000`
3. Check security groups allow port 3000
4. Clear browser cache (Ctrl+F5)

### If MongoDB connection fails:
```bash
sudo systemctl status mongod
sudo systemctl start mongod
mongo --eval "db.runCommand('ping')"
```

### If you get permission errors:
```bash
sudo chown -R ec2-user:ec2-user /path/to/your/project
chmod -R 755 /path/to/your/project
```

## Success Indicators

✅ Server starts without errors
✅ Can access `http://44.204.20.146:3000` in browser
✅ Can sign up/login successfully
✅ Products load on the shop page
✅ No "connection refused" errors in browser console

Your application should now be fully functional on AWS!
