# EverCart Docker Deployment Guide

This guide will help you deploy the EverCart e-commerce application using Docker and Docker Compose.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/) (version 20.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## 🚀 Quick Start

### 1. Clone and Navigate to Project
```bash
git clone <your-repository-url>
cd Evercart
```

### 2. Build and Start Services
```bash
# Start the application with MongoDB
docker-compose up -d

# View logs (optional)
docker-compose logs -f evercart-app
```

### 3. Seed the Database (First Time Only)
```bash
# Run the seeder to populate initial product data
docker-compose --profile seeder up evercart-seeder

# Or run it manually
docker-compose run --rm evercart-app node seed-db.js
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin-login.html
- **API**: http://localhost:3000/api/*

## 🏗️ Architecture Overview

The Docker setup includes:

### Services:
1. **evercart-app**: Node.js application server
2. **mongodb**: MongoDB database with authentication
3. **evercart-seeder**: Database seeding service (runs once)

### Network:
- Custom bridge network (`evercart-network`) for inter-service communication

### Volumes:
- `mongodb_data`: Persistent storage for MongoDB data
- `mongodb_config`: MongoDB configuration persistence

## 📂 File Structure

```
Evercart/
├── Dockerfile              # Multi-stage Node.js app container
├── docker-compose.yml      # Multi-service orchestration
├── .dockerignore           # Files excluded from Docker build
├── .env.docker            # Environment variables for containers
├── server.js              # Main application server
├── seed-db.js             # Database seeding script
├── package.json           # Node.js dependencies
└── public/                # Static frontend files
```

## 🛠️ Development Commands

### Basic Operations
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a specific service
docker-compose restart evercart-app

# Scale the app (if needed)
docker-compose up -d --scale evercart-app=2
```

### Database Operations
```bash
# Connect to MongoDB container
docker-compose exec mongodb mongosh -u admin -p evercart2025 --authenticationDatabase admin

# Backup database
docker-compose exec mongodb mongodump -u admin -p evercart2025 --authenticationDatabase admin --db evercart --out /data/backup

# Restore database
docker-compose exec mongodb mongorestore -u admin -p evercart2025 --authenticationDatabase admin --db evercart /data/backup/evercart
```

### Rebuild and Update
```bash
# Rebuild app container
docker-compose build evercart-app

# Pull latest images and restart
docker-compose pull && docker-compose up -d

# Clean rebuild (no cache)
docker-compose build --no-cache evercart-app
```

## 🔧 Configuration

### Environment Variables
Key environment variables are configured in `docker-compose.yml`:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | production | Node.js environment |
| `PORT` | 3000 | Application port |
| `MONGODB_URI` | mongodb://admin:evercart2025@mongodb:27017/evercart?authSource=admin | Database connection |
| `ADMIN_KEY` | EVERCART_ADMIN_2025 | Secret for admin account creation |
| `BCRYPT_SALT_ROUNDS` | 12 | Password hashing rounds |

### MongoDB Authentication
- **Username**: admin
- **Password**: evercart2025
- **Database**: evercart
- **Auth Database**: admin

## 🔍 Health Checks

Both services include health checks:

### Application Health Check
- **Endpoint**: `GET /api/products`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds

### MongoDB Health Check
- **Command**: `mongosh --eval "db.adminCommand('ping')"`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds

## 📊 Monitoring

### View Service Status
```bash
# Check service health
docker-compose ps

# View resource usage
docker stats

# View container logs
docker-compose logs -f --tail=100 evercart-app
```

### Application URLs for Testing
- **Health Check**: http://localhost:3000/api/products
- **Categories**: http://localhost:3000/api/categories
- **Brands**: http://localhost:3000/api/brands

## 🛡️ Security Features

1. **Non-root User**: App runs as non-privileged user `evercart`
2. **Authenticated MongoDB**: Database requires username/password
3. **Network Isolation**: Services communicate through private network
4. **Password Hashing**: Bcrypt with 12 salt rounds
5. **Read-only Volumes**: Static files mounted as read-only

## 🔄 Backup and Recovery

### Database Backup
```bash
# Create backup directory
mkdir -p backups

# Backup database
docker-compose exec mongodb mongodump -u admin -p evercart2025 --authenticationDatabase admin --db evercart --out /data/backup

# Copy backup to host
docker cp evercart-mongodb:/data/backup ./backups/
```

### Database Recovery
```bash
# Copy backup to container
docker cp ./backups/evercart evercart-mongodb:/data/restore/

# Restore database
docker-compose exec mongodb mongorestore -u admin -p evercart2025 --authenticationDatabase admin --db evercart /data/restore/evercart
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 3000
netstat -tulpn | grep :3000
# or
lsof -i :3000

# Kill process or change port in docker-compose.yml
```

#### 2. MongoDB Connection Issues
```bash
# Check MongoDB container status
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Test connection manually
docker-compose exec mongodb mongosh -u admin -p evercart2025 --authenticationDatabase admin
```

#### 3. Application Won't Start
```bash
# Check application logs
docker-compose logs evercart-app

# Restart with fresh build
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### 4. Database Seeding Issues
```bash
# Manual seeding
docker-compose run --rm evercart-app node seed-db.js

# Check seeder logs
docker-compose --profile seeder logs evercart-seeder
```

### Performance Optimization
```bash
# Monitor resource usage
docker stats

# Limit memory usage (add to docker-compose.yml)
deploy:
  resources:
    limits:
      memory: 512M
```

## 🧹 Cleanup

### Remove Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker image rm evercart_evercart-app
docker image rm mongo:7.0

# Remove all unused resources
docker system prune -a
```

### Remove Only Containers
```bash
# Stop and remove containers (keep volumes)
docker-compose down
```

## 📈 Production Considerations

1. **Use Docker Secrets** for sensitive data
2. **Set up reverse proxy** (nginx) for HTTPS
3. **Configure log rotation** to prevent disk space issues
4. **Set up monitoring** with tools like Prometheus/Grafana
5. **Regular backups** of database and application data
6. **Update base images** regularly for security patches

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes with `docker-compose build --no-cache`
2. Update this README if configuration changes
3. Ensure health checks pass
4. Test seeding process with fresh database

## 📞 Support

For Docker-related issues:
1. Check this README first
2. Review Docker and Docker Compose logs
3. Verify system requirements are met
4. Check network connectivity and port availability

---

Happy containerizing! 🐳
