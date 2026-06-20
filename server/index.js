const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectMySQL } = require('./config/mysql');
const connectMongoDB = require('./config/mongodb');
const errorHandler = require('./middleware/errorHandler');

// MongoDB Models for Seeding
const User = require('./models/mongodb/User');
const VendorPerformance = require('./models/mongodb/VendorPerformance');
const ProcurementAnalytics = require('./models/mongodb/ProcurementAnalytics');

// Import Routes
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const partRoutes = require('./routes/parts');
const poRoutes = require('./routes/purchaseOrders');
const challanRoutes = require('./routes/challans');
const grrRoutes = require('./routes/grr');
const qualityRoutes = require('./routes/qualityInspection');
const mirRoutes = require('./routes/mir');
const inventoryRoutes = require('./routes/inventory');
const analyticsRoutes = require('./routes/analytics');
const documentRoutes = require('./routes/documents');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const auditLogRoutes = require('./routes/auditLogs');

const app = express();

// Security and Logging middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', mysql: 'Connected', mongodb: 'Connected', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/grr', grrRoutes);
app.use('/api/quality-inspections', qualityRoutes);
app.use('/api/mir', mirRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Error Handling Middleware (must be last)
app.use(errorHandler);

// Port setup
const PORT = process.env.PORT || 5000;

// Seed Function
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding default users...');
      
      const seedUsers = [
        { username: 'admin', password: 'admin123', name: 'Pranav Admin', role: 'Admin', email: 'admin@tatasupply.com' },
        { username: 'purchase', password: 'purchase123', name: 'Sanjay Dutt', role: 'Purchase Manager', email: 'sanjay@tatasupply.com' },
        { username: 'store', password: 'store123', name: 'Ramesh Verma', role: 'Store Manager', email: 'ramesh@tatasupply.com' },
        { username: 'inspector', password: 'inspector123', name: 'QC Deepak Jain', role: 'Inspector', email: 'deepak.qc@tatasupply.com' },
        { username: 'vendor', password: 'vendor123', name: 'Tata Steels representative', role: 'Vendor', email: 'sales@tatasteel.com', vendorCode: 'VND-001' }
      ];

      for (const u of seedUsers) {
        await User.create(u);
      }
      console.log('Seed: Created 5 default authentication users.');
    }

    const perfCount = await VendorPerformance.countDocuments();
    if (perfCount === 0) {
      console.log('Seeding initial MongoDB vendor performance metrics...');
      
      const seedPerf = [
        {
          vendorCode: 'VND-001',
          vendorName: 'Tata Steels Ltd',
          ratings: [{ rating: 5, comment: 'High quality steel supply' }],
          deliveryHistory: [{ poNumber: 'PO-2024-001', expectedDate: new Date('2024-01-25'), actualDate: new Date('2024-01-24'), onTime: true }],
          rejectionRate: 1.01,
          qualityScore: 98.99,
          comments: ['Preferred vendor for raw sheets.'],
          performanceTrend: [{ month: '2024-01', qualityScore: 99, deliveryScore: 100 }]
        },
        {
          vendorCode: 'VND-002',
          vendorName: 'Bharat Electronics Ltd',
          ratings: [{ rating: 4, comment: 'Slight delay in PCBs but excellent components' }],
          deliveryHistory: [{ poNumber: 'PO-2024-002', expectedDate: new Date('2024-02-01'), actualDate: new Date('2024-01-30'), onTime: true }],
          rejectionRate: 5.0,
          qualityScore: 95.0,
          comments: ['PCBs need rigorous moisture testing.'],
          performanceTrend: [{ month: '2024-01', qualityScore: 95, deliveryScore: 100 }]
        },
        {
          vendorCode: 'VND-003',
          vendorName: 'Supreme Hydraulics Pvt',
          ratings: [{ rating: 5, comment: 'Zero defects' }],
          deliveryHistory: [{ poNumber: 'PO-2024-003', expectedDate: new Date('2024-02-05'), actualDate: new Date('2024-02-04'), onTime: true }],
          rejectionRate: 0.0,
          qualityScore: 100.0,
          comments: ['Pressure testing values are perfect.'],
          performanceTrend: [{ month: '2024-02', qualityScore: 100, deliveryScore: 100 }]
        }
      ];

      for (const p of seedPerf) {
        await VendorPerformance.create(p);
      }
      console.log('Seed: Created initial vendor performance statistics.');
    }

    const analyticsCount = await ProcurementAnalytics.countDocuments();
    if (analyticsCount === 0) {
      console.log('Seeding initial SCM procurement analytics trends...');
      
      const seedAnalytics = [
        {
          period: '2024-01',
          totalSpend: 60400.00,
          poCount: 2,
          vendorBreakdown: [
            { vendorCode: 'VND-001', vendorName: 'Tata Steels Ltd', spend: 16400.00 },
            { vendorCode: 'VND-002', vendorName: 'Bharat Electronics Ltd', spend: 44000.00 }
          ],
          categoryBreakdown: [
            { categoryId: 1, categoryName: 'Steel Components', spend: 16400.00 },
            { categoryId: 2, categoryName: 'Electronic Components', spend: 44000.00 }
          ]
        },
        {
          period: '2024-02',
          totalSpend: 324000.00,
          poCount: 3,
          vendorBreakdown: [
            { vendorCode: 'VND-003', vendorName: 'Supreme Hydraulics Pvt', spend: 17700.00 },
            { vendorCode: 'VND-004', vendorName: 'Global Auto Parts Inc', spend: 288000.00 },
            { vendorCode: 'VND-005', vendorName: 'Precision Engineering', spend: 18300.00 }
          ],
          categoryBreakdown: [
            { categoryId: 3, categoryName: 'Hydraulic Parts', spend: 36000.00 },
            { categoryId: 5, categoryName: 'Engine Assemblies', spend: 288000.00 }
          ]
        }
      ];

      for (const a of seedAnalytics) {
        await ProcurementAnalytics.create(a);
      }
      console.log('Seed: Created monthly SCM trend metrics.');
    }
  } catch (err) {
    console.error('Seeding warning:', err.message);
  }
};

// Start Server
const startServer = async () => {
  // Connect Databases
  await connectMySQL();
  await connectMongoDB();

  // Run seed
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
