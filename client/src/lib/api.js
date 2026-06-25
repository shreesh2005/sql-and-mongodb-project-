import axios from 'axios';

// ==========================================
// 1. REAL BACKEND AXIOS INSTANCE
// ==========================================
const realApi = axios.create({
  baseURL: '', // Proxied via Vite config to http://localhost:5000
  headers: {
    'Content-Type': 'application/json'
  }
});

realApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

realApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 2. MOCK CLIENT-SIDE DATABASE (localStorage)
// ==========================================
const initMockDB = () => {
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify([
      { _id: 'u1', username: 'admin', password: 'admin123', name: 'Pranav Admin', role: 'Admin', email: 'admin@tatasupply.com' },
      { _id: 'u2', username: 'purchase', password: 'purchase123', name: 'Sanjay Dutt', role: 'Purchase Manager', email: 'sanjay@tatasupply.com' },
      { _id: 'u3', username: 'store', password: 'store123', name: 'Ramesh Verma', role: 'Store Manager', email: 'ramesh@tatasupply.com' },
      { _id: 'u4', username: 'inspector', password: 'inspector123', name: 'QC Deepak Jain', role: 'Inspector', email: 'deepak.qc@tatasupply.com' },
      { _id: 'u5', username: 'vendor', password: 'vendor123', name: 'Tata Steels Representative', role: 'Vendor', email: 'sales@tatasteel.com', vendorCode: 'VND-001' }
    ]));
  }

  if (!localStorage.getItem('mock_vendors')) {
    localStorage.setItem('mock_vendors', JSON.stringify([
      { vendor_code: 'VND-001', vendor_name: 'Tata Steels Ltd', email: 'tata@steels.com', phone: '9876543210', city: 'Mumbai', state: 'Maharashtra', address_line1: '101 Industrial Area', pin_code: '400001', payment_terms: 'Net 30 Days', qualityScore: 98.99, rejectionRate: 1.01 },
      { vendor_code: 'VND-002', vendor_name: 'Bharat Electronics Ltd', email: 'info@bel.com', phone: '9111222333', city: 'Bangalore', state: 'Karnataka', address_line1: '22 Tech Park', pin_code: '560001', payment_terms: 'Advance Payment', qualityScore: 95, rejectionRate: 5 },
      { vendor_code: 'VND-003', vendor_name: 'Supreme Hydraulics Pvt', email: 'supreme@hydro.com', phone: '9222333444', city: 'Pune', state: 'Maharashtra', address_line1: '45 MIDC Phase-2', pin_code: '411001', payment_terms: 'Net 45 Days', qualityScore: 100, rejectionRate: 0 },
      { vendor_code: 'VND-004', vendor_name: 'Global Auto Parts Inc', email: 'global@parts.in', phone: '9333444555', city: 'Chennai', state: 'Tamil Nadu', address_line1: '78 Export Zone', pin_code: '600001', payment_terms: 'Net 60 Days', qualityScore: 92, rejectionRate: 8 },
      { vendor_code: 'VND-005', vendor_name: 'Precision Engineering', email: 'pe@nashik.com', phone: '9444555666', city: 'Nashik', state: 'Maharashtra', address_line1: '33 Ambad MIDC', pin_code: '422001', payment_terms: 'Net 30 Days', qualityScore: 98.7, rejectionRate: 1.3 }
    ]));
  }

  if (!localStorage.getItem('mock_parts')) {
    localStorage.setItem('mock_parts', JSON.stringify([
      { part_no: 'RM-001', description: 'Steel Sheet 2mm Grade A', unit_of_measure: 'KG', unit_rate: 85.50, opening_stock: 500, minimum_stock: 100, order_quantity: 200, part_type: 'RAW', category: { category_name: 'Steel Components' } },
      { part_no: 'RM-002', description: 'Circuit Board Type-A', unit_of_measure: 'PCS', unit_rate: 450.00, opening_stock: 200, minimum_stock: 50, order_quantity: 100, part_type: 'RAW', category: { category_name: 'Electronic Components' } },
      { part_no: 'RM-003', description: 'Hydraulic Pipe 1 inch', unit_of_measure: 'MTR', unit_rate: 120.00, opening_stock: 300, minimum_stock: 60, order_quantity: 150, part_type: 'RAW', category: { category_name: 'Hydraulic Parts' } },
      { part_no: 'RM-004', description: 'ABS Plastic Casing Large', unit_of_measure: 'PCS', unit_rate: 55.00, opening_stock: 800, minimum_stock: 200, order_quantity: 400, part_type: 'RAW', category: { category_name: 'Plastic Mouldings' } },
      { part_no: 'RM-005', description: 'Steel Rod 25mm Dia', unit_of_measure: 'KG', unit_rate: 72.00, opening_stock: 400, minimum_stock: 80, order_quantity: 200, part_type: 'RAW', category: { category_name: 'Steel Components' } },
      { part_no: 'FP-001', description: 'Engine Block Assembly 1600cc', unit_of_measure: 'SET', unit_rate: 12500.00, opening_stock: 50, minimum_stock: 10, order_quantity: 25, part_type: 'FINISHED', category: { category_name: 'Engine Assemblies' } },
      { part_no: 'FP-002', description: 'Gear Box Type-2 Manual', unit_of_measure: 'PCS', unit_rate: 8750.00, opening_stock: 30, minimum_stock: 5, order_quantity: 15, part_type: 'FINISHED', category: { category_name: 'Transmission Units' } },
      { part_no: 'FP-003', description: 'Engine Head Assembly', unit_of_measure: 'PCS', unit_rate: 6200.00, opening_stock: 40, minimum_stock: 8, order_quantity: 20, part_type: 'FINISHED', category: { category_name: 'Engine Assemblies' } }
    ]));
  }

  if (!localStorage.getItem('mock_pos')) {
    localStorage.setItem('mock_pos', JSON.stringify([
      { po_number: 'PO-2024-001', vendor_code: 'VND-001', po_date: '2024-01-10', expected_delivery_date: '2024-01-25', total_amount: 16400.00, status: 'COMPLETE', approvalStatus: 'APPROVED', currentStage: 'COMPLETED', details: [{ part_no: 'RM-001', ordered_qty: 200, unit_rate: 82.00 }] },
      { po_number: 'PO-2024-002', vendor_code: 'VND-002', po_date: '2024-01-15', expected_delivery_date: '2024-02-01', total_amount: 44000.00, status: 'PARTIAL', approvalStatus: 'APPROVED', currentStage: 'COMPLETED', details: [{ part_no: 'RM-002', ordered_qty: 100, unit_rate: 440.00 }] },
      { po_number: 'PO-2024-003', vendor_code: 'VND-003', po_date: '2024-01-20', expected_delivery_date: '2024-02-05', total_amount: 17700.00, status: 'COMPLETE', approvalStatus: 'APPROVED', currentStage: 'COMPLETED', details: [{ part_no: 'RM-003', ordered_qty: 150, unit_rate: 118.00 }] },
      { po_number: 'PO-2024-004', vendor_code: 'VND-004', po_date: '2024-02-01', expected_delivery_date: '2024-02-20', total_amount: 288000.00, status: 'PENDING', approvalStatus: 'PENDING', currentStage: 'Store Manager', details: [{ part_no: 'FP-001', ordered_qty: 24, unit_rate: 12000.00 }] }
    ]));
  }

  if (!localStorage.getItem('mock_challans')) {
    localStorage.setItem('mock_challans', JSON.stringify([
      { challan_no: 'CHN-001', challan_date: '2024-01-24', vendor_code: 'VND-001', transporter_id: 'TRP-001', po_number: 'PO-2024-001', remarks: 'First batch steel sheets', deliveryStatus: 'DELIVERED' },
      { challan_no: 'CHN-002', challan_date: '2024-01-30', vendor_code: 'VND-002', transporter_id: 'TRP-002', po_number: 'PO-2024-002', remarks: 'Electronic components - partial', deliveryStatus: 'DELIVERED' },
      { challan_no: 'CHN-003', challan_date: '2024-02-04', vendor_code: 'VND-003', transporter_id: 'TRP-003', po_number: 'PO-2024-003', remarks: 'Hydraulic pipes batch 1', deliveryStatus: 'DELIVERED' }
    ]));
  }

  if (!localStorage.getItem('mock_grrs')) {
    localStorage.setItem('mock_grrs', JSON.stringify([
      { grr_no: 1, challan_no: 'CHN-001', grr_date: '2024-01-24', received_by: 'Ramesh Verma', remarks: 'All items received in good condition', details: [{ grr_detail_id: 1, part_no: 'RM-001', challan_qty: 200, description: 'Steel Sheet 2mm Grade A', remarks: 'As per PO' }] },
      { grr_no: 2, challan_no: 'CHN-002', grr_date: '2024-01-30', received_by: 'Sunil Mehta', remarks: 'Outer packaging slightly damaged', details: [{ grr_detail_id: 2, part_no: 'RM-002', challan_qty: 100, description: 'Circuit Board Type-A', remarks: '5 units damaged packaging' }] }
    ]));
  }

  if (!localStorage.getItem('mock_inspections')) {
    localStorage.setItem('mock_inspections', JSON.stringify([
      { inspection_id: 1, grr_detail_id: 1, inspection_date: '2024-01-25', accepted_qty: 198, rejected_qty: 2, status: 'PARTIAL', inspector_name: 'QC Ravi Kumar', remarks: '2 sheets have rust' },
      { inspection_id: 2, grr_detail_id: 2, inspection_date: '2024-01-31', accepted_qty: 95, rejected_qty: 5, status: 'PARTIAL', inspector_name: 'QC Meena Joshi', remarks: '5 PCBs failed functionality test' }
    ]));
  }

  if (!localStorage.getItem('mock_mirs')) {
    localStorage.setItem('mock_mirs', JSON.stringify([
      { mir_no: 'MIR-2024-001', mir_date: '2024-02-01', requested_by: 'Prod Mgr – A', department: 'Production', status: 'ISSUED', details: [{ mir_detail_id: 1, part_no: 'RM-001', qty_issued: 50, issue_date: '2024-02-01' }] }
    ]));
  }

  if (!localStorage.getItem('mock_movements')) {
    localStorage.setItem('mock_movements', JSON.stringify([
      { partNo: 'RM-001', movementType: 'INWARD', quantity: 200, toLocation: 'MAIN_WAREHOUSE', referenceId: 'GRR-1', user: 'Ramesh Verma', timestamp: new Date('2024-01-24') },
      { partNo: 'RM-001', movementType: 'OUTWARD', quantity: 50, toLocation: 'Production', referenceId: 'MIR-2024-001', user: 'Prod Mgr – A', timestamp: new Date('2024-02-01') }
    ]));
  }

  if (!localStorage.getItem('mock_notifications')) {
    localStorage.setItem('mock_notifications', JSON.stringify([
      { _id: 'n1', role: 'Store Manager', type: 'INFO', title: 'New PO Raised', message: 'PO PO-2024-004 raised for VND-004.', readBy: [], priority: 'MEDIUM', createdAt: new Date() }
    ]));
  }

  if (!localStorage.getItem('mock_docs')) {
    localStorage.setItem('mock_docs', JSON.stringify([]));
  }

  if (!localStorage.getItem('mock_audit_logs')) {
    localStorage.setItem('mock_audit_logs', JSON.stringify([
      { _id: 'a1', username: 'admin', action: 'CREATE_PO', entity: 'PurchaseOrder', entityId: 'PO-2024-004', timestamp: new Date() }
    ]));
  }
};

