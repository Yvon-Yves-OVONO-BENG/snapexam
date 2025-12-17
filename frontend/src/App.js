import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

import Accueil from "./components/Accueil";
import MesContacts from "./components/MesContacts";
import Apropos from "./components/Apropos";
import Contact from "./components/Contact";
import Plans from "./components/plans/Plans";
import MotDePasseOublie from "./components/MotDePasseOublie";
import ResetMotDePasse from "./components/ResetMotDePasse";
import Profil from "./components/utilisateur/Profil";
import CreationContact from "./components/CreationContact";
import Login from "./components/utilisateur/Login";
import Signup from "./components/utilisateur/Signup";
import Logout from "./components/utilisateur/Logout";
import ListeUtilisateurs from "./components/ListeUtilisateurs";
import useAutoLogout from "./components/UseAutoLogout";
import Checkout from "./components/Checkout";
import CheckoutCard from "./components/CheckoutCard";
import PayPalButton from "./components/PayPalButton";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import GestionDossiers from "./components/GestionDossier";
import AdminPayment from "./components/AdminPayment";
import Messages from "./components/GestionMessages";
import RedimensionnerImage from "./components/RedimensionnerImage";
import UpdatePasswordModal from "./components/UpdatePasswordModal";


function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null); // on met à jour l’état
  };

  // Si le token change (ex: login réussi), on le recharge
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Appel du hook auto-déconnexion
  useAutoLogout(token, logout);

  return (
    
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Accueil />} />
        {/* <Route path="/mesContacts" element={<MesContacts />} /> */}
        <Route path="/listeUtilisateurs" element={<ListeUtilisateurs />} />
        <Route path="/apropos" element={<Apropos />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/contacts/new" element={<CreationContact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/motDePasseOublie" element={<MotDePasseOublie />} />
        <Route path="/resetMotDePasse" element={<ResetMotDePasse />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout-card" element={<CheckoutCard />} />
        <Route path="/checkout-paypal" element={<PayPalButton />} />
        <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/gestionDossier" element={<GestionDossiers />} />
        <Route path="/adminPayment" element={<AdminPayment />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/redimensionnerImage" element={<RedimensionnerImage />} />
        <Route path="/updatePassword" element={<UpdatePasswordModal />} />
      </Routes>
    </Router>
  );
}

export default App;
