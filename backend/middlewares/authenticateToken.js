// middlewares/authenticateToken.js
import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  // Vérifier que la clé secrète est définie
  if (!process.env.JWT_SECRET) {
    console.error("ERREUR : JWT_SECRET non défini !");
    return res.status(500).json({ message: "Erreur serveur : clé JWT non configurée." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if(err.name === "TokenExpireError"){
        return res.status(401).json({ message: "Session expirée"});
      }
      console.error("Erreur JWT :", err);
      return res.status(403).json({ message: "Token invalide" });
    }

    req.user = user; // On récupère l’ID et info du user depuis le token
    next();
  });
};

export default authenticateToken;
