// fixPasswords.js
import bcrypt from "bcrypt";
import User from "./models/utilisateur.js"; // chemin vers ton modèle
import sequelize from "./config/database.js"; // connexion à ta BDD

const fixOldPasswords = async () => {
  try {
    await sequelize.authenticate(); // vérifie la connexion à la BDD
    console.log("Connexion à la BDD OK");

    const users = await User.findAll();

    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("123456", salt); // mot de passe par défaut
      user.password = hash;
      await user.save();
      console.log(`Mot de passe réinitialisé pour ${user.username}`);
    }

    console.log("Tous les anciens mots de passe ont été réinitialisés !");
    process.exit(0);
  } catch (err) {
    console.error("Erreur :", err);
    process.exit(1);
  }
};

fixOldPasswords();
