-- ================================================================
--  TATA SUPPLY CHAIN CO. LTD. — DATABASE MANAGEMENT SYSTEM
--  USM's Shriram Mantri Vidyanidhi Info Tech Academy
--  MySQL 8.x Compatible Script
-- ================================================================

DROP DATABASE IF EXISTS tata_supply_chain;
CREATE DATABASE tata_supply_chain CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tata_supply_chain;

-- ================================================================
-- SECTION A: CREATE TABLE STATEMENTS
-- ================================================================

-- 1. Part Category Table (3NF: category details separated from Part)
CREATE TABLE Part_Category (
    category_id   INT           AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100)  NOT NULL,
    category_type ENUM('RAW_MATERIAL','FINISHED_PART') NOT NULL,
    description   TEXT
);

-- 2. Part Table (Raw Materials & Finished Parts)
CREATE TABLE Part (
    part_no          VARCHAR(20)     PRIMARY KEY,
    category_id      INT             NOT NULL,
    description      VARCHAR(255)    NOT NULL,
    unit_of_measure  VARCHAR(20)     NOT NULL,
    unit_rate        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    opening_stock    INT             NOT NULL DEFAULT 0,
    minimum_stock    INT             NOT NULL DEFAULT 0,
    order_quantity   INT             NOT NULL DEFAULT 0,
    part_type        ENUM('RAW','FINISHED') NOT NULL,
    CONSTRAINT fk_part_category FOREIGN KEY (category_id)
        REFERENCES Part_Category(category_id) ON UPDATE CASCADE
);

-- 3. Vendor Table
CREATE TABLE Vendor (
    vendor_code    VARCHAR(20)   PRIMARY KEY,
    vendor_name    VARCHAR(100)  NOT NULL,
    address_line1  VARCHAR(255),
    city           VARCHAR(50),
    state          VARCHAR(50),
    pin_code       VARCHAR(10),
    phone          VARCHAR(15),
    email          VARCHAR(100),
    payment_terms  VARCHAR(255)
);

-- 4. Vendor_Part (M:N Junction – resolves many-to-many between Vendor & Part)
CREATE TABLE Vendor_Part (
    vendor_code    VARCHAR(20)   NOT NULL,
    part_no        VARCHAR(20)   NOT NULL,
    vendor_rate    DECIMAL(12,2) NOT NULL,
    lead_time_days INT           DEFAULT 0,
    is_preferred   TINYINT(1)    DEFAULT 0,
    PRIMARY KEY (vendor_code, part_no),
    CONSTRAINT fk_vp_vendor FOREIGN KEY (vendor_code)
        REFERENCES Vendor(vendor_code) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_vp_part   FOREIGN KEY (part_no)
        REFERENCES Part(part_no) ON UPDATE CASCADE ON DELETE CASCADE
);

-- 5. Transporter Table (exactly 5 transporters per requirements)
CREATE TABLE Transporter (
    transporter_id   VARCHAR(20)  PRIMARY KEY,
    transporter_name VARCHAR(100) NOT NULL,
    contact_person   VARCHAR(100),
    phone            VARCHAR(15),
    email            VARCHAR(100),
    address          VARCHAR(255)
);

-- 6. Purchase Order Header
CREATE TABLE Purchase_Order (
    po_number              VARCHAR(20)  PRIMARY KEY,
    vendor_code            VARCHAR(20)  NOT NULL,
    po_date                DATE         NOT NULL,
    expected_delivery_date DATE,
    total_amount           DECIMAL(14,2) DEFAULT 0.00,
    status ENUM('PENDING','PARTIAL','COMPLETE','CANCELLED') DEFAULT 'PENDING',
    CONSTRAINT fk_po_vendor FOREIGN KEY (vendor_code)
        REFERENCES Vendor(vendor_code) ON UPDATE CASCADE
);

