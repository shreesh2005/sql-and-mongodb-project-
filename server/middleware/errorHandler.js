const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map(e => e.message).join(', ');
    return res.status(400).json({ success: false, error: message });
  }

  // Sequelize ForeignKey Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ success: false, error: 'Database constraint violation: Invalid reference key' });
  }

  // Mongoose Bad ObjectId Cast
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Resource not found' });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    return res.status(400).json({ success: false, error: 'Duplicate field value entered' });
  }

  // Mongoose/Sequelize Validation Error
  if (err.name === 'ValidationError' || err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors || {}).map(val => val.message || val).join(', ');
    return res.status(400).json({ success: false, error: message || err.message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
