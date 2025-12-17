import axios from "axios";

export const verifyCaptcha = async (req, res, next) => {
  const token = req.body.captchaToken; // envoyé depuis le frontend
  if (!token) return res.status(400).json({ message: "Captcha requis" });

  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
    );

    if (!response.data.success) {
      return res.status(400).json({ message: "Captcha invalide" });
    }

    next();
  } catch (err) {
    console.error("Erreur vérification captcha :", err);
    res.status(500).json({ message: "Erreur serveur captcha" });
  }
};
