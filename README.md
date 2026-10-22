# TrustMart 🛍️

A full-stack online marketplace where users can browse products, sellers can list items, and administrators can manage users and product listings.

## 🚀 Features

### User Authentication

- User registration and login
- JWT-based authentication
- Role-based access control

### Product Marketplace

- Browse and search product listings
- Filter products by category
- View product information and prices
- Seller-only product listing creation

### Admin Dashboard

- View marketplace statistics
- View and search registered users
- View, search, and delete product listings
- Role-restricted administrative operations

### Frontend

- Responsive React interface
- Search bar and category navigation
- Image carousel and product cards
- Login and seller listing interfaces

## 🛠️ Technologies Used

**Frontend**

- React
- Vite
- JavaScript
- HTML and CSS

**Backend**

- Java 21
- Spring Boot
- Spring Security
- REST APIs
- JWT authentication
- Maven

**Database and Tools**

- MySQL
- Git and GitHub
- Visual Studio Code
- MySQL Workbench

## 📁 Project Structure

```text
TrustMart/
├── trustmart-backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw.cmd
├── trustmart-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project:

- Java 21
- MySQL Server
- Node.js and npm
- Git

## ▶️ Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Atharva-xyz/TrustMart.git
cd TrustMart
```

### 2. Configure MySQL

Create the database:

```sql
CREATE DATABASE trustmart_db;
```

Configure your local database username and password using environment variables. Do not commit real credentials to GitHub.

The backend expects these environment variables:

- `DB_PASSWORD` — your MySQL password
- `TRUSTMART_JWT_SECRET` — a strong, private JWT signing secret

Set both variables in the terminal before starting the backend. Use a secure secret appropriate for your JWT configuration; never publish it in this README.

### 3. Start the backend

Open a terminal in `trustmart-backend` and set the required environment variables.

In PowerShell:

```powershell
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
$env:TRUSTMART_JWT_SECRET="YOUR_PRIVATE_JWT_SECRET"
.\mvnw.cmd spring-boot:run
```

Replace the example values with your own local values. Keep this terminal running.

Backend base URL:

`http://localhost:8080`

### 4. Start the frontend

Open another terminal:

```powershell
cd trustmart-frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

`http://localhost:5173`

## 🔗 Main API Endpoints

| Method | Endpoint                   | Purpose                                          |
| ------ | -------------------------- | ------------------------------------------------ |
| GET    | `/api/products`            | Retrieve product listings                        |
| GET    | `/api/products/{id}`       | Retrieve a product by ID                         |
| POST   | `/api/products`            | Create a listing with seller/admin authorization |
| POST   | `/api/auth/register`       | Register an account                              |
| POST   | `/api/auth/login`          | Log in                                           |
| GET    | `/api/admin/stats`         | Retrieve admin dashboard statistics              |
| GET    | `/api/admin/users`         | Retrieve registered users                        |
| GET    | `/api/admin/products`      | Retrieve products for administration             |
| DELETE | `/api/admin/products/{id}` | Delete a product as an administrator             |

Protected endpoints require the appropriate authentication and authorization.

## 🔐 Security

- JWT-based authentication
- Role-based access control
- Server-side authorization for seller listing creation
- Administrative endpoints restricted by role
- Database credentials and JWT secrets supplied through environment variables

Never commit real passwords, access tokens, or signing secrets.

## 🎯 Project Objective

TrustMart demonstrates full-stack development by integrating a React frontend, a Java Spring Boot REST API, MySQL persistence, authentication, and role-based authorization in one marketplace application.

## 👨‍💻 Author

**Atharva Birje**

GitHub: [Atharva-xyz](https://github.com/Atharva-xyz)

---

_Developed as a full-stack engineering project._
