# Mess Slot Booking System

A full-stack university mess management system that allows students to book meal slots and enables administrators to manage students, meal timings, and analytics.

🔗 Built as a real-world campus automation project.

---

##  Key Features

###  Student Panel
- Secure student login (college email based)
- Book mess slots (Breakfast, Lunch, Dinner)
- Prevent double bookings
- View booking history
- QR-based meal verification system

### Admin Panel
- Secure admin login
- Create & manage meal slots
- View all student bookings
- Manage registered students
- Daily mess usage analytics
- QR Scanner for attendance

---

## System Workflow

1. Students log in using university email  
2. Students book available meal slots
3. Slot gets selected to the nearest slot available automatically for the selected meal
4. Admin monitors bookings in real time  
5. QR codes are used to verify entry  
6. Analytics dashboard shows meal statistics

---
## 📸 Screenshots

### Student Login
![Student Login](screenshots/student-login.png)

### Student Dashboard
![Student Dashboard](screenshots/student-dashboard.png)

### Student Meal QR
![Student QR](screenshots/student-meal-qr.png)

### Admin QR Scanner
![Admin QR Scanner](screenshots/admin-qr-scanner.png)


##  Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Authentication | JWT |
| Styling | CSS |
| Tools | Git, GitHub |

---

## ⚙️ Installation Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/arjunnvarshney/mess-slot-booking.git
cd mess-slot-booking
```

---
# API Documentation

Base URL (local):
http://localhost:5000/api


---

## Admin APIs

### Register Admin  
**POST** `/admin/register`  

Create a new admin account.

**Request Body**
```json
{
  "username": "admin",
  "password": "password123"
}
Success Response

{ "message": "Admin registered successfully" }
Admin Login
POST /admin/login

Authenticates admin and returns a JWT token.

Request Body

{
  "username": "admin",
  "password": "password123"
}
Success Response

{
  "message": "Admin login successful",
  "token": "jwt_token_here"
}
Get Logged-in Admin
GET /admin/me
Requires Admin Token

Headers

Authorization: Bearer <token>
Response

{
  "message": "Admin authenticated",
  "admin": {
    "id": "admin_id",
    "username": "admin"
  }
}
Today’s Stats
GET /admin/stats/today
Requires Admin Token

Returns today’s meal booking summary.

Response

{
  "breakfast": 45,
  "lunch": 120,
  "dinner": 90,
  "totalStudents": 180
}
Today’s Booking Report
GET /admin/reports/today
Requires Admin Token

Returns full booking details for export.

Daily Analytics
GET /admin/analytics/daily?date=YYYY-MM-DD
Requires Admin Token

Returns booking vs consumption per meal.

Weekly Analytics
GET /admin/analytics/weekly
Requires Admin Token

Returns last 7 days booking statistics.

Get All Bookings
GET /admin/bookings
Requires Admin Token

Returns all student bookings with slot details.

Student APIs
Create Student
POST /students/create

Registers a new student.

Request Body

{
  "rollNo": "E23CSEU1638",
  "name": "Arjun",
  "hostel": "A Block",
  "password": "studentpass"
}
Success Response

{ "message": "Student created successfully" }
 Get Student Profile
GET /students/profile
 Requires Student Token

Headers

Authorization: Bearer <token>
Returns logged-in student data.

Authentication
Protected routes require a JWT token in headers:

Authorization: Bearer <your_token>
Admin routes use adminAuth middleware
Student routes use studentAuth middleware






