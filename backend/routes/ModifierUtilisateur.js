// routes/ModifierUtilisateur.js
import express from "express";
import pool from "../../config/database.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// ✅ Modifier un utilisateur (admin uniquement)
router.put("/:id", authMiddleware, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, email, role, contact } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET username = $1, email = $2, role = $3, contact = $4 WHERE id = $5 RETURNING id, username, email, role, statut, contact, created_at",
      [username, email, role, contact, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur modification utilisateur :", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
