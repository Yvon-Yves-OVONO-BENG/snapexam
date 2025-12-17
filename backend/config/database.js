// config/database.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize("c2462367c_snapexam", "c2462367c_userSnapExam", "Uiz%4idZNfFv", {
  host: "mysql.tophebergement.com",
  dialect: "mysql",
  logging: false, // optionnel : désactive les logs SQL dans la console
});

export default sequelize;
