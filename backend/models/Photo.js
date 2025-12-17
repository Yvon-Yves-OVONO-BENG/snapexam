// models/Photo.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Photo = sequelize.define("Photo", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nom_candidat: { type: DataTypes.STRING, allowNull: false },
  photo_url: { type: DataTypes.STRING, allowNull: false },
  dossierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "dossier", key: "id" },
  }, 
  },{
  tableName: "photo",
});

export default Photo;