-- 7. Purchase Order Detail Lines
CREATE TABLE Purchase_Order_Detail (
    po_detail_id INT           AUTO_INCREMENT PRIMARY KEY,
    po_number    VARCHAR(20)   NOT NULL,
    part_no      VARCHAR(20)   NOT NULL,
    ordered_qty  INT           NOT NULL,
    unit_rate    DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_pod_po   FOREIGN KEY (po_number)
        REFERENCES Purchase_Order(po_number) ON UPDATE CASCADE,
    CONSTRAINT fk_pod_part FOREIGN KEY (part_no)
        REFERENCES Part(part_no) ON UPDATE CASCADE
);

-- 8. Challan Table (Delivery document from Vendor)
CREATE TABLE Challan (
    challan_no     VARCHAR(20) PRIMARY KEY,
    challan_date   DATE        NOT NULL,
    vendor_code    VARCHAR(20) NOT NULL,
    transporter_id VARCHAR(20) NOT NULL,
    po_number      VARCHAR(20) NOT NULL,
    remarks        TEXT,
    CONSTRAINT fk_ch_vendor      FOREIGN KEY (vendor_code)
        REFERENCES Vendor(vendor_code) ON UPDATE CASCADE,
    CONSTRAINT fk_ch_transporter FOREIGN KEY (transporter_id)
        REFERENCES Transporter(transporter_id) ON UPDATE CASCADE,
    CONSTRAINT fk_ch_po          FOREIGN KEY (po_number)
        REFERENCES Purchase_Order(po_number) ON UPDATE CASCADE
);

-- 9. GRR Header (Goods Received Report – auto-generated number)
CREATE TABLE GRR (
    grr_no      INT           AUTO_INCREMENT PRIMARY KEY,
    challan_no  VARCHAR(20)   NOT NULL,
    grr_date    DATE          NOT NULL,
    received_by VARCHAR(100),
    remarks     TEXT,
    CONSTRAINT fk_grr_challan FOREIGN KEY (challan_no)
        REFERENCES Challan(challan_no) ON UPDATE CASCADE
);

-- 10. GRR Detail Lines
CREATE TABLE GRR_Detail (
    grr_detail_id INT          AUTO_INCREMENT PRIMARY KEY,
    grr_no        INT          NOT NULL,
    part_no       VARCHAR(20)  NOT NULL,
    challan_qty   INT          NOT NULL,
    description   VARCHAR(255),
    remarks       TEXT,
    CONSTRAINT fk_grrd_grr  FOREIGN KEY (grr_no)
        REFERENCES GRR(grr_no) ON UPDATE CASCADE,
    CONSTRAINT fk_grrd_part FOREIGN KEY (part_no)
        REFERENCES Part(part_no) ON UPDATE CASCADE
);

-- 11. Quality Inspection Table
CREATE TABLE Quality_Inspection (
    inspection_id  INT  AUTO_INCREMENT PRIMARY KEY,
    grr_detail_id  INT  NOT NULL,
    inspection_date DATE NOT NULL,
    accepted_qty   INT  NOT NULL DEFAULT 0,
    rejected_qty   INT  NOT NULL DEFAULT 0,
    status         ENUM('PASS','FAIL','PARTIAL') NOT NULL,
    inspector_name VARCHAR(100),
    remarks        TEXT,
    CONSTRAINT fk_qi_grrd FOREIGN KEY (grr_detail_id)
        REFERENCES GRR_Detail(grr_detail_id) ON UPDATE CASCADE
);

-- 12. MIR Header (Material Issue Requisition)
CREATE TABLE MIR (
    mir_no      VARCHAR(20) PRIMARY KEY,
    mir_date    DATE        NOT NULL,
    requested_by VARCHAR(100),
    department  VARCHAR(100),
    status ENUM('PENDING','ISSUED','PARTIAL','CANCELLED') DEFAULT 'PENDING'
);

