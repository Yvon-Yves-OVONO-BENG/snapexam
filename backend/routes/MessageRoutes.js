// src/routes/contactRoutes.js
import express from "express";
import { envoyerMessage, recupererMessages } from "../controllers/MessageController.js";

const router = express.Router();

// POST /api/contact
// ➤ envoie le message
router.post("/", envoyerMessage);

// ➤ Récupérer tous les messages
router.get("/", recupererMessages);

export default router;
