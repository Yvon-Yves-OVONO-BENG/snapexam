// src/components/UpdatePasswordModal.js
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UpdatePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [strength, setStrength] = useState("");
  const [match, setMatch] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // Reset automatique à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
      setStrength("");
      setMatch(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!newPassword) return setStrength("");
    if (newPassword.length >= 12) setStrength("Très fort");
    else if (newPassword.length >= 8) setStrength("Fort");
    else if (newPassword.length >= 5) setStrength("Moyen");
    else setStrength("Faible");

    if (!confirmPassword) return setMatch(null);
    setMatch(newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[@$!%*?&#]/.test(newPassword);

    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (!newPassword) setStrength("");
    else if (newPassword.length >= 10 && score >= 3) setStrength("Très fort");
    else if (newPassword.length >= 8 && score >= 2) setStrength("Fort");
    else if (newPassword.length >= 6 && score >= 1) setStrength("Moyen");
    else setStrength("Faible");

    if (!confirmPassword) return setMatch(null);
    setMatch(newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);


  if (!isOpen) return null;

  const getStrengthClass = () => {
    switch (strength) {
      case "Très fort": return "bg-green-600";
      case "Fort": return "bg-green-400";
      case "Moyen": return "bg-yellow-400";
      case "Faible": return "bg-red-400";
      default: return "bg-gray-300";
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Vérifications côté frontend
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/${user.id}/motdepasse`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur serveur");
        setLoading(false);
        return;
      }

      // ✅ Mot de passe mis à jour
      toast.success("Mot de passe mis à jour avec succès !");
      toast.info("Vous devez vous reconnecter avec votre nouveau mot de passe.");

      // Supprimer le token pour forcer la reconnexion
      localStorage.removeItem("token");

      setLoading(false);

      // ⏱️ Laisser le toast s'afficher avant de fermer le modal et rediriger
      setTimeout(() => {
        onClose(); // fermer le modal
        window.location.href = "/login"; // ou navigate("/login") si react-router
      }, 5000); // 1,5 seconde

    } catch (err) {
      console.error("Erreur modification mot de passe :", err);
      setError("Impossible de modifier le mot de passe !");
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case "Très fort": return "bg-green-600";
      case "Fort": return "bg-green-400";
      case "Moyen": return "bg-yellow-400";
      case "Faible": return "bg-red-400";
      default: return "bg-gray-300";
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-auto">
      <div className="bg-white w-full max-w-md max-h-[90vh] p-6 rounded-xl shadow-xl relative overflow-auto animate-zoom">
        
        {/* Bouton fermer */}
        <button
          className="absolute right-4 top-4 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Modifier le mot de passe
        </h2>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Ancien mot de passe */}
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Ancien mot de passe"
              className="w-full border px-3 py-2 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer"
              onClick={() => setShowOld(!showOld)}
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* Nouveau mot de passe */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              className="w-full border px-3 py-2 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>

            {/* Barre de force */}
            {newPassword && (
              <>
                {/* Barre de force */}
                <div className="mt-1 h-2 w-full bg-gray-200 rounded">
                  <div
                    className={`h-2 rounded transition-all duration-300 ${getStrengthClass()}`}
                    style={{
                      width:
                        strength === "Très fort" ? "100%" :
                        strength === "Fort" ? "75%" :
                        strength === "Moyen" ? "50%" :
                        strength === "Faible" ? "25%" : "0%",
                    }}
                  ></div>
                </div>

                {/* Texte indicateur */}
                <p className="text-xs text-gray-600 mt-1">
                  Force du mot de passe : {strength}
                </p>

                {/* Critères */}
                <ul className="mt-1 text-xs space-y-1">
                  <li className={newPassword.length >= 8 ? "text-green-600" : "text-gray-500"}>
                    • 8 caractères minimum
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : "text-gray-500"}>
                    • 1 majuscule
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? "text-green-600" : "text-gray-500"}>
                    • 1 minuscule
                  </li>
                  <li className={/\d/.test(newPassword) ? "text-green-600" : "text-gray-500"}>
                    • 1 chiffre
                  </li>
                  <li className={/[@$!%*?&#]/.test(newPassword) ? "text-green-600" : "text-gray-500"}>
                    • 1 caractère spécial (@$!%*?&#)
                  </li>
                </ul>
              </>
            )}

          </div>

          {/* Confirmation */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              className="w-full border px-3 py-2 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
            {match !== null && (
              <p
                className={`text-sm mt-1 ${
                  match ? "text-green-600" : "text-red-500"
                }`}
              >
                {match ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-medium flex items-center justify-center"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            ) : null}
            {loading ? "Mise à jour..." : "Confirmer"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
