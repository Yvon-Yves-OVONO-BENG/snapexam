// src/pages/ResetPassword.js
import { useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "./Navbar";
import { Lock, CheckCircle, XCircle } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (!password) newErrors.password = "Le mot de passe est requis";
    if (!confirmPassword) newErrors.confirmPassword = "Veuillez confirmer le mot de passe";
    if (password && confirmPassword && password !== confirmPassword)
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok) Swal.fire("Succès", data.message, "success");
      else Swal.fire("Erreur", data.message, "error");
    } catch (err) {
      Swal.fire("Erreur", "Une erreur est survenue", "error");
    }
  };

  const getInputClasses = (field, value) => {
    if (errors[field]) return "border-red-500 pr-10";
    if (value) return "border-green-500 pr-10";
    return "border-gray-300";
  };

  const renderIcon = (field, value) => {
    if (errors[field]) return <XCircle className="absolute right-3 top-3 text-red-500" size={20} />;
    if (value) return <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />;
    return <Lock className="absolute right-3 top-3 text-gray-400" size={20} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
      <Navbar />

      <div className="flex items-center justify-center flex-1 px-4 mt-24">
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 rounded-lg shadow-lg p-8 w-full max-w-md text-gray-800"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Réinitialiser le mot de passe</h2>

          {/* Nouveau mot de passe */}
          <div className="mb-4 relative">
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 rounded border ${getInputClasses("password", password)} pr-10`}
            />
            {renderIcon("password", password)}
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirmation mot de passe */}
          <div className="mb-4 relative">
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-3 rounded border ${getInputClasses("confirmPassword", confirmPassword)} pr-10`}
            />
            {renderIcon("confirmPassword", confirmPassword)}
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-500 transition"
          >
            Réinitialiser
          </button>
        </form>
      </div>
    </div>
  );
}
