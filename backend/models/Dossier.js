import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Dossier = sequelize.define("Dossier", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  utilisateurId: {         // ← Vérifie que tu as bien cette ligne
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "dossier",
});

export default Dossier;
