import React, { useState, useMemo, useEffect } from "react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan; 
  const [duration, setDuration] = useState("1");
  
  // je vérifie qu'un plan a été reçu
  useEffect(()=> {
    if (!plan) {
      navigate("/plans");
      return null;
    }
  }, [plan, navigate]);
  
  ///je récupère le prix mensuel
  const prixMensuel = parseInt(plan.price);

  //calcul automatique du total 
  const nombreDeMois = parseInt(duration);
  const totalPrix = useMemo(() => {

    return prixMensuel * nombreDeMois;
  }, [duration, prixMensuel]);

  const handleDurationChange = (e) => {
    setDuration(e.target.value);
  };

  const handlePayment = (type) => {
    if (type === "card") navigate("/checkout-card", {state: { plan, nombreDeMois, totalPrix }});
    else if (type === "paypal") navigate("/checkout-paypal", {state: { plan, nombreDeMois, totalPrix }});
    else if (type === "paypal-card") navigate("/checkout-paypal", {state: { plan, nombreDeMois, totalPrix }});
  };

  return (
    // <div className="min-h-screen bg-gray-100 py-10 px-4">
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 pt-24 px-6 lg:px-20">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Page de Paiement – {plan.name}
        </h1>

        {/* Section 1 : Détails du plan */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Récapitulatif du plan
            </h2>
            {/* <ul className="space-y-2 text-gray-700">
              <li>💾 Espace disque : {plan.storage}</li>
              <li>📶 Bande passante : {plan.bandwidth}</li>
              <li>🧰 Support technique : {plan.support}</li>
              <li>💰 Prix de base : {plan.price.toLocaleString()} FCFA / session</li>
            </ul> */}
            <ul className="mt-6 space-y-3">
              {Array.isArray(plan.features)
                ? plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <CheckCircle className="text-green-500" size={20} />
                      {f}
                    </li>
                  ))
                : plan.features.split(",").map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <CheckCircle className="text-green-500" size={20} />
                      {f.trim()}
                    </li>
                  ))}
            </ul>
          </div>

          {/* Section 2 : Durée d'engagement */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Durée d’engagement
            </h2>
            <select
              value={duration}
              onChange={handleDurationChange}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-700"
            >
              <option value="1">1 session</option>
              <option value="3">3 sessions</option>
              <option value="6">6 sessions</option>
              <option value="12">12 sessions</option>
            </select>

            <p className="mt-4 text-gray-700">
              💡 Vous avez choisi un engagement de{" "}
              <span className="font-semibold">{duration} session</span>.
            </p>
          </div>
        </div>

        {/* Section 3 : Tableau récapitulatif */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-center">⚙️Service</th>
                <th className="p-3 text-center">💰 Tarif</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 text-center">Plan {plan.name}</td>
                <td className="p-3 text-center">{totalPrix.toLocaleString()} FCFA</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4 : Choix du paiement */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Choisissez votre mode de paiement sécurisé
          </h2>

          <button
            onClick={() => {
              Swal.fire({
                title: "Paiement Mobile",
                html: `
                  <p style="font-size:16px; margin-bottom:10px;">
                    Veuillez contacter les numéros ci-dessous ou effectuer un paiement par :
                  </p>
                  <div style="display:flex; justify-content:center; gap:40px; align-items:center; margin-bottom:15px;">
                    <div style="text-align:center;">
                      <img src="${process.env.REACT_APP_API_URL}/avatars/momo.jpeg" alt="MTN MoMo" width="80" height="80" style="border-radius:10px;"/>
                      
                    </div>
                    <div style="text-align:center;">
                      <img src="${process.env.REACT_APP_API_URL}/avatars/om.png" alt="Orange Money" width="80" height="80" style="border-radius:10px;"/>
                      
                    </div>
                  </div>
                  <p style="font-size:15px; font-weight:500;">
                    📞 673 78 83 08 (MTN)  /  📞 697 99 33 86 (Orange)
                  </p>
                  <p style="font-size:14px; color:#555; margin-top:8px;">
                    Merci d’indiquer votre nom d’utilisateur lors du paiement.
                  </p>
                `,
                icon: "info",
                confirmButtonText: "J’ai compris",
                confirmButtonColor: "#2563eb",
                width: 600,
                background: "#fff",
              });
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition"
          >
            💰 Payer par Mobile
          </button>

        </div>


      </div>
      <Footer />
    </div>
  );
};

export default Checkout;