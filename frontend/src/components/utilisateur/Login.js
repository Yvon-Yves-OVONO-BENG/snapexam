import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import "react-toastify/dist/ReactToastify.css";
import titreDeLaPage from "../TitreDeLaPage";

export default function Login() {

  titreDeLaPage("Connexion - SnapExam");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "L'email est requis";
    else if (!isValidEmail(email)) newErrors.email = "Format email incorrect";

    if (!password) newErrors.password = "Le mot de passe est requis";
    if (!captchaValid) newErrors.captcha = "Veuillez valider le reCAPTCHA";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
        recaptchaToken,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Connexion réussie 🎉");
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
      if (window.grecaptcha) window.grecaptcha.reset(); // réinitialiser le captcha
      setCaptchaValid(false);
    }
  };

  const getInputClasses = (field, value) => {
    if (errors[field]) return "border-red-500";
    if (value) return "border-green-500";
    return "border-gray-300";
  };

  const renderIcon = (field, value) => {
    if (errors[field]) return <XCircle className="absolute right-3 top-3 text-red-500" size={20} />;
    if (value) return <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-blue-600 text-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-indigo-700">
          <h1 className="text-6xl font-bold mb-4">SnapExam</h1>
          <p className="text-2xl max-w-md">
            Gérez facilement les informations et les photos de vos candidats dans un espace simple, rapide et sécurisé.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white text-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm flex flex-col gap-4"
          >
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-2 rounded bg-gray-100 placeholder-gray-500 border ${getInputClasses("email", email)}`}
              />
              {renderIcon("email", email)}
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2 rounded bg-gray-100 placeholder-gray-500 border ${getInputClasses("password", password)}`}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-10 top-3 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              {renderIcon("password", password)}
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="text-right">
              <Link to="/motDePasseOublie" className="text-blue-700 text-sm hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={(token) => { setCaptchaValid(true); setRecaptchaToken(token); setErrors({...errors, captcha: ""}); }}
                onExpired={() => { setCaptchaValid(false); setRecaptchaToken(""); }}
              />
            </div>
            {errors.captcha && <p className="text-red-500 text-center text-sm">{errors.captcha}</p>}
            {serverError && <p className="text-red-500 text-sm text-center">{serverError}</p>}

            <button
              disabled={loading || !captchaValid}
              className="w-full py-2 bg-blue-700 text-white font-semibold rounded hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <hr className="my-2 border-gray-300" />

            <Link
              to="/signup"
              className="w-full py-2 bg-green-500 text-white text-center rounded font-semibold hover:bg-green-400 transition"
            >
              Créer un compte
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
