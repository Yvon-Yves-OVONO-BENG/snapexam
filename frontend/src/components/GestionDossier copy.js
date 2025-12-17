// src/components/GestionDossier.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash, FaFolder } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import autoTable from "jspdf-autotable"; 
import DossierPhotos from "./DossierPhoto";
import "sweetalert2/dist/sweetalert2.min.css";
import titreDeLaPage from "./TitreDeLaPage";

const GestionDossier = () => {
  titreDeLaPage("Gestion des dossiers");

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [dossiers, setDossiers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loadingDossiers, setLoadingDossiers] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDossier, setNewDossier] = useState({ nom: "" });
  const [selectedDossiers, setSelectedDossiers] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [editNom, setEditNom] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedDossierForEdit, setSelectedDossierForEdit] = useState(null);
  const [selectedDossierForDelete, setSelectedDossierForDelete] = useState(null);
  const [selectedDossierForPhotos, setSelectedDossierForPhotos] = useState(null);

  const token = localStorage.getItem("token");
  const isAuthenticated = !!user;

  const [hasSubscription, setHasSubscription] = useState(false); // 🟢 pour savoir si l'utilisateur est abonné

  // 🟢 Vérifier l'abonnement au chargement
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/subscription/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setHasSubscription(res.data.paye); // paye = true ou false selon ton backend
      } catch (err) {
        console.error("Erreur vérification abonnement :", err);
        setHasSubscription(false);
      }
      
    };
    
        
    if (user) checkSubscription();
  }, [user, token]);

  // ...

  // 🟢 Lorsqu’on clique sur “Ajouter Dossier”
  const handleAddClick1 = () => {
    console.log(hasSubscription);
    if (!hasSubscription) {
      Swal.fire({
        title: "🔒 Abonnement requis",
        html: `
          <p class="text-gray-700 text-base leading-relaxed">
            Vous n'avez pas encore souscrit à un plan. <br><br>
            Pour pouvoir créer et gérer vos photos, veuillez effectuer votre paiement via :
          </p>
          <div class="bg-gray-100 rounded-lg p-3 mt-3 text-left">
            <strong>💳 MTN MoMo :</strong> 673 78 83 08<br>
            <strong>💳 Orange Money :</strong> 697 99 33 86<br>
            <strong>Nom du compte :</strong> <em>Yvon Yves Noël OVONO BENG</em>
          </div>
          <p class="mt-3 text-gray-600 text-sm">
            Après le paiement, contactez l’administrateur pour l’activation de votre compte.
          </p>
        `,
        icon: "info",
        width: "600px", // 🟢 Swal plus large
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
      });
    } else {
      setShowModal(true);
    }
  };

  // Toujours afficher le modal Ajouter Dossier
  const handleAddClick = () => {
    setShowModal(true);
  };

  ////AJOUT Dossier
  const handleAddDossier = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/dossiers`,
        newDossier,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDossiers([...dossiers, res.data.dossier]);
      toast.success("Dossier ajouté avec succès !");
      setShowModal(false);
      setNewDossier({ nom: "" });
    } catch (err) {
      if (err.response?.status === 403) {
        
        Swal.fire({
          title: "🔒 Abonnement requis",
          html: `
            <p class="text-gray-700 text-base leading-relaxed">
              ${err.response.data.message}<br>
              Pour pouvoir ajouter d'autres dossiers, veuillez effectuer votre paiement via :
            </p>
            <div class="bg-gray-100 rounded-lg p-3 mt-3 text-left">
              <strong>💳 MTN MoMo :</strong> 673 78 83 08<br>
              <strong>💳 Orange Money :</strong> 697 99 33 86<br>
              <strong>Nom du compte :</strong> <em>Yvon Yves Noël OVONO BENG</em>
            </div>
            <p class="mt-3 text-gray-600 text-sm">
              Après le paiement, contactez l’administrateur pour l’activation de votre compte.
            </p>
          `,
          icon: "info",
          width: "600px", // 🟢 Swal plus large
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        });
      } else {
        toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
      }
    }
  };

  // Chargement des dossiers
  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/dossiers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDossiers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDossiers(false);
      }
    };
    fetchDossiers();
  }, [token]);

  // Swal si aucun dossier
  // useEffect(() => {
  //   if (!loadingDossiers && dossiers.length === 0) {
  //     Swal.fire({
  //       title: "Aucun dossier trouvé",
  //       text: "Vous pouvez ajouter un nouveau dossier.",
  //       icon: "info",
  //       confirmButtonText: "OK",
  //     });
  //   }
  // }, [dossiers, loadingDossiers]);

  const handleChange = (e) => {
    setNewDossier({ ...newDossier, [e.target.name]: e.target.value });
  };

  const handleAddDossier1 = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/dossiers`,
        newDossier,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDossiers([...dossiers, res.data]);
      toast.success("Dossier ajouté avec succès !");
      setShowModal(false);
      setNewDossier({ nom: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  //modification du dossier
  const handleUpdateDossier = async () => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/dossiers/${selectedDossier.id}`,
        { nom: editNom },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDossiers(dossiers.map(d => d.id === res.data.id ? res.data : d));
      toast.success("Dossier modifié avec succès !");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Erreur modification");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDossiers.length === 0) return;

    const result = await Swal.fire({
      title: '⚠️ Confirmation',
      text: `Voulez-vous vraiment supprimer ce(s) ${selectedDossiers.length} dossier(s) ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedDossiers.map(id => 
          axios.delete(`${process.env.REACT_APP_API_URL}/api/dossiers/${id}`, 
            { headers: { Authorization: `Bearer ${token}` } 
          })
        ));
        setDossiers(dossiers.filter(d => !selectedDossiers.includes(d.id)));
        setSelectedDossiers([]);
        Swal.fire('Supprimé !', 'Le(s) dossier(s) ont été supprimé(s).', 'success');
      } catch (err) {
        console.error(err);
        Swal.fire('Erreur', 'Impossible de supprimer les dossiers ❌', 'error');
      }
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDossiers(currentDossiers.map(d => d.id));
    } else {
      setSelectedDossiers([]);
    }
  };

  const toggleSelectDossier = (id) => {
    if (selectedDossiers.includes(id)) {
      setSelectedDossiers(selectedDossiers.filter(d => d !== id));
    } else {
      setSelectedDossiers([...selectedDossiers, id]);
    }
  };

  // Filtrage et pagination
  const filteredDossiers = dossiers.filter(d => 
  (d.nom || "").toLowerCase().includes(search.toLowerCase()) || 
  (d.proprietaire.username.toLowerCase().includes(search.toLowerCase())));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDossiers = filteredDossiers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDossiers.length / itemsPerPage);

  // PDF export
  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Liste des dossiers", 14, 20);
    const tableData = filteredDossiers.map((d, index) => [
      index + 1,
      d.nom,
      new Date(d.dateCreation).toLocaleString(),
      isAuthenticated && user.role === "admin" ? d.userId : undefined
    ].filter(Boolean));
    autoTable(doc, {
      head: isAuthenticated && user.role === "admin" ? [["#", "Nom", "Date de création", "Propriétaire"]] : [["#", "Nom", "Date de création"]],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: { halign: "center", valign: "middle" },
    });
    window.open(doc.output("bloburl"), "_blank");
  };

  // Fonction utilitaire pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // mois commence à 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleUploadPhotos1 = async (dossierId, files) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i]);
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/photos/dossier/${dossierId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      toast.success(`${res.data.length} photo(s) ajoutée(s) ✅`);
      // Optionnel : mettre à jour le nombre de photos dans le tableau
      setDossiers(dossiers.map(d => d.id === dossierId ? { ...d, nombrePhotos: res.data.nombrePhotos } : d));
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'upload des photos ❌");
    }
  };

  const handleUploadPhotos = async (dossierId, files) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("photos", files[i]);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/photos/dossier/${dossierId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      toast.success(`${res.data.photos.length} photo(s) ajoutée(s) ✅`);
      setDossiers(dossiers.map(d => d.id === dossierId ? { ...d, nombrePhotos: res.data.nombrePhotos } : d));
    } catch (err) {
      if (err.response?.status === 403) {

        Swal.fire({
          title: "🔒 Abonnement requis",
          html: `
            <p class="text-gray-700 text-base leading-relaxed">
              ${err.response.data.message}<br>
              Pour pouvoir ajouter d'autres photos, veuillez effectuer votre paiement via :
            </p>
            <div class="bg-gray-100 rounded-lg p-3 mt-3 text-left">
              <strong>💳 MTN MoMo :</strong> 673 78 83 08<br>
              <strong>💳 Orange Money :</strong> 697 99 33 86<br>
              <strong>Nom du compte :</strong> <em>Yvon Yves Noël OVONO BENG</em>
            </div>
            <p class="mt-3 text-gray-600 text-sm">
              Après le paiement, contactez l’administrateur pour l’activation de votre compte.
            </p>
          `,
          icon: "info",
          width: "600px", // 🟢 Swal plus large
          confirmButtonText: "OK",
          confirmButtonColor: "#2563eb",
        });
      } else {
        toast.error("Erreur lors de l'upload des photos ❌");
      }
    }
  };

  //téléchargement
  const handleDownloadZip = async (dossier) => {
    const token = localStorage.getItem("token");

    if (!dossier) {
      Swal.fire("Aucun dossier sélectionné", "", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Téléchargement en cours...",
        html: "Veuillez patienter pendant la génération du fichier ZIP.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/photos/dossier/${dossier.id}/telecharger-zip`, // <-- ici
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              Swal.update({
                title: `Téléchargement : ${percentCompleted}%`,
                html: "Le fichier ZIP est en cours de préparation...",
              });
            }
          },
        }
      );

      // 🔽 Créer un lien de téléchargement
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${dossier.nom}.zip`; // <-- ici
      link.click();

      Swal.fire({
        icon: "success",
        title: "Téléchargement terminé 🎉",
        text: `Le fichier ${dossier.nom}.zip a été téléchargé.`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Erreur téléchargement ZIP :", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de télécharger le ZIP",
      });
    }
  };

  return (
    <>
      <Navbar />
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}
      <ToastContainer position="top-right" />

      <div className="max-w-6xl mx-auto p-6 pt-20 relative z-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des dossiers</h1>
          <div className="flex items-center space-x-2">
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border px-2 py-1 rounded"
            >
              {[10, 20, 30, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="border px-3 py-1 rounded w-64"
            />
            <button onClick={handleGeneratePDF} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">🖨️ Imprimer</button>
            <button 
              // onClick={() => setShowModal(true)} 
              onClick={handleAddClick}
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">➕ Ajouter Dossier
            </button>
          </div>
        </div>

        {/* Tableau */}
        {selectedDossiers.length > 0 && (
          <div className="flex space-x-2 mt-4 mb-4">
            <button onClick={handleDeleteSelected} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">🗑️ Supprimer sélection</button>
          </div>
        )}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">
                  <input type="checkbox" checked={selectedDossiers.length === currentDossiers.length && currentDossiers.length > 0} onChange={toggleSelectAll}/>
                </th>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Nom</th>
                <th className="border px-4 py-2 text-left">Nombre de photos</th>
                <th className="border px-4 py-2 text-left">Date de création</th>
                {isAuthenticated && user.role === "admin" && <th className="border px-4 py-2 text-left">Propriétaire</th>}
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tfoot className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">
                  <input type="checkbox" checked={selectedDossiers.length === currentDossiers.length && currentDossiers.length > 0} onChange={toggleSelectAll}/>
                </th>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Nom</th>
                <th className="border px-4 py-2 text-left">Nombre de photos</th>
                <th className="border px-4 py-2 text-left">Date de création</th>
                {isAuthenticated && user.role === "admin" && <th className="border px-4 py-2 text-left">Propriétaire</th>}
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </tfoot>

            <tbody>
              {currentDossiers.length > 0 ? currentDossiers.map((dossier, index) => (
                <tr key={dossier.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="border px-4 py-2 text-center">
                    <input type="checkbox" checked={selectedDossiers.includes(dossier.id)} onChange={() => toggleSelectDossier(dossier.id)}/>
                  </td>
                  <td className="border px-4 py-2 text-center">{(currentPage-1)*itemsPerPage + index + 1}</td>
                  <td className="border px-4 py-2">{dossier.nom}</td>
                <th className="border px-4 py-2 text-center">{dossier.nombrePhotos}</th>
                  <td className="border px-4 py-2 text-center">{formatDate(dossier.createdAt)}</td>
                  {isAuthenticated && user.role === "admin" && <td className="border px-4 py-2">{dossier.proprietaire.username}</td>}
                  
                  <td className="border px-4 py-2 space-x-2 text-center">

                    {/* Éditer */}
                    <button
                      onClick={() => {
                        setSelectedDossierForEdit(dossier);
                        setEditNom(dossier.nom);
                        setIsEditModalOpen(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded inline-flex items-center"
                    >
                      <FaEdit />
                    </button>

                    {/* Supprimer */}
                    <button
                      onClick={() => setSelectedDossierForDelete(dossier)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded inline-flex items-center"
                    >
                      <FaTrash />
                    </button>

                    {/* Upload photos */}
                    <label className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded cursor-pointer">
                      📤
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleUploadPhotos(dossier.id, e.target.files)}
                      />
                    </label>

                    {/* Voir photos */}
                    <button
                      onClick={() => setSelectedDossierForPhotos(dossier)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      👁️
                    </button>

                    {/* Télécharger ZIP */}
                    {dossier.nombrePhotos > 0 && (
                      <button
                        onClick={() => handleDownloadZip(dossier)}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                      >
                        📦
                      </button>
                    )}
                  </td>


                </tr>
              )) : (
                <tr><td colSpan={isAuthenticated && user.role === "admin" ? 6 : 5} className="text-center py-4 text-gray-500 italic">Aucun dossier trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-gray-600 text-sm">Page {currentPage} sur {totalPages} (Total : {filteredDossiers.length})</p>
          <div className="flex space-x-1">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage===1} className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50">⏮️</button>
            <button onClick={() => setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1} className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50">⬅️</button>
            {Array.from({length: totalPages}, (_,i)=>i+1).map(page=>(
              <button key={page} onClick={()=>setCurrentPage(page)} className={`px-3 py-1 border rounded ${currentPage===page?"bg-blue-500 text-white":"bg-gray-100"}`}>{page}</button>
            ))}
            <button onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50">➡️</button>
            <button onClick={()=>setCurrentPage(totalPages)} disabled={currentPage===totalPages} className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50">⏭️</button>
          </div>
        </div>
      </div>

      {/* Modal Ajouter */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 animate-slide-up">
            <h2 className="text-lg font-bold mb-4">➕ Ajouter Dossier</h2>
            <form onSubmit={handleAddDossier}>
              <input type="text" name="nom" placeholder="Nom" value={newDossier.nom} onChange={handleChange} className="w-full border px-3 py-2 rounded mb-3" required/>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* modale edition  */}
      {isEditModalOpen && selectedDossierForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 animate-slide-up">
            <h2 className="text-lg font-bold mb-4">✏️ Modifier le dossier</h2>
            <input
              type="text"
              value={editNom}
              onChange={e => setEditNom(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Annuler</button>
              <button
                onClick={async () => {
                  try {
                    const res = await axios.put(
                      `${process.env.REACT_APP_API_URL}/api/dossiers/${selectedDossierForEdit.id}`,
                      { nom: editNom },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setDossiers(dossiers.map(d => d.id === res.data.id ? res.data : d));
                    toast.success("Dossier modifié avec succès !");
                    setIsEditModalOpen(false);
                    setSelectedDossierForEdit(null);
                  } catch (err) {
                    console.error(err);
                    toast.error("Erreur modification !");
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                💾 Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal Supprimer */}
      {selectedDossierForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">⚠️ Avertissement</h2>
            <p className="mb-4">Voulez-vous vraiment supprimer ce dossier ?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setSelectedDossierForDelete(null)} className="px-4 py-2 bg-gray-300 rounded">Non</button>
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`${process.env.REACT_APP_API_URL}/api/dossiers/${selectedDossierForDelete.id}`, { headers: { Authorization: `Bearer ${token}` }});
                    setDossiers(dossiers.filter(d => d.id !== selectedDossierForDelete.id));
                    toast.success("Dossier supprimé avec succès !");
                    setSelectedDossierForDelete(null);
                  } catch (err) {
                    console.error(err);
                    toast.error("Erreur suppression !");
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal pour afficher les photos */}
      {selectedDossierForPhotos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/4 max-h-[80vh] overflow-auto">
            <h2 className="text-lg font-bold mb-4">{selectedDossierForPhotos.nom} - Photos</h2>
            <DossierPhotos dossierId={selectedDossierForPhotos.id} />
            <button
              onClick={() => setSelectedDossierForPhotos(null)}
              className="mt-4 px-4 py-2 bg-gray-300 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}


      <Footer />

      <style>{`
        @keyframes slideUp { from { transform: translateY(50px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
      `}</style>
    </>
  );
};

export default GestionDossier;
