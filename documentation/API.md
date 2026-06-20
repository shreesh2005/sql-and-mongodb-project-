# SCM API Documentation

This SCM REST backend is powered by Node.js, Express, Sequelize (MySQL), and Mongoose (MongoDB). All requests must contain the `Authorization: Bearer <JWT_TOKEN>` header (except public login).

---

## 🔐 Authentication Endpoints

### 1. User Registration
* **Endpoint:** `POST /api/auth/register`
* **Access:** Public
* **Payload:**
```json
{
  "username": "newuser",
  "password": "userpass123",
  "name": "Full Name",
  "role": "Viewer", // Admin, Purchase Manager, Store Manager, Inspector, Vendor, Viewer
  "email": "user@company.com"
}
```

### 2. User Login
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Payload:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```
* **Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "data": { "id": "...", "username": "admin", "role": "Admin", "name": "..." }
}
```

### 3. Get User Profile
* **Endpoint:** `GET /api/auth/profile`
* **Access:** Private (All roles)

---

## 🏢 Vendor & Sourcing Endpoints

### 1. List Vendors
* **Endpoint:** `GET /api/vendors`
* **Access:** Private (Admin, Purchase Manager, Viewer)
* **Response:** Returns list of vendors enriched with MongoDB quality scores.

### 2. Register New Vendor
* **Endpoint:** `POST /api/vendors`
* **Access:** Private (Admin, Purchase Manager)

### 3. Rate Vendor (MongoDB direct entry)
* **Endpoint:** `POST /api/vendors/:id/rate`
* **Access:** Private (Admin, Purchase Manager, Inspector)
* **Payload:** `{ "rating": 5, "comment": "Excellent quality" }`

---

## 🛒 Purchase & Sourcing Workflows

### 1. Create Purchase Order (MySQL + MongoDB sync)
* **Endpoint:** `POST /api/purchase-orders`
* **Access:** Private (Admin, Purchase Manager)
* **Payload:**
```json
{
  "po_number": "PO-2024-006",
  "vendor_code": "VND-001",
  "po_date": "2026-06-20",
  "expected_delivery_date": "2026-06-25",
  "details": [
    { "part_no": "RM-001", "ordered_qty": 200, "unit_rate": 82.00 }
  ]
}
```

### 2. Approve PO Stage (MongoDB Workflow Engine)
* **Endpoint:** `PUT /api/purchase-orders/:id/approve`
* **Access:** Private (Admin, Purchase Manager, Store Manager)
* **Payload:** `{ "status": "APPROVED", "comment": "Prices verified" }`

---

## 📦 Goods Receipts & Inspections

### 1. Register Goods Receipt (GRR)
* **Endpoint:** `POST /api/grr`
* **Access:** Private (Admin, Store Manager)
* **Payload:**
```json
{
  "challan_no": "CHN-001",
  "grr_date": "2026-06-20",
  "received_by": "Ramesh Verma",
  "details": [
    { "part_no": "RM-001", "challan_qty": 200, "remarks": "Visual check ok" }
  ]
}
```

### 2. Submit QA Inspection (MySQL Stock updates + MongoDB Sync)
* **Endpoint:** `POST /api/quality-inspections`
* **Access:** Private (Admin, Inspector)
* **Payload:**
```json
{
  "grr_detail_id": 1,
  "inspection_date": "2026-06-20",
  "accepted_qty": 198,
  "rejected_qty": 2,
  "status": "PARTIAL",
  "inspector_name": "QC Deepak Jain",
  "remarks": "2 units surface rust"
}
```

---

## 📂 Document GridFS Uploads

### 1. Upload File
* **Endpoint:** `POST /api/documents/upload`
* **Access:** Private (Multi-part form data)
* **Payload:** Key `file` (File buffer), fields `documentType` (e.g. 'PO', 'CHALLAN'), and `referenceId`.

### 2. Download File
* **Endpoint:** `GET /api/documents/download/:gridFsId`
* **Access:** Private (Downloads file buffer directly from GridFS)
