import express from "express";
import pool from "../../config/database.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// ✅ Récupérer tous les utilisateurs (admin uniquement)
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, contact, statut FROM users ORDER BY username ASC"
      
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs :", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Toggle statut (activer/désactiver un utilisateur)
router.patch("/toggle/:id", authMiddleware, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query("SELECT statut FROM users WHERE id=$1", [id]);
    if (user.rows.length === 0) return res.status(404).json({ message: "Utilisateur introuvable" });

    const newStatut = !user.rows[0].statut;
    await pool.query("UPDATE users SET statut=$1 WHERE id=$2", [newStatut, id]);
    res.json({ message: "Statut mis à jour", statut: newStatut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
