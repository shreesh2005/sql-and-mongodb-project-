# Deployment & Installation Guide

Follow these steps to deploy and run the SCM portal on your local machine or production environment.

---

## 📋 Prerequisites

Ensure you have the following software installed:
1. **Node.js** (v18.x or higher) & **npm** (v9.x or higher).
2. **MySQL Server** (v8.0+) with database name `tata_supply_chain`.
3. **MongoDB Server** (v6.0+) running locally or a **MongoDB Atlas** cluster.

---

## 🚀 Quick Start Guide

### Step 1: Initialize MySQL Schema
Log into your local MySQL CLI or Workbench and run the schema setup:
```sql
CREATE DATABASE tata_supply_chain;
USE tata_supply_chain;
SOURCE E:/STUDY/CDAC/Project/files/Tata_SCDB_Schema.sql;
```
This initializes all 13 3NF tables and seeds the database with historical records.

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=5000
NODE_ENV=development

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=tata_supply_chain

MONGODB_URI=mongodb://localhost:27017/tata_supply_chain
JWT_SECRET=tata_supply_chain_secret_key
JWT_EXPIRES_IN=7d
```

### Step 3: Install Dependencies
Run the installation script from the project root to install packages for the root runner, Express server, and React client:
```bash
npm run install-all
```

### Step 4: Run SCM Portal
Launch both the backend API server and frontend client concurrently:
```bash
npm run dev
```
* **API Server:** Runs on `http://localhost:5000`
* **Vite React Portal:** Runs on `http://localhost:3000`

---

## 🔐 Default Authentication Users
On startup, the system automatically checks MongoDB and seeds these default accounts:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `purchase` | `purchase123` | Purchase Manager |
| `store` | `store123` | Store Manager |
| `inspector` | `inspector123` | Inspector |
| `vendor` | `vendor123` | Vendor |

---

## 📦 Production SCM Build
To compile the static React bundle for hosting on CDNs or static servers:
```bash
npm run build
```
This outputs the compiled files inside `client/dist/`.
