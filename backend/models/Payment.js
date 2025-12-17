// backend/models/Payment.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateurId: { type: DataTypes.INTEGER, allowNull: false },
  subscriptionId: { type: DataTypes.INTEGER, allowNull: true },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  method: { type: DataTypes.STRING, allowNull: false }, // card, paypal, virement (simulé)
  status: { type: DataTypes.STRING, defaultValue: "paye" }, // paye, failed
  meta: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: "payment",
  timestamps: true,
});

export default Payment;
