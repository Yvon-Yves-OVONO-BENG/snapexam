// config/database.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize("snapexam", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false, // optionnel : désactive les logs SQL dans la console
});

export default sequelize;