-- 13. MIR Detail Lines
CREATE TABLE MIR_Detail (
    mir_detail_id INT          AUTO_INCREMENT PRIMARY KEY,
    mir_no        VARCHAR(20)  NOT NULL,
    part_no       VARCHAR(20)  NOT NULL,
    qty_issued    INT          NOT NULL,
    issue_date    DATE         NOT NULL,
    CONSTRAINT fk_mird_mir  FOREIGN KEY (mir_no)
        REFERENCES MIR(mir_no) ON UPDATE CASCADE,
    CONSTRAINT fk_mird_part FOREIGN KEY (part_no)
        REFERENCES Part(part_no) ON UPDATE CASCADE
);


-- ================================================================
-- SECTION B: SAMPLE INSERT STATEMENTS
-- ================================================================

-- Part_Category
INSERT INTO Part_Category (category_name, category_type, description) VALUES
('Steel Components',    'RAW_MATERIAL',  'Various steel sheets, rods, and plates'),
('Electronic Components','RAW_MATERIAL', 'PCBs, sensors, and electronic modules'),
('Hydraulic Parts',     'RAW_MATERIAL',  'Hydraulic pipes, valves, and fittings'),
('Plastic Mouldings',   'RAW_MATERIAL',  'Injection-moulded plastic components'),
('Engine Assemblies',   'FINISHED_PART', 'Fully assembled engine blocks'),
('Transmission Units',  'FINISHED_PART', 'Gear boxes and transmission sub-assemblies');

-- Part
INSERT INTO Part (part_no, category_id, description, unit_of_measure, unit_rate, opening_stock, minimum_stock, order_quantity, part_type) VALUES
('RM-001', 1, 'Steel Sheet 2mm Grade A',       'KG',  85.50,  500, 100, 200, 'RAW'),
('RM-002', 2, 'Circuit Board Type-A',          'PCS', 450.00, 200,  50, 100, 'RAW'),
('RM-003', 3, 'Hydraulic Pipe 1 inch',         'MTR', 120.00, 300,  60, 150, 'RAW'),
('RM-004', 4, 'ABS Plastic Casing Large',      'PCS',  55.00, 800, 200, 400, 'RAW'),
('RM-005', 1, 'Steel Rod 25mm Dia',            'KG',   72.00, 400,  80, 200, 'RAW'),
('FP-001', 5, 'Engine Block Assembly 1600cc',  'SET',12500.00,  50,  10,  25, 'FINISHED'),
('FP-002', 6, 'Gear Box Type-2 Manual',        'PCS', 8750.00,  30,   5,  15, 'FINISHED'),
('FP-003', 5, 'Engine Head Assembly',          'PCS', 6200.00,  40,   8,  20, 'FINISHED');

-- Vendor
INSERT INTO Vendor VALUES
('VND-001','Tata Steels Ltd',        '101 Industrial Area',  'Mumbai',    'Maharashtra','400001','9876543210','tata@steels.com',        'Net 30 Days'),
('VND-002','Bharat Electronics Ltd', '22 Tech Park, Phase-1','Bangalore', 'Karnataka',  '560001','9111222333','info@bel.com',           'Advance Payment'),
('VND-003','Supreme Hydraulics Pvt', '45 MIDC Phase-2',      'Pune',      'Maharashtra','411001','9222333444','supreme@hydro.com',      'Net 45 Days'),
('VND-004','Global Auto Parts Inc',  '78 Export Zone',       'Chennai',   'Tamil Nadu', '600001','9333444555','global@parts.in',        'Net 60 Days'),
('VND-005','Precision Engineering',  '33 Ambad MIDC',        'Nashik',    'Maharashtra','422001','9444555666','pe@nashik.com',          'Net 30 Days');

