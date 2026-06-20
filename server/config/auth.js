require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'tata_supply_chain_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
