const ApprovalWorkflow = require('../models/mongodb/ApprovalWorkflow');
const InventoryMovement = require('../models/mongodb/InventoryMovement');
const DeliveryTracking = require('../models/mongodb/DeliveryTracking');
const QualityReport = require('../models/mongodb/QualityReport');
const VendorPerformance = require('../models/mongodb/VendorPerformance');
const Notification = require('../models/mongodb/Notification');
const ProcurementAnalytics = require('../models/mongodb/ProcurementAnalytics');

class SyncService {
  /**
   * Syncs PO creation to MongoDB approval workflows and analytics
   */
  async syncPurchaseOrder(po, details, vendorName) {
    try {
      // 1. Create approval workflow in MongoDB
      await ApprovalWorkflow.create({
        entityType: 'PO',
        entityId: po.po_number,
        approvalChain: [
          { role: 'Purchase Manager', status: 'APPROVED', comment: 'PO Raised', timestamp: new Date() },
          { role: 'Store Manager', status: 'PENDING', comment: 'Awaiting stock delivery' }
        ],
        currentStage: 'Store Manager',
        status: 'PENDING',
        comments: ['PO raised in system. Waiting for vendor delivery.']
      });

      // 2. Create notification for Store Manager
      await Notification.create({
        role: 'Store Manager',
        type: 'INFO',
        title: 'New PO Raised',
        message: `PO ${po.po_number} raised for vendor ${vendorName || po.vendor_code}. Expected amount: INR ${po.total_amount}.`,
        priority: 'MEDIUM'
      });

      // 3. Update Procurement Analytics
      const period = po.po_date.substring(0, 7); // YYYY-MM
      await ProcurementAnalytics.findOneAndUpdate(
        { period },
        {
          $inc: { totalSpend: Number(po.total_amount), poCount: 1 },
          $addToSet: {
            vendorBreakdown: { vendorCode: po.vendor_code, vendorName: vendorName || po.vendor_code, spend: Number(po.total_amount) }
          }
        },
        { upsert: true, new: true }
      );

      console.log(`Sync Success: PO ${po.po_number} sync completed.`);
    } catch (error) {
      console.error('Sync Error: Failed to sync Purchase Order:', error.message);
    }
  }

  /**
   * Syncs GRR creation to inventory movements and delivery tracking
   */
  async syncGRR(grr, details, vendorCode, transporterId, transporterName) {
    try {
      // 1. Log inventory movement (INWARD) for each line item
      for (const item of details) {
        await InventoryMovement.create({
          partNo: item.part_no,
          description: item.description,
          movementType: 'INWARD',
          quantity: item.challan_qty,
          toLocation: 'MAIN_WAREHOUSE',
          referenceId: `GRR-${grr.grr_no}`,
          user: grr.received_by || 'SYSTEM'
        });
      }

      // 2. Complete delivery tracking in MongoDB
      await DeliveryTracking.findOneAndUpdate(
        { challanNo: grr.challan_no },
        {
          challanNo: grr.challan_no,
          transporterId,
          transporterName,
          deliveryStatus: 'DELIVERED',
          $push: { routeHistory: 'Received at Tata Main Warehouse' }
        },
        { upsert: true, new: true }
      );

      // 3. Create notification for Inspectors
      await Notification.create({
        role: 'Inspector',
        type: 'ACTION',
        title: 'Quality Inspection Required',
        message: `GRR ${grr.grr_no} created for Challan ${grr.challan_no}. Inspection required for incoming materials.`,
        priority: 'HIGH'
      });

      console.log(`Sync Success: GRR ${grr.grr_no} inventory and delivery sync completed.`);
    } catch (error) {
      console.error('Sync Error: Failed to sync GRR:', error.message);
    }
  }