-- Vendor_Part
INSERT INTO Vendor_Part VALUES
('VND-001','RM-001', 82.00, 7,  1),
('VND-003','RM-001', 85.50,10,  0),
('VND-002','RM-002',440.00,14,  1),
('VND-004','RM-002',450.00,21,  0),
('VND-003','RM-003',118.00, 5,  1),
('VND-005','RM-003',122.00, 7,  0),
('VND-005','RM-004', 53.00, 3,  1),
('VND-001','RM-005', 70.00, 5,  1),
('VND-001','FP-001',12000.00,30, 1),
('VND-004','FP-002', 8500.00,45, 1),
('VND-004','FP-003', 6000.00,35, 1);

-- Transporter
INSERT INTO Transporter VALUES
('TRP-001','Blue Dart Logistics','Ramesh Kumar', '9111111111','bluedart@log.com',  'Andheri East, Mumbai'),
('TRP-002','DTDC Courier',       'Suresh Patel', '9222222222','dtdc@courier.com',  'Connaught Place, Delhi'),
('TRP-003','Delhivery Ltd',      'Amrish Shah',  '9333333333','del@ivery.com',     'Sector 18, Gurgaon'),
('TRP-004','VRL Logistics',      'Pradeep Naik', '9444444444','vrl@log.com',       'Whitefield, Bangalore'),
('TRP-005','TCI Express',        'Mahesh Reddy', '9555555555','tci@express.com',   'Kukatpally, Hyderabad');

-- Purchase_Order
INSERT INTO Purchase_Order VALUES
('PO-2024-001','VND-001','2024-01-10','2024-01-25', 16400.00,'COMPLETE'),
('PO-2024-002','VND-002','2024-01-15','2024-02-01', 44000.00,'PARTIAL'),
('PO-2024-003','VND-003','2024-01-20','2024-02-05', 17700.00,'COMPLETE'),
('PO-2024-004','VND-004','2024-02-01','2024-02-20',288000.00,'PENDING'),
('PO-2024-005','VND-005','2024-02-05','2024-02-28', 18300.00,'COMPLETE');

-- Purchase_Order_Detail
INSERT INTO Purchase_Order_Detail (po_number, part_no, ordered_qty, unit_rate) VALUES
('PO-2024-001','RM-001',200, 82.00),
('PO-2024-002','RM-002',100,440.00),
('PO-2024-003','RM-003',150,118.00),
('PO-2024-004','FP-001', 24,12000.00),
('PO-2024-005','RM-003',150,122.00);

-- Challan
INSERT INTO Challan VALUES
('CHN-001','2024-01-24','VND-001','TRP-001','PO-2024-001','First batch – steel sheets'),
('CHN-002','2024-01-30','VND-002','TRP-002','PO-2024-002','Electronic components – partial delivery'),
('CHN-003','2024-02-04','VND-003','TRP-003','PO-2024-003','Hydraulic pipes batch 1'),
('CHN-004','2024-02-19','VND-004','TRP-001','PO-2024-004','Engine block assemblies'),
('CHN-005','2024-02-27','VND-005','TRP-004','PO-2024-005','Hydraulic pipes from Nashik');

-- GRR
INSERT INTO GRR (challan_no, grr_date, received_by, remarks) VALUES
('CHN-001','2024-01-24','Ramesh Verma',  'All items received in good condition'),
('CHN-002','2024-01-30','Sunil Mehta',   'Outer packaging of 5 boxes slightly damaged'),
('CHN-003','2024-02-04','Priya Sharma',  'Received as per challan – no discrepancy'),
('CHN-004','2024-02-19','Rajesh Gupta',  'Engine assemblies received and counted'),
('CHN-005','2024-02-27','Anita Singh',   'All hydraulic pipes in good condition');

