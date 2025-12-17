// sync.js
import sequelize from "./config/database.js";
import "./models/Abonnement.js";
import "./models/Invoice.js";
import "./models/Payment.js";
import "./models/Plan.js";
import "./models/Subscription.js";
import "./models/Dossier.js";
import "./models/Photo.js";
import "./models/Message.js";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à Mysql réussie");

    await sequelize.sync({ alter: true });
    // alter = adapte la structure sans tout supprimer
    // force = supprime et recrée toutes les tables

    console.log("✅ Les tables ont été créées/mises à jour avec succès");
    process.exit();
  } catch (error) {
    console.error("❌ Erreur de synchronisation :", error);
  }
})();
