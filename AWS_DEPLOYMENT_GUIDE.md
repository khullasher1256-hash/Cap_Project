# EverCart AWS Deployment Guide

## Issue Resolution for "Connection Refused" Error

You're experiencing a "connection refused" error because your frontend is trying to connect to `localhost:3000`, but on AWS, it needs to connect to your EC2 instance's public IP address.

## Quick Fix Steps

### 1. Update Your Environment Variables on AWS

On your AWS EC2 instance, update the `.env` file:

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Navigate to your project directory
cd /path/to/your/evercart-project

# Edit the .env file
nano .env
```

Update the `.env` file with your EC2 instance's public IP:

```env
# Replace YOUR_EC2_PUBLIC_IP with your actual EC2 public IP address
API_BASE_URL=http://YOUR_EC2_PUBLIC_IP:3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/evercart
```

### 2. Install Missing Dependencies

Make sure you have all required dependencies installed:

```bash
# Install dotenv package (required for environment variables)
npm install dotenv

# Install all dependencies
npm install
```

### 3. Update Frontend HTML Files

You need to include the dynamic configuration script in your HTML files. Add this line to the `<head>` section of ALL your HTML files:

```html
<script src="/config.js"></script>
```

Add it to these files:
- `public/home.html`
- `public/index.html`
- `public/login.html`
- `public/cart.html`
- `public/admin-login.html`
- `public/admin-dashboard.html`
- All other HTML files

### 4. Update Frontend JavaScript

Replace hardcoded API URLs in your frontend JavaScript with dynamic configuration. For example:

**Before:**
```javascript
fetch('http://localhost:3000/api/login', {
```

**After:**
```javascript
fetch(window.CONFIG.API.LOGIN, {
// OR
fetch(window.getApiUrl('/api/login'), {
```

### 5. Configure Security Groups

Make sure your EC2 security group allows inbound traffic on port 3000:

1. Go to AWS EC2 Console
2. Select your instance
3. Click on Security Groups
4. Edit inbound rules
5. Add rule: Custom TCP, Port 3000, Source 0.0.0.0/0

### 6. Restart Your Application

```bash
# Kill any existing Node.js processes
pkill node

# Start your application
npm start

# Or run in background with nohup
nohup npm start &
```

## Complete Deployment Checklist

### Prerequisites
- [ ] EC2 instance running Amazon Linux 2
- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running
- [ ] Security group configured for ports 22, 80, 443, 3000

### Environment Setup
- [ ] `.env` file configured with correct EC2 public IP
- [ ] `dotenv` package installed
- [ ] MongoDB connection string updated

### Code Updates
- [ ] Dynamic config script added to HTML files
- [ ] Frontend JavaScript updated to use window.CONFIG
- [ ] All hardcoded localhost URLs replaced

### Database Setup
- [ ] MongoDB service running
- [ ] Database seeded with sample data
- [ ] Database accessible from application

### Application Startup
- [ ] Application starts without errors
- [ ] Can access homepage via EC2-IP:3000
- [ ] API endpoints responding correctly

## Example Environment File for AWS

```env
# =============================================================================
# AWS PRODUCTION ENVIRONMENT
# =============================================================================

# Server Configuration
PORT=3000
NODE_ENV=production

# Replace with your actual EC2 public IP address
API_BASE_URL=http://54.123.45.67:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/evercart
DB_NAME=evercart

# Security Configuration
ADMIN_KEY=EVERCART_ADMIN_2025
JWT_SECRET=your-super-secret-production-key
BCRYPT_SALT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=*

# File Upload Configuration
UPLOAD_DIR=public/Assets
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,gif,webp
```

## Testing Your Deployment

1. **Check if server is running:**
   ```bash
   curl http://YOUR_EC2_IP:3000
   ```

2. **Test API endpoints:**
   ```bash
   curl http://YOUR_EC2_IP:3000/api/products
   curl http://YOUR_EC2_IP:3000/config.js
   ```

3. **Check MongoDB connection:**
   ```bash
   mongo
   use evercart
   db.products.count()
   ```

4. **View application logs:**
   ```bash
   # If running with nohup
   tail -f nohup.out
   ```

## Common Issues and Solutions

### 1. "Cannot GET /" Error
- **Solution:** Make sure your static files are being served correctly
- Check that `public` directory exists and contains HTML files

### 2. MongoDB Connection Error
- **Solution:** Start MongoDB service
  ```bash
  sudo systemctl start mongod
  sudo systemctl enable mongod
  ```

### 3. Permission Denied Errors
- **Solution:** Check file permissions
  ```bash
  sudo chown -R ec2-user:ec2-user /path/to/your/project
  chmod -R 755 /path/to/your/project
  ```

### 4. Frontend Still Shows "Connection Refused"
- **Solution:** Clear browser cache and hard refresh (Ctrl+F5)
- Check browser developer tools for any cached requests to localhost

### 5. Port 3000 Not Accessible
- **Solution:** Check security groups and firewall
  ```bash
  # Check if port is listening
  netstat -tlnp | grep 3000
  
  # Check firewall (if enabled)
  sudo iptables -L
  ```

## Production Recommendations

1. **Use PM2 for Process Management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name evercart
   pm2 startup
   pm2 save
   ```

2. **Set up Nginx as Reverse Proxy:**
   ```bash
   sudo amazon-linux-extras install nginx1
   # Configure Nginx to proxy to port 3000
   ```

3. **Use Environment-Specific Configs:**
   - Create separate `.env.production` file
   - Use different MongoDB databases for different environments

4. **Enable HTTPS:**
   - Get SSL certificate (Let's Encrypt)
   - Update API_BASE_URL to use HTTPS

5. **Set up Monitoring:**
   - Use CloudWatch for logs and metrics
   - Set up health checks

## Need Help?

If you're still experiencing issues:

1. Check the server logs for errors
2. Verify your EC2 public IP address hasn't changed
3. Test API endpoints directly with curl
4. Check browser developer tools for network errors
5. Ensure MongoDB is running and accessible

Remember to replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 instance's public IP address in all configurations!
