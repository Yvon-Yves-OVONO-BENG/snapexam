// src/controllers/contactController.js
import Message from "../models/Message.js";

export const envoyerMessage = async (req, res) => {
  try {
    const { nom, email, message } = req.body;

    // Vérification des champs
    if (!nom || !email || !message) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Création du message en base
    const nouveauMessage = await Message.create({ nom, email, message });

    res.status(201).json({
      message: "Votre message a été envoyé avec succès !",
      data: nouveauMessage,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    res.status(500).json({ message: "Erreur serveur. Veuillez réessayer plus tard." });
  }
};

// ➤ Récupérer tous les messages
export const recupererMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Liste des messages récupérée avec succès.",
      data: messages,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    res.status(500).json({ message: "Erreur serveur. Impossible de récupérer les messages." });
  }
};