-- GRR_Detail
INSERT INTO GRR_Detail (grr_no, part_no, challan_qty, description, remarks) VALUES
(1,'RM-001',200,'Steel Sheet 2mm Grade A',      'As per PO quantity'),
(2,'RM-002',100,'Circuit Board Type-A',         'Outer packaging of 5 units damaged'),
(3,'RM-003',150,'Hydraulic Pipe 1 inch',        'All dimensions appear correct'),
(4,'FP-001', 24,'Engine Block Assembly 1600cc', 'All 24 units received and palletised'),
(5,'RM-003',150,'Hydraulic Pipe 1 inch',        'Received from Nashik vendor');

-- Quality_Inspection
INSERT INTO Quality_Inspection (grr_detail_id, inspection_date, accepted_qty, rejected_qty, status, inspector_name, remarks) VALUES
(1,'2024-01-25',198,  2,'PARTIAL','QC Ravi Kumar', '2 sheets have surface rust defects'),
(2,'2024-01-31', 95,  5,'PARTIAL','QC Meena Joshi','5 PCBs failed functionality test'),
(3,'2024-02-05',150,  0,'PASS',   'QC Deepak Jain','All pipes cleared pressure test'),
(4,'2024-02-20', 22,  2,'PARTIAL','QC Suresh Nair','2 engines failed assembly alignment check'),
(5,'2024-02-28',148,  2,'PARTIAL','QC Ravi Kumar', '2 pipes have outer diameter deviation');

-- MIR
INSERT INTO MIR VALUES
('MIR-2024-001','2024-02-01','Prod Mgr – A','Production','ISSUED'),
('MIR-2024-002','2024-02-05','Prod Mgr – B','Assembly',  'ISSUED'),
('MIR-2024-003','2024-02-10','Prod Mgr – A','Production','PENDING'),
('MIR-2024-004','2024-02-15','Prod Mgr – C','Quality',   'PARTIAL'),
('MIR-2024-005','2024-02-20','Prod Mgr – B','Assembly',  'ISSUED');

-- MIR_Detail
INSERT INTO MIR_Detail (mir_no, part_no, qty_issued, issue_date) VALUES
('MIR-2024-001','RM-001', 50,'2024-02-01'),
('MIR-2024-002','RM-002', 30,'2024-02-05'),
('MIR-2024-003','RM-003', 40,'2024-02-10'),
('MIR-2024-004','FP-001', 10,'2024-02-15'),
('MIR-2024-005','RM-001', 75,'2024-02-20');


-- ================================================================
-- SECTION C: 15 MEANINGFUL SQL QUERIES
-- ================================================================

-- Q1: Full parts catalogue with category details
SELECT  p.part_no, pc.category_name, pc.category_type,
        p.description, p.unit_of_measure, p.unit_rate,
        p.opening_stock, p.minimum_stock, p.order_quantity
FROM    Part p
JOIN    Part_Category pc ON p.category_id = pc.category_id
ORDER BY pc.category_type, p.part_no;

-- Q2: All vendors who supply a specific part (RM-001), cheapest first
SELECT  v.vendor_code, v.vendor_name, v.city,
        vp.vendor_rate, vp.lead_time_days,
        CASE WHEN vp.is_preferred = 1 THEN 'Yes' ELSE 'No' END AS preferred_vendor
FROM    Vendor v
JOIN    Vendor_Part vp ON v.vendor_code = vp.vendor_code
WHERE   vp.part_no = 'RM-001'
ORDER BY vp.vendor_rate ASC;

-- Q3: Reorder Alert – parts with current stock below minimum
SELECT  part_no, description, unit_of_measure,
        opening_stock, minimum_stock,
        (minimum_stock - opening_stock) AS shortage_qty,
        order_quantity                  AS recommended_order_qty
FROM    Part
WHERE   opening_stock < minimum_stock
ORDER BY (minimum_stock - opening_stock) DESC;

-- Q4: Complete GRR report – vendor, transporter, PO, and parts detail
SELECT  g.grr_no, g.grr_date,
        c.challan_no, c.challan_date,
        v.vendor_name,
        t.transporter_name,
        po.po_number,
        gd.part_no, p.description,
        gd.challan_qty
