# IQ Test Platform - Startup Commands

## Development Mode

### Option 1: Run in separate terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 2: Using concurrently (if installed)
```bash
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm start"
```

## Production Mode

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve the build folder using a static server
npx serve -s build -p 3000
```

## Database Operations

### Create Database
```bash
mysql -u root -p < backend/database/schema.sql
```

### Add Sample Data
```bash
mysql -u root -p < backend/database/sample_data.sql
```

### Reset Database
```bash
mysql -u root -p
DROP DATABASE IF EXISTS iq_test_db;
SOURCE backend/database/schema.sql;
SOURCE backend/database/sample_data.sql;
exit
```

## Generate Admin User
```bash
cd backend
node scripts/createAdmin.js
# Copy the SQL output and run it in MySQL
```

## Useful Commands

### Check if ports are available
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :5000
lsof -i :3000
```

### Kill process on port (if needed)
```bash
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

### View logs
```bash
# Backend logs
cd backend
npm run dev

# Frontend logs
cd frontend
npm start
```

## Testing Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Environment Setup Checklist

- [ ] Node.js installed (v14+)
- [ ] MySQL installed and running
- [ ] Database created
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Dependencies installed (backend & frontend)
- [ ] OpenAI API key added
- [ ] Google OAuth credentials added (optional)
- [ ] Razorpay keys added (optional for testing)
- [ ] Email credentials configured (optional for testing)

## Quick Start (First Time)

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install

# 3. Setup database
cd ..
mysql -u root -p < backend/database/schema.sql

# 4. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both .env files with your credentials

# 5. Generate admin user
cd backend
node scripts/createAdmin.js
# Copy SQL and run in MySQL

# 6. Start backend (Terminal 1)
npm run dev

# 7. Start frontend (Terminal 2)
cd ../frontend
npm start
```

## URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/health

## Default Credentials

### Admin (after running createAdmin.js)
- Email: admin@iqtest.com
- Password: admin123

### Test User (create via registration)
- Register at: http://localhost:3000/register

---

**Ready to go! 🚀**
