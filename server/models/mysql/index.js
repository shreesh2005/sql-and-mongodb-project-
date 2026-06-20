const { sequelize } = require('../../config/mysql');

const PartCategory = require('./PartCategory');
const Part = require('./Part');
const Vendor = require('./Vendor');
const VendorPart = require('./VendorPart');
const Transporter = require('./Transporter');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderDetail = require('./PurchaseOrderDetail');
const Challan = require('./Challan');
const GRR = require('./GRR');
const GRRDetail = require('./GRRDetail');
const QualityInspection = require('./QualityInspection');
const MIR = require('./MIR');
const MIRDetail = require('./MIRDetail');

// --- Associations ---

// PartCategory <-> Part
PartCategory.hasMany(Part, { foreignKey: 'category_id', as: 'parts' });
Part.belongsTo(PartCategory, { foreignKey: 'category_id', as: 'category' });

// Vendor <-> Part via VendorPart
Vendor.belongsToMany(Part, { through: VendorPart, foreignKey: 'vendor_code', otherKey: 'part_no', as: 'parts' });
Part.belongsToMany(Vendor, { through: VendorPart, foreignKey: 'part_no', otherKey: 'vendor_code', as: 'vendors' });
VendorPart.belongsTo(Vendor, { foreignKey: 'vendor_code', as: 'vendor' });
VendorPart.belongsTo(Part, { foreignKey: 'part_no', as: 'part' });
Vendor.hasMany(VendorPart, { foreignKey: 'vendor_code', as: 'vendorParts' });
Part.hasMany(VendorPart, { foreignKey: 'part_no', as: 'vendorParts' });

// Vendor <-> PurchaseOrder
Vendor.hasMany(PurchaseOrder, { foreignKey: 'vendor_code', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Vendor, { foreignKey: 'vendor_code', as: 'vendor' });

// PurchaseOrder <-> PurchaseOrderDetail
PurchaseOrder.hasMany(PurchaseOrderDetail, { foreignKey: 'po_number', as: 'details' });
PurchaseOrderDetail.belongsTo(PurchaseOrder, { foreignKey: 'po_number', as: 'purchaseOrder' });

// Part <-> PurchaseOrderDetail
Part.hasMany(PurchaseOrderDetail, { foreignKey: 'part_no', as: 'poDetails' });
PurchaseOrderDetail.belongsTo(Part, { foreignKey: 'part_no', as: 'part' });

// Challan associations
Vendor.hasMany(Challan, { foreignKey: 'vendor_code', as: 'challans' });
Challan.belongsTo(Vendor, { foreignKey: 'vendor_code', as: 'vendor' });

Transporter.hasMany(Challan, { foreignKey: 'transporter_id', as: 'challans' });
Challan.belongsTo(Transporter, { foreignKey: 'transporter_id', as: 'transporter' });

PurchaseOrder.hasMany(Challan, { foreignKey: 'po_number', as: 'challans' });
Challan.belongsTo(PurchaseOrder, { foreignKey: 'po_number', as: 'purchaseOrder' });

// GRR associations
Challan.hasMany(GRR, { foreignKey: 'challan_no', as: 'grrs' });
GRR.belongsTo(Challan, { foreignKey: 'challan_no', as: 'challan' });

// GRR <-> GRRDetail
GRR.hasMany(GRRDetail, { foreignKey: 'grr_no', as: 'details' });
GRRDetail.belongsTo(GRR, { foreignKey: 'grr_no', as: 'grr' });

// Part <-> GRRDetail
Part.hasMany(GRRDetail, { foreignKey: 'part_no', as: 'grrDetails' });
GRRDetail.belongsTo(Part, { foreignKey: 'part_no', as: 'part' });

// QualityInspection associations
GRRDetail.hasMany(QualityInspection, { foreignKey: 'grr_detail_id', as: 'inspections' });
QualityInspection.belongsTo(GRRDetail, { foreignKey: 'grr_detail_id', as: 'grrDetail' });

// MIR <-> MIRDetail
MIR.hasMany(MIRDetail, { foreignKey: 'mir_no', as: 'details' });
MIRDetail.belongsTo(MIR, { foreignKey: 'mir_no', as: 'mir' });

// Part <-> MIRDetail
Part.hasMany(MIRDetail, { foreignKey: 'part_no', as: 'mirDetails' });
MIRDetail.belongsTo(Part, { foreignKey: 'part_no', as: 'part' });

module.exports = {
  sequelize,
  PartCategory,
  Part,
  Vendor,
  VendorPart,
  Transporter,
  PurchaseOrder,
  PurchaseOrderDetail,
  Challan,
  GRR,
  GRRDetail,
  QualityInspection,
  MIR,
  MIRDetail
};
