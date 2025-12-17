// backend/routes/contacts.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { pool } from "../../config/database.js"; // connexion PostgreSQL

const router = express.Router();

// Créer un contact
router.post("/", verifyToken, async (req, res) => {
  const utilisateurId = req.user.id; // extrait de JWT
  const { nom, prenom, email, telephone } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO contact (nom, prenom, email, telephone, utilisateurId) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nom, prenom, email, telephone, utilisateurId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer tous les contacts de l’utilisateur connecté
router.get("/", verifyToken, async (req, res) => {
  const utilisateurId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM contact WHERE user_id = $1 ORDER BY created_at DESC",
      [utilisateurId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
