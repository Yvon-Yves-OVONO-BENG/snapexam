// backend/models/Invoice.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Utilisateur from "./Utilisateur.js";
import Subscription from "./Subscription.js";

const Invoice = sequelize.define("Invoice", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateurId: { type: DataTypes.INTEGER, allowNull: false },
  path: { type: DataTypes.STRING, allowNull: false }, // chemin fichier PDF
  amount: { type: DataTypes.INTEGER, allowNull: false },
  meta: { type: DataTypes.JSON, allowNull: true },

  subscriptionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Subscription,
      key: "id"
    },
  }
}, 
{
  tableName: "invoice",
  timestamps: true,
});

export default Invoice;
