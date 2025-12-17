// models/Contact.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
// import User from "./user.js"; // import du modèle User

const Contact = sequelize.define(
  "Contact",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    numero: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    statut: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    utilisateurId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "utilisateur", // table utilisateur
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "contact",
    timestamps: true,
    createdAt: "created_at",
  }
);


export default Contact;
