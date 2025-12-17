// src/pages/ForgotPassword.js
import { useState } from "react";
import Swal from "sweetalert2";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      Swal.fire("Erreur", "Veuillez saisir votre email", "error");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire("Succès", data.message, "success");
      } else {
        Swal.fire("Erreur", data.message, "error");
      }
    } catch (err) {
      Swal.fire("Erreur", "Une erreur est survenue", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
      <Navbar />

      <div className="flex flex-col items-center justify-center flex-1 px-4 pt-20">
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
            >
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Mot de passe oublié
            </h2>
            <input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded mb-4 text-gray-800 placeholder-gray-400"
            />
            <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-500 transition"
            >
                Envoyer le lien
            </button>
            <p className="mt-4 text-sm text-gray-600 text-center">
                Retour à la{" "}
                <Link to="/login" className="text-indigo-600 hover:underline">
                page de connexion
                </Link>
            </p>
            </form>

      </div>
    </div>
  );
}
