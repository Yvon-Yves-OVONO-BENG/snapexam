export function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé : réservé aux administrateurs" });
  }
  next();
}