FROM    GRR g
JOIN    Challan           c   ON g.challan_no     = c.challan_no
JOIN    Vendor            v   ON c.vendor_code    = v.vendor_code
JOIN    Transporter       t   ON c.transporter_id = t.transporter_id
JOIN    Purchase_Order    po  ON c.po_number      = po.po_number
JOIN    GRR_Detail        gd  ON g.grr_no         = gd.grr_no
JOIN    Part              p   ON gd.part_no       = p.part_no
ORDER BY g.grr_no, gd.part_no;

-- Q5: Quality inspection summary – accepted vs rejected totals
SELECT  qi.status,
        COUNT(*)              AS total_inspections,
        SUM(qi.accepted_qty)  AS total_accepted,
        SUM(qi.rejected_qty)  AS total_rejected,
        ROUND(SUM(qi.rejected_qty) / (SUM(qi.accepted_qty) + SUM(qi.rejected_qty)) * 100, 2) AS rejection_pct
FROM    Quality_Inspection qi
GROUP BY qi.status;

-- Q6: Total material issued per part (Feb 2024)
SELECT  md.part_no, p.description,
        SUM(md.qty_issued)            AS total_qty_issued,
        SUM(md.qty_issued * p.unit_rate) AS total_value_INR
FROM    MIR_Detail md
JOIN    Part p  ON md.part_no = p.part_no
JOIN    MIR  m  ON md.mir_no  = m.mir_no
WHERE   m.mir_date BETWEEN '2024-02-01' AND '2024-02-28'
GROUP BY md.part_no, p.description
ORDER BY total_value_INR DESC;

-- Q7: Vendor performance – rejection rate ranking
SELECT  v.vendor_code, v.vendor_name,
        SUM(qi.accepted_qty)  AS total_accepted,
        SUM(qi.rejected_qty)  AS total_rejected,
        ROUND(SUM(qi.rejected_qty) /
              (SUM(qi.accepted_qty) + SUM(qi.rejected_qty)) * 100, 2) AS rejection_pct
FROM    Vendor v
JOIN    Challan c  ON v.vendor_code  = c.vendor_code
JOIN    GRR     g  ON c.challan_no   = g.challan_no
JOIN    GRR_Detail gd ON g.grr_no    = gd.grr_no
JOIN    Quality_Inspection qi ON gd.grr_detail_id = qi.grr_detail_id
GROUP BY v.vendor_code, v.vendor_name
ORDER BY rejection_pct DESC;

-- Q8: Open purchase orders with expected vs actual status
SELECT  po.po_number, v.vendor_name, po.po_date,
        po.expected_delivery_date, po.total_amount, po.status
FROM    Purchase_Order po
JOIN    Vendor v ON po.vendor_code = v.vendor_code
WHERE   po.status IN ('PENDING','PARTIAL')
ORDER BY po.expected_delivery_date ASC;

-- Q9: Cheapest vendor for every part (best price sourcing report)
SELECT  vp.part_no, p.description,
        v.vendor_name   AS cheapest_vendor,
        vp.vendor_rate  AS cheapest_rate,
        vp.lead_time_days
FROM    Vendor_Part vp
JOIN    Vendor v ON vp.vendor_code = v.vendor_code
JOIN    Part   p ON vp.part_no     = p.part_no
WHERE   vp.vendor_rate = (
            SELECT MIN(vp2.vendor_rate)
            FROM   Vendor_Part vp2
            WHERE  vp2.part_no = vp.part_no
        )
ORDER BY vp.part_no;

-- Q10: Department-wise material consumption report
SELECT  m.department,
        p.part_no, p.description,
        COUNT(md.mir_detail_id)           AS number_of_requests,
        SUM(md.qty_issued)                AS total_qty_issued,
        SUM(md.qty_issued * p.unit_rate)  AS total_value_INR
