// src/components/DossierPhotos.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DossierPhotos({ dossierId }) {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!dossierId) return;

    const token = localStorage.getItem("token");

    axios.get(`${process.env.REACT_APP_API_URL}/api/photos/dossier/${dossierId}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setPhotos(res.data))
    .catch(err => console.error("Erreur chargement photos :", err));
  }, [dossierId]);

  const handleDelete = async (photoId) => {
    const token = localStorage.getItem("token");

    // Utilisation de Swal.fire pour la confirmation
    const result = await Swal.fire({
      title: '⚠️ Supprimer la photo ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhotos(photos.filter(p => p.id !== photoId));
      toast.success("La photo a été supprimée !");
      // Swal.fire({
      //   icon: 'success',
      //   title: 'Supprimé !',
      //   text: 'La photo a été supprimée.'
      // });
    } catch (err) {
      console.error("Erreur suppression photo :", err);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Impossible de supprimer la photo."
      });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {photos.length === 0 && (
        <p className="text-gray-500 col-span-3 text-center">Aucune photo</p>
      )}
      {photos.map(p => (
        <div key={p.id} className="relative bg-gray-50 p-2 rounded-lg shadow">
          <img
            src={`${process.env.REACT_APP_API_URL}/${p.photo_url}`} 
            alt={p.nom_candidat}
            className="w-full h-58 object-cover rounded"
          />
          <p className="text-center mt-1 text-sm text-gray-600 truncate">{p.nom_candidat}</p>
          <button
            onClick={() => handleDelete(p.id)}
            className="mt-1 w-full bg-red-500 hover:bg-red-600 text-white text-sm py-1 rounded"
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
