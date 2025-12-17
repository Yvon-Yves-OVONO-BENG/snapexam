// src/components/AdminPayment.js
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import titreDeLaPage from "./TitreDeLaPage";
import { FaFilePdf, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaMoneyBill } from "react-icons/fa";
import snapExamLogo from "../assets/favicon.jpg";// ✅ mets le bon chemin vers ton image

const AdminPayment = () => {
  titreDeLaPage("Gestion des Paiements");

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPayment, setNewPayment] = useState({ utilisateur_id: "", montant: "", status: "paye" });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editMontant, setEditMontant] = useState("");
  const [editStatut, setEditStatut] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [utilisateurId, setUtilisateurId] = useState("");
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("MoMo");
    const [planId, setPlanId] = useState("");
    const [duration, setDuration] = useState("");

  const token = localStorage.getItem("token");

const [users, setUsers] = useState([]);
// const [filteredUsers, setFilteredUsers] = useState([]);
const [searchUser, setSearchUser] = useState("");
const [plans, setPlans] = useState([]);

const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const dropdownRef = useRef(null);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

// Chargement des utilisateurs et plans au montage
useEffect(() => {
  const fetchData = async () => {
    try {
      const usersRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const plansRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUsers(usersRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      console.error("Erreur chargement données :", err);
      // toast.error("Erreur lors du chargement des données.");
    }
  };
  fetchData();
}, []);


const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/payments/create-payment`,
      {
        utilisateurId: selectedUser.id,
        amount,
        method,
        planId,
        duration,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPayments([...payments, res.data]);
    toast.success("✅ Paiement enregistré !");
    setShowModal(false);
  } catch (err) {
    console.error(err);
    toast.error("❌ Erreur lors de l’enregistrement !");
  }
};

  // Charger les paiements
  useEffect(() => {
  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data.map(p => ({
        id: p.id,
        utilisateur: p.utilisateur?.username || "Inconnu",
        email: p.utilisateur?.email || "Inconnu",
        amount: p.subscription?.plan?.price || 0,
        status: p.status,
        method: p.method || "N/A",
        plan: p.subscription?.plan?.name || "N/A",
        date_paiement: new Date(p.createdAt).toLocaleDateString(),
        date_expiration: new Date(p.subscription?.expiresAt).toLocaleDateString(),
      }));

      setPayments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  fetchPayments();
}, [token]);


  ////pdf facture 
  // const handlePrintInvoice = (p) => {
  //   const doc = new jsPDF();

  //   // Logo
  //   doc.addImage(snapExamLogo, "JPEG", 85, 10, 40, 40);

  //   // Titre
  //   doc.setFontSize(18);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("FACTURE DE PAIEMENT", 70, 60);

  //   // Sous-titre
  //   doc.setFontSize(12);
  //   doc.setFont("helvetica", "normal");
  //   doc.text("Plateforme de gestion des photos des candidats", 58, 68);
  //   doc.line(20, 72, 190, 72);

  //   // Infos client
  //   doc.setFont("helvetica", "bold");
  //   doc.text("Informations du client :", 20, 85);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(`Nom : ${p.utilisateur}`, 20, 93);
  //   doc.text(`Email : ${p.email}`, 20, 100);

  //   // Détails du paiement
  //   doc.setFont("helvetica", "bold");
  //   doc.text("Détails du paiement :", 20, 115);
  //   autoTable(doc, {
  //     startY: 120,
  //     head: [["Plan", "Montant", "Méthode", "Statut", "Début", "Expiration"]],
  //     body: [[
  //       p.plan,
  //       `${p.amount} FCFA`,
  //       p.method,
  //       p.status?.toUpperCase() || "N/A",
  //       p.date_paiement,
  //       p.date_expiration
  //     ]],
  //     theme: "striped",
  //     styles: { halign: "center", valign: "middle", fontSize: 11 },
  //     headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: "bold" },
  //   });

  //   // Pied de page
  //   const today = new Date().toLocaleDateString();
  //   doc.setFontSize(10);
  //   doc.setTextColor(100);
  //   doc.text(`Date d’émission : ${today}`, 20, doc.internal.pageSize.height - 20);
  //   doc.text("Merci pour votre confiance.", 140, doc.internal.pageSize.height - 20);

  //   window.open(doc.output("bloburl"), "_blank");
  // };

  // const handlePrintInvoice = (p) => {
  //   const doc = new jsPDF();

  //   // === 🔹 Logo ===
  //   doc.addImage(snapExamLogo, "PNG", 15, 10, 25, 25);

  //   // === 🔹 En-tête ===
  //   doc.setFontSize(10);
  //   doc.setFont("helvetica");
  //   doc.text("SnapExam Yaoundé Ahala", 70, 20);
  //   doc.text("Plateforme de gestion des photos des candidats", 60, 25);
  //   doc.text("contact@snapexam.cm", 70, 30);
  //   doc.text("https://snapexam.freedomsoftwarepro.com", 70, 35);
  //   doc.text("+237 673 78 83 08 / +237 697 99 33 86", 70, 40);
  //   doc.setFontSize(12);
  //   doc.setFont("helvetica", "normal");
  //   doc.setFontSize(10);
  //   // doc.text("Université de Yaoundé I - Faculté des Sciences", 72, 34);
  //   // doc.text("Département d'Informatique", 88, 39);
  //   doc.line(10, 45, 200, 45);
  //   doc.text("FACTURE", 50, 55);

  //   // === 🔹 Détails de la facture===
  //   doc.setFont("helvetica", "bold");
  //   doc.text("Réf :", 20, 55);
  //   doc.setFont("helvetica", "normal");
  //   doc.text("Payé le : ", 20, 62);
  //   doc.text("Mde règlement : ", 20, 68);

  //   // === 🔹 Informations du client ===
  //   doc.setFontSize(10);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("Informations du client :", 100, 55);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(`Nom : ${p.utilisateur || "Client Inconnu"}`, 100, 62);
  //   doc.text(`Email : ${p.email || "—"}`, 100, 68);

  //   // === 🔹 Titre du tableau ===
  //   doc.setFontSize(12);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("Détails du produit :", 20, 95);

  //   // === 🔹 Tableau Produit (comme sur la facture) ===
  //   autoTable(doc, {
  //     startY: 100,
  //     head: [["Référence", "Produit / Service", "Durée", "Prix HT", "TVA (19.25%)", "Total TTC"]],
  //     body: [[
  //       p.reference || "RNV-2462367",
  //       p.plan || "CPanel - freedomsoftwarepro.com",
  //       "12 Mois",
  //       `${p.amount || "72.00"} fcfa`,
  //       `${((parseFloat(p.amount) * 0.1925) || 13.87).toFixed(2)} fcfa`,
  //       `${(parseFloat(p.amount) + (parseFloat(p.amount) * 0.1925) || 85.87).toFixed(2)} fcfa`
  //     ]],
  //     theme: "striped",
  //     styles: {
  //       halign: "center",
  //       valign: "middle",
  //       fontSize: 11,
  //       cellPadding: 4,
  //     },
  //     headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: "bold" },
  //   });

  //   let finalY = doc.lastAutoTable.finalY || 120;

  //   // === 🔹 Résumé Totaux ===
  //   const montantHT = parseFloat(p.amount) || 72.00;
  //   const tva = (montantHT * 0.1925).toFixed(2);
  //   const totalTTC = (montantHT + parseFloat(tva)).toFixed(2);

  //   doc.setFontSize(11);
  //   doc.setFont("helvetica", "bold");
  //   doc.text("Récapitulatif :", 20, finalY + 15);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(`Montant HT : ${montantHT.toFixed(2)} fcfa`, 20, finalY + 23);
  //   doc.text(`TVA (19.25%) : ${tva} fcfa`, 20, finalY + 29);
  //   doc.setFont("helvetica", "bold");
  //   doc.text(`Total TTC : ${totalTTC} fcfa`, 20, finalY + 37);

  //   // === 🔹 Signature ===
  //   doc.setFontSize(11);
  //   doc.setFont("helvetica", "normal");
  //   doc.text("Signature :", 20, finalY + 55);
  //   doc.line(45, finalY + 56, 100, finalY + 56);
  //   doc.text("Responsable Facturation", 20, finalY + 65);

  //   // === 🔹 Pied de page ===
  //   const today = new Date().toLocaleDateString("fr-FR");
  //   doc.setFontSize(9);
  //   doc.setTextColor(100);
  //   doc.text(`Date d’émission : ${today}`, 20, 285);
  //   doc.text("Merci pour votre confiance.", 150, 285);

  //   // === 🔹 Afficher le PDF dans un nouvel onglet ===
  //   window.open(doc.output("bloburl"), "_blank");
  // };

  const handlePrintInvoice = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // === 🔹 Logo ===
    doc.addImage(snapExamLogo, "JPEG", 15, 15, 30, 30);

    // === 🔹 En-tête ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("FACTURE DE PAIEMENT", 70, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Plateforme de gestion des photos des candidats", 58, 32);
    doc.line(20, 38, 190, 38);

    // === 🔹 Ligne principale de contenu ===
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      "RNV-2462367   -   renouvellement   CPanel   L : freedomsoftwarepro.com   *  12 Mois  *   (ok) 85.87 €",
      20,
      55
    );

    // === 🔹 Bloc des montants ===
    doc.setFontSize(11);
    doc.text("Sous-total HT :", 140, 85);
    doc.text("72.00 €", 180, 85, { align: "right" });

    doc.text("TVA (19.25%) :", 140, 92);
    doc.text("13.87 €", 180, 92, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("Total TTC :", 140, 99);
    doc.text("85.87 €", 180, 99, { align: "right" });

    // === 🔹 Référence de facturation ===
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Facture n° : FCT-2507500", 20, 115);
    doc.text("Date : 24/10/2025", 20, 121);
    doc.text("Client : freedomsoftwarepro.com", 20, 127);

    // === 🔹 Informations société ===
    doc.setFont("helvetica", "bold");
    doc.text("Émis par :", 20, 145);
    doc.setFont("helvetica", "normal");
    doc.text("OBC Cameroun", 20, 151);
    doc.text("contact@obc.cm", 20, 157);
    doc.text("www.obc.cm", 20, 163);
    doc.text("+237 699 00 00 00", 20, 169);

    // === 🔹 Signature ===
    doc.setFont("helvetica", "bold");
    doc.text("Signature :", 20, 200);
    doc.line(45, 201, 100, 201);
    doc.setFont("helvetica", "normal");
    doc.text("Responsable Facturation", 20, 208);

    // === 🔹 Pied de page ===
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Merci pour votre confiance.", 80, 285);
    doc.text("Document généré automatiquement le 24/10/2025", 55, 290);

    // === 🔹 Ouvre dans un nouvel onglet ===
    window.open(doc.output("bloburl"), "_blank");
  };

  const handlePrintInvoice1 = (p) => {
    const generatePDF = () => {
      const doc = new jsPDF();

      // === 🔹 Logo ===
      doc.addImage(snapExamLogo, "JPEG", 15, 10, 25, 25);

      // === 🔹 En-tête ===
      doc.setFontSize(18);
      doc.text("FACTURE DE PAIEMENT", 70, 20);
      doc.setFontSize(12);
      doc.text("Plateforme de gestion des photos des candidats", 60, 28);
      doc.setFontSize(10);
      doc.text("Université de Yaoundé I - Faculté des Sciences", 70, 34);
      doc.text("Département d'Informatique", 85, 39);

      // === 🔹 Ligne de séparation ===
      doc.setDrawColor(0);
      doc.line(10, 45, 200, 45);

      // === 🔹 Informations client ===
      doc.setFontSize(12);
      doc.text("Référence : RNV-2462367", 20, 55);
      doc.text("Type : Renouvellement", 20, 62);
      doc.text("Service : CPanel", 20, 69);
      doc.text("Domaine : freedomsoftwarepro.com", 20, 76);
      doc.text("Durée : 12 Mois", 20, 83);
      doc.text("Statut : (ok) 85.87 fcfa", 20, 90);

      // === 🔹 Informations société ===
      doc.setFontSize(10);
      doc.text("OBC Cameroun", 150, 55);
      doc.text("Email : contact@obc.cm", 150, 61);
      doc.text("Site : www.obc.cm", 150, 67);
      doc.text("Téléphone : +237 699 00 00 00", 150, 73);

      // === 🔹 Ligne de séparation ===
      doc.line(10, 100, 200, 100);

      // === 🔹 Détails du paiement ===
      doc.setFontSize(12);
      doc.text("DÉTAIL DU PAIEMENT", 20, 110);
      doc.setFontSize(10);
      doc.text("Description : Renouvellement de service CPanel (freedomsoftwarepro.com)", 20, 118);
      doc.text("Durée : 12 mois", 20, 124);
      doc.text("Montant : 85.87 fcfa", 20, 130);
      doc.text("Méthode : Paiement en ligne", 20, 136);
      doc.text("Date : 24/10/2025", 20, 142);

      // === 🔹 Signature ===
      doc.setFontSize(11);
      doc.text("Signature :", 20, 160);
      doc.line(45, 161, 100, 161);
      doc.text("Responsable Facturation", 20, 170);

      // === 🔹 Pied de page ===
      doc.setFontSize(9);
      doc.text("Merci pour votre confiance.", 80, 285);
      doc.text("Document généré automatiquement le 24/10/2025", 55, 290);

      // === 🔹 Télécharger ===
      doc.save("facture-2507500.pdf");
    };

    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h2>Génération de la Facture</h2>
        <button
          onClick={generatePDF}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Télécharger la Facture PDF
        </button>
      </div>
    );
  };

  // Recherche filtrée
  const filteredPayments = payments.filter(p => {
    const s = search.toLowerCase();

    const username = p.utilisateur?.username?.toLowerCase() || "";
    const email = p.utilisateur?.email?.toLowerCase() || "";
    const amount = p.amount?.toString() || "";
    const status = p.status?.toLowerCase() || "";

    return username.includes(s) || email.includes(s) || amount.includes(s) || status.includes(s);
});

  // Génération du PDF
  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Liste des Paiements", 14, 20);

    const tableData = filteredPayments.map((p, i) => [
      i + 1,
      p.utilisateur,
      `${p.amount} FCFA`,
      p.status,
      p.date_paiement,
    ]);

    autoTable(doc, {
      head: [["#", "Utilisateur", "Montant", "Statut", "Date"]],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: { halign: "center", valign: "middle" },
    });

    window.open(doc.output("bloburl"), "_blank");
  };

  // Ajouter un paiement
  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "${process.env.REACT_APP_API_URL}/api/payments",
        newPayment,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments([...payments, res.data]);
      toast.success("Paiement ajouté avec succès !");
      setShowModal(false);
      setNewPayment({ utilisateur_id: "", amount: "", status: "paye" });
    } catch (err) {
      toast.error("Erreur lors de l’ajout du paiement !");
    }
  };

  // Modifier un paiement
  const handleUpdatePayment = async () => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/payments/${selectedPayment.id}`,
        { amount: editMontant, status: editStatut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(payments.map(p => (p.id === res.data.id ? res.data : p)));
      toast.success("Paiement modifié avec succès !");
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour !");
    }
  };

  // Supprimer un paiement
  const handleDeletePayment = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/payments/${selectedPayment.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(payments.filter(p => p.id !== selectedPayment.id));
      toast.success("Paiement supprimé !");
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error("Erreur de suppression !");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" />

      <div className="max-w-6xl mx-auto p-6 pt-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">💳 Gestion des Paiements</h1>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-1 rounded w-64"
            />
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleGeneratePDF}
            >
              🖨️ Imprimer
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setShowModal(true)}
            >
              ➕ Ajouter Paiement
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Utilisateur</th>
                <th className="border px-4 py-2 text-left">Montant</th>
                <th className="border px-4 py-2 text-left">Statut</th>
                <th className="border px-4 py-2 text-left">Date début</th>
                <th className="border px-4 py-2 text-left">Date fin</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tfoot className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Utilisateur</th>
                <th className="border px-4 py-2 text-left">Montant</th>
                <th className="border px-4 py-2 text-left">Statut</th>
                <th className="border px-4 py-2 text-left">Date début</th>
                <th className="border px-4 py-2 text-left">Date fin</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </tfoot>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p, index) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">{p.utilisateur}</td>
                    <td className="border px-4 py-2 font-semibold">
                      {p.amount} FCFA <br /> {p.method}
                    </td>
                    <td className="border px-4 py-2">
                      {p.status === "paye" ? (
                        <span className="text-green-600 flex items-center gap-1"><FaCheckCircle /> Payé</span>
                      ) : p.status === "rejeté" ? (
                        <span className="text-red-600 flex items-center gap-1"><FaTimesCircle /> Rejeté</span>
                      ) : (
                        <span className="text-yellow-600 flex items-center gap-1"><FaMoneyBill /> En attente</span>
                      )}
                    </td>
                    <td className="border px-4 py-2">{p.date_paiement}</td>
                    <td className="border px-4 py-2">{p.date_expiration}</td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => { setSelectedPayment(p); setEditMontant(p.amount); setEditStatut(p.status); setIsEditModalOpen(true); }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      ><FaEdit /></button>

                      <button
                        onClick={() => { setSelectedPayment(p); setIsDeleteModalOpen(true); }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      ><FaTrash /></button>

                      <button
                        onClick={() => handlePrintInvoice(p)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      ><FaFilePdf className="inline mr-1" /> Facture</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">Aucun paiement trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout */}
      {/* Modal Ajout Paiement */}
        {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[450px] shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                    💳 Nouveau Paiement
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* --- Sélecteur intelligent d'utilisateur --- */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        Utilisateur
                        </label>
                        <div
                        className="border rounded px-3 py-2 cursor-pointer bg-white"
                        onClick={() => setShowDropdown(!showDropdown)}
                        >
                        {selectedUser
                            ? `${selectedUser.username} (${selectedUser.email})`
                            : "🔍 Sélectionner un utilisateur"}
                        </div>

                        {showDropdown && (
                        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-64 overflow-y-auto">
                            <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
                            className="w-full px-3 py-2 border-b outline-none"
                            autoFocus
                            />
                            {filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                                <div
                                key={u.id}
                                onClick={() => {
                                    setSelectedUser(u);
                                    setShowDropdown(false);
                                    setSearchUser("");
                                }}
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                >
                                {u.username} <span className="text-gray-500">({u.email})</span>
                                </div>
                            ))
                            ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                                Aucun utilisateur trouvé
                            </div>
                            )}
                        </div>
                        )}
                    </div>

                    {/* Montant */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        Montant (FCFA)
                        </label>
                        <input
                        type="number"
                        placeholder="Ex : 5000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        required
                        />
                    </div>

                    {/* Méthode */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        Méthode
                        </label>
                        <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        >
                        <option value="MoMo">MTN MoMo</option>
                        <option value="OM">Orange Money</option>
                        </select>
                    </div>

                    {/* Plan */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        Plan d’abonnement
                        </label>
                        <select
                        value={planId}
                        onChange={(e) => setPlanId(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        >
                        <option value="">-- Sélectionnez un plan --</option>
                        {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                            {p.name} - {p.price} FCFA
                            </option>
                        ))}
                        </select>
                    </div>

                    {/* Durée */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        Durée (session)
                        </label>
                        <input
                        type="number"
                        placeholder="Ex : 1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        min="1"
                        required
                        />
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                        >
                        Annuler
                        </button>
                        <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                        Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
        )}



      {/* Modal Modification */}
      {isEditModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">✏️ Modifier le Paiement</h2>
            <input
              type="number"
              value={editMontant}
              onChange={(e) => setEditMontant(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            />
            <select
              value={editStatut}
              onChange={(e) => setEditStatut(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            >
              <option value="en_attente">En attente</option>
              <option value="paye">Payé</option>
              <option value="rejeté">Rejeté</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">
                Annuler
              </button>
              <button onClick={handleUpdatePayment} className="px-4 py-2 bg-blue-500 text-white rounded">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {isDeleteModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">⚠️ Supprimer le Paiement</h2>
            <p className="mb-4">Voulez-vous vraiment supprimer ce paiement de <strong>{selectedPayment.utilisateur}</strong> ?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Annuler</button>
              <button onClick={handleDeletePayment} className="px-4 py-2 bg-red-500 text-white rounded">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AdminPayment;
