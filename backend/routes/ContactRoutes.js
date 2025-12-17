import express from "express";
import { Utilisateur, Contact } from "../models/Association.js"; // Sequelize model
import authenticateToken from "../middlewares/authenticateToken.js";

const router = express.Router();

// 📌 GET - Liste des contacts
router.get("/", authenticateToken, async (req, res) => {
  try {

    if (req.user.role === "admin") {
      // Admin → tous les contacts avec utilisateur
      const contacts = await Contact.findAll({
        include: [{ model: Utilisateur, as: "utilisateur", attributes: ["id", "username", "email"] }],
      });
      return res.json(contacts);

    } else {
      // utilisateur → uniquement ses contacts
      const contacts = await Contact.findAll({
        where: { utilisateurId: req.user.id },
      });
      
      return res.json(contacts);
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 POST - Créer un contact
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { nom, numero, statut } = req.body;

    const contact = await Contact.create({
      nom,
      numero,
      statut,
      utilisateurId: req.user.id, // le contact appartient au user connecté
    });

    res.status(201).json({ message: "Contact ajouté ✅", contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 PUT - Modifier un contact
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, numero } = req.body;

    const contact = await Contact.findByPk(id);
    if (!contact) return res.status(404).json({ message: "Contact introuvable" });

    // Vérification : seul admin ou propriétaire peut modifier
    if (req.user.role !== "admin" && contact.utilisateurId !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé ❌" });
    }

    contact.nom = nom || contact.nom;
    contact.numero = numero || contact.numero;
    // contact.statut = statut !== undefined ? statut : contact.statut;

    await contact.save();
    res.json({ message: "Contact modifié ✅", contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 DELETE - Supprimer un contact
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByPk(id);
    if (!contact) return res.status(404).json({ message: "Contact introuvable" });

    // Vérification
    if (req.user.role !== "admin" && contact.utilisateurId !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé ❌" });
    }

    await contact.destroy();
    res.json({ message: "Contact supprimé ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 PATCH /api/contacts/toggle/:id
router.patch("/toggle/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await Contact.findByPk(id);
    if (!contact) return res.status(404).json({ message: "Contact introuvable" });

    contact.statut = !contact.statut; // bascule actif / bloqué
    await contact.save();
    await contact.reload();
    res.json(contact);
  } catch (err) {
    console.error("Erreur toggle statut :", err);
    res.status(500).json({ message: "Erreur toggle statut", error: err });
  }
});

// Suppression multiple /api/contacts/multiple
// backend/routes/contactRoutes.js
router.post("/multiple-delete", async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Aucun contact sélectionné" });
  }

  try {
    await Contact.destroy({ where: { id: ids } });
    res.json({ message: "Contacts supprimés" });
  } catch (err) {
    res.status(500).json({ message: "Impossible de supprimer les contacts" });
  }
});



export default router;