const getMockData = (key) => JSON.parse(localStorage.getItem(key));
const saveMockData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Emulated axios client for GitHub Pages
const mockApi = {
  get: async (url) => {
    initMockDB();
    await new Promise(resolve => setTimeout(resolve, 200));

    if (url.includes('/api/auth/profile')) {
      const user = JSON.parse(localStorage.getItem('user'));
      return { data: { success: true, data: user } };
    }

    if (url.includes('/api/vendors')) {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      if (id !== 'vendors') {
        const vendors = getMockData('mock_vendors');
        const v = vendors.find(item => item.vendor_code === id);
        return { data: { success: true, data: { ...v, performance: { qualityScore: v.qualityScore, rejectionRate: v.rejectionRate, ratings: [], deliveryHistory: [], comments: [] } } } };
      }
      return { data: { success: true, data: getMockData('mock_vendors') } };
    }

    if (url.includes('/api/parts')) {
      return { data: { success: true, data: getMockData('mock_parts') } };
    }

    if (url.includes('/api/purchase-orders')) {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      if (id !== 'purchase-orders') {
        const pos = getMockData('mock_pos');
        const vendors = getMockData('mock_vendors');
        const po = pos.find(item => item.po_number === id);
        const v = vendors.find(item => item.vendor_code === po.vendor_code);
        const workflow = {
          entityId: po.po_number,
          status: po.approvalStatus,
          currentStage: po.currentStage,
          approvalChain: [
            { role: 'Purchase Manager', status: 'APPROVED', comment: 'PO Raised', timestamp: po.po_date },
            { role: 'Store Manager', status: po.approvalStatus === 'APPROVED' ? 'APPROVED' : 'PENDING', comment: po.approvalStatus === 'APPROVED' ? 'Cleared' : 'Awaiting delivery', timestamp: po.po_date }
          ],
          comments: []
        };
        return { data: { success: true, data: { ...po, vendor: v, workflow } } };
      }
      const pos = getMockData('mock_pos');
      const vendors = getMockData('mock_vendors');
      const enriched = pos.map(po => ({
        ...po,
        vendor: vendors.find(v => v.vendor_code === po.vendor_code)
      }));
      return { data: { success: true, data: enriched } };
    }

    if (url.includes('/api/challans')) {
      const challans = getMockData('mock_challans');
      const vendors = getMockData('mock_vendors');
      const enriched = challans.map(ch => ({
        ...ch,
        vendor: vendors.find(v => v.vendor_code === ch.vendor_code),
        transporter: { transporter_name: ch.transporter_id === 'TRP-001' ? 'Blue Dart Logistics' : 'DTDC Courier' }
      }));
      return { data: { success: true, data: enriched } };
    }

    if (url.includes('/api/grr')) {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      if (id !== 'grr') {
        const grrs = getMockData('mock_grrs');
        const grr = grrs.find(g => String(g.grr_no) === String(id));
        return { data: { success: true, data: grr } };
      }
      return { data: { success: true, data: getMockData('mock_grrs') } };
    }

    if (url.includes('/api/quality-inspections')) {
      const inspections = getMockData('mock_inspections');
      const grrDetails = getMockData('mock_grrs').flatMap(g => g.details);
      const enriched = inspections.map(ins => {
        const det = grrDetails.find(d => d.grr_detail_id === ins.grr_detail_id) || {};
        return {
          ...ins,
          grrDetail: {
            ...det,
            grr_no: det.grr_no || 1,
            part_no: det.part_no || 'RM-001',
            part: { description: det.description || 'Raw Material', unit_of_measure: 'PCS' }
          }
        };
      });
      return { data: { success: true, data: enriched } };
    }

    if (url.includes('/api/mir')) {
      return { data: { success: true, data: getMockData('mock_mirs') } };
    }

    if (url.includes('/api/inventory/status')) {
      const parts = getMockData('mock_parts');
      const statusList = parts.map(p => {
        let status = 'ADEQUATE';
        if (p.opening_stock < p.minimum_stock) {
          status = 'REORDER NOW';
        } else if (p.opening_stock < p.minimum_stock * 1.5) {
          status = 'LOW STOCK';
        }
        return {
          ...p,
          current_stock: p.opening_stock,
          stock_status: status,
          category: p.category.category_name
        };
      });
      return { data: { success: true, data: statusList } };
    }

    if (url.includes('/api/inventory/movements')) {
      return { data: { success: true, data: getMockData('mock_movements') } };
    }

    if (url.includes('/api/analytics/dashboard')) {
      const vendors = getMockData('mock_vendors');
      const pos = getMockData('mock_pos');
      const grrs = getMockData('mock_grrs');
      const parts = getMockData('mock_parts');
      const inspections = getMockData('mock_inspections');

      const totalVendors = vendors.length;
      const totalPOs = pos.length;
      const pendingGRRs = grrs.length;
      const inventoryValue = parts.reduce((acc, p) => acc + (p.opening_stock * p.unit_rate), 0);
      const rejectedQty = inspections.reduce((acc, i) => acc + i.rejected_qty, 0);
      const acceptedQty = inspections.reduce((acc, i) => acc + i.accepted_qty, 0);

      return {
        data: {
          success: true,
          data: {
            kpis: { totalVendors, totalPOs, pendingGRRs, inventoryValue, rejectedQty, acceptedQty },
            vendorRankings: vendors.slice(0, 5),
            monthlySpend: [
              { period: '2024-01', totalSpend: 60400, poCount: 2 },
              { period: '2024-02', totalSpend: 324000, poCount: 3 }
            ]
          }
        }
      };
    }

    if (url.includes('/api/analytics/quality')) {
      return {
        data: {
          success: true,
          data: [
            { status: 'PASS', total_inspections: 1, total_accepted: 150, total_rejected: 0 },
            { status: 'PARTIAL', total_inspections: 2, total_accepted: 293, total_rejected: 7 }
          ]
        }
      };
    }

    if (url.includes('/api/documents')) {
      return { data: { success: true, data: getMockData('mock_docs') } };
    }

    if (url.includes('/api/notifications')) {
      return { data: { success: true, data: getMockData('mock_notifications') } };
    }

    if (url.includes('/api/users')) {
      return { data: { success: true, data: getMockData('mock_users') } };
    }

    if (url.includes('/api/audit-logs')) {
      return { data: { success: true, data: getMockData('mock_audit_logs') } };
    }

    return { data: { success: true, data: [] } };
  },

  post: async (url, data) => {
    initMockDB();
    await new Promise(resolve => setTimeout(resolve, 200));

    if (url.includes('/api/auth/login')) {
      const users = getMockData('mock_users');
      const u = users.find(item => item.username === data.username && item.password === data.password);
      if (u) {
        return { data: { success: true, token: 'mock-token', data: u } };
      }
      throw { response: { data: { error: 'Invalid mock credentials' } } };
    }

    if (url.includes('/api/vendors')) {
      const vendors = getMockData('mock_vendors');
      const newVendor = { ...data, qualityScore: 100, rejectionRate: 0 };
      vendors.push(newVendor);
      saveMockData('mock_vendors', vendors);
      return { data: { success: true, data: newVendor } };
    }

    if (url.includes('/api/purchase-orders')) {
      const pos = getMockData('mock_pos');
      let total = 0;
      data.details.forEach(l => { total += l.ordered_qty * l.unit_rate; });
      const newPo = {
        ...data,
        total_amount: total,
        status: 'PENDING',
        approvalStatus: 'PENDING',
        currentStage: 'Store Manager'
      };
      pos.push(newPo);
      saveMockData('mock_pos', pos);

      const logs = getMockData('mock_audit_logs');
      logs.push({ _id: Math.random().toString(), username: 'admin', action: 'CREATE_PO', entity: 'PurchaseOrder', entityId: data.po_number, timestamp: new Date() });
      saveMockData('mock_audit_logs', logs);

      return { data: { success: true, data: newPo } };
    }

    if (url.includes('/api/challans')) {
      const challans = getMockData('mock_challans');
      const newChallan = { ...data, deliveryStatus: 'DISPATCHED' };
      challans.push(newChallan);
      saveMockData('mock_challans', challans);
      return { data: { success: true, data: newChallan } };
    }

    if (url.includes('/api/grr')) {
      const grrs = getMockData('mock_grrs');
      const newGrr = {
        ...data,
        grr_no: grrs.length + 1,
        details: data.details.map((d, i) => ({ ...d, grr_detail_id: Math.floor(Math.random()*1000) }))
      };
      grrs.push(newGrr);
      saveMockData('mock_grrs', grrs);

      const movements = getMockData('mock_movements');
      data.details.forEach(l => {
        movements.push({
          partNo: l.part_no,
          movementType: 'INWARD',
          quantity: l.challan_qty,
          referenceId: `GRR-${newGrr.grr_no}`,
          user: data.received_by || 'SYSTEM',
          timestamp: new Date()
        });
      });
      saveMockData('mock_movements', movements);

      return { data: { success: true, data: newGrr } };
    }

    if (url.includes('/api/quality-inspections')) {
      const inspections = getMockData('mock_inspections');
      const newQi = {
        ...data,
        inspection_id: inspections.length + 1
      };
      inspections.push(newQi);
      saveMockData('mock_inspections', inspections);

      const grrDetails = getMockData('mock_grrs').flatMap(g => g.details);
      const grrLine = grrDetails.find(d => d.grr_detail_id === data.grr_detail_id);
      if (grrLine) {
        const parts = getMockData('mock_parts');
        const p = parts.find(item => item.part_no === grrLine.part_no);
        if (p) {
          p.opening_stock += data.accepted_qty;
          saveMockData('mock_parts', parts);
        }
      }

      return { data: { success: true, data: newQi } };
    }

    if (url.includes('/api/mir')) {
      const mirList = getMockData('mock_mirs');
      const newMir = {
        ...data,
        status: 'ISSUED',
        details: data.details.map((d, i) => ({ ...d, mir_detail_id: Math.floor(Math.random()*1000) }))
      };
      mirList.push(newMir);
      saveMockData('mock_mirs', mirList);

      const parts = getMockData('mock_parts');
      const movements = getMockData('mock_movements');
      data.details.forEach(l => {
        const p = parts.find(item => item.part_no === l.part_no);
        if (p) {
          p.opening_stock -= l.qty_issued;
        }
        movements.push({
          partNo: l.part_no,
          movementType: 'OUTWARD',
          quantity: l.qty_issued,
          referenceId: data.mir_no,
          user: data.requested_by || 'SYSTEM',
          timestamp: new Date()
        });
      });
      saveMockData('mock_parts', parts);
      saveMockData('mock_movements', movements);

      return { data: { success: true, data: newMir } };
    }

    if (url.includes('/api/documents/upload')) {
      const docs = getMockData('mock_docs');
      const newDoc = {
        _id: Math.random().toString(),
        filename: data.get('file')?.name || 'upload.pdf',
        contentType: data.get('file')?.type || 'application/pdf',
        size: data.get('file')?.size || 1024,
        gridFsId: Math.random().toString(),
        documentType: data.get('documentType'),
        referenceId: data.get('referenceId') || 'N/A',
        uploadedBy: 'admin',
        createdAt: new Date()
      };
      docs.push(newDoc);
      saveMockData('mock_docs', docs);
      return { data: { success: true, data: newDoc } };
    }

    return { data: { success: true, data: {} } };
  },

  put: async (url, data) => {
    initMockDB();
    await new Promise(resolve => setTimeout(resolve, 200));

    if (url.includes('/approve')) {
      const parts = url.split('/');
      const poNum = parts[parts.length - 2];
      const pos = getMockData('mock_pos');
      const po = pos.find(p => p.po_number === poNum);
      if (po) {
        po.approvalStatus = data.status;
        po.status = data.status === 'APPROVED' ? 'COMPLETE' : 'CANCELLED';
        po.currentStage = 'COMPLETED';
        saveMockData('mock_pos', pos);
        return { data: { success: true, data: po } };
      }
    }

    if (url.includes('/api/users')) {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      const users = getMockData('mock_users');
      const u = users.find(item => item._id === id);
      if (u) {
        Object.assign(u, data);
        saveMockData('mock_users', users);
        return { data: { success: true, data: u } };
      }
    }

    if (url.includes('/api/notifications')) {
      const parts = url.split('/');
      const id = parts[parts.length - 2];
      const notifications = getMockData('mock_notifications');
      const notif = notifications.find(n => n._id === id);
      if (notif) {
        notif.readBy.push('u1');
        saveMockData('mock_notifications', notifications);
        return { data: { success: true, data: notif } };
      }
    }

    return { data: { success: true, data: {} } };
  },

  delete: async (url) => {
    initMockDB();
    await new Promise(resolve => setTimeout(resolve, 200));

    if (url.includes('/api/documents')) {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      const docs = getMockData('mock_docs');
      const filtered = docs.filter(d => d._id !== id);
      saveMockData('mock_docs', filtered);
      return { data: { success: true, message: 'Document deleted' } };
    }

    if (url.includes('/api/users')) {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      const users = getMockData('mock_users');
      const filtered = users.filter(u => u._id !== id);
      saveMockData('mock_users', filtered);
      return { data: { success: true, message: 'User deleted' } };
    }

    return { data: { success: true } };
  }
};

// ==========================================
// 3. AUTO-SWITCHING EXPORT
// ==========================================
// Automatically switches to mock DB when deployed on GitHub Pages (*.github.io)
const isGitHubPages = window.location.hostname.includes('github.io');
const api = isGitHubPages ? mockApi : realApi;

export default api;
