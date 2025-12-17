// src/components/MesContacts.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash, FaEnvelope, FaSms } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import autoTable from "jspdf-autotable"; // 👈 import explicite
import titreDeLaPage from "./TitreDeLaPage";

const MesContacts = () => {

  titreDeLaPage("Mes contacts");
  
  const [user, setUser] = useState(() => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
  });

  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({ nom: "", numero: "" });
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [selectedContact, setSelectedContact] = useState(null);
  const [editNom, setEditNom] = useState("");
  const [editNumero, setEditNumero] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {

    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // récupération des contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Sequelize renvoie souvent dataValues ou plain objects
        const listContacts = res.data.map(contact => ({
          id: contact.id,
          nom: contact.nom,
          numero: contact.numero,
          statut: contact.statut,
          proprietaire: contact.utilisateur?.username || "non défini"
        }));

        setContacts(listContacts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [token]);

  console.log(selectedContacts);
  
  // Swal si aucun contact
  useEffect(() => {
    if (!loadingContacts && contacts.length === 0) {
      Swal.fire({
        title: "Aucun contact trouvé",
        text: "Vous pouvez ajouter un nouveau contact.",
        icon: "info",
        confirmButtonText: "OK",
      });
    }
  }, [contacts, loadingContacts]);

  const handleChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  ///ajout d'un contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/contacts`,
        newContact,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setContacts([...contacts, res.data]);
      toast.success("Contact ajouté avec succès !");
      setShowModal(true);
      setNewContact({ nom: "", numero: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  // Modifier un contact
  const handleUpdateContact = async () => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/contacts/${selectedContact.id}`,
        { nom: editNom, numero: editNumero },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Mettre à jour localement
      setContacts(contacts.map(contact => contact.id === res.data.id ? res.data : contact));
      // setSuccessMessage("Informations modifiées avec succès");
      toast.success("Contact modifié avec succès !");
      const modal = document.getElementById("editModal");
      if (modal) {
        modal.classList.add("animate-slide-down");
        setTimeout(() => setIsEditModalOpen(false), 400);
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Erreur modification :", err);
    }
  };

  // Suppression multiple
  const handleDeleteSelected = async () => {
    if (selectedContacts.length === 0) return;

    const result = await Swal.fire({
      title: '⚠️ Confirmation',
      text: `Voulez-vous vraiment supprimer ce(s) ${selectedContacts.length} contacts(s) ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/contacts/multiple-delete`, 
          { ids: selectedContacts },
          { headers: { Authorization: `Bearer ${token}` } }
        );


        // Mise à jour du state
        setContacts(contacts.filter(contact => !selectedContacts.includes(contact.id)));
        setSelectedContacts([]);

        Swal.fire('Supprimé !', 'Le(s) contact(s) ont été supprimé(s).', 'success');
      } catch (err) {
        console.error("Erreur suppression :", err);
        Swal.fire('Erreur', 'Impossible de supprimer les contacts ❌', 'error');
      }
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContacts(currentContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  // Gestion des checkboxes
  const toggleSelectContact = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((contact) => contact !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  // Toggle statut contact
  const toggleStatut = async (id) => {
    try {
      const res = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/contacts/toggle/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContacts(contacts.map(contact => contact.id === id ? { ...contact, statut: res.data.statut } : contact));
    } catch (err) {
      console.error("Erreur toggle statut :", err);
    }
  };
  // filtrage
  const filteredContacts = contacts.filter((contact) => {
    const s = search.toLowerCase();
    const nom = contact.nom?.toLowerCase() || "";
    const numero = contact.numero?.toLowerCase() || "";
    return nom.includes(s) || numero.includes(s);
  });

  // pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  //Génération du pdf
    const handleGeneratePDF = async (users) => {
        const doc = new jsPDF();
  
        doc.setFontSize(16);
        doc.text("Liste des contacts", 14, 20);
  
        // Construire les données du tableau
        const dataToPrint = filteredContacts.length > 0 ? filteredContacts : users;
  
        const tableData = dataToPrint.map((contact, index) => [
          index + 1,
          contact.nom,
          contact.numero,
          contact.statut ? "Actif" : "Inactif",
        ]);
  
  
        // const tableData = filteredContacts.length > 0 ? filteredContacts : users;
  
        autoTable(doc, {
          head: [["N°", "Nom", "Contact", "Statut"]],
          body: tableData,
          startY: 30,
          theme: "grid",
          styles: { halign: "center", valign: "middle" },
          
        });
  
        // 🔍 Prévisualiser dans un nouvel onglet
        window.open(doc.output("bloburl"), "_blank");
      };

  return (
    
    <>
      <Navbar />

      {/* ✅ Message succès */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      <ToastContainer position="top-right" />
      <div className="max-w-6xl mx-auto p-6 pt-20 relative z-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Mes Contacts</h1>
          <div className="flex items-center space-x-2">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border px-2 py-1 rounded"
            >
              {[10, 20, 30, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="border px-3 py-1 rounded w-64"
            />
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => handleGeneratePDF(contacts)}
            >
              🖨️ Imprimer
            </button>
            <button
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setShowModal(true)}
            >
              ➕ Ajouter Contact
            </button>
            
          </div>
        </div>

        {/* Tableau */}
        {selectedContacts.length > 0 && (
          <div className="flex space-x-2 mt-4 mb-4">
            <button
              onClick={() => setIsMailModalOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              📧 Envoyer Mail Groupé
            </button>
            <button
              onClick={() => setIsSMSModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              📩 Envoyer SMS Groupé
            </button>
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              🗑️ Supprimer sélection
            </button>
          </div>
        )}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === currentContacts.length && currentContacts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Nom</th>
                <th className="border px-4 py-2 text-left">Numéro</th>
                {isAuthenticated && user?.role === "admin" && (
                  <th className="border px-4 py-2 text-left">Propriétaire</th>
                )}
                <th className="border px-4 py-2 text-left">Statut</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tfoot className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === currentContacts.length && currentContacts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Nom</th>
                <th className="border px-4 py-2 text-left">Numéro</th>
                {isAuthenticated && user?.role === "admin" && (
                  <th className="border px-4 py-2 text-left">Propriétaire</th>
                )}
                <th className="border px-4 py-2 text-left">Statut</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </tfoot>
            <tbody>
              {currentContacts.length > 0 ? (
                currentContacts.map((contact, index) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition duration-200">
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleSelectContact(contact.id)}
                      />
                    </td>
                    <td className="border px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="border px-4 py-2">{contact.nom}</td>
                    <td className="border px-4 py-2">{contact.numero}</td>
                    {isAuthenticated && user?.role === "admin" && (
                      <td className="border px-4 py-2">{contact.proprietaire}</td>
                    )}
                    <td className="border px-4 py-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contact.statut}
                        onChange={() => toggleStatut(contact.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition"></div>
                      <span className="ml-2 text-sm">{contact.statut ? "Actif" : "Bloqué"}</span>
                    </label>
                  </td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setEditNom(contact.nom);
                          setEditNumero(contact.numero);
                          setIsEditModalOpen(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded inline-flex items-center"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => { setSelectedContact(contact); setIsDeleteModalOpen(true); }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded inline-flex items-center"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => { setSelectedContacts([contact.id]); setIsMailModalOpen(true); }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded inline-flex items-center"
                      >
                        <FaEnvelope />
                      </button>
                      <button
                        onClick={() => { setSelectedContacts([contact.id]); setIsSMSModalOpen(true); }}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded inline-flex items-center"
                      >
                        <FaSms />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 italic">
                    Aucun contact trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-gray-600 text-sm">
            Page {currentPage} sur {totalPages} (Total : {filteredContacts.length})
          </p>
          <div className="flex space-x-1">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50">⏮️</button>
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50">⬅️</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page <= 3 || page > totalPages - 3 || (page >= currentPage - 2 && page <= currentPage + 2))
              .map((page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  return (
                    <React.Fragment key={page}>
                      <span className="px-2 py-1">...</span>
                      <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-100"}`}>{page}</button>
                    </React.Fragment>
                  );
                }
                return (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-100"}`}>{page}</button>
                );
              })}
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50">➡️</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50">⏭️</button>
          </div>
        </div>
      </div>

      {/* Modal Ajouter Contact */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 animate-slide-up">
            <h2 className="text-lg font-bold mb-4">➕ Ajouter Contact</h2>
            <form onSubmit={handleAddContact}>
              <input
                type="text"
                name="nom"
                placeholder="Nom"
                value={newContact.nom}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded mb-3"
                required
              />
              <input
                type="text"
                name="numero"
                placeholder="Numéro"
                value={newContact.numero}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded mb-3"
                required
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* ✏️ Modal Modifier */}
      {isEditModalOpen && selectedContact && (
        <div
          id="editModal"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div className="bg-white p-6 rounded-lg w-96 transform transition-all duration-300 translate-y-10 opacity-0 animate-slide-up">
            <h2 className="text-lg font-bold mb-4"> ✏️ Modifier le contact</h2>

            <input
              type="text"
              value={editNom}
              onChange={(e) => setEditNom(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <input
              type="text"
              value={editNumero}
              onChange={(e) => setEditNumero(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  const modal = document.getElementById("editModal");
                  if (modal) {
                    modal.classList.add("animate-slide-down");
                    setTimeout(() => setIsEditModalOpen(false), 400);
                  }
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                ❌ Annuler
              </button>
              <button
                onClick={handleUpdateContact}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                💾 Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Modal Supprimer */}
      {isDeleteModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">⚠️ Avertissement</h2>
            <p className="mb-4">Il est déconseillé de supprimer les données en informatique.<br />Voulez-vous vraiment continuer ?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Non</button>
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`${process.env.REACT_APP_API_URL}/api/contacts/${selectedContact.id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    setContacts(contacts.filter(contact => contact.id !== selectedContact.id));
                    toast.success("Contact supprimé avec succès !");
                    setIsDeleteModalOpen(false);
                  } catch (err) {
                    console.error("Erreur suppression :", err);
                    // alert("Suppression forcée appliquée !");
                    toast.error("Erreur de suppression !");
                    setContacts(contacts.filter(contact => contact.id !== selectedContact.id));
                    setIsDeleteModalOpen(false);
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

      {/* ✅ Modales Mail et SMS Groupés */}
      {(isMailModalOpen || isSMSModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">{isMailModalOpen ? "📧 Envoyer Email" : "📩 Envoyer SMS"}</h2>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Votre message..."
              className="w-full border px-3 py-2 rounded mb-3"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setIsMailModalOpen(false); setIsSMSModalOpen(false); setMessageContent(""); }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  Swal.fire({
                    title: "Message envoyé !",
                    text: `Votre message a été envoyé à ${selectedContacts.length} utilisateur(s) 🎉`,
                    icon: "success",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3085d6"
                  });

                  // Réinitialiser les modales et le contenu
                  setIsMailModalOpen(false);
                  setIsSMSModalOpen(false);
                  setMessageContent("");
                }}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Envoyer
              </button>

            </div>
          </div>
        </div>
      )}
      <Footer />

      <style>
        {`
          @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
        `}
      </style>
    </>
  );


};

export default MesContacts;
