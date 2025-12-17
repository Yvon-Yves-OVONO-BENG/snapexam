// routes/Utilisateur/usersRoutes.js
import express from "express";
import { Utilisateur } from "../../models/Association.js"; // Sequelize model
import authMiddleware from "../../middlewares/authMiddleware.js";
import bcrypt from "bcryptjs"; 

const router = express.Router();

// 🔹 GET /api/users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      
    });

    // const usersJSON = users.map(user => user.toJSON());
    res.json(users);
    // JSON.stringify(users, null, 2)
    
  } catch (err) {
    console.error("Erreur récupération utilisateurs :", err);
    res.status(500).json({ message: "Erreur récupération utilisateurs", error: err.message });
  }
});

// 🔹 PUT /api/users/:id
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { username, email, contact, role } = req.body;

  try {
    const user = await Utilisateur.findByPk(id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    await user.update({ username, email, contact, role });
    await user.reload(); // récupère les dataValues à jour
    res.json(user); // renvoie l'objet Sequelize mis à jour
  } catch (err) {
    console.error("Erreur modification utilisateur :", err);
    res.status(500).json({ message: "Erreur modification utilisateur", error: err });
  }
});

// 🔹 DELETE /api/users/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Utilisateur.findByPk(id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    await user.destroy();
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error("Erreur suppression utilisateur :", err);
    res.status(500).json({ message: "Erreur suppression utilisateur", error: err });
  }
});

// 🔹 PATCH /api/users/toggle/:id
router.patch("/toggle/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Utilisateur.findByPk(id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    user.statut = !user.statut; // bascule actif / bloqué
    await user.save();
    await user.reload();
    res.json(user);
  } catch (err) {
    console.error("Erreur toggle statut :", err);
    res.status(500).json({ message: "Erreur toggle statut", error: err });
  }
});

// Suppression multiple /api/users/multiple
router.post("/multiple", async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Aucun utilisateur sélectionné" });
  }

  try {
    await Contact.destroy({ where: { id: ids } });
    res.json({ message: "Contacts supprimés" });
  } catch (err) {
    res.status(500).json({ message: "Impossible de supprimer les utilisateurs" });
  }
});

// PUT /api/users/:id/motdepasse
router.put("/:id/motdepasse", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1️⃣ Vérification des champs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 8 caractères" });
    }

    // 2️⃣ Récupération utilisateur
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) {
      console.log("Utilisateur introuvable avec id:", req.params.id);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // 3️⃣ Vérification ancien mot de passe
    let hashedPassword = user.password;

    // Convertir Buffer en string si nécessaire
    if (Buffer.isBuffer(hashedPassword)) {
      hashedPassword = hashedPassword.toString("utf-8");
    }
    
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(oldPassword, hashedPassword);
    } catch (err) {
      console.error("Erreur bcrypt.compare:", err, "user.password:", hashedPassword);
      return res.status(500).json({
        message: "Erreur serveur lors de la vérification du mot de passe",
        error: err.message,
      });
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    // 4️⃣ Hash du nouveau mot de passe
    let newHashed;
    try {
      console.log("Mot de passe saisi :", newPassword);
      console.log("Hash en base :", user.password);

      newHashed = await bcrypt.hash(newPassword, 10);
      console.log("Nouveau hash :", newHashed); // 🔍 vérification
    } catch (err) {
      console.error("Erreur bcrypt.hash:", err);
      return res.status(500).json({ message: "Erreur serveur lors du hash du mot de passe", error: err.message });
    }

    user.password = newPassword; // Sequelize va hasher automatiquement
    await user.save();

    console.log(`Mot de passe mis à jour pour l'utilisateur id=${user.id}`);

    res.json({ message: "Mot de passe mis à jour avec succès" });

  } catch (err) {
    console.error("Erreur serveur /motdepasse:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

export default router;