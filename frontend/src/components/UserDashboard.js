import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import titreDeLaPage from "./TitreDeLaPage";
import { FaFilePdf, FaDownload, FaCalendarAlt, FaMoneyBillWave, FaClock } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import snapExamLogo from "../assets/favicon.jpg";// ✅ mets le bon chemin vers ton image


export default function UserDashboard() {

  titreDeLaPage("Tableau de bord - SnapExam");

  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${process.env.REACT_APP_API_URL}/api/subscription/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubs(res.data))
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, []);

const handlePrintInvoice = async (sub) => {
  const doc = new jsPDF();
  console.log(sub.paymentMethod);

  // 🔹 Logo SnapExam
  const logoWidth = 40;
  const logoHeight = 40;
  doc.addImage(snapExamLogo, "JPEG", 85, 10, logoWidth, logoHeight);

  // 🔹 Titre principal
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE DE PAIEMENT", 70, 60);

  // 🔹 Sous-titre
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Plateforme de gestion des photos des candidats", 58, 68);
  doc.line(20, 72, 190, 72);

  // 🔹 Informations du client
  const utilisateurNom = sub.utilisateur?.username || "Utilisateur SnapExam";
  const utilisateurEmail = sub.utilisateur?.email || "Non spécifié";

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Informations du client :", 20, 85);

  doc.setFont("helvetica", "normal");
  doc.text(`Nom : ${utilisateurNom}`, 20, 93);
  doc.text(`Email : ${utilisateurEmail}`, 20, 100);
  
  
  // 🔹 Détails de la transaction
  const plan = sub.plan?.name || "N/A";
  const montant = sub.totalPrice || 0;
  const methode = sub.paymentMethod;
  const statut = sub.status?.toUpperCase() || "N/A";
  const dateDebut = new Date(sub.createdAt).toLocaleDateString() || "N/A";
  const dateFin = new Date(sub.expiresAt).toLocaleDateString() || "N/A";

  doc.setFont("helvetica", "bold");
  doc.text("Détails du paiement :", 20, 115);

  autoTable(doc, {
    startY: 120,
    head: [["Plan", "Montant", "Méthode", "Statut", "Début", "Expiration"]],
    body: [[plan, `${montant} FCFA`, methode, statut, dateDebut, dateFin]],
    theme: "striped",
    styles: {
      halign: "center",
      valign: "middle",
      fontSize: 11,
    },
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: "bold",
    },
  });

  // 🔹 Pied de page
  const today = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Date d’émission : ${today}`, 20, doc.internal.pageSize.height - 20);
  doc.text("Merci pour votre confiance.", 140, doc.internal.pageSize.height - 20);

  // 🔹 Ouvrir le PDF dans un nouvel onglet
  window.open(doc.output("bloburl"), "_blank");
};


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Mon Tableau de bord
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : subs.length === 0 ? (
          <p className="text-center text-gray-500">
            Aucun abonnement actif pour le moment.
          </p>
        ) : (
          subs.map((sub) => (
            <div
              key={sub.id}
              className="bg-white p-6 mb-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-200"
            >
              <div className="flex justify-between items-center border-b pb-3 mb-3">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  📦 {sub.plan?.name || "Plan inconnu"} --- 📦 {sub.plan?.price || "Plan inconnu"} / session
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    sub.status === "paye"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {sub.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                <p className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
                  Début :{" "}
                  <strong>{new Date(sub.createdAt).toLocaleDateString()}</strong>
                </p>

                <p className="flex items-center gap-2">
                  <FaClock className="text-purple-500" />
                  Fin :{" "}
                  <strong>{new Date(sub.expiresAt).toLocaleDateString()}</strong>
                </p>

                <p className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-green-500" />
                  Durée :{" "}
                  <strong>
                    {sub.duration}{" "}
                    {sub.duration > 1 ? "session" : "session"}
                  </strong>
                </p>

                <p className="flex items-center gap-2">
                  💰 Total payé :{" "}
                  <strong className="text-gray-900">
                    {sub.totalPrice.toLocaleString()} FCFA
                  </strong>
                </p>
              </div>

              {/* Factures */}
              
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-gray-800">Factures :</h3>
                  
                  
                    <button
                      onClick={() => handlePrintInvoice(sub)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                    >
                      <FaFilePdf className="text-red-500" />
                      <FaDownload />
                      Télécharger la facture
                    </button>

                 
                </div>
              
            </div>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
}