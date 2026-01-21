# Quick Setup Guide

## ⚡ Fast Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 2: Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
source backend/database/schema.sql
source backend/database/sample_data.sql
exit
```

### Step 3: Configure Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env and add your credentials
```

**Frontend (.env)**
```bash
cd frontend
cp .env.example .env
# Edit .env and add your credentials
```

### Step 4: Get Required API Keys

1. **OpenAI API Key**
   - Visit: https://platform.openai.com
   - Create account & generate API key
   - Add to backend .env: `OPENAI_API_KEY=your_key`

2. **Google OAuth**
   - Visit: https://console.cloud.google.com
   - Create project → Enable Google+ API
   - Create OAuth credentials
   - Add authorized redirect: `http://localhost:5000/api/auth/google/callback`
   - Add to both .env files

3. **Razorpay**
   - Visit: https://razorpay.com
   - Sign up → Get test keys
   - Add to backend .env

4. **Gmail (for emails)**
   - Enable 2FA on Gmail
   - Generate App Password
   - Add to backend .env

### Step 5: Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 6: Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

## 🎯 First Steps

1. **Register** a new account
2. **Login** to dashboard
3. **Take a test** (IQ or Career)
4. **Generate report** (Free or Paid)
5. **Access admin** (create admin user first)

## 🔐 Create Admin User

```sql
-- Connect to MySQL
mysql -u root -p

-- Use database
USE iq_test_db;

-- Hash password first (use bcrypt online tool or run node script)
-- Password: admin123
-- Hashed: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO users (email, password, name, role) 
VALUES ('admin@iqtest.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin');
```

Login with:
- Email: admin@iqtest.com
- Password: admin123

## 📝 Minimum Required Configuration

**Backend .env (Essential)**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=iq_test_db
JWT_SECRET=any_random_secret_string_here
OPENAI_API_KEY=your_openai_key
FRONTEND_URL=http://localhost:3000
```

**Frontend .env (Essential)**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚨 Common Issues & Fixes

### Issue: Database connection failed
```bash
# Check MySQL is running
mysql --version

# Verify credentials
mysql -u root -p

# Check database exists
SHOW DATABASES;
```

### Issue: OpenAI API errors
- Verify API key is correct
- Check OpenAI account has credits
- Test with simple prompt

### Issue: Email not sending
- Use Gmail App Password (not regular password)
- Check firewall/antivirus blocking SMTP

### Issue: Payment not working
- Use Razorpay test mode keys
- Check key format (starts with rzp_test_)

## 🎨 Test the Features

### Test Flow:
1. Register → Login
2. Dashboard → Start IQ Test
3. Answer questions → Submit
4. Choose report type
5. For paid: Complete Razorpay payment
6. Check email for report PDF
7. Download from Reports section

### Admin Flow:
1. Login as admin
2. View Statistics
3. Manage Questions
4. View All Reports
5. Update Settings (Pricing)

## 📞 Need Help?

Check:
1. Terminal logs for errors
2. Browser console for frontend errors
3. MySQL logs for database issues
4. .env files for missing variables

## 🎉 Success Checklist

- [ ] MySQL database created
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can register/login
- [ ] Can take test
- [ ] Can generate report
- [ ] Admin dashboard accessible

---

**Happy Testing! 🚀**
