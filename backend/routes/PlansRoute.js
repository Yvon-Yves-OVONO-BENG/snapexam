// backend/routes/plansRoutes.js
import express from "express";
import {
  getAllPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  subscribeToPlan,
  adminStats,
} from "../controllers/PlanController.js";

import authenticateToken from "../middlewares/authenticateToken.js"; // ton middleware existant

const router = express.Router();

// CRUD public (GET list + GET one open)
router.get("/", getAllPlans);
router.get("/:id", getPlan);

// Routes protégées (admin)
router.post("/", authenticateToken, createPlan);       // -> à sécuriser (role admin) côté controller ou middleware
router.put("/:id", authenticateToken, updatePlan);    // idem
router.delete("/:id", authenticateToken, deletePlan);

// Simuler abonnement (utilisateur connecté)
router.post("/:id/subscribe", authenticateToken, subscribeToPlan);

// Admin stats
router.get("/admin/stats", authenticateToken, adminStats);

export default router;
