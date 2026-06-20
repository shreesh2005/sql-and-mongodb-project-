const AuditLog = require('../models/mongodb/AuditLog');

const auditLog = (action, entity) => {
  return async (req, res, next) => {
    // We wrap the response send to log the audit trail AFTER the request completes successfully
    const originalSend = res.send;

    res.send = function(data) {
      res.send = originalSend;
      originalSend.apply(this, arguments);

      // Only audit log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const parsedData = JSON.parse(data);
          
          // Identify entity ID from response or request parameters
          let entityId = req.params.id || req.body.id || 'N/A';
          if (parsedData && parsedData.data) {
            entityId = parsedData.data.id || parsedData.data.po_number || parsedData.data.challan_no || parsedData.data.grr_no || parsedData.data.mir_no || entityId;
          }

          AuditLog.create({
            userId: req.user ? req.user._id : 'SYSTEM',
            username: req.user ? req.user.username : 'SYSTEM',
            action: action || req.method,
            entity: entity || req.baseUrl.split('/').pop(),
            entityId: String(entityId),
            before: req.body.beforeState || null, // Can pass beforeState in request if available
            after: req.body // Save the request body payload
          }).catch(err => console.error('Failed to write audit log:', err.message));
        } catch (e) {
          // If response is not JSON, we still audit log basic info
          AuditLog.create({
            userId: req.user ? req.user._id : 'SYSTEM',
            username: req.user ? req.user.username : 'SYSTEM',
            action: action || req.method,
            entity: entity || req.baseUrl.split('/').pop(),
            entityId: req.params.id || 'N/A',
            after: req.body
          }).catch(err => console.error('Failed to write audit log:', err.message));
        }
      }
    };

    next();
  };
};

module.exports = auditLog;
