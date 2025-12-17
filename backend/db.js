// db.js
import pkg from "pg";
const { Pool } = pkg;

// ⚠️ À adapter avec tes identifiants PostgreSQL
const pool = new Pool({
  user: "postgres",        // ton utilisateur PostgreSQL
  host: "localhost",       // ou l’IP/nom du serveur
  database: "annuaire",     // nom de ta base de données
  password: "postgresql",  // ton mot de passe PostgreSQL
  port: 5432,              // port par défaut de PostgreSQL
});

// Vérification de la connexion
pool.connect()
  .then(() => console.log("✅ Connexion à mysql réussie"))
  .catch(err => console.error("❌ Erreur de connexion à mysql", err));

export default pool;
