import express from "express";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import Invoice from "../models/Invoice.js";
import Plan from "../models/Plan.js";
import Utilisateur from "../models/Utilisateur.js";
import authMiddlewareToken from "../middlewares/authenticateToken.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = express.Router();

// Middleware admin simple (à adapter selon ton auth)
const isAdmin = (req, res, next) => {
  // supposons req.user.role
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Accès refusé" });
};

// Créer manuellement un paiement + subscription + invoice
router.post("/create-payment", authenticateToken, async (req, res) => {
  try {
    const { utilisateurId, amount, method, planId, duration } = req.body;

    if (!utilisateurId || !amount || !method || !planId || !duration) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Créer la subscription
    const now = new Date();
    const expiresAt = new Date(now);

    expiresAt.setFullYear(now.getFullYear() + parseInt(duration));
     const expirationDateString = expiresAt.toISOString().split('T')[0];

    const subscription = await Subscription.create({
      utilisateurId,
      planId,
      startedAt: now,
      expiresAt: expirationDateString,
      status: "paye",
    });

    // Créer le paiement
    const payment = await Payment.create({
      utilisateurId,
      subscriptionId: subscription.id,
      amount,
      method,
      status: "paye",
      meta: { manuel: true }, // pour savoir que c'est un paiement admin
    });

    // Créer la facture (optionnel)
    const invoice = await Invoice.create({
      utilisateurId,
      subscriptionId: subscription.id,
      amount,
      path: `/invoices/facture_${utilisateurId}_${Date.now()}.pdf`, // ou un PDF généré plus tard
      meta: { method, adminEntry: true },
    });

    res.json({
      message: "Paiement, abonnement et facture créés avec succès",
      subscription,
      payment,
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * 🔹 Récupérer tous les paiements avec les infos utilisateur, abonnement, plan et payment(pour avour la méthode de payment)
 */
router.get("/", authMiddlewareToken, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Utilisateur,
          as: "utilisateur",
          attributes: ["id", "username", "email"],
        },
        {
          model: Subscription,
          as: "subscription",
          include: [
            {
              model: Plan,
              as: "plan",
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Erreur récupération paiements :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des paiements" });
  }
});

// Modifier un paiement
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, status } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) return res.status(404).json({ message: "Paiement non trouvé" });

    // Met à jour les champs autorisés
    payment.amount = amount ?? payment.amount;
    payment.status = status ?? payment.status;

    await payment.save();

    res.json(payment); // retourne le paiement mis à jour
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Suppression d'un paiement
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) return res.status(404).json({ message: "Paiement non trouvé" });

    await payment.destroy();

    res.json({ message: "Paiement supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
