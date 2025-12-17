// src/components/GestionMessages.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import { FaTrash, FaEdit, FaEnvelope } from "react-icons/fa";
import titreDeLaPage from "./TitreDeLaPage";
import "react-toastify/dist/ReactToastify.css";
import "sweetalert2/dist/sweetalert2.min.css";

const GestionMessages = () => {
  titreDeLaPage("Gestion des messages");

  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMessageForEdit, setSelectedMessageForEdit] = useState(null);
  const [editContent, setEditContent] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAuthenticated = !!user;

  // Charger les messages depuis l’API
  useEffect(() => {
    const fetchMessages = async () => {
        try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/messages`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Corrige ici : vérifie si c’est bien un tableau ou un objet
        if (Array.isArray(res.data)) {
            setMessages(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
            setMessages(res.data.data);
        } else {
            console.warn("Format inattendu :", res.data);
            setMessages([]);
        }
        } catch (err) {
        console.error("Erreur chargement messages :", err);
        setMessages([]); // évite l’erreur filter
        } finally {
        setLoadingMessages(false);
        }
    };
    fetchMessages();
    }, [token]);


  // 🔍 Filtrage + pagination
  const filteredMessages = Array.isArray(messages)
  ? messages.filter(m =>
      (m.contenu || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.auteur?.username || "").toLowerCase().includes(search.toLowerCase())
    )
  : [];


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  // 🗑️ Suppression multiple
  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) return;

    const confirm = await Swal.fire({
      title: "Confirmer la suppression",
      text: `Voulez-vous supprimer ${selectedMessages.length} message(s) ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!confirm.isConfirmed) return;

    try {
      await Promise.all(
        selectedMessages.map(id =>
          axios.delete(`${process.env.REACT_APP_API_URL}/api/messages/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setMessages(messages.filter(m => !selectedMessages.includes(m.id)));
      setSelectedMessages([]);
      Swal.fire("Supprimé !", "Messages supprimés avec succès ✅", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Erreur", "Impossible de supprimer ❌", "error");
    }
  };

  // 📄 Export PDF
  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Liste des messages", 14, 20);
    const tableData = filteredMessages.map((m, index) => [
      index + 1,
      m.auteur?.username || "Anonyme",
      m.contenu,
      new Date(m.createdAt).toLocaleString(),
    ]);
    autoTable(doc, {
      head: [["#", "Auteur", "Contenu", "Date"]],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: { halign: "center", valign: "middle" },
    });
    window.open(doc.output("bloburl"), "_blank");
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedMessages(currentMessages.map(m => m.id));
    else setSelectedMessages([]);
  };

  const toggleSelectMessage = (id) => {
    if (selectedMessages.includes(id))
      setSelectedMessages(selectedMessages.filter(m => m !== id));
    else setSelectedMessages([...selectedMessages, id]);
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" />

      <div className="max-w-6xl mx-auto p-6 pt-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">📬 Gestion des messages</h1>

          <div className="flex items-center space-x-2">
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border px-2 py-1 rounded"
            >
              {[10, 20, 30, 50, 100].map(n => (
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
            <button onClick={handleGeneratePDF} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              🖨️ Imprimer
            </button>
          </div>
        </div>

        {selectedMessages.length > 0 && (
          <div className="flex space-x-2 mt-4 mb-4">
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
                <th className="border px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedMessages.length === currentMessages.length && currentMessages.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="border px-4 py-2">#</th>
                <th className="border px-4 py-2">Auteur</th>
                <th className="border px-4 py-2">Contenu</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

             <tfoot className="bg-gray-100">
                <tr>
                    <th className="border px-4 py-2 text-center">
                    <input
                        type="checkbox"
                        checked={selectedMessages.length === currentMessages.length && currentMessages.length > 0}
                        onChange={toggleSelectAll}
                    />
                    </th>
                    <th className="border px-4 py-2">#</th>
                    <th className="border px-4 py-2">Auteur</th>
                    <th className="border px-4 py-2">Contenu</th>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2 text-center">Actions</th>
                </tr>
                </tfoot>

            <tbody>
              {currentMessages.length > 0 ? (
                currentMessages.map((msg, index) => (
                  <tr key={msg.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(msg.id)}
                        onChange={() => toggleSelectMessage(msg.id)}
                      />
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="border px-4 py-2">{msg.nom || "Anonyme"} <br />
                        {msg.email || "Anonyme"}
                    </td>
                    <td className="border px-4 py-2">{msg.message}</td>
                    <td className="border px-4 py-2 text-center">
                      {new Date(msg.createdAt).toLocaleString()}
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMessageForEdit(msg);
                          setEditContent(msg.contenu);
                          setIsEditModalOpen(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={async () => {
                          const confirm = await Swal.fire({
                            title: "Supprimer ce message ?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Oui",
                            cancelButtonText: "Non",
                          });
                          if (confirm.isConfirmed) {
                            await axios.delete(`${process.env.REACT_APP_API_URL}/api/messages/${msg.id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            setMessages(messages.filter(m => m.id !== msg.id));
                            toast.success("Message supprimé ✅");
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500 italic">
                    Aucun message trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-gray-600 text-sm">
            Page {currentPage} sur {totalPages} (Total : {filteredMessages.length})
          </p>
          <div className="flex space-x-1">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>⏮️</button>
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>⬅️</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-500 text-white" : "bg-gray-100"}`}
              >
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>➡️</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>⏭️</button>
          </div>
        </div>
      </div>

      {/* Modal Édition */}
      {isEditModalOpen && selectedMessageForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">✏️ Modifier le message</h2>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
              rows="4"
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Annuler</button>
              <button
                onClick={async () => {
                  try {
                    const res = await axios.put(
                      `${process.env.REACT_APP_API_URL}/api/messages/${selectedMessageForEdit.id}`,
                      { contenu: editContent },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setMessages(messages.map(m => m.id === res.data.id ? res.data : m));
                    setIsEditModalOpen(false);
                    toast.success("Message modifié ✅");
                  } catch (err) {
                    toast.error("Erreur modification ❌");
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

      <Footer />
    </>
  );
};

export default GestionMessages;
