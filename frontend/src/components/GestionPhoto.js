import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { Trash2, PlusCircle } from "lucide-react";

export default function GestionPhotos() {
  const { dossierId } = useParams(); // ID du dossier
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);

  // Charger les photos du dossier
  const fetchPhotos = async () => {
    try {
      const response = await axios.get(`/api/dossiers/${dossierId}/photos`);
      setPhotos(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des photos :", error);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [dossierId]);

  // Ajouter une photo
  const handleAjouterPhoto = async (e) => {
    e.preventDefault();
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Aucun fichier",
        text: "Veuillez sélectionner une photo à ajouter.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      await axios.post(`/api/dossiers/${dossierId}/photos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Photo ajoutée !",
        timer: 2000,
        showConfirmButton: false,
      });
      setFile(null);
      fetchPhotos();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible d'ajouter la photo.",
      });
    }
  };

  // Supprimer une photo
  const handleSupprimerPhoto = (id) => {
    Swal.fire({
      title: "Supprimer cette photo ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/photos/${id}`);
          Swal.fire({
            icon: "success",
            title: "Supprimée !",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchPhotos();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Impossible de supprimer la photo.",
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen p-6 md:p-12 bg-gray-100">
      {/* Formulaire ajout photo */}
      <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg mb-12">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          <PlusCircle className="inline mb-1 mr-2" /> Ajouter une photo
        </h2>
        <form onSubmit={handleAjouterPhoto} className="flex flex-col items-center space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border rounded-lg p-3"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Ajouter
          </button>
        </form>
      </div>

      {/* Galerie des photos */}
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative bg-white rounded-2xl shadow-md overflow-hidden group"
          >
            <img
              src={photo.url}
              alt="Candidat"
              className="w-full h-64 object-cover transition-transform group-hover:scale-105"
            />
            <button
              onClick={() => handleSupprimerPhoto(photo.id)}
              className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
