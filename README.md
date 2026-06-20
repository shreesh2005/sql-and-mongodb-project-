# Tata Supply Chain Management System

An end-to-end full-stack Enterprise Resource Planning (ERP) and Supply Chain Management (SCM) portal designed for **Tata Supply Chain Co. Ltd.** to automate, optimize, and track procurement, storage, material issue requisition, and quality audits.

This project implements a **Hybrid Database Architecture** linking a 3NF Normalized relational database (**MySQL**) with a scalable document logging store (**MongoDB**).

---

## 🏢 Project Context
* **Institution:** USM's Shriram Mantri Vidyanidhi Info Tech Academy
* **Subject:** Database Management System (DBMS) & Full-Stack Migration
* **Architecture:** Node.js (Express) + Sequelize (MySQL) + Mongoose (MongoDB) + React (Vite + Tailwind CSS)

---

## 📊 Relational Core (MySQL)
The database structure contains **13 3NF tables** to handle transactions and core catalog data:
* **Core Masters:** `Part_Category`, `Part`, `Vendor`, `Transporter`
* **Junction (M:N):** `Vendor_Part` (tracks negotiated pricing agreements)
* **ACID Transactions:** `Purchase_Order`, `Purchase_Order_Detail`, `Challan`, `GRR`, `GRR_Detail`, `Quality_Inspection`, `MIR`, `MIR_Detail`

---

## 🍃 Logging & Analytics Core (MongoDB)
MongoDB Atlas holds unstructured, transactional audit, and workflow documents:
* **approval_workflows:** Multi-stage PO and MIR authorization pipelines.
* **vendor_performance:** Rejection rates, lead-times, and QC scores.
* **quality_reports:** Quality audits, anomalies, and AI checks.
* **inventory_movements:** Chronological log of stock inward/outward events.
* **delivery_tracking:** Transporter shipment logs and GPS checkpoints.
* **audit_logs:** User modification histories and changed payloads.
* **document_repository:** Binary attachments and PDFs managed via **MongoDB GridFS**.
* **warehouse_sensor_data:** IoT logs for warehouse climate controls.

---

## 🚀 Installation & Local Execution

### 1. Database Setup
Ensure you have MySQL and MongoDB running locally. Run the schema initialization script:
```sql
CREATE DATABASE tata_supply_chain;
USE tata_supply_chain;
SOURCE E:/STUDY/CDAC/Project/files/Tata_SCDB_Schema.sql;
```

### 2. Environment Configurations
Configure the `.env` file at the root:
```env
PORT=5000
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=tata_supply_chain
MONGODB_URI=mongodb://localhost:27017/tata_supply_chain
JWT_SECRET=tata_supply_chain_secret_key
```

### 3. Dependencies & Running
Run the following commands in your terminal:
```bash
# Install root, backend and frontend dependencies
npm run install-all

# Start local SCM server and client concurrently
npm run dev
```

* **Vite React Portal:** `http://localhost:3000`
* **Express REST API Server:** `http://localhost:5000`
* **Default Admin Account:** `admin` / `admin123`

---

## 📁 Repository Structure Reference
* `/server`: Backend API controllers, models (Sequelize & Mongoose), routes, and synchronization services.
* `/client`: React Vite frontend with dashboard analytics charts, layouts, contexts, and SCM sheets.
* `/docs`: Detailed references for [REST APIs](./docs/API.md), [Database Architecture](./docs/ARCHITECTURE.md), and [Deployment](./docs/DEPLOYMENT.md).
* `/make_excel.py`: Original Python openpyxl reporting engine.
