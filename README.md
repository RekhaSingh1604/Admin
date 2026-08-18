# Bingo Admin Panel

A responsive Admin Panel developed as part of the Bingo Singapore Pte. Ltd. frontend assessment.

## Tech Stack

- React.js
- Vite
- JavaScript (ES6+)
- React Router DOM
- Axios
- CSS
- JWT Authentication
- REST APIs

## Implemented Modules

### Authentication & Session
- Login with JWT authentication
- Access and refresh token handling
- Protected routes
- Automatic token refresh on `401 Unauthorized`
- Logout and logout-all functionality
- Session handling

### Dashboard
- Dynamic KPI cards
- Live API integration
- Users, vendors, products and order statistics
- Loading and error states
- Responsive dashboard UI

API:
```text
GET /api/v1/admin/dashboard

Profile
Dynamic profile information
Full name
Email
Phone
Role
Account status
Email/phone verification status
Responsive profile UI

API:

GET /api/v1/auth/profile
Settings
Settings sidebar/categories
Setting groups
Dynamic settings UI
Loading and error states
Responsive settings layout
UI & UX
Fully responsive admin layout
Responsive sidebar and mobile navigation
Modern dashboard UI
Loading states
Empty states
Error states
Retry actions
Permission-aware UI handling
