// src/components/Navbar.js
import { useState, useEffect } from "react";
import {
  User,
  LogOut,
  LogIn,
  UserPlus,
  Info,
  Home,
  Users,
  Mail,
  CreditCard,
  Menu,
  X,
  Image,
  Folder,
  Lock,
  BarChart2
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import UpdatePasswordModal from "./UpdatePasswordModal";


export default function Navbar() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const username = user?.username || "";

  const handleLinkClick = () => setMenuOpen(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const linkClasses = ({ isActive }) =>
    isActive
      ? "text-yellow-400 font-bold flex items-center gap-2 border-b-2 border-yellow-400 pb-1"
      : "text-white hover:text-yellow-400 transition flex items-center gap-2";

  const isGestionActive =
    location.pathname === "/gestionDossier" ||
    location.pathname === "/redimensionnerImage";

  const isAdminActive =
    location.pathname === "/listeUtilisateurs" ||
    location.pathname === "/adminPayment";

  return (
    <nav className="bg-indigo-900/95 backdrop-blur-md shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <Image size={30} className="text-yellow-300 animate-bounce" />
            <span className="text-2xl font-extrabold text-white tracking-wide">
              SnapExam
            </span>
          </NavLink>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={linkClasses}>
              <Home size={18} /> Accueil
            </NavLink>

            {isAuthenticated && (
              <div className="relative group">
                <button
                  className={`flex items-center gap-2 transition ${
                    isGestionActive
                      ? "text-yellow-400 font-bold"
                      : "text-white hover:text-yellow-400"
                  }`}
                >
                  <Folder size={18} /> Gestion ▼
                </button>

                <div className="absolute left-0 mt-2 w-56 bg-white text-gray-900 rounded-lg shadow-lg opacity-0 scale-95 pointer-events-none
                                group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                                transition-all duration-300 py-2">
                  <NavLink
                    to="/gestionDossier"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50"
                  >
                    <Folder size={16} /> Dossiers
                  </NavLink>

                  <NavLink
                    to="/redimensionnerImage"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50"
                  >
                    <Image size={16} /> Redimensionner photos
                  </NavLink>
                </div>
              </div>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <div className="relative group">
                <button
                  className={`flex items-center gap-2 transition ${
                    isAdminActive
                      ? "text-yellow-400 font-bold"
                      : "text-white hover:text-yellow-400"
                  }`}
                >
                  <Users size={18} /> Administration ▼
                </button>

                <div className="absolute left-0 mt-2 w-56 bg-white text-gray-900 rounded-lg shadow-lg opacity-0 scale-95 pointer-events-none
                                group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                                transition-all duration-300 py-2">
                  <NavLink
                    to="/listeUtilisateurs"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50"
                  >
                    <Users size={16} /> Comptes
                  </NavLink>

                  <NavLink
                    to="/adminPayment"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50"
                  >
                    <CreditCard size={16} /> Paiements
                  </NavLink>
                </div>
              </div>
            )}

            <NavLink to="/plans" className={linkClasses}>
              <CreditCard size={18} /> Plans
            </NavLink>

            <NavLink to="/apropos" className={linkClasses}>
              <Info size={18} /> À propos
            </NavLink>

            <NavLink to="/contact" className={linkClasses}>
              <Mail size={18} /> Contact
            </NavLink>

            {/* Menu utilisateur */}
            <div className="relative group">
              <button className="flex items-center space-x-2 bg-indigo-700 px-4 py-2 rounded-full text-white hover:bg-indigo-600 transition">
                <User size={18} />
                <span>{isAuthenticated ? username : "Utilisateur"}</span>
              </button>

              <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg py-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 transform pointer-events-none group-hover:pointer-events-auto">

                {!isAuthenticated ? (
                  <>
                    <NavLink
                      to="/login"
                      className="flex items-center px-4 py-2 hover:bg-indigo-100 gap-2"
                      onClick={handleLinkClick}
                    >
                      <LogIn size={16} /> Se connecter
                    </NavLink>

                    <NavLink
                      to="/signup"
                      className="flex items-center px-4 py-2 hover:bg-indigo-100 gap-2"
                      onClick={handleLinkClick}
                    >
                      <UserPlus size={16} /> Créer un compte
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/profil"
                      className="flex items-center px-4 py-2 hover:bg-indigo-100 gap-2"
                      onClick={handleLinkClick}
                    >
                      <User size={16} /> Profil
                    </NavLink>

                    <NavLink
                      to="#"
                      className="flex items-center px-4 py-2 hover:bg-indigo-100 gap-2"
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
                      <Lock size={18} /> Modifier le mot de passe
                    </NavLink>

                    <div className="border-t my-1"></div>

                    <NavLink
                      to={user?.role === "admin" ? "/adminDashboard" : "/userDashboard"}
                      className="flex items-center px-4 py-2 hover:bg-indigo-100 gap-2"
                      onClick={handleLinkClick}
                    >
                      <User size={16} /> Tableau de bord
                    </NavLink>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 gap-2"
                    >
                      <LogOut size={16} /> Se déconnecter
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={`md:hidden bg-indigo-800 transition-all duration-300 ease-in-out overflow-hidden ${
          menuOpen ? "max-h-[700px] opacity-100 py-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col space-y-3 px-6">
          <NavLink to="/" className={linkClasses} onClick={handleLinkClick}>
            <Home size={18} /> Accueil
          </NavLink>

          {isAuthenticated && (
            <>
              <p className="text-yellow-300 font-semibold mt-2">Gestion</p>
              <NavLink
                to="/gestionDossier"
                className={linkClasses}
                onClick={handleLinkClick}
              >
                <Folder size={18} /> Dossiers
              </NavLink>
              <NavLink
                to="/redimensionnerImage"
                className={linkClasses}
                onClick={handleLinkClick}
              >
                <Image size={18} /> Redimensionner photos
              </NavLink>
            </>
          )}

          {isAuthenticated && user?.role === "admin" && (
            <>
              <p className="text-yellow-300 font-semibold mt-2">Administration</p>
              <NavLink
                to="/listeUtilisateurs"
                className={linkClasses}
                onClick={handleLinkClick}
              >
                <Users size={18} /> Comptes
              </NavLink>
              <NavLink
                to="/adminPayment"
                className={linkClasses}
                onClick={handleLinkClick}
              >
                <CreditCard size={18} /> Paiements
              </NavLink>
            </>
          )}

          <NavLink to="/plans" className={linkClasses} onClick={handleLinkClick}>
            <CreditCard size={18} /> Plans
          </NavLink>
          <NavLink to="/apropos" className={linkClasses} onClick={handleLinkClick}>
            <Info size={18} /> À propos
          </NavLink>
          <NavLink to="/contact" className={linkClasses} onClick={handleLinkClick}>
            <Mail size={18} /> Contact
          </NavLink>

          {/* --- SECTION: Tableau de bord (séparée) --- */}
          {isAuthenticated && (
            <>
              <p className="text-yellow-300 font-semibold mt-2">Tableau de bord</p>

              {user?.role === "admin" ? (
                <>
                  <NavLink
                    to="/adminDashboard"
                    className={linkClasses}
                    onClick={handleLinkClick}
                  >
                    <User size={18} /> Tableau de bord admin
                  </NavLink>
                  {/* Exemple : lien admin supplémentaire si besoin */}
                  <NavLink
                    to="/adminStats"
                    className={linkClasses}
                    onClick={handleLinkClick}
                  >
                    <BarChart2 size={18} /> Statistiques
                  </NavLink>
                </>
              ) : (
                <NavLink
                  to="/userDashboard"
                  className={linkClasses}
                  onClick={handleLinkClick}
                >
                  <User size={18} /> Tableau de bord
                </NavLink>
              )}
            </>
          )}

          {/* Section Utilisateur */}
          <p className="text-yellow-300 font-semibold mt-2">Mon compte</p>

          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                className={linkClasses}
                onClick={handleLinkClick}
              >
                <LogIn size={18} /> Se connecter
              </NavLink>

              <NavLink
                to="/signup"
                className={linkClasses}
                onClick={handleLinkClick}
              >
                <UserPlus size={18} /> Créer un compte
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/profil"
                className={linkClasses}
                onClick={handleLinkClick}
              >
                <User size={18} /> Profil
              </NavLink>

              <NavLink
                to="#"
                className={linkClasses}
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <Lock size={18} /> Modifier le mot de passe
              </NavLink>



              <button
                onClick={() => {
                  handleLogout()
                  handleLinkClick()
                }}
                className={`${linkClasses} text-red-300`}
              >
                <LogOut size={18} /> Se déconnecter
              </button>
            </>
          )}
        </div>
      </div>

      {isPasswordModalOpen && (
        <UpdatePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}

    </nav>
  );
}
