// src/models/Message.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // ton instance Sequelize

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: "message",
  timestamps: true, // createdAt & updatedAt
});

export default Message;
