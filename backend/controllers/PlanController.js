// backend/controllers/planController.js
import Plan from "../models/Plan.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// 🔹 Créer un plan
export const createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔹 Lister tous les plans
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({ order: [["createdAt", "DESC"]] });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Récupérer un plan par ID
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan non trouvé" });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Modifier un plan
export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan non trouvé" });

    await plan.update(req.body);
    res.json({ message: "Plan mis à jour avec succès", plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Supprimer un plan
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan non trouvé" });

    await plan.destroy();
    res.json({ message: "Plan supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single plan
export const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan introuvable" });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


/*
  Endpoint pour "s'abonner" (simulation) :
  - On génère une facture PDF côté serveur et on renvoie l'URL.
  - Auth requis (req.user fourni par authenticateToken)
*/
export const subscribeToPlan = async (req, res) => {
  try {
    const user = req.user; // fourni par authent middleware
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan introuvable" });

    // Générer une facture PDF simple
    const invoicesDir = path.join(process.cwd(), "invoices");
    if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

    const filename = `invoice_${user.id}_${plan.id}_${Date.now()}.pdf`;
    const filepath = path.join(invoicesDir, filename);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Entête facture
    doc.fontSize(20).text("Facture d'abonnement", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Client: ${user.username || user.email}`);
    doc.text(`Email: ${user.email || ""}`);
    doc.text(`Plan: ${plan.name}`);
    doc.text(`Prix: ${plan.price}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Détails
    doc.text("Détails:", { underline: true });
    doc.moveDown(0.5);
    const features = plan.features ? (Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || "[]")) : [];
    doc.text(plan.description || "");
    doc.moveDown();
    features.forEach((f, i) => doc.text(`${i + 1}. ${f}`));
    doc.moveDown();

    doc.text("Merci pour votre achat !", { align: "center" });
    doc.end();

    stream.on("finish", () => {
      // ici tu peux enregistrer l'abonnement en BD si besoin
      res.json({
        message: "Abonnement simulé - facture générée",
        invoiceUrl: `/invoices/${filename}`, // expose le dossier via static dans server.js
      });
    });

    stream.on("error", (err) => {
      console.error("PDF write error:", err);
      res.status(500).json({ message: "Erreur génération facture" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Admin stats (ex: nombre de plans & revenu simulé)
export const adminStats = async (req, res) => {
  try {
    const count = await Plan.count();
    // tu peux étendre ici avec des données d'abonnements
    res.json({ plansCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
