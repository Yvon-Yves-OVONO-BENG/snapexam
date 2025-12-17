import { sequelize, Utilisateur } from "./models/Association.js";

async function testUtilisateurs() {
  try {
    // Vérifie la connexion à la base
    await sequelize.authenticate();
    console.log("Connexion à la base OK ✅");

    // Synchronisation optionnelle (ne pas utiliser si les tables existent déjà)
    // await sequelize.sync({ force: false });

  } catch (err) {
    console.error("Erreur :", err);
  } finally {
    await sequelize.close();
    console.log("Connexion fermée");
  }
}

testUtilisateurs();