FROM    MIR m
JOIN    MIR_Detail md ON m.mir_no   = md.mir_no
JOIN    Part       p  ON md.part_no = p.part_no
WHERE   m.status = 'ISSUED'
GROUP BY m.department, p.part_no, p.description
ORDER BY m.department, total_value_INR DESC;

-- Q11: Parts that have NEVER been issued via MIR (dead stock alert)
SELECT  p.part_no, p.description, p.part_type,
        p.opening_stock, p.minimum_stock
FROM    Part p
WHERE   p.part_no NOT IN (
            SELECT DISTINCT part_no FROM MIR_Detail
        );

-- Q12: Transporter-wise delivery performance summary
SELECT  t.transporter_id, t.transporter_name,
        COUNT(DISTINCT c.challan_no)   AS total_deliveries,
        COUNT(DISTINCT gd.part_no)     AS distinct_parts_delivered,
        COALESCE(SUM(gd.challan_qty),0) AS total_units_delivered
FROM    Transporter t
LEFT JOIN Challan    c  ON t.transporter_id = c.transporter_id
LEFT JOIN GRR        g  ON c.challan_no     = g.challan_no
LEFT JOIN GRR_Detail gd ON g.grr_no         = gd.grr_no
GROUP BY t.transporter_id, t.transporter_name
ORDER BY total_deliveries DESC;

-- Q13: Monthly procurement value trend
SELECT  DATE_FORMAT(c.challan_date,'%Y-%m') AS month_year,
        COUNT(DISTINCT g.grr_no)            AS grr_count,
        SUM(gd.challan_qty)                 AS total_units_received,
        SUM(gd.challan_qty * vp.vendor_rate)AS procurement_value_INR
FROM    Challan      c
JOIN    GRR          g   ON c.challan_no     = g.challan_no
JOIN    GRR_Detail   gd  ON g.grr_no         = gd.grr_no
JOIN    Vendor_Part  vp  ON c.vendor_code    = vp.vendor_code
                         AND gd.part_no      = vp.part_no
GROUP BY DATE_FORMAT(c.challan_date,'%Y-%m')
ORDER BY month_year;

-- Q14: Multi-source parts – rate variance analysis
SELECT  vp.part_no, p.description,
        COUNT(DISTINCT vp.vendor_code)  AS vendor_count,
        MIN(vp.vendor_rate)             AS min_rate,
        MAX(vp.vendor_rate)             AS max_rate,
        ROUND(MAX(vp.vendor_rate) - MIN(vp.vendor_rate), 2) AS rate_variance
FROM    Vendor_Part vp
JOIN    Part p ON vp.part_no = p.part_no
GROUP BY vp.part_no, p.description
HAVING  COUNT(DISTINCT vp.vendor_code) > 1
ORDER BY vendor_count DESC;

-- Q15: Live stock position after all MIR issuances (inventory dashboard)
SELECT  p.part_no, p.description, p.unit_of_measure,
        p.opening_stock                            AS opening_stock,
        COALESCE(SUM(md.qty_issued), 0)            AS total_issued,
        (p.opening_stock - COALESCE(SUM(md.qty_issued), 0)) AS current_stock,
        p.minimum_stock,
        p.order_quantity,
        CASE
            WHEN (p.opening_stock - COALESCE(SUM(md.qty_issued), 0)) < p.minimum_stock
            THEN 'REORDER NOW'
            WHEN (p.opening_stock - COALESCE(SUM(md.qty_issued), 0)) < p.minimum_stock * 1.5
            THEN 'LOW STOCK'
            ELSE 'ADEQUATE'
        END AS stock_status
FROM    Part p
LEFT JOIN MIR_Detail md ON p.part_no = md.part_no
GROUP BY p.part_no, p.description, p.unit_of_measure,
         p.opening_stock, p.minimum_stock, p.order_quantity
ORDER BY stock_status DESC, current_stock ASC;

-- END OF SCRIPT
