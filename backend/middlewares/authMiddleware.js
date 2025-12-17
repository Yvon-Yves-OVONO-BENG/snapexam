// backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/Utilisateur.js"; // ton modèle Sequelize User

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token manquant" });
    }

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");

    // Récupération de l'utilisateur via Sequelize
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "username", "email", "role", "avatar", "contact"], 
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    req.user = user; // attache l'utilisateur à la requête
    next();
  } catch (err) {
    console.error("Erreur authMiddleware :", err.message);
    res.status(403).json({ error: "Token invalide" });
  }
};

export default authMiddleware;
