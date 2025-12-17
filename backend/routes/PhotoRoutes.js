import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Photo, Dossier } from "../models/Association.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import Subscription from "../models/Subscription.js";
import archiver from "archiver";
import sharp from "sharp";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const nameWithoutExt = path.parse(file.originalname).name.replace(/\s+/g, "_"); 
    const ext = path.extname(file.originalname);
    const uniqueName = `${nameWithoutExt}_${Date.now()}${ext}`; // ex: "photo_candidat_1697612345678.jpg"
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// 📌 Upload multiple photos
router.post(
  "/dossier/:dossierId",
  authenticateToken,
  upload.array("photos", 10), // Multer permet max 10 fichiers
  async (req, res) => {
    const { dossierId } = req.params;

    try {
      const dossier = await Dossier.findByPk(dossierId, {
        include: ["photos", "proprietaire"]
      });
      if (!dossier) return res.status(404).json({ message: "Dossier introuvable" });

      // Vérifie abonnement
      const sub = await Subscription.findOne({
        where: { utilisateurId: req.user.id, status: "paye" },
      });
      const hasSubscription = !!sub;

      const currentPhotoCount = dossier.photos.length;
      const newPhotoCount = req.files.length;

      // Si utilisateur gratuit et dépassement
      if (!hasSubscription && currentPhotoCount + newPhotoCount > 10) {
        return res.status(403).json({
          message: "Limite atteinte : vous devez souscrire pour ajouter plus de 10 photos",
          limitePhotos: 10,
          numeroMomo: "+237 673 78 83 08",
          numeroOM: "+237 697 99 33 86",
        });
      }

      const photoRecords = await Promise.all(
        req.files.map(file =>
          Photo.create({
            nom_candidat: path.parse(file.originalname).name,
            photo_url: `uploads/${file.filename}`,
            dossierId: dossier.id,
          })
        )
      );

      res.status(201).json({
        message: "Photos ajoutées ✅",
        photos: photoRecords,
        nombrePhotos: currentPhotoCount + photoRecords.length
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur", error: err });
    }
  }
);

// GET photos d'un dossier
router.get("/dossier/:dossierId", authenticateToken, async (req, res) => {
  const { dossierId } = req.params;

  try {
    const dossier = await Dossier.findByPk(dossierId);
    if (!dossier) return res.status(404).json({ message: "Dossier introuvable" });

    const photos = await Photo.findAll({
      where: { dossierId },
      attributes: ["id", "nom_candidat", "photo_url"] // tu peux ajuster
    });
    
    res.json(photos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Supprimer une photo
router.delete("/:photoId", authenticateToken, async (req, res) => {
  const { photoId } = req.params;

  try {
    const photo = await Photo.findByPk(photoId);
    if (!photo) return res.status(404).json({ message: "Photo introuvable" });

    // Chemin du fichier sur le serveur
    const filePath = path.join(process.cwd(), photo.photo_url); // si photo_url = 'uploads/nom.jpg'

    // Supprimer le fichier physique
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer l'entrée dans la base de données
    await photo.destroy();

    res.json({ message: "Photo supprimée avec succès ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});


// 📦 Télécharger toutes les photos d’un dossier en ZIP
router.get("/dossier/:dossierId/telecharger-zip", authenticateToken, async (req, res) => {
  try {
    const { dossierId } = req.params;
    const dossier = await Dossier.findByPk(dossierId);
    if (!dossier) return res.status(404).json({ message: "Dossier introuvable" });

    const photos = await Photo.findAll({ where: { dossierId } });
    if (photos.length === 0) return res.status(404).json({ message: "Aucune photo trouvée" });

    res.setHeader("Content-Disposition", `attachment; filename=${dossier.nom}.zip`);
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    const dateDossier = new Date(dossier.createdAt).toLocaleDateString("fr-FR");

    for (const photo of photos) {
    //   const photoPath = path.join(__dirname, "..", "uploads", photo.photo_url); // assure-toi que le chemin est correct
      const photoPath = path.join(
        "uploads",
        path.basename(photo.photo_url)
        );

      if (!fs.existsSync(photoPath)) {
        console.warn(`Photo introuvable : ${photoPath}`);
        continue;
      }

      // Récupérer les dimensions de l'image
      const metadata = await sharp(photoPath).metadata();
      const width = metadata.width;
      const height = metadata.height;

    // Fonction utilitaire pour couper un texte long en lignes
function splitTextToLines(text, maxCharsPerLine) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

const nomCandidatLines = splitTextToLines(photo.nom_candidat, 25); // 25 caractères max par ligne
const dossierLines = splitTextToLines(dossier.nom, 25);

const svgOverlay = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Date en haut à gauche -->
   
    <text x="5" y="35" font-size="50" fill="black" font-weight="bold">${dateDossier}</text>

    <!-- Nom du candidat (multi-lignes) -->
    <g>
      ${nomCandidatLines
        .map(
          (line, i) =>
            `
             <text x="10" y="${height - 45 + i * 22}" font-size="50" fill="black" font-weight="bold">${line}</text>`
        )
        .join("\n")}
    </g>

    <!-- Nom du dossier (multi-lignes aussi) -->
    <g>
      ${dossierLines
        .map(
          (line, i) =>
            `
              <text x="10" y="${height - 5 + i * 22}" font-size="50" fill="black">${line}</text>`
        )
        .join("\n")}
    </g>
  </svg>
`;


// const svgOverlay = `
//   <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">

//     <!-- 📅 Date centrée en haut -->
//     <text 
//       x="50%" 
//       y="25" 
//       text-anchor="middle" 
//       font-size="16" 
//       fill="black" 
//       font-weight="bold"
//       font-family="Arial, sans-serif">
//       ${dateDossier}
//     </text>

//     <!-- 👤 Nom du candidat (ex : YMELE LADJOU NATACHA) -->
//     <text 
//       x="50%" 
//       y="${height - 40}" 
//       text-anchor="middle" 
//       font-size="10" 
//       fill="black" 
//       font-weight="bold"
//       font-family="Arial, sans-serif">
//       ${nomCandidatLines}
//     </text>

//     <!-- 📘 Classe + Matricule (ex : TLE C CR 4136) -->
//     <text 
//       x="50%" 
//       y="${height - 20}" 
//       text-anchor="middle" 
//       font-size="10" 
//       fill="black" 
//       font-family="Arial, sans-serif">
//       ${dossier}
//     </text>

//   </svg>
//   `;

      const annotatedImageBuffer = await sharp(photoPath)
        .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
        .jpeg()
        .toBuffer();

      archive.append(annotatedImageBuffer, { name: `${photo.nom_candidat}.jpg` });
    }

    // Finalize l’archive et attendre la fin avant de terminer la requête
    archive.finalize();

    // Gérer les erreurs d'archiver
    archive.on("error", (err) => {
      throw err;
    });

  } catch (err) {
    console.error("Erreur création ZIP :", err);
    res.status(500).json({ message: "Erreur lors de la création du ZIP", error: err.message });
  }
});

export default router;
