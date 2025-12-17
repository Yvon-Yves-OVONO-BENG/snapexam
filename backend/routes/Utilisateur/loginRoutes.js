// routes/Utilisateur/authRoutes.js
import express from "express";
import User from "../../models/Utilisateur.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    if (!email || !password || !recaptchaToken)
      return res.status(400).json({ message: "Email, mot de passe et reCAPTCHA requis" });

    // Vérification reCAPTCHA
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${recaptchaToken}`
    );

    if (!response.data.success) return res.status(400).json({ message: "reCAPTCHA invalide" });

    // Vérification utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    // Vérification mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    // Génération JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Connexion réussie", token, user });

  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
