// backend/routes/subscriptionRoutes.js
import express from "express";
import authenticateToken from "../middlewares/authenticateToken.js";
import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Utilisateur from "../models/Utilisateur.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const router = express.Router();

/**
 * ROUTE : POST /api/plans/checkout
 * Description : Simule un paiement, crée l’abonnement, le paiement et la facture PDF.
 */
router.post("/checkout", authenticateToken, async (req, res) => {
  try {
    const { planId, paymentMethod, durationMonths } = req.body;

    if (!planId) return res.status(400).json({ message: "ID du plan manquant" });

    // Vérifier que le plan existe
    const plan = await Plan.findByPk(planId);
    if (!plan) return res.status(404).json({ message: "Plan introuvable" });

    // Récupérer l’utilisateur connecté
    const userId = req.user.id;
    const now = new Date();

    // Durée d’engagement en session (par défaut 1)
    const months = parseInt(durationMonths) || 1;

    // Calcul de la date d’expiration
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + months);

    // Vérification de validité
    if (isNaN(expiresAt.getTime())) {
      return res.status(400).json({ message: "Durée d’engagement invalide" });
    }

    // Calcul du montant total à payer
    const totalAmount = plan.price * months;

    // ⿡ Créer l’abonnement
    const subscription = await Subscription.create({
      utilisateurId: userId,
      planId: plan.id,
      startedAt: now,
      expiresAt,
      status: "paye",
    });

    // ⿢ Créer le paiement (simulé)
    const payment = await Payment.create({
      utilisateurId: userId,
      subscriptionId: subscription.id,
      amount: totalAmount,
      method: paymentMethod || "card",
      status: "paye",
      date: now,
    });

    // ⿣ Générer la facture PDF
    const invoiceDir = "invoices";
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

    const filename = `invoice_${userId}_${Date.now()}.pdf`;
    const filepath = path.join(invoiceDir, filename);

    const user = await Utilisateur.findByPk(userId);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filepath));

    doc.fontSize(22).text("FACTURE D’ABONNEMENT - SnapExam", { align: "center" });
    doc.moveDown();

    // doc.fontSize(14).text(`Nom : ${user?.nom} ${user?.prenom || ""}`);
    doc.fontSize(14).text(`Nom : ${user?.username}`);
    doc.text(`Email : ${user?.email}`);
    doc.text(`Date : ${now.toLocaleString()}`);
    doc.text(`Plan choisi : ${plan.name} - Voût : ${plan.price} / session`);
    doc.text(`Durée d’engagement : ${months} session`);
    doc.text(`Montant total payé : ${totalAmount} FCFA`);
    doc.text(`Méthode de paiement : ${paymentMethod || "Carte bancaire"}`);
    doc.moveDown(2);
    doc.text("Merci pour votre confiance.", { align: "center" });

    doc.end();

    // ⿤ Enregistrer la facture dans la base
    const invoice = await Invoice.create({
      utilisateurId: userId,
      subscriptionId: subscription.id,
      path: filepath,
      amount: totalAmount,
      date: now,
    });

    // ⿥ Réponse complète
    res.status(200).json({
      message: "Paiement simulé et abonnement créé avec succès",
      subscription,
      payment,
      invoice,
    });
  } catch (err) {
    console.error("Erreur checkout :", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

/**
 * ROUTE : GET /api/subscription/my-subscription
 * Description : Récupère l’abonnement actif de l’utilisateur connecté
 */
router.get("/my-subscription", authenticateToken, async (req, res) => {
  try {
    const utilisateurId = req.user.id;

    const subscriptions = await Subscription.findAll({
      where: { utilisateurId },
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: ["id", "name", "price"],
        },
        {
          model: Invoice,
          as: "Invoices",
          attributes: ["id", "amount", "path", "createdAt"],
        },
        {
          model: Payment,
          as: "payments",
          attributes: ["id", "method", "status", "amount", "createdAt"]
        },
        {
          model: Utilisateur,  // ✅ Ajout du modèle Utilisateur
          as: "utilisateur",   // ⚠️ Doit correspondre à ton alias défini dans associations
          attributes: ["id", "username", "email"], // Tu peux ajouter d’autres champs si besoin
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = subscriptions.map(sub => {
    const start = new Date(sub.createdAt);
    const end = new Date(sub.expiresAt);
    const duration = end.getFullYear() - start.getFullYear();
    const totalPrice = sub.plan ? sub.plan.price * (duration || 1) : 0;

    return {
      id: sub.id,
      plan: sub.plan,
      createdAt: sub.createdAt,
      expiresAt: sub.expiresAt,
      status: sub.status,
      duration,
      totalPrice,
      invoices: sub.Invoices,
      utilisateur: sub.utilisateur,
      // 🔹 Méthode du dernier paiement
      paymentMethod: sub.payments.length > 0 ? sub.payments[sub.payments.length - 1].method : "N/A",
      payments: sub.payments.map(p => ({
        id: p.id,
        method: p.method,
        status: p.status,
        price: p.price,
        date: p.createdAt,
      })),
    };
  });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Erreur récupération abonnements :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});


/**
 * ROUTE : GET /api/subscription/invoices
 * Description : Récupère toutes les factures de l’utilisateur connecté
 */
router.get("/invoices", authenticateToken, async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { utilisateurId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json(invoices);
  } catch (err) {
    console.error("Erreur invoices :", err);
    res.status(500).json({ message: "Erreur lors de la récupération des factures" });
  }
});

/**
 * ROUTE : GET /api/plans/invoice/:id
 * Permet à l’utilisateur de télécharger sa facture
 */
router.get("/invoices/:id", authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });

    // Sécurité : seul le propriétaire ou un admin peut y accéder
    if (invoice.utilisateurId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    res.sendFile(path.resolve(invoice.path));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération de la facture" });
  }
});

///vérifie si un utilisateur a déjà souscris
router.get("/check", authenticateToken, async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      where: { utilisateurId: req.user.id, status: "paye" },
    });

    res.json({ paye: !!sub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur vérification abonnement" });
  }
});

export default router;
