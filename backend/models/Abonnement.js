// models/Abonnement.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./Utilisateur.js";
import Plan from "./Plan.js";

const Abonnement = sequelize.define("Abonnement", {
  dateDebut: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dateFin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  statut: {
    type: DataTypes.STRING,
    defaultValue: "actif",
  },
});

User.hasMany(Abonnement, { foreignKey: "userId" });
Abonnement.belongsTo(User, { foreignKey: "userId" });

Plan.hasMany(Abonnement, { foreignKey: "planId" });
Abonnement.belongsTo(Plan, { foreignKey: "planId" });

export default Abonnement;
