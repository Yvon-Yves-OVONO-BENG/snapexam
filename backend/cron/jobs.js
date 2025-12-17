// backend/cron/jobs.js
import cron from "node-cron";
import Subscription from "../models/Subscription.js";
import Utilisateur from "../models/Utilisateur.js";
import { Op } from "sequelize";

export function startCronJobs() {
  // Check daily at 00:30
  cron.schedule("30 0 * * *", async () => {
    console.log("[cron] Vérification abonnements");
    const now = new Date();
    const soon = new Date(now.getTime() + 10 * 24 * 3600 * 1000); // J+10

    try {
      // find subscriptions expiring within 10 days and still paye
      const subsSoon = await Subscription.findAll({
        where: {
          expiresAt: { [Op.lte]: soon, [Op.gt]: now },
          status: "paye"
        },
        include: [{ model: Utilisateur, as: "utilisateur" }]
      });

      for (const s of subsSoon) {
        // Ici tu peux envoyer mail réel — pour l'instant on logue
        console.log(`Notification J-10 -> user ${s.utilisateurId} (${s.utilisateur?.email}) subscription expires ${s.expiresAt}`);
        // TODO: push notification, mail, SMS
      }

      // Expires
      const expired = await Subscription.findAll({
        where: { expiresAt: { [Op.lte]: now }, status: "paye" },
      });
      for (const s of expired) {
        s.status = "expired";
        await s.save();
        console.log(`Subscription expired for user ${s.utilisateurId}`);
      }

    } catch (err) {
      console.error("Cron error:", err);
    }
  });
}
