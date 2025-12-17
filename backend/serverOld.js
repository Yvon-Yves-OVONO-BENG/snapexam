// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import signupRoute from "./routes/Signup.js";
import loginRoute from "./routes/Login.js";
import listeUtilisateursRoute from "./routes/ListeUtilisateurs.js";
import modifierUtilisateurRoute from "./routes/ModifierUtilisateur.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Test serveur
app.get("/", (req, res) => res.send("🚀 Backend fonctionne bien !"));

// Routes
app.use("/api/auth/signup", signupRoute);
app.use("/api/auth/login", loginRoute);
app.use("/api/users", listeUtilisateursRoute); // préfixe /api/users
app.use("/api/modifierUtilisateur", modifierUtilisateurRoute);


// Démarrage serveur
app.listen(PORT, () => console.log(`✅ Serveur en marche sur http://localhost:${PORT}`));