  /**
   * Syncs Quality Inspection completion to quality reports and vendor performance
   */
  async syncQualityInspection(inspection, grrDetail, vendorCode, vendorName) {
    try {
      // 1. Create a detailed quality report with AI observations mockup
      const aiObservations = [];
      const rejectPct = (inspection.rejected_qty / (inspection.accepted_qty + inspection.rejected_qty)) * 100;
      
      if (inspection.rejected_qty > 0) {
        aiObservations.push(`Rejected quantity: ${inspection.rejected_qty} units.`);
        aiObservations.push('AI Alert: Rejection detected. Vendor quality rating may decrease.');
        if (inspection.remarks && inspection.remarks.toLowerCase().includes('rust')) {
          aiObservations.push('AI Suggestion: Rust found. Check anti-corrosive packaging quality.');
        }
      } else {
        aiObservations.push('AI Check: 100% Quality Acceptance rate for this batch.');
      }

      await QualityReport.create({
        grrNo: grrDetail.grr_no,
        inspectionId: inspection.inspection_id,
        partNo: grrDetail.part_no,
        remarks: inspection.remarks,
        inspectorDetails: { name: inspection.inspector_name },
        aiObservations
      });

      // 2. Update Vendor Performance metrics
      const totalQty = inspection.accepted_qty + inspection.rejected_qty;
      const isRej = inspection.rejected_qty > 0;
      
      const vendorPerformance = await VendorPerformance.findOne({ vendorCode });

      if (vendorPerformance) {
        // Calculate new quality score
        let rejections = 0;
        let totalReceived = 0;

        vendorPerformance.deliveryHistory.forEach(h => {
          // fetch historical quality if needed
        });

        // Simplified calculation: quality score drops based on rejection rate
        const currentRejectionRate = vendorPerformance.rejectionRate;
        const newRejectionRate = (currentRejectionRate + (inspection.rejected_qty / totalQty * 100)) / 2;
        const newQualityScore = Math.max(0, 100 - newRejectionRate);

        await VendorPerformance.updateOne(
          { vendorCode },
          {
            $set: {
              rejectionRate: parseFloat(newRejectionRate.toFixed(2)),
              qualityScore: parseFloat(newQualityScore.toFixed(2))
            },
            $push: {
              ratings: { rating: isRej ? 3 : 5, comment: inspection.remarks || 'Standard Delivery' }
            }
          }
        );
      } else {
        // Seed performance tracking if not existing
        await VendorPerformance.create({
          vendorCode,
          vendorName,
          ratings: [{ rating: isRej ? 3 : 5, comment: inspection.remarks || 'Initial Delivery' }],
          rejectionRate: parseFloat(((inspection.rejected_qty / totalQty) * 100).toFixed(2)),
          qualityScore: parseFloat((100 - (inspection.rejected_qty / totalQty * 100)).toFixed(2)),
          comments: [inspection.remarks || 'Initial quality inspection recorded.']
        });
      }

      // 3. Create Notification for Purchase Manager if rejections found
      if (isRej) {
        await Notification.create({
          role: 'Purchase Manager',
          type: 'WARNING',
          title: 'Material Rejection Alert',
          message: `QC rejection of ${inspection.rejected_qty} units of ${grrDetail.part_no} from Vendor ${vendorName || vendorCode}.`,
          priority: 'HIGH'
        });
      }

      console.log(`Sync Success: Quality inspection ${inspection.inspection_id} synced successfully.`);
    } catch (error) {
      console.error('Sync Error: Failed to sync Quality Inspection:', error.message);
    }
  }

  /**
   * Syncs MIR issuance to inventory movements
   */
  async syncMIR(mir, details) {
    try {
      // 1. Create stock movement (OUTWARD) for each line item
      for (const item of details) {
        await InventoryMovement.create({
          partNo: item.part_no,
          movementType: 'OUTWARD',
          quantity: item.qty_issued,
          fromLocation: 'MAIN_WAREHOUSE',
          toLocation: mir.department || 'PRODUCTION',
          referenceId: mir.mir_no,
          user: mir.requested_by || 'SYSTEM'
        });
      }

      // 2. Log workflow in ApprovalWorkflow (Completed)
      await ApprovalWorkflow.create({
        entityType: 'MIR',
        entityId: mir.mir_no,
        approvalChain: [
          { role: 'Store Manager', status: 'APPROVED', comment: 'Material Issued', timestamp: new Date() }
        ],
        status: 'APPROVED',
        comments: [`Materials issued to ${mir.department} department.`]
      });

      console.log(`Sync Success: MIR ${mir.mir_no} sync completed.`);
    } catch (error) {
      console.error('Sync Error: Failed to sync MIR:', error.message);
    }
  }
}

module.exports = new SyncService();
