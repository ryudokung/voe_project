const { AuditLog } = require('../models');

const createAuditLog = async (actorId, action, entity, entityId, detail, req) => {
  try {
    await AuditLog.create({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId,
      detail,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
    });
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
};

const auditMiddleware = (action, entity) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function (data) {
      // Only audit successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const actorId = req.user?.id;
        const entityId = req.params?.id || (req.body?.id || req.body?.data?.id);
        
        setImmediate(async () => {
          await createAuditLog(
            actorId,
            action,
            entity,
            entityId,
            {
              method: req.method,
              url: req.originalUrl,
              body: req.method !== 'GET' ? req.body : undefined,
              status: res.statusCode,
            },
            req
          );
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  createAuditLog,
  auditMiddleware,
};
