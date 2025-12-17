// backend/creationContact.js
import Contact from "./models/contact.js";

// Quelques prénoms et noms pour générer des contacts réalistes
const prenoms = ["Alice", "Bertrand", "Catherine", "David", "Emmanuel", "Fatou", "Georges", "Hélène", "Ismael", "Julie"];
const noms = ["Ngono", "Mebenga", "Owona", "Etoa", "Mvondo", "Tchoua", "Abega", "Njoya", "Kamdem", "Nkengue"];

// Génère un numéro de téléphone
const generatePhone = () => {
  const prefix = "6" + Math.floor(50 + Math.random() * 49); // 650-699
  const random = Math.floor(100000 + Math.random() * 899999);
  return prefix + random;
};

// Génère un nom complet réaliste
const generateName = (userId, i) => {
  const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
  const nom = noms[Math.floor(Math.random() * noms.length)];
  return `${prenom} ${nom} ${userId}_${i}`;
};

const CreationContact = async () => {
  try {
    const contactsData = [];

    for (let userId = 620; userId <= 819; userId++) {
      for (let i = 1; i <= 100; i++) {
        contactsData.push({
          nom: generateName(userId, i),
          numero: generatePhone(),
          statut: Math.random() < 0.8, // 80% actif
          utilisateurId: userId,
        });
      }
    }

    console.log(`📦 Génération de ${contactsData.length} contacts...`);

    // Insertion par batchs pour éviter surcharge mémoire
    const batchSize = 1000;
    for (let i = 0; i < contactsData.length; i += batchSize) {
      const batch = contactsData.slice(i, i + batchSize);
      await Contact.bulkCreate(batch, { validate: true });
      console.log(`✅ Batch ${i / batchSize + 1} inséré (${batch.length} contacts)`);
    }

    console.log("🎉 Tous les contacts insérés avec succès !");
    process.exit();
  } catch (error) {
    console.error("❌ Erreur lors de l’insertion :", error);
    process.exit(1);
  }
};

CreationContact();
