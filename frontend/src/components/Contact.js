// src/pages/Contact.js
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import titreDeLaPage from "./TitreDeLaPage";
import axios from "axios";

export default function Contact() {
  titreDeLaPage("Contact - SnapExam");

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState(null); // success / error

  // Gestion des champs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages`, formData);
      setStatus({ type: "success", message: response.data.message });
      setFormData({ nom: "", email: "", message: "" }); // reset form
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Erreur lors de l'envoi du message.";
      setStatus({ type: "error", message: msg });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-yellow-300">
          Contactez-nous
        </h1>
        <p className="text-lg md:text-xl max-w-2xl text-center mb-12">
          Une question, une suggestion ou un besoin d’assistance ? 
          Remplissez le formulaire ci-dessous ou utilisez nos coordonnées pour nous joindre.
        </p>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Formulaire */}
          <div className="bg-white text-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-700">Envoyer un message</h2>

            {status && (
              <p
                className={`mb-4 p-3 rounded ${
                  status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {status.message}
              </p>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 font-medium">Nom complet</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Adresse e-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Votre email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Écrivez votre message..."
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-500 transition"
              >
                Envoyer
              </button>
            </form>
          </div>

          {/* Coordonnées */}
          <div className="bg-indigo-900/90 rounded-2xl shadow-lg p-8 flex flex-col justify-center space-y-6">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-300">
              Nos coordonnées
            </h2>
            <p className="flex items-center space-x-3">
              <Mail className="text-yellow-300" />
              <span>contact@snapexam.com</span>
            </p>
            <p className="flex items-center space-x-3">
              <Phone className="text-yellow-300" />
              <span>+237 697 99 33 86 / 673 78 83 08</span>
            </p>
            <p className="flex items-center space-x-3">
              <MapPin className="text-yellow-300" />
              <span>Yaoundé, Cameroun</span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
