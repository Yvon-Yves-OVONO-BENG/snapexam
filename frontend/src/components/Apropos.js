// src/pages/Apropos.js
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Users, Eye, Target, Heart } from "lucide-react";
import titreDeLaPage from "./TitreDeLaPage";

export default function Apropos() {
  titreDeLaPage("Apropos - SnapExam");
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Padding-top pour espacer du Navbar */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        {/* Titre principal */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          À propos de SnapExam
        </h1>

        {/* Sections */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* À propos */}
          <div className="bg-white shadow-md rounded-2xl p-8 hover:shadow-xl transition">
            <div className="flex items-center mb-4">
              <Users className="text-blue-500 w-8 h-8 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-700">À propos</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              SnapExam est une application conçue pour gérer efficacement les photos 
              des candidats et les informations associées aux examens. Elle centralise 
              les données des candidats et facilite le suivi et la validation des dossiers.
            </p>
          </div>

          {/* Notre vision */}
          <div className="bg-white shadow-md rounded-2xl p-8 hover:shadow-xl transition">
            <div className="flex items-center mb-4">
              <Eye className="text-purple-500 w-8 h-8 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-700">
                Notre vision
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Devenir la référence pour la gestion numérique des candidatures et des 
              photos des candidats, offrant une plateforme moderne, intuitive et 
              sécurisée adaptée aux établissements d’enseignement et aux organismes 
              d’examen.
            </p>
          </div>

          {/* Notre mission */}
          <div className="bg-white shadow-md rounded-2xl p-8 hover:shadow-xl transition">
            <div className="flex items-center mb-4">
              <Target className="text-green-500 w-8 h-8 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-700">
                Notre mission
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Fournir une solution simple et sécurisée pour l’enregistrement, le 
              traitement et la gestion des photos des candidats, facilitant l’identification 
              et la vérification lors des examens tout en garantissant la confidentialité des données.
            </p>
          </div>

          {/* Nos valeurs */}
          <div className="bg-white shadow-md rounded-2xl p-8 hover:shadow-xl transition">
            <div className="flex items-center mb-4">
              <Heart className="text-red-500 w-8 h-8 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-700">
                Nos valeurs
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              🔹 Innovation : intégrer des fonctionnalités avancées pour la gestion des photos. <br />
              🔹 Fiabilité : garantir la sécurité et l’intégrité des dossiers et photos. <br />
              🔹 Simplicité : faciliter la navigation et l’utilisation pour tous les utilisateurs. <br />
              🔹 Collaboration : permettre un suivi coordonné entre les différents services.
            </p>
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
}
