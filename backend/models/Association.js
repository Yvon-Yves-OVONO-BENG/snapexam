// models/association.js (ou un fichier central pour gérer les relations)
import sequelize from "../config/database.js";
import Utilisateur from "./Utilisateur.js";
import Dossier from "./Dossier.js";
import Photo from "./Photo.js";
import Contact from "./Contact.js";
import Invoice from "./Invoice.js";
import Subscription from "./Subscription.js";
import Payment from "./Payment.js";
import Plan from "./Plan.js";

// export const Utilisateur = UtilisateurFactory(sequelize);

// Définition de la relation
Contact.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });
Utilisateur.hasMany(Contact, { foreignKey: "utilisateurId", as: "contacts" });

Invoice.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });
Invoice.belongsTo(Subscription, { foreignKey: "subscriptionId", as: "subscription" });
Subscription.hasMany(Invoice, {foreignKey: "subscriptionId"});

Subscription.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });
Subscription.belongsTo(Plan, { foreignKey: "planId", as: "plan" });
Subscription.hasMany(Payment, {as: "payments", foreignKey: "subscriptionId"});

Payment.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "utilisateur" });
Payment.belongsTo(Subscription, { foreignKey: "subscriptionId", as: "subscription" });

Utilisateur.hasMany(Subscription, { foreignKey: "utilisateurId", as: "subscriptions" });
Plan.hasMany(Subscription, { foreignKey: "planId", as: "subscriptions" });

// Dossier → Utilisateur
Utilisateur.hasMany(Dossier, { foreignKey: "utilisateurId", as: "dossiers" });
Dossier.belongsTo(Utilisateur, { foreignKey: "utilisateurId", as: "proprietaire" });

// Dossier → Photos
Dossier.hasMany(Photo, { foreignKey: "dossierId", as: "photos" });
Photo.belongsTo(Dossier, { foreignKey: "dossierId", as: "dossier" });

export { sequelize, Utilisateur, Contact, Dossier, Photo };
