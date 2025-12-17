// routes/authRoutes.js
import axios from "axios";  // 🔹 ajouter cette ligne
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/Utilisateur.js"; // ton modèle User
import path from "path";
import authMiddleware from "../../middlewares/authMiddleware.js";
import authenticateToken from "../../middlewares/authenticateToken.js";
import upload from "../../middlewares/upload.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// --- SIGNUP avec reCAPTCHA ---
router.post("/signup", async (req, res) => {
  const { username, email, password, contact, recaptchaToken } = req.body;

  // Vérification des champs obligatoires
  if (!username || !email || !password || !contact || !recaptchaToken) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  try {
    // 1️⃣ Vérification du token reCAPTCHA
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${recaptchaToken}`;

    const recaptchaRes = await axios.post(verifyURL);
    if (!recaptchaRes.data.success) {
      return res.status(400).json({ error: "reCAPTCHA invalide, veuillez réessayer" });
    }

    // 2️⃣ Vérifie si email ou username existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email déjà utilisé" });

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) return res.status(400).json({ error: "Nom d'utilisateur déjà utilisé" });

    // 3️⃣ Création de l'utilisateur
    const newUser = await User.create({
      username,
      email,
      password,  // sera hashé par le hook beforeCreate dans le modèle
      contact,
      role: "user",
      statut: true,
      avatar: "default-avatar.png",
    });

    // 4️⃣ Génération du token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 5️⃣ Réponse avec token et info utilisateur
    res.status(201).json({
      message: "Compte créé avec succès 🎉",
      user: newUser,
      token,
    });

  } catch (err) {
    console.error("Erreur signup :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// --- LOGIN ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email et mot de passe requis" });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // 🔑 utilise la clé du .env
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Connexion réussie", user, token });
  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email requis" });

  try {
    const user = await Utilisateur.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email non trouvé" });

    // Générer token
    const token = crypto.randomBytes(32).toString("hex");
    const expiration = Date.now() + 3600000; // 1h

    // Stocker token et expiration dans la table utilisateur
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiration;
    await user.save();

    // Configurer le mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tonemail@gmail.com",
        pass: "tonmotdepasseappli", // App Password Gmail
      },
    });

    const resetURL = `http://localhost:3000/reset-password/${token}`;

    const mailOptions = {
      from: "tonemail@gmail.com",
      to: email,
      subject: "Réinitialisation du mot de passe",
      html: `<p>Vous avez demandé une réinitialisation du mot de passe.</p>
             <p>Cliquez sur le lien pour créer un nouveau mot de passe :</p>
             <a href="${resetURL}">Réinitialiser mon mot de passe</a>
             <p>Ce lien expire dans 1 heure.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Lien de réinitialisation envoyé à votre email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// routes/auth.js
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await Utilisateur.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) return res.status(400).json({ message: "Token invalide ou expiré" });

    // Mettre à jour mot de passe
    user.password = password; // Attention : hasher avec bcrypt si tu ne l'as pas déjà
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Get profil
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Mise à jour du profil
router.put("/profile", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    const utilisateurId = req.user.id;
    const { username, email, contact } = req.body;

    // Vérifier l'utilisateur
    const user = await User.findByPk(utilisateurId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Si avatar uploadé
    if (req.file) {
      // Supprimer l’ancien avatar si ce n’est pas celui par défaut
      if (user.avatar && user.avatar !== "default-avatar.png") {
        const oldPath = path.join("avatars", user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      user.avatar = req.file.filename; // Nouveau fichier
    }

    // Mise à jour des autres champs
    user.username = username || user.username;
    user.email = email || user.email;
    user.contact = contact || user.contact;

    await user.save();

    res.json({
      message: "Profil mis à jour avec succès ✅",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur ❌" });
  }
});

// 🔹 vérifie qui est connecté
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // Optionnel : récupérer les infos complètes depuis la base
    const user = await User.findByPk(req.user.id);
    res.json(req.user); // renvoie l’objet décodé du token
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
