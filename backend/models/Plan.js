// backend/models/Plan.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // ton init Sequelize existant

const Plan = sequelize.define(
  "Plan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING(150), allowNull: false },
    price: { type: DataTypes.STRING(100), allowNull: false },
    amount_cents: { type: DataTypes.INTEGER, allowNull: true }, // pour paiement
    currency: { type: DataTypes.STRING(10), defaultValue: "XAF" },
    description: { type: DataTypes.TEXT, allowNull: true },
    features: { type: DataTypes.TEXT, allowNull: true }, // JSON.stringify([...]) ou CSV
    color: { type: DataTypes.STRING(100), allowNull: true },
    highlight: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "plan",
    timestamps: true,
    underscored: true,
  }
);

export default Plan;
