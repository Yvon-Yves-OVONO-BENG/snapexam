// src/components/Footer.js
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-gray-300 py-12 mt-16">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {/* Bloc 1 */}
        <div>
          <h2 className="text-3xl font-extrabold text-yellow-400 mb-4">SnapExam</h2>
          <p className="text-sm leading-relaxed text-gray-300">
            Gagnez du temps dans la gestion des photos de vos candidats avec une solution moderne, rapide et fiable, conçue pour les établissements et organisateurs d’examens.
          </p>
        </div>

        {/* Bloc 2 */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-yellow-400 transition">Accueil</Link></li>
            <li><Link to="/plans" className="hover:text-yellow-400 transition">Plans tarifaires</Link></li>
            <li><Link to="/apropos" className="hover:text-yellow-400 transition">À propos</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-400 transition">Contact</Link></li>
          </ul>
        </div>

        {/* Bloc 3 */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Suivez-nous</h3>
          <div className="flex space-x-4">
            <Link to="#" className="hover:text-yellow-400"><Facebook /></Link>
            <Link to="#" className="hover:text-yellow-400"><Twitter /></Link>
            <Link to="#" className="hover:text-yellow-400"><Linkedin /></Link>
            <Link to="mailto:contact@snapexam.com" className="hover:text-yellow-400"><Mail /></Link>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm mt-10 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} SnapExam. Tous droits réservés.
      </div>
    </footer>
  );
}
