# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response 201:
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response 200:
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Google OAuth
```http
GET /auth/google
# Redirects to Google login

GET /auth/google/callback
# Google callback URL
```

## Tests

### Get All Tests
```http
GET /tests

Response 200:
[
  {
    "id": 1,
    "test_type": "iq",
    "title": "General IQ Assessment",
    "description": "Comprehensive IQ test...",
    "duration_minutes": 45,
    "is_active": true
  }
]
```

### Get Test by ID
```http
GET /tests/:id

Response 200:
{
  "id": 1,
  "test_type": "iq",
  "title": "General IQ Assessment",
  "description": "...",
  "duration_minutes": 45
}
```

### Get Test Questions
```http
GET /tests/:id/questions
Authorization: Bearer {token}

Response 200:
[
  {
    "id": 1,
    "question_text": "What comes next in the sequence...",
    "question_type": "multiple_choice",
    "options": ["16", "24", "32", "64"],
    "order_number": 1
  }
]
```

### Start Test Attempt
```http
POST /tests/:id/start
Authorization: Bearer {token}

Response 200:
{
  "message": "Test started",
  "attemptId": 123
}
```

### Submit Answer
```http
POST /tests/attempts/:attemptId/answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "questionId": 1,
  "answer": "32"
}

Response 200:
{
  "message": "Answer submitted"
}
```

### Complete Test
```http
POST /tests/attempts/:attemptId/complete
Authorization: Bearer {token}

Response 200:
{
  "message": "Test completed",
  "score": 8,
  "total": 10,
  "percentage": 80
}
```

### Get Test History
```http
GET /tests/user/history
Authorization: Bearer {token}

Response 200:
[
  {
    "id": 1,
    "test_id": 1,
    "title": "General IQ Assessment",
    "test_type": "iq",
    "score": 8,
    "total_questions": 10,
    "status": "completed",
    "created_at": "2024-01-20T10:00:00Z"
  }
]
```

## Reports

### Generate Report
```http
POST /reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "attemptId": 123,
  "reportType": "free"  // or "paid"
}

Response 200:
{
  "message": "Report generated successfully",
  "reportId": 456,
  "needsPayment": false
}
```

### Get User Reports
```http
GET /reports/user
Authorization: Bearer {token}

Response 200:
[
  {
    "id": 1,
    "attempt_id": 123,
    "report_type": "free",
    "score": 8,
    "total_questions": 10,
    "title": "General IQ Assessment",
    "test_type": "iq",
    "is_paid": false,
    "created_at": "2024-01-20T10:00:00Z"
  }
]
```

### Download Report
```http
GET /reports/:id/download
Authorization: Bearer {token}

Response 200:
Binary PDF file
```

## Payments

### Create Order
```http
POST /payments/create-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "reportId": 456
}

Response 200:
{
  "orderId": "order_xyz123",
  "amount": 49900,
  "currency": "INR",
  "keyId": "rzp_test_..."
}
```

### Verify Payment
```http
POST /payments/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash"
}

Response 200:
{
  "message": "Payment verified successfully",
  "reportId": 456
}
```

### Get Payment History
```http
GET /payments/history
Authorization: Bearer {token}

Response 200:
[
  {
    "id": 1,
    "report_id": 456,
    "amount": 499,
    "status": "completed",
    "test_title": "General IQ Assessment",
    "created_at": "2024-01-20T10:00:00Z"
  }
]
```

## Admin Routes

All admin routes require `Authorization: Bearer {admin_token}`

### Get Statistics
```http
GET /admin/statistics
Authorization: Bearer {admin_token}

Response 200:
{
  "totalUsers": 150,
  "totalTestsCompleted": 320,
  "totalReports": 280,
  "paidReports": 95,
  "totalRevenue": 47405
}
```

### Get All Users
```http
GET /admin/users
Authorization: Bearer {admin_token}

Response 200:
[
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "auth_provider": "local",
    "created_at": "2024-01-20T10:00:00Z"
  }
]
```

### Get All Reports
```http
GET /admin/reports
Authorization: Bearer {admin_token}

Response 200:
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "test_title": "General IQ Assessment",
    "report_type": "paid",
    "score": 8,
    "total_questions": 10,
    "is_paid": true,
    "created_at": "2024-01-20T10:00:00Z"
  }
]
```

### Get All Questions
```http
GET /admin/questions
Authorization: Bearer {admin_token}

Response 200:
[
  {
    "id": 1,
    "test_id": 1,
    "test_title": "General IQ Assessment",
    "test_type": "iq",
    "question_text": "What comes next...",
    "question_type": "multiple_choice",
    "options": ["16", "24", "32", "64"],
    "correct_answer": "32",
    "points": 1,
    "order_number": 1
  }
]
```

### Add Question
```http
POST /admin/questions
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "test_id": 1,
  "question_text": "New question...",
  "question_type": "multiple_choice",
  "options": ["A", "B", "C", "D"],
  "correct_answer": "B",
  "points": 1,
  "order_number": 11
}

Response 201:
{
  "message": "Question added successfully",
  "questionId": 21
}
```

### Update Question
```http
PUT /admin/questions/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "question_text": "Updated question...",
  "question_type": "multiple_choice",
  "options": ["A", "B", "C", "D"],
  "correct_answer": "C",
  "points": 1,
  "order_number": 11
}

Response 200:
{
  "message": "Question updated successfully"
}
```

### Delete Question
```http
DELETE /admin/questions/:id
Authorization: Bearer {admin_token}

Response 200:
{
  "message": "Question deleted successfully"
}
```

### Get Settings
```http
GET /admin/settings
Authorization: Bearer {admin_token}

Response 200:
[
  {
    "id": 1,
    "setting_key": "paid_report_price",
    "setting_value": "499",
    "description": "Price for detailed paid report in INR"
  }
]
```

### Update Setting
```http
PUT /admin/settings/:key
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "value": "599"
}

Response 200:
{
  "message": "Setting updated successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```

## Authentication Header Format

All protected routes require JWT token:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rate Limiting

- No rate limiting implemented in current version
- Recommended: Add rate limiting middleware for production

## CORS

- Configured for frontend URL: `http://localhost:3000`
- Credentials enabled for cookie-based auth

---

**Complete API Reference for IQ Test Platform**
