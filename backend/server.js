// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sequelize from "./config/database.js";
import userRoutes from "./routes/Utilisateur/userRoutes.js";
import authRoutes from "./routes/Utilisateur/authRoutes.js";
import contactRoutes from "./routes/ContactRoutes.js";
import plansRoutes from "./routes/PlansRoute.js";
import subscriptionRoutes from "./routes/SubscriptionRoutes.js";
import dossiers from "./routes/DossierRoutes.js";
import photoRoutes from "./routes/PhotoRoutes.js";
import adminPaymentsRoutes from "./routes/AdminPaymentRoutes.js";
import messageRoutes from "./routes/MessageRoutes.js";
import path from "path";
import dotenv from "dotenv";  // importer le package dotenv
dotenv.config();              // charger le fichier .env

const app = express();

//Autoriser ton frontend à accéder au Backend
app.use(
  cors(
    {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }
  )
);

app.use(express.json());

// 📂 Rendre le dossier uploads accessible publiquement
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use('/avatars', express.static(path.join(process.cwd(), 'avatars')));

// Middleware
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// Test serveur
app.get("/", (req, res) => res.send("🚀 Backend fonctionne bien avec Sequelize !"));

// Exposer les factures (URL: ${process.env.REACT_APP_API_URL}/invoices/xxx.pdf)
app.use("/invoices", express.static(path.join(process.cwd(), "invoices")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes); // contient maintenant login + signup
app.use("/api/contacts", contactRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/dossiers", dossiers);
app.use("/api/photos", photoRoutes);
app.use("/api/payments", adminPaymentsRoutes);
app.use("/api/messages", messageRoutes);

// Connexion + Sync Sequelize
sequelize.authenticate()
  .then(() => console.log("✅ Connexion Mysql réussie"))
  .catch(err => console.error("❌ Erreur connexion :", err));

sequelize.sync()
  .then(() => console.log("✅ Modèles synchronisés"))
  .catch(err => console.error("❌ Erreur synchronisation :", err));

// Démarrage serveur
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Serveur en marche sur http://localhost:${PORT}`);
});

