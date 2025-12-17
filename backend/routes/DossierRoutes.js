// backend/routes/dossierRoute.js
import express from "express";
import { Dossier, Utilisateur, Photo } from "../models/Association.js"; // Sequelize model
import authenticateToken from "../middlewares/authenticateToken.js";
import Subscription from "../models/Subscription.js";
import { Sequelize } from "sequelize";

const router = express.Router();

// 📌 GET - Liste des dossiers
router.get("/", authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const whereClause = isAdmin ? {} : { utilisateurId: req.user.id };

    const dossiers = await Dossier.findAll({
      where: whereClause,
      include: [
        { model: Utilisateur, as: "proprietaire", attributes: ["id", "username"] },
        {
          model: Photo,
          as: "photos",
          attributes: [],
          required: false // pour éviter les erreurs si aucun dossier n’a de photo
        }
      ],
      attributes: [
        "id",
        "nom",
        "createdAt",
        "utilisateurId",
        [Sequelize.fn("COUNT", Sequelize.col("photos.id")), "nombrePhotos"]
      ],
      group: ["Dossier.id"],
      raw: false,
      subQuery: false
    });

    res.json(dossiers);

  } catch (err) {
    console.error("Erreur SQL :", err);
    res.status(500).json({ message: "Erreur serveur", erreur: err.message });
  }
});

// 📌 POST - Créer un dossier
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ message: "Le nom du dossier est requis" });

    // Vérifie si l'utilisateur a un abonnement
    const sub = await Subscription.findOne({
      where: { utilisateurId: req.user.id, status: "paye" },
    });
    const hasSubscription = !!sub;

    // Récupère le nombre de dossiers existants
    const existingDossiers = await Dossier.count({
      where: { utilisateurId: req.user.id }
    });

    // Si utilisateur gratuit et qu'il a déjà 1 dossier
    if (!hasSubscription && existingDossiers >= 1) {
      return res.status(403).json({
        message: "Vous devez souscrire pour créer plus d'un dossier",
        limiteDossiers: 1,
        numeroMomo: "673788308",
        numeroOM: "697993386",
      });
    }

    const dossier = await Dossier.create({
      nom,
      utilisateurId: req.user.id,
    });

    res.status(201).json({ message: "Dossier ajouté ✅", dossier });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 PUT - Modifier un dossier
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nom } = req.body;

    const dossier = await Dossier.findByPk(id);
    if (!dossier) return res.status(404).json({ message: "Dossier introuvable" });

    // Vérification : seul admin ou propriétaire peut modifier
    if (req.user.role !== "admin" && dossier.utilisateurId !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé ❌" });
    }

    dossier.nom = nom || dossier.nom;
    await dossier.save();
    res.json({ message: "Dossier modifié ✅", dossier });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 DELETE - Supprimer un dossier
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const dossier = await Dossier.findByPk(id);
    if (!dossier) return res.status(404).json({ message: "Dossier introuvable" });

    // Vérification
    if (req.user.role !== "admin" && dossier.utilisateurId !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé ❌" });
    }

    await dossier.destroy();
    res.json({ message: "Dossier supprimé ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Suppression multiple /api/dossiers/multiple
router.post("/multiple-delete", authenticateToken, async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Aucun dossier sélectionné" });
  }

  try {
    // Si user n'est pas admin, supprimer uniquement ses dossiers
    if (req.user.role !== "admin") {
      await Dossier.destroy({ where: { id: ids, utilisateurId: req.user.id } });
    } else {
      await Dossier.destroy({ where: { id: ids } });
    }
    res.json({ message: "Dossiers supprimés ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Impossible de supprimer les dossiers" });
  }
});

export default router;