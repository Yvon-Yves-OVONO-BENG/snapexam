// src/components/RedimensionezImage.jsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "sweetalert2/dist/sweetalert2.min.css";
import titreDeLaPage from "./TitreDeLaPage";

export default function RedimensionerImage() {
  titreDeLaPage("Redimensioner les photos");
  const [width, setWidth] = useState(744);
  const [height, setHeight] = useState(787);
  const [zipName, setZipName] = useState(""); // <-- Ajout nom ZIP
  const [images, setImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);


  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const resizeImage = (file, targetWidth, targetHeight, mime = "image/jpeg", quality = 0.92) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = (ev) => {
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = Number(targetWidth);
            canvas.height = Number(targetHeight);
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
              (blob) => {
                if (!blob) return reject(new Error("Erreur de conversion canvas->blob"));
                resolve({ blob, name: file.name });
              },
              mime,
              quality
            );
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = (err) => reject(err);
        img.src = ev.target.result;
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleResizeAndDownload = async () => {
    if (!images.length) {
      toast.warn("Veuillez sélectionner au moins une image.");
      return;
    }

    if (!width || !height || width <= 0 || height <= 0) {
      toast.warn("Veuillez renseigner des dimensions valides.");
      return;
    }

    setProcessing(true);

    Swal.fire({
        title: "Traitement en cours",
        html: "Redimensionnement des images... <br/><small>Ne fermez pas cette fenêtre</small>",
        allowOutsideClick: true,
        showConfirmButton: true, // ← supprime le bouton OK
        didOpen: () => {
          Swal.showLoading();        // garde le spinner circulaire
        },
    });
    
    try {
      const zip = new JSZip();
      const total = images.length;

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const percent = Math.round(((i + 1) / total) * 100);
        setProgress(percent);
        // const percent = Math.round((i / total) * 100);

        Swal.update({
          html: `
            Redimensionnement : ${percent}%<br/>
            <small>Traitement de ${i + 1} / ${total} — ${file.name}</small>

            <div style="width:100%; margin-top:15px;">
              <div style="width:100%; background:#ddd; height:16px; border-radius:8px; overflow:hidden;">
                <div id="progress-bar"
                  style="
                    height:16px;
                    width:${percent}%;
                    background: linear-gradient(to right,
                      rgb(${255 - percent * 2.55}, ${percent * 2.55}, 0),
                      rgb(${255 - percent * 2.55}, ${percent * 2.55}, 0)
                    );
                    transition: width 0.3s;
                  "
                ></div>
              </div>
              <p id="progress-text" style="margin-top:8px; font-size:14px; color:#444;">${percent}%</p>
            </div>
          `
        });

        const { blob, name } = await resizeImage(file, width, height, "image/jpeg", 0.9);
        zip.file(`${name.replace(/\s+/g, " ")}`, blob);
      }

      Swal.update({ html: "Génération du fichier ZIP..." });
      const content = await zip.generateAsync({ type: "blob" });

      const finalName = zipName.trim()
        ? `${zipName.trim().replace(/\s+/g, "_")}.zip`
        : `images_redimensionnees_${Date.now()}.zip`;

      saveAs(content, finalName);

      Swal.close();
      toast.success("ZIP généré et téléchargé ✔️");
      setImages([]);
    } catch (err) {
      console.error("Erreur redimensionnement:", err);
      Swal.close();
      toast.error("Erreur pendant le traitement des images.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" />

      <div className="max-w-6xl mx-auto p-6 pt-20 relative z-0">
        <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📐 Redimensionner des images</h2>
            <p className="text-sm text-gray-500">Entrez la largeur et la hauteur en pixels</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Largeur (px)</label>
              <input
                type="number"
                min="1"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Ex : 744"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hauteur (px)</label>
              <input
                type="number"
                min="1"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Ex : 787"
              />
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                onClick={() => { setWidth(744); setHeight(787); }}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl border text-gray-700"
                title="Remettre 744x787"
              >
                Restaurer 744×787
              </button>
            </div>
          </div>

          {/* --- Champ Nom du ZIP --- */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fichier ZIP</label>
            <input
              type="text"
              value={zipName}
              onChange={(e) => setZipName(e.target.value)}
              placeholder="ex : photos_redimensionnees"
              className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">L'extension .zip sera ajoutée automatiquement</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner vos images</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0l5 5m-5-5L2 9m9 11h6" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Cliquez pour sélectionner</span> ou glissez-déposez vos images ici</p>
                  <p className="text-xs text-gray-400">PNG, JPG, JPEG — taille max selon ton navigateur</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <div className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded">
                  {images.length} image(s) sélectionnée(s)
                </div>
                <button
                  onClick={() => setImages([])}
                  className="text-sm px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Effacer la sélection
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center gap-3">

            <button
              onClick={handleResizeAndDownload}
              disabled={processing}
              className={`w-full md:w-auto px-6 py-3 rounded-xl text-white font-semibold transition ${processing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              🚀 Redimensionner & Télécharger ZIP
            </button>

            <button
              onClick={() => {
                setWidth(1024); setHeight(768);
                toast.info("Dimensions réglées sur 1024×768");
              }}
              className="w-full md:w-auto px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              ⚙️ Exemple 1024×768
            </button>

            <div className="ml-auto text-sm text-gray-500">
              <span className="font-medium">Astuce :</span> Pour une meilleure qualité, utilisez des dimensions proches du format original.
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Animations small */}
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        .animate-slide-up { animation: slideUp 0.35s ease-out forwards; }
      `}</style>
    </>
  );
}
