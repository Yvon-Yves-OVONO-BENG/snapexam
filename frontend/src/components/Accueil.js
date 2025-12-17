// src/pages/Accueil.js
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Image, CheckCircle, Cloud, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import titreDeLaPage from "../components/TitreDeLaPage";

export default function Accueil() {
  titreDeLaPage("Accueil - SnapExam");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-600 text-white">
      <Navbar />

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6 pt-24 md:pt-32 pb-16">
        <Image size={90} className="text-yellow-300 mb-6 animate-bounce" />
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          Bienvenue sur <span className="text-yellow-400">SnapExam</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-2xl mb-8">
          Organisez, visualisez et gérez facilement les informations de vos photos
          dans un seul dossier centralisé.
        </p>
        
        <Link
          to="/login"
          className="px-8 py-4 bg-yellow-400 text-indigo-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 transition-transform hover:scale-105"
        >
          Commencer maintenant
        </Link>

        <button
          onClick={() => {
            Swal.fire({
              title: "Paiement Mobile",
              html: `
                <p style="font-size:16px; margin-bottom:10px;">
                  Veuillez contacter les numéros ci-dessous ou effectuer un paiement par :
                </p>
                <div style="display:flex; justify-content:center; gap:40px; align-items:center; margin-bottom:15px;">
                  <div style="text-align:center;">
                    <img src="${process.env.REACT_APP_API_URL}/avatars/momo.jpeg" alt="MTN MoMo" width="80" height="80" style="border-radius:10px;"/>
                  </div>
                  <div style="text-align:center;">
                    <img src="${process.env.REACT_APP_API_URL}/avatars/om.png" alt="Orange Money" width="80" height="80" style="border-radius:10px;"/>
                  </div>
                </div>
                <p style="font-size:15px; font-weight:500;">
                  📞 673 78 83 08  /  📞 697 99 33 86
                </p>
                <p style="font-size:14px; color:#555; margin-top:8px;">
                  Merci d’indiquer votre nom d’utilisateur lors du paiement.
                </p>
              `,
              icon: "info",
              confirmButtonText: "J’ai compris",
              confirmButtonColor: "#2563eb",
              width: 600,
              background: "#fff",
            });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition mt-4"
        >
          💰 Payer par Mobile
        </button>
      </main>

      {/* Features Section */}
      <section className="py-16 bg-white text-gray-800 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-indigo-700">
          Pourquoi choisir SnapExam ?
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
          <div className="bg-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
            <Cloud size={48} className="text-indigo-600 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Stockage intelligent</h3>
            <p className="text-gray-600">
              Classez automatiquement vos photos et leurs informations pour un accès rapide et organisé.
            </p>
          </div>

          <div className="bg-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
            <Shield size={48} className="text-indigo-600 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Sécurité garantie</h3>
            <p className="text-gray-600">
              Vos images et données sont protégées et sauvegardées dans un environnement sécurisé.
            </p>
          </div>

          <div className="bg-indigo-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
            <CheckCircle size={48} className="text-indigo-600 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Interface intuitive</h3>
            <p className="text-gray-600">
              Naviguez facilement dans vos dossiers et visualisez les informations de chaque photo sans effort.
            </p>
          </div>
        </div>
      </section>

      {/* Ils nous font confiance */}
      <section className="py-16 bg-gray-100 text-gray-800 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-indigo-700">
          Ils nous font confiance
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-10">
          <img src="/avatars/logo1.png" alt="Logo 1" className="h-16 object-contain" />
          <img src="/avatars/logo2.png" alt="Logo 2" className="h-16 object-contain" />
          <img src="/avatars/logo3.png" alt="Logo 3" className="h-16 object-contain" />
          <img src="/avatars/logo4.png" alt="Logo 4" className="h-16 object-contain" />
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 bg-white text-gray-800 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-indigo-700">
          Témoignages
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          <div className="bg-indigo-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
            <p className="text-gray-600 mb-4">
              "SnapExam m'a permis de gérer facilement toutes les photos de mes candidats sans aucun stress."
            </p>
            <p className="font-semibold text-indigo-700">– Alice M.</p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
            <p className="text-gray-600 mb-4">
              "Une interface intuitive et rapide, parfaite pour organiser les examens."
            </p>
            <p className="font-semibold text-indigo-700">– Jean P.</p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
            <p className="text-gray-600 mb-4">
              "Je recommande SnapExam à tous les enseignants pour simplifier le suivi des candidats."
            </p>
            <p className="font-semibold text-indigo-700">– Fatou S.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Prêt à organiser vos photos intelligemment ?
        </h2>
        <Link
          to="/signup"
          className="inline-block px-10 py-4 bg-yellow-400 text-indigo-900 rounded-full font-semibold shadow-md hover:bg-yellow-300 hover:scale-105 transition"
        >
          Créer un compte gratuit
        </Link>
      </section>

      <Footer />
    </div>
  );
}
