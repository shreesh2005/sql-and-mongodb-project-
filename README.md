# Tata Supply Chain Co. Ltd. — Database Management System

An end-to-end relational database solution designed for **Tata Supply Chain Co. Ltd.** to automate, optimize, and seamlessly track day-to-day procurement, storage, and material allocation operations[cite: 3]. Built with **MySQL 8.x** and fully normalized to **3rd Normal Form (3NF)**.

## 🏢 Project Context
* **Institution:** USM's Shriram Mantri Vidyanidhi Info Tech Academy[cite: 3]
* **Subject:** Database Management System (DBMS)[cite: 3]
* **Target Scale:** Managing dynamic records for baseline raw materials and finished engineering assemblies across multi-vendor networks[cite: 3].

---

## 📊 Relational Architecture & Entity Summary
The database system removes operational confusion by decoupling multi-valued properties and tracking delivery documents natively[cite: 3]. The architecture consists of **13 normalized tables**:

* **Core Masters:** `Part_Category`, `Part`, `Vendor`, `Transporter`[cite: 1, 2]
* **Dynamic Junctions (M:N):** `Vendor_Part` (Tracks custom vendor rates, lead times, and preferred statuses to prevent pricing confusion)[cite: 1, 2, 3]
* **Transaction Lifecycle:** `Purchase_Order`, `Purchase_Order_Detail`, `Challan`, `GRR` (Goods Received Report), `GRR_Detail`, `Quality_Inspection`, `MIR` (Material Issue Requisition), `MIR_Detail`[cite: 1, 2, 3]

### Normalization Benchmarks
* **1NF:** Ensured all structural attributes are atomic (e.g., separating vendor address blocks into granular city, state, and pin segments)[cite: 1, 2].
* **2NF:** Eliminated partial dependencies on composite keys inside the `Vendor_Part` junction framework.
* **3NF:** Eliminated transitive anomalies by extracting part categories out of the main `Part` matrix into a dedicated `Part_Category` relationship index[cite: 1].

---

## 📁 Repository Map
* `/database`: Houses `Tata_SCDB_Schema.sql` containing the structured table definitions, cascading constraint rules, and sample historical transactions.
* `/scripts`: Contains `make_excel.py`, a tracking engine written in Python utilizing `openpyxl` to auto-compile formatted reports directly from python data objects[cite: 1].
* `/documentation`: Holds the engineering data dictionaries, primary/foreign key mapping matrices, and underlying assumptions[cite: 1].

---

## 🚀 Local Deployment Guide

### Prerequisites
* **Database:** MySQL Server (v8.0 or higher) and a client interface like MySQL Workbench.
* **Script Engine:** Python 3.x with the `openpyxl` library installed (`pip install openpyxl`).

### 1. Initialize the Relational Schema
Log into your local MySQL CLI or Workbench instance and execute the schema initialization script:
```sql
SOURCE E:/STUDY/CDAC/Project/files/Tata_SCDB_Schema.sql;
