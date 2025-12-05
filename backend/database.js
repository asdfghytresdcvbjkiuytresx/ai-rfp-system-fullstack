import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "rfp_database.sqlite",
});

// --------------------
// RFP MODEL
// --------------------
export const Rfp = sequelize.define("Rfp", {
  title: DataTypes.STRING,
  items: DataTypes.TEXT,
  total_budget: DataTypes.STRING,
  delivery_days: DataTypes.INTEGER,
  payment_terms: DataTypes.STRING,
  warranty: DataTypes.STRING,
});

// --------------------
// VENDOR MODEL
// --------------------
export const Vendor = sequelize.define("Vendor", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// --------------------
// PROPOSAL MODEL
// --------------------
export const Proposal = sequelize.define("Proposal", {
  rfpId: DataTypes.INTEGER,
  vendorId: DataTypes.INTEGER,

  total_price: DataTypes.STRING,
  delivery_days: DataTypes.INTEGER,
  warranty: DataTypes.STRING,
  payment_terms: DataTypes.STRING,

  raw_text: DataTypes.TEXT,
});

// --------------------
// DB INIT
// --------------------
export async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync();
    console.log("✅ Database synced");

  } catch (err) {
    console.error("❌ DB init failed:", err);
  }
}
