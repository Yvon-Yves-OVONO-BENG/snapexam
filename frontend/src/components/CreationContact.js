// src/pages/CreationContact.js
import { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";

export default function CreationContact() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // récupérer le JWT
    const contact = { nom, prenom, email, telephone };

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/contacts`, contact, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Contact créé avec succès !");
      console.log(res.data);
      // Optionnel : reset du formulaire
      setNom(""); setPrenom(""); setEmail(""); setTelephone("");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du contact");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-1 pt-16 px-4">
        <h1 className="text-3xl font-bold mb-6">Ajouter un contact</h1>
        <form className="bg-indigo-800/80 p-8 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-indigo-700/50 placeholder-white text-white"
            required
          />
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-indigo-700/50 placeholder-white text-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-indigo-700/50 placeholder-white text-white"
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-indigo-700/50 placeholder-white text-white"
          />
          <button className="w-full p-3 bg-yellow-400 text-indigo-900 font-semibold rounded-lg hover:bg-yellow-300 transition">
            Ajouter
          </button>
        </form>
      </div>
    </div>
  );
}
