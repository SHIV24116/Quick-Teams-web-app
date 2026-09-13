const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

const dbUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';

if (dbUrl.startsWith('mysql://')) {
  sequelize = new Sequelize(dbUrl, {
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Default to SQLite fallback for instant zero-dependency local dev
  const storagePath = path.resolve(__dirname, '../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[DB] Database connected successfully (${sequelize.getDialect()})`);
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}. Falling back to SQLite...`);
    const fallbackPath = path.resolve(__dirname, '../database.sqlite');
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: fallbackPath,
      logging: false
    });
    await sequelize.authenticate();
    console.log(`[DB] Fallback SQLite database connected successfully.`);
  }
};

module.exports = { sequelize, testConnection };
