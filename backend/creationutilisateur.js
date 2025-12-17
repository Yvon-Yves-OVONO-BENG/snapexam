import User from "./models/Utilisateur.js";

// Listes de prénoms et noms
const firstNames = [
  'Alice','Antoine','Aurélie','Bruno','Camille','Claire','David','Elodie','Emmanuel','Fatou',
  'Franck','Gabrielle','Hugo','Isabelle','Jules','Karim','Laura','Marc','Nadia','Olivier'
];

const lastNames = [
  'Dupont','Moreau','Petit','Leroy','Rousseau','Germain','Ngoma','Koumba','Mendes','Bonnet'
];

(async () => {
  try {
    for (let i = 1; i <= 200; i++) {
      const first = firstNames[(i - 1) % firstNames.length];
      const last = lastNames[(i - 1) % lastNames.length];

      // Username parlant
      const username = `${first.toUpperCase()} ${last.toLowerCase()}${i}`;
      const email = `${first.toLowerCase()}${i}${last.toLowerCase()}@test.com`;

      // Mot de passe en clair : le hook beforeCreate le hashera automatiquement
      const password = "123456";

      // Contact unique
      const contact = `690${String(1000 + i).slice(-5)}`;

      await User.create({ username, email, password, contact});
      console.log(`Utilisateur créé : ${username}`);
    }

    console.log("Insertion terminée !");
  } catch (err) {
    console.error("Erreur lors de la création des utilisateurs :", err);
  }
})();
