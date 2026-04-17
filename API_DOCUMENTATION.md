# Personal Finance App - API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": "d10a33c5-a04b-4374-aef8-89c07e28d6a0"
}
```

---

### Login User
**POST** `/auth/login`

Authenticates user and returns JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "test-user-1",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### Refresh Token
**POST** `/auth/refresh`

Generates new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Credit Card Endpoints

### Get All Credit Cards
**GET** `/credit-cards`

Retrieves all credit cards for the authenticated user.

**Response (200):**
```json
{
  "cards": [
    {
      "id": "card-id-1",
      "name": "Visa Platinum",
      "creditLimit": 5000,
      "currentBalance": 1500,
      "availableCredit": 3500,
      "lastDigits": "4242",
      "issuer": "VISA"
    }
  ]
}
```

---

### Create Credit Card
**POST** `/credit-cards/create`

Creates a new credit card account.

**Request Body:**
```json
{
  "name": "My Amex Card",
  "creditLimit": 8000,
  "lastDigits": "3782",
  "issuer": "AMEX"
}
```

**Response (201):**
```json
{
  "message": "Credit card created successfully",
  "cardId": "e5dfd8cd-2b16-4e6a-b22d-01ef111e5d19"
}
```

---

### Get Credit Card Details
**GET** `/credit-cards/{id}`

Retrieves details for a specific credit card.

**Response (200):**
```json
{
  "card": {
    "id": "card-id-1",
    "name": "Visa Platinum",
    "creditLimit": 5000,
    "currentBalance": 1500,
    "availableCredit": 3500,
    "lastDigits": "4242",
    "issuer": "VISA"
  }
}
```

---

### Delete Credit Card
**DELETE** `/credit-cards/{id}`

Deletes a credit card and all associated expenses.

**Response (200):**
```json
{
  "message": "Credit card deleted successfully"
}
```

---

## Expense Endpoints

### Add Expense
**POST** `/expenses`

Adds a new expense to a credit card.

**Request Body:**
```json
{
  "creditCardId": "card-id-1",
  "description": "Coffee",
  "amount": 5.99,
  "category": "Food & Beverages",
  "date": "2026-03-16T10:30:00Z"  // Optional, defaults to now
}
```

**Response (201):**
```json
{
  "message": "Expense added successfully",
  "expenseId": "895eac02-6b5c-44fe-98bc-b518fe415633"
}
```

---

### Get Expenses for Credit Card
**GET** `/credit-cards/{id}/expenses`

Retrieves all expenses for a specific credit card.

**Response (200):**
```json
{
  "expenses": [
    {
      "id": "expense-id-1",
      "creditCardId": "card-id-1",
      "description": "Coffee at Starbucks",
      "amount": 5.99,
      "category": "Food & Beverages",
      "date": "2026-03-16T22:31:31.086Z",
      "createdAt": "2026-03-16T22:31:31.086Z"
    }
  ],
  "totalAmount": 201.49
}
```

---

### Get Expense Details
**GET** `/expenses/{id}`

Retrieves details for a specific expense.

**Response (200):**
```json
{
  "expense": {
    "id": "expense-id-1",
    "creditCardId": "card-id-1",
    "description": "Coffee at Starbucks",
    "amount": 5.99,
    "category": "Food & Beverages",
    "date": "2026-03-16T22:31:31.086Z",
    "createdAt": "2026-03-16T22:31:31.086Z"
  }
}
```

---

### Update Expense
**PUT** `/expenses/{id}`

Updates an existing expense.

**Request Body:**
```json
{
  "description": "Updated description",
  "amount": 6.99,
  "category": "Updated Category",
  "date": "2026-03-16T10:30:00Z"
}
```

**Response (200):**
```json
{
  "message": "Expense updated successfully"
}
```

---

### Delete Expense
**DELETE** `/expenses/{id}`

Deletes an expense and adjusts credit card balance.

**Response (200):**
```json
{
  "message": "Expense deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Not authorized"
}
```

### 404 Not Found
```json
{
  "error": "Credit card not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Key Features

✅ **User Authentication** - JWT-based login with access and refresh tokens  
✅ **Credit Card Management** - Create, view, and delete credit cards  
✅ **Expense Tracking** - Add, view, update, and delete expenses  
✅ **Balance Tracking** - Automatically tracks current balance and available credit  
✅ **Authorization** - All endpoints protected with JWT middleware  
✅ **Clean Architecture** - Repository pattern for database abstraction  
✅ **Type Safety** - Full TypeScript implementation  
✅ **Database** - Prisma ORM with SQLite  
✅ **Docker Containerization** - Development environment in Docker
