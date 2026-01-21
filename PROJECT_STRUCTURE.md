# Project Structure

```
IQ-Test/
│
├── backend/                          # Node.js Backend
│   ├── config/
│   │   └── database.js              # MySQL connection configuration
│   │
│   ├── database/
│   │   ├── schema.sql               # Database schema with all tables
│   │   └── sample_data.sql          # Sample questions for testing
│   │
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   │
│   ├── routes/
│   │   ├── auth.js                  # Authentication routes (login, register, OAuth)
│   │   ├── tests.js                 # Test management routes
│   │   ├── reports.js               # Report generation and retrieval
│   │   ├── payments.js              # Razorpay payment processing
│   │   └── admin.js                 # Admin panel routes
│   │
│   ├── services/
│   │   ├── openai.js                # OpenAI integration for AI analysis
│   │   ├── pdf.js                   # PDF generation using PDFKit
│   │   └── email.js                 # Email service using Nodemailer
│   │
│   ├── scripts/
│   │   └── createAdmin.js           # Script to generate admin credentials
│   │
│   ├── reports/                     # Generated PDF reports (auto-created)
│   │
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Git ignore file
│   ├── package.json                 # Backend dependencies
│   └── server.js                    # Express server entry point
│
├── frontend/                         # React Frontend
│   ├── public/
│   │   └── index.html               # HTML template
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js            # Navigation bar component
│   │   │   └── Navbar.css           # Navbar styles
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js       # Global authentication state
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.js             # Login page
│   │   │   ├── Register.js          # Registration page
│   │   │   ├── Auth.css             # Auth pages styles
│   │   │   ├── Dashboard.js         # Main dashboard
│   │   │   ├── Dashboard.css        # Dashboard styles
│   │   │   ├── TestPage.js          # Test taking interface
│   │   │   ├── TestPage.css         # Test page styles
│   │   │   ├── Reports.js           # Reports management
│   │   │   ├── Reports.css          # Reports styles
│   │   │   ├── Payment.js           # Payment processing page
│   │   │   ├── Payment.css          # Payment styles
│   │   │   ├── AdminDashboard.js    # Admin panel
│   │   │   └── AdminDashboard.css   # Admin styles
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Axios API configuration and endpoints
│   │   │
│   │   ├── App.js                   # Main app component with routing
│   │   ├── index.js                 # React entry point
│   │   └── index.css                # Global styles
│   │
│   ├── .env.example                 # Frontend environment template
│   ├── .gitignore                   # Git ignore file
│   └── package.json                 # Frontend dependencies
│
├── README.md                         # Main documentation
├── SETUP.md                         # Quick setup guide
└── COMMANDS.md                      # Useful commands reference

```

## 📁 Detailed File Descriptions

### Backend

#### Configuration
- **database.js**: MySQL connection pool with automatic reconnection

#### Database
- **schema.sql**: Complete database structure with 8 tables
- **sample_data.sql**: 20 sample questions (10 IQ + 10 Career)

#### Middleware
- **auth.js**: JWT verification, admin authorization

#### Routes
- **auth.js**: Register, login, Google OAuth
- **tests.js**: Get tests, start attempt, submit answers
- **reports.js**: Generate reports, download PDFs
- **payments.js**: Create orders, verify payments
- **admin.js**: Manage users, questions, reports, settings

#### Services
- **openai.js**: AI-powered test analysis
- **pdf.js**: Generate professional PDF reports
- **email.js**: Send reports and payment links

### Frontend

#### Components
- **Navbar**: Responsive navigation with user menu

#### Context
- **AuthContext**: Global authentication state management

#### Pages
- **Login/Register**: Authentication with Google OAuth
- **Dashboard**: Test selection and history
- **TestPage**: Interactive test-taking interface with timer
- **Reports**: Report management and download
- **Payment**: Razorpay payment integration
- **AdminDashboard**: Complete admin panel

#### Services
- **api.js**: Centralized API calls with interceptors

## 🎯 Key Features by File

### Backend Routes

**auth.js**
- ✅ Form-based registration
- ✅ Form-based login
- ✅ Google OAuth integration
- ✅ JWT token generation

**tests.js**
- ✅ List all tests
- ✅ Get test questions
- ✅ Start test attempt
- ✅ Submit answers
- ✅ Calculate scores
- ✅ View history

**reports.js**
- ✅ Generate free reports
- ✅ Generate paid reports
- ✅ AI analysis integration
- ✅ PDF generation
- ✅ Email delivery
- ✅ Download reports

**payments.js**
- ✅ Create Razorpay orders
- ✅ Verify payments
- ✅ Payment history
- ✅ Automatic report unlock

**admin.js**
- ✅ View all users
- ✅ View all reports
- ✅ Manage questions (CRUD)
- ✅ Update settings
- ✅ View statistics

### Frontend Pages

**Dashboard**
- ✅ Beautiful test cards
- ✅ Test descriptions
- ✅ Recent history
- ✅ Progress tracking

**TestPage**
- ✅ Timer countdown
- ✅ Progress bar
- ✅ Question navigation
- ✅ Answer tracking
- ✅ Auto-submission

**Reports**
- ✅ Free vs Paid comparison
- ✅ Report list with filters
- ✅ Download functionality
- ✅ Upgrade options

**Payment**
- ✅ Razorpay integration
- ✅ Premium features list
- ✅ Secure checkout
- ✅ Payment verification

**AdminDashboard**
- ✅ Statistics cards
- ✅ User management
- ✅ Question editor
- ✅ Settings panel
- ✅ Revenue tracking

## 🔐 Security Features

- JWT authentication
- Password hashing (bcrypt)
- CORS configuration
- SQL injection prevention
- XSS protection
- Secure payment processing

## 📊 Database Tables

1. **users**: User accounts
2. **tests**: Test configurations
3. **questions**: Test questions
4. **user_test_attempts**: Test sessions
5. **user_answers**: Individual answers
6. **reports**: Generated reports
7. **payments**: Payment records
8. **settings**: System configuration

## 🎨 UI Components

- Gradient backgrounds
- Card-based layouts
- Responsive design
- Toast notifications
- Loading spinners
- Modal dialogs
- Progress indicators
- Icon integration

## 🔄 Data Flow

1. User → Frontend
2. Frontend → Backend API
3. Backend → Database
4. Backend → External APIs (OpenAI, Razorpay)
5. Backend → Email Service
6. Backend → PDF Generation
7. Response → Frontend
8. Frontend → User

---

**Well-structured and production-ready! 🚀**
