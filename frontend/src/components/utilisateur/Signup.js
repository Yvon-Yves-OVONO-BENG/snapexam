// src/pages/Signup.js
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import toast, { Toaster } from "react-hot-toast";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import titreDeLaPage from "../TitreDeLaPage";

export default function Signup() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [strength, setStrength] = useState("");
  const navigate = useNavigate();

  titreDeLaPage("Création de compte - SnapExam");

  useEffect(() => {
    if (!password) return setStrength("");
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&#]/.test(password);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (password.length >= 12 && score >= 3) setStrength("Très fort");
    else if (password.length >= 8 && score >= 2) setStrength("Fort");
    else if (password.length >= 6 && score >= 1) setStrength("Moyen");
    else setStrength("Faible");
  }, [password]);

  const validateField = (name, value) => {
    if (!value) return `${name} requis`;
    if (name === "Email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Email invalide";
    }
    if (name === "Mot de passe") {
      if (value.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (validateField("Nom d'utilisateur", nom)) newErrors.nom = validateField("Nom d'utilisateur", nom);
    if (validateField("Email", email)) newErrors.email = validateField("Email", email);
    if (validateField("Contact", contact)) newErrors.contact = validateField("Contact", contact);
    if (validateField("Mot de passe", password)) newErrors.password = validateField("Mot de passe", password);
    if (!captchaValid) newErrors.captcha = "Veuillez valider le reCAPTCHA";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
        username: nom,
        email,
        contact,
        password,
        recaptchaToken: window.grecaptcha.getResponse(),
      });

      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Compte créé avec succès 🎉");
      setNom(""); setEmail(""); setContact(""); setPassword(""); setErrors({});
      navigate("/");

    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur côté serveur ❌");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthClass = () => {
    switch (strength) {
      case "Très fort": return "bg-green-600";
      case "Fort": return "bg-green-400";
      case "Moyen": return "bg-yellow-400";
      case "Faible": return "bg-red-400";
      default: return "bg-gray-300";
    }
  };

  const isValid = (field, value) => !validateField(field, value);

  return (
    <div className="min-h-screen bg-blue-600 text-white flex flex-col">
      <Toaster position="top-right" />
      <Navbar />

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-indigo-700">
          <h1 className="text-6xl font-bold mb-4">SnapExam</h1>
          <p className="text-2xl max-w-md">
            Simplifiez la gestion des photos de vos candidats avec une plateforme rapide, intuitive et moderne.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <form onSubmit={handleSubmit} className="bg-white text-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col gap-4" noValidate>

            {/* Nom */}
            <div className="relative">
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={nom}
                onChange={(e) => {
                  setNom(e.target.value);
                  setErrors({ ...errors, nom: validateField("Nom d'utilisateur", e.target.value) });
                }}
                className={`w-full p-2 rounded bg-gray-100 placeholder-gray-500 border
                  ${errors.nom ? "border-red-500" : nom && isValid("Nom d'utilisateur", nom) ? "border-green-500" : "border-gray-300"}
                `}
              />
              {nom && isValid("Nom d'utilisateur", nom) && <CheckCircle size={20} className="absolute right-3 top-3 text-green-400" />}
              {errors.nom && <XCircle size={20} className="absolute right-3 top-3 text-red-400" />}
              {errors.nom && <p className="text-red-400 text-sm mt-1">{errors.nom}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: validateField("Email", e.target.value) });
                }}
                className={`w-full p-2 rounded bg-gray-100 placeholder-gray-500 border
                  ${errors.email ? "border-red-500" : email && isValid("Email", email) ? "border-green-500" : "border-gray-300"}
                `}
              />
              {email && isValid("Email", email) && <CheckCircle size={20} className="absolute right-3 top-3 text-green-400" />}
              {errors.email && <XCircle size={20} className="absolute right-3 top-3 text-red-400" />}
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Contact */}
            <div className="relative">
              <input
                type="text"
                placeholder="Contact"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  setErrors({ ...errors, contact: validateField("Contact", e.target.value) });
                }}
                className={`w-full p-2 rounded bg-gray-100 placeholder-gray-500 border
                  ${errors.contact ? "border-red-500" : contact && isValid("Contact", contact) ? "border-green-500" : "border-gray-300"}
                `}
              />
              {contact && isValid("Contact", contact) && <CheckCircle size={20} className="absolute right-3 top-3 text-green-400" />}
              {errors.contact && <XCircle size={20} className="absolute right-3 top-3 text-red-400" />}
              {errors.contact && <p className="text-red-400 text-sm mt-1">{errors.contact}</p>}
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2 rounded bg-gray-100 placeholder-gray-500 border
                  ${errors.password ? "border-red-500" : password && isValid("Mot de passe", password) ? "border-green-500" : "border-gray-300"}
                `}
              />
              <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 cursor-pointer">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>

              {/* Barre de force */}
              {password && (
                <>
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
                  <p className="text-xs text-gray-600 mt-1">Force du mot de passe : {strength}</p>

                  <ul className="mt-1 text-xs space-y-1">
                    <li className={password.length >= 8 ? "text-green-600" : "text-gray-500"}>• 8 caractères minimum</li>
                    <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}>• 1 majuscule</li>
                    <li className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-500"}>• 1 minuscule</li>
                    <li className={/\d/.test(password) ? "text-green-600" : "text-gray-500"}>• 1 chiffre</li>
                    <li className={/[@$!%*?&#]/.test(password) ? "text-green-600" : "text-gray-500"}>• 1 caractère spécial (@$!%*?&#)</li>
                  </ul>
                </>
              )}
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={() => { setCaptchaValid(true); setErrors({...errors, captcha: ""}); }}
                onExpired={() => setCaptchaValid(false)}
              />
            </div>
            {errors.captcha && <p className="text-red-500 text-center text-sm">{errors.captcha}</p>}

            <button
              type="submit"
              disabled={loading || !captchaValid}
              className="w-full py-3 bg-green-500 text-white rounded font-semibold hover:bg-green-400 transition"
            >
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>

            <p className="mt-4 text-center text-sm text-black/80">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-indigo-300 hover:underline">Se connecter</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
