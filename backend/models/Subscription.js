// backend/models/Subscription.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Subscription = sequelize.define("Subscription", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateurId: { type: DataTypes.INTEGER, allowNull: false },
  planId: { type: DataTypes.INTEGER, allowNull: false },
  startedAt: { type: DataTypes.DATE, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "paye" }, // paye, cancelled, expired
}, {
  tableName: "subscription",
  timestamps: true,
});

export default Subscription;
