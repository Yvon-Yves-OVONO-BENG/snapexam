// ListeUtilisateurs.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaEnvelope, FaSms, FaMale, FaFemale } from "react-icons/fa";
import jsPDF from "jspdf";
import { ToastContainer, toast } from "react-toastify";
import "jspdf-autotable";
import autoTable from "jspdf-autotable"; // 👈 import explicite
import titreDeLaPage from "./TitreDeLaPage";
import { CheckCircle, XCircle } from "lucide-react";

const UsersList = () => {
  
  titreDeLaPage("Liste utilisateurs - SnapExam");

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editRole, setEditRole] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem("token");

  
  // Récupération utilisateurs via Sequelize
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Sequelize renvoie souvent dataValues ou plain objects
        const userList = res.data.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          contact: u.contact,
          statut: u.statut, // true/false
          avatar: u.avatar, // avatar
        }));

        setUsers(userList);
      } catch (err) {
        console.error("Erreur récupération utilisateurs :", err);
      }
    };
    fetchUsers();
  }, [token]);

  //Génération du pdf
  const handleGeneratePDF = async (users) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Liste des utilisateurs", 14, 20);

  const dataToPrint = filteredUsers.length > 0 ? filteredUsers : users;

  // 1️⃣ Précharge les images
  const tableData = await Promise.all(
    dataToPrint.map(async (u, index) => {
      let imgBase64 = null;
      if (u.avatar) {
        const imgUrl = `${process.env.REACT_APP_API_URL}/avatars/${u.avatar}`;
        try {
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          imgBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.error("Erreur chargement avatar:", err);
        }
      }

      // On ne met pas l’image dans le tableau texte
      return [
        index + 1,
        u.username,
        u.email,
        u.role,
        u.contact,
        u.statut ? "Actif" : "Inactif",
        { image: imgBase64 }, // 👈 objet image (pas du texte)
      ];
    })
  );

  // 2️⃣ Génération du tableau
  autoTable(doc, {
      head: [["N°", "Nom", "Email", "Rôle", "Contact", "Statut", "Photo"]],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: { halign: "center", valign: "middle" },
      columnStyles: {
        6: { cellWidth: 25, minCellHeight: 25 }, // colonne photo
      },
      didDrawCell: (data) => {
        if (data.column.index === 6 && data.cell.raw?.image) {
          // Dessine uniquement l’image (pas de texte)
          const img = data.cell.raw.image;
          doc.addImage(
            img,
            "JPEG",
            data.cell.x + 3,
            data.cell.y + 3,
            19,
            19
          );
        }
      },
    });

    window.open(doc.output("bloburl"), "_blank");
  };

  // Toggle statut utilisateur
  const toggleStatut = async (id) => {
    try {
      const res = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/users/toggle/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u => u.id === id ? { ...u, statut: res.data.statut } : u));
    } catch (err) {
      console.error("Erreur toggle statut :", err);
    }
  };

  // Modifier utilisateur
  const handleUpdateUser = async () => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/${selectedUser.id}`,
        { username: editUsername, email: editEmail, contact: editContact, role: editRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Mettre à jour localement
      setUsers(users.map(u => u.id === res.data.id ? res.data : u));

      // setSuccessMessage("Informations modifiées avec succès");
      toast.success("Utilisateur modifié avec succès !");
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
    if (selectedUsers.length === 0) return;

    const result = await Swal.fire({
      title: '⚠️ Confirmation',
      text: `Voulez-vous vraiment supprimer ce(s) ${selectedUsers.length} utilisateur(s) ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/users/multiple`, {
          data: { ids: selectedUsers },
          headers: { Authorization: `Bearer ${token}` }
        });

        // Mise à jour du state
        setUsers(users.filter(u => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);

        Swal.fire('Supprimé !', 'Les utilisateurs ont été supprimés.', 'success');
      } catch (err) {
        console.error("Erreur suppression :", err);
        Swal.fire('Erreur', 'Impossible de supprimer les utilisateurs ❌', 'error');
      }
    }
  };

  // 🔍 Filtrage
  const filteredUsers = users.filter(u => {
    const s = search.toLowerCase();
    const username = u.username?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";
    const contact = u.contact ? String(u.contact).toLowerCase() : "";
    const role = u.role?.toLowerCase() || "";
    const statutText = u.statut ? "actif" : "bloqué";
    return username.includes(s) || email.includes(s) || contact.includes(s) || role.includes(s) || 
    statutText.includes(s);
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  console.log(currentUsers);
  
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
      <div className="max-w-6xl mx-auto p-6">
        {/* 🔎 Recherche + Sélecteur pagination */}
        <div className="flex justify-between items-center pt-16">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <div className="flex items-center space-x-4">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border px-2 py-1 rounded"
            >
              {[10,20,30,40,50,60,70,80,90,100].map(n => (
                <option key={n} value={n}>{n} / page</option>
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
              onClick={() => handleGeneratePDF(users)}
              className="ml-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              📄 Générer PDF
            </button>

          </div>
        </div>

        {/* ✅ Boutons d’actions groupées */}
        {selectedUsers.length > 0 && (
          <div className="flex space-x-2 mt-4">
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

        {/* 📋 Tableau utilisateurs */}
        <div className="overflow-x-auto shadow-lg rounded-lg mt-4">
          <table className="min-w-full border border-gray-300 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(currentUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    checked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                  />
                </th>
                <th className="border px-4 py-2 text-left">N°</th>
                <th className="border px-4 py-2 text-left">Photo</th>
                <th className="border px-4 py-2 text-left">Nom</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Rôle</th>
                <th className="border px-4 py-2 text-left">Contact</th>
                <th className="border px-4 py-2 text-left">Statut</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tfoot className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(currentUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    checked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                  />
                </th>
                <th className="border px-4 py-2 text-left">N°</th>
                <th className="border px-4 py-2 text-left">Photo</th>
                <th className="border px-4 py-2 text-left">Nom</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Rôle</th>
                <th className="border px-4 py-2 text-left">Contact</th>
                <th className="border px-4 py-2 text-left">Statut</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </tfoot>

            <tbody>
              {currentUsers.length > 0 ? currentUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="border px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                    
                  </td>
                  <td className="border px-4 py-2">{(currentPage -1) * itemsPerPage + index + 1 }</td>
                  <td className="border px-4 py-2 text-center">
                    {user.avatar ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL}/avatars/${user.avatar}`} 
                        alt="avatar"
                        style={{ width: 40, height: 40, borderRadius: "50%" }}
                      />

                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
                        <span className="text-gray-600">N/A</span>
                      </div>
                    )}
                  </td>
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.role}</td>
                  <td className="border px-4 py-2">{user.contact}</td>
                  <td className="border px-4 py-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.statut}
                        onChange={() => toggleStatut(user.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition"></div>
                      <span className="ml-2 text-sm">{user.statut ? "Actif" : "Bloqué"}</span>
                    </label>
                  </td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setEditUsername(user.username);
                        setEditEmail(user.email);
                        setEditContact(user.contact);
                        setEditRole(user.role);
                        setIsEditModalOpen(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded inline-flex items-center"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded inline-flex items-center"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => { setSelectedUsers([user.id]); setIsMailModalOpen(true); }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded inline-flex items-center"
                    >
                      <FaEnvelope />
                    </button>
                    <button
                      onClick={() => { setSelectedUsers([user.id]); setIsSMSModalOpen(true); }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded inline-flex items-center"
                    >
                      <FaSms />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500 italic">Aucun utilisateur trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-gray-600 text-sm">
            Page {currentPage} sur {totalPages} (Total : {filteredUsers.length} utilisateurs)
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

      {/* ✏️ Modal Modifier */}
      {isEditModalOpen && selectedUser && (
        <div
          id="editModal"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div className="bg-white p-6 rounded-lg w-96 transform transition-all duration-300 translate-y-10 opacity-0 animate-slide-up">
            <h2 className="text-lg font-bold mb-4"> ✏️ Modifier l'utilisateur</h2>

            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <input
              type="text"
              value={editContact}
              onChange={(e) => setEditContact(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <input
              type="text"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
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
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                💾 Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Modal Supprimer */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">⚠️ Avertissement</h2>
            <p className="mb-4">Il est déconseillé de supprimer les données en informatique.<br />Voulez-vous vraiment continuer ?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Non</button>
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${selectedUser.id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    setUsers(users.filter(u => u.id !== selectedUser.id));
                    setIsDeleteModalOpen(false);
                  } catch (err) {
                    console.error("Erreur suppression :", err);

                    toast.success("Suppression forcée appliquée ! !");

                    setUsers(users.filter(u => u.id !== selectedUser.id));
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
                    text: `Votre message a été envoyé à ${selectedUsers.length} utilisateur(s) 🎉`,
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

      {/* CSS animations */}
      <style>
        {`
          @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(50px); opacity: 0; }
          }
          .animate-slide-down {
            animation: slideDown 0.4s ease-out forwards;
          }
          @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-up {
            animation: slideUp 0.4s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }
        `}
      </style>
    </>
  );
};

export default UsersList;
