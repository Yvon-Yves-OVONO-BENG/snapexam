import { useState } from "react";
import axios from "axios";

export default function CreerDossier() {
  const [examen, setExamen] = useState("");
  const [serie, setSerie] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nom_dossier = `${examen} ${serie} ${code}`;
    try {
      await axios.post("/api/dossiers", { examen, serie, code, nom_dossier });
      setMessage("✅ Dossier créé avec succès !");
      setExamen("");
      setSerie("");
      setCode("");
    } catch (error) {
      setMessage("❌ Erreur lors de la création du dossier.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-16 bg-white p-8 rounded-2xl shadow-lg text-gray-800">
      <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">
        Créer un nouveau dossier
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Examen (ex: BAC)"
          value={examen}
          onChange={(e) => setExamen(e.target.value)}
          className="w-full border rounded-lg p-3"
          required
        />
        <input
          type="text"
          placeholder="Série (ex: ESG D)"
          value={serie}
          onChange={(e) => setSerie(e.target.value)}
          className="w-full border rounded-lg p-3"
          required
        />
        <input
          type="text"
          placeholder="Code (ex: CR-1935)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border rounded-lg p-3"
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Créer le dossier
        </button>
      </form>
      {message && <p className="text-center mt-4 text-indigo-700">{message}</p>}
    </div>
  );
